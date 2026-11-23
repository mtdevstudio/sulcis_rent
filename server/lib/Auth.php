<?php
declare(strict_types=1);

/**
 * Sessioni admin su tabella MySQL (niente sessioni PHP su file condivisi).
 * - token 256 bit random_bytes(32), in DB solo SHA-256;
 * - cookie __Host-sr_admin: HttpOnly, Secure, SameSite=Strict, Path=/, nessun Domain;
 * - durata 8 h a scorrimento, scadenza assoluta 7 giorni;
 * - CSRF: SameSite=Strict + controllo Origin/Referer + token double-submit legato alla sessione.
 *
 * OGNI endpoint protetto chiama Auth::requireAuth($role) come prima istruzione.
 */
final class Auth
{
    public const COOKIE = '__Host-sr_admin';
    public const CSRF_COOKIE = '__Host-sr_csrf';
    public const DEVICE_COOKIE = '__Host-sr_device';
    public const IDLE_HOURS = 8;
    public const ABSOLUTE_DAYS = 7;

    private static ?array $current = null;

    /** @return array{id:int,name:string,role:string,session_id:int} */
    public static function requireAuth(string $role = 'staff'): array
    {
        Http::apiHeaders();
        $user = self::currentUser();
        if (!$user) throw new HttpError(401, 'Sessione scaduta: accedi di nuovo');
        if (!in_array(Http::method(), ['GET', 'HEAD', 'OPTIONS'], true)) {
            self::checkOrigin();
            self::checkCsrf($user);
        }
        if ($role === 'owner' && $user['role'] !== 'owner') throw new HttpError(403, 'Operazione riservata al titolare');
        return $user;
    }

    public static function currentUser(): ?array
    {
        if (self::$current) return self::$current;
        $token = $_COOKIE[self::COOKIE] ?? '';
        if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) return null;
        $row = Db::one(
            "SELECT s.id AS session_id, s.csrf_hash, s.last_seen_at, s.created_at, u.id, u.name, u.role
               FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
              WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
                AND s.created_at > UTC_TIMESTAMP() - INTERVAL ? DAY AND u.active = 1",
            [hash('sha256', $token), self::ABSOLUTE_DAYS]
        );
        if (!$row) return null;
        // rinnovo a scorrimento (al massimo una scrittura al minuto)
        if (strtotime($row['last_seen_at'] . ' UTC') < time() - 60) {
            Db::run(
                "UPDATE admin_sessions SET last_seen_at = UTC_TIMESTAMP(),
                        expires_at = LEAST(UTC_TIMESTAMP() + INTERVAL ? HOUR, created_at + INTERVAL ? DAY)
                  WHERE id = ?",
                [self::IDLE_HOURS, self::ABSOLUTE_DAYS, $row['session_id']]
            );
        }
        $row['id'] = (int) $row['id'];
        $row['session_id'] = (int) $row['session_id'];
        return self::$current = $row;
    }

    /** Origin (o Referer) deve essere tra quelli consentiti. Usato anche dal login. */
    public static function checkOrigin(): void
    {
        $allowed = array_map(static fn($o) => rtrim((string) $o, '/'), (array) Util::cfg('allowed_origins', []));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '') {
            if (!in_array(rtrim($origin, '/'), $allowed, true)) throw new HttpError(403, 'Origine non consentita');
            return;
        }
        $ref = $_SERVER['HTTP_REFERER'] ?? '';
        if ($ref !== '') {
            $p = parse_url($ref);
            $o = ($p['scheme'] ?? '') . '://' . ($p['host'] ?? '') . (isset($p['port']) ? ':' . $p['port'] : '');
            if (in_array($o, $allowed, true)) return;
        }
        throw new HttpError(403, 'Origine non consentita');
    }

    private static function checkCsrf(array $user): void
    {
        $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $cookie = $_COOKIE[self::CSRF_COOKIE] ?? '';
        if (!is_string($header) || !is_string($cookie) || !preg_match('/^[a-f0-9]{64}$/', $header)
            || !hash_equals($cookie, $header) || !hash_equals((string) $user['csrf_hash'], hash('sha256', $header))) {
            throw new HttpError(403, 'Token di sicurezza non valido: ricarica la pagina');
        }
    }

    /** Crea la sessione e imposta i cookie. Ritorna il token CSRF (da inviare nell'header X-CSRF-Token). */
    public static function startSession(int $userId, string $ipHash): string
    {
        $token = bin2hex(random_bytes(32));
        $csrf = bin2hex(random_bytes(32));
        $ua = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255);
        Db::run(
            "INSERT INTO admin_sessions (token_hash, csrf_hash, user_id, created_at, expires_at, last_seen_at, user_agent, ip_hash)
             VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? HOUR, UTC_TIMESTAMP(), ?, ?)",
            [hash('sha256', $token), hash('sha256', $csrf), $userId, self::IDLE_HOURS, $ua, $ipHash]
        );
        $exp = time() + self::ABSOLUTE_DAYS * 86400;
        Http::setCookie(self::COOKIE, $token, $exp, true);
        Http::setCookie(self::CSRF_COOKIE, $csrf, $exp, false);
        return $csrf;
    }

    public static function endSession(): void
    {
        $token = $_COOKIE[self::COOKIE] ?? '';
        if (is_string($token) && preg_match('/^[a-f0-9]{64}$/', $token)) {
            Db::run('DELETE FROM admin_sessions WHERE token_hash = ?', [hash('sha256', $token)]);
        }
        Http::setCookie(self::COOKIE, '', time() - 3600, true);
        Http::setCookie(self::CSRF_COOKIE, '', time() - 3600, false);
    }

    /** Invalida tutte le sessioni di un utente tranne (opzionale) quella corrente. */
    public static function revokeUserSessions(int $userId, ?int $exceptSessionId = null): int
    {
        return Db::run('DELETE FROM admin_sessions WHERE user_id = ? AND id <> ?', [$userId, $exceptSessionId ?? 0])->rowCount();
    }

    /** Dispositivo nuovo? (cookie random a lunga durata, in DB solo l'hash). */
    public static function isNewDevice(int $userId): bool
    {
        $dev = $_COOKIE[self::DEVICE_COOKIE] ?? '';
        if (!is_string($dev) || !preg_match('/^[a-f0-9]{64}$/', $dev)) {
            $dev = bin2hex(random_bytes(32));
            Http::setCookie(self::DEVICE_COOKIE, $dev, time() + 400 * 86400, true);
        }
        $h = hash('sha256', $dev);
        $known = Db::val('SELECT 1 FROM admin_devices WHERE user_id = ? AND device_hash = ?', [$userId, $h]);
        if ($known) {
            Db::run('UPDATE admin_devices SET last_seen_at = UTC_TIMESTAMP() WHERE user_id = ? AND device_hash = ?', [$userId, $h]);
            return false;
        }
        Db::run('INSERT INTO admin_devices (user_id, device_hash, first_seen_at, last_seen_at) VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())', [$userId, $h]);
        return true;
    }

    /** Ritardo artificiale uniforme (~500 ms + jitter) dall'inizio della richiesta. */
    public static function uniformDelay(float $start, float $target = 0.5): void
    {
        $remaining = $target + random_int(0, 40) / 1000 - (microtime(true) - $start);
        if ($remaining > 0) usleep((int) ($remaining * 1e6));
    }
}
