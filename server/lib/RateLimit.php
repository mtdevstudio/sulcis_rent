<?php
declare(strict_types=1);

/**
 * Rate limiting persistente in MySQL.
 * - 5 fallimenti in 15 min per IP → blocco; idem per utente. Backoff: 15 min → 1 h → 24 h
 *   (gli «strike» si azzerano dopo 24 h senza nuovi blocchi).
 * - Globale: > 20 fallimenti in 1 h da qualsiasi IP → login bloccato 1 h per tutti + notifica.
 * IP salvati solo come HMAC-SHA256 con sale segreto.
 */
final class RateLimit
{
    public const MAX_FAILS = 5;
    public const WINDOW_MIN = 15;
    public const GLOBAL_MAX = 20;
    private const BACKOFF = [15, 60, 1440]; // minuti

    public static function clientIp(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $trusted = (array) Util::cfg('trusted_proxies', []);
        if ($trusted && in_array($remote, $trusted, true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // il client reale è il primo indirizzo da destra che NON è un proxy fidato
            $chain = array_reverse(array_map('trim', explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR'])));
            foreach ($chain as $ip) {
                if (filter_var($ip, FILTER_VALIDATE_IP) && !in_array($ip, $trusted, true)) return $ip;
            }
        }
        return $remote;
    }

    public static function ipHash(?string $ip = null): string
    {
        $salt = (string) Util::cfg('ip_hash_salt', '');
        if (strlen($salt) < 16) throw new RuntimeException('ip_hash_salt mancante o troppo corto');
        return hash_hmac('sha256', $ip ?? self::clientIp(), $salt);
    }

    /** Secondi di blocco rimanenti (0 = libero). */
    public static function lockedFor(string $ipHash, ?int $userId): int
    {
        $rows = Db::all(
            "SELECT TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), locked_until) AS s FROM auth_locks
             WHERE locked_until > UTC_TIMESTAMP() AND ((scope='ip' AND scope_key=?) OR (scope='user' AND scope_key=?) OR (scope='global' AND scope_key='*'))",
            [$ipHash, (string) ($userId ?? '-')]
        );
        $max = 0;
        foreach ($rows as $r) $max = max($max, (int) $r['s']);
        return $max;
    }

    public static function record(string $ipHash, ?int $userId, bool $success): void
    {
        Db::run('INSERT INTO auth_attempts (ip_hash, user_id, attempted_at, success) VALUES (?, ?, UTC_TIMESTAMP(3), ?)', [$ipHash, $userId, $success ? 1 : 0]);
    }

    /** Dopo un fallimento: valuta e applica i blocchi. Ritorna true se è scattato un blocco. */
    public static function afterFailure(string $ipHash, ?int $userId): bool
    {
        $locked = false;
        $ipFails = (int) Db::val(
            "SELECT COUNT(*) FROM auth_attempts a WHERE a.ip_hash = ? AND a.success = 0
               AND a.attempted_at > UTC_TIMESTAMP() - INTERVAL ? MINUTE
               AND a.attempted_at > COALESCE((SELECT MAX(b.attempted_at) FROM auth_attempts b WHERE b.ip_hash = a.ip_hash AND b.success = 1), '1970-01-01')
               AND a.attempted_at > COALESCE((SELECT l.locked_until FROM auth_locks l WHERE l.scope='ip' AND l.scope_key = a.ip_hash), '1970-01-01')",
            [$ipHash, self::WINDOW_MIN]
        );
        if ($ipFails >= self::MAX_FAILS) { self::lock('ip', $ipHash); $locked = true; }

        if ($userId !== null) {
            $uFails = (int) Db::val(
                "SELECT COUNT(*) FROM auth_attempts a WHERE a.user_id = ? AND a.success = 0
                   AND a.attempted_at > UTC_TIMESTAMP() - INTERVAL ? MINUTE
                   AND a.attempted_at > COALESCE((SELECT MAX(b.attempted_at) FROM auth_attempts b WHERE b.user_id = a.user_id AND b.success = 1), '1970-01-01')
                   AND a.attempted_at > COALESCE((SELECT l.locked_until FROM auth_locks l WHERE l.scope='user' AND l.scope_key = CAST(a.user_id AS CHAR)), '1970-01-01')",
                [$userId, self::WINDOW_MIN]
            );
            if ($uFails >= self::MAX_FAILS) { self::lock('user', (string) $userId); $locked = true; }
        }

        $gFails = (int) Db::val(
            "SELECT COUNT(*) FROM auth_attempts WHERE success = 0 AND attempted_at > UTC_TIMESTAMP() - INTERVAL 1 HOUR
               AND attempted_at > COALESCE((SELECT locked_until FROM auth_locks WHERE scope='global' AND scope_key='*'), '1970-01-01')"
        );
        if ($gFails > self::GLOBAL_MAX) {
            Db::run("INSERT INTO auth_locks (scope, scope_key, locked_until, strikes, last_strike_at) VALUES ('global','*', UTC_TIMESTAMP() + INTERVAL 1 HOUR, 1, UTC_TIMESTAMP())
                     ON DUPLICATE KEY UPDATE locked_until = VALUES(locked_until), strikes = strikes + 1, last_strike_at = VALUES(last_strike_at)");
            Audit::log(null, 'login_global_lock', 'auth', null, ['failures_last_hour' => $gFails]);
            Notify::send('Sulcis Rent · login admin bloccato', "Più di " . self::GLOBAL_MAX . " tentativi di PIN falliti nell'ultima ora: login bloccato per 1 ora per tutti. Se non sei stato tu, qualcuno sta provando ad entrare.");
            $locked = true;
        }
        return $locked;
    }

    private static function lock(string $scope, string $key): void
    {
        $row = Db::one('SELECT strikes, last_strike_at > UTC_TIMESTAMP() - INTERVAL 24 HOUR AS recent FROM auth_locks WHERE scope = ? AND scope_key = ?', [$scope, $key]);
        $strikes = ($row && (int) $row['recent']) ? min((int) $row['strikes'] + 1, count(self::BACKOFF)) : 1;
        $minutes = self::BACKOFF[$strikes - 1];
        Db::run(
            'INSERT INTO auth_locks (scope, scope_key, locked_until, strikes, last_strike_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE, ?, UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE locked_until = VALUES(locked_until), strikes = VALUES(strikes), last_strike_at = VALUES(last_strike_at)',
            [$scope, $key, $minutes, $strikes]
        );
        Audit::log($scope === 'user' ? (int) $key : null, 'login_lock', 'auth', $scope === 'user' ? $key : null, ['scope' => $scope, 'minutes' => $minutes]);
    }

    /** Sblocco manuale (owner o CLI). */
    public static function unlock(?int $userId = null, bool $global = false): void
    {
        if ($userId !== null) Db::run("DELETE FROM auth_locks WHERE scope='user' AND scope_key = ?", [(string) $userId]);
        if ($global) Db::run("DELETE FROM auth_locks WHERE scope='global'");
    }
}
