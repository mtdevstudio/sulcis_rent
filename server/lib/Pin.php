<?php
declare(strict_types=1);

/** Politica del PIN: numerico, ≥ 8 cifre (configurabile, mai meno di 8), niente PIN banali. */
final class Pin
{
    public static function minLength(): int { return max(8, (int) Util::cfg('admin_pin_min_length', 8)); }

    /** @return string|null messaggio d'errore, null se valido */
    public static function policyError(string $pin): ?string
    {
        $min = self::minLength();
        if (!preg_match('/^\d+$/', $pin)) return 'Il PIN deve contenere solo cifre';
        if (strlen($pin) < $min) return "Il PIN deve avere almeno $min cifre";
        if (strlen($pin) > 16) return 'Il PIN può avere al massimo 16 cifre';
        if (preg_match('/^(\d)\1+$/', $pin)) return 'PIN troppo semplice (cifre ripetute)';
        // sequenze crescenti/decrescenti (anche cicliche: 90123456)
        $asc = $desc = true;
        for ($i = 1, $n = strlen($pin); $i < $n; $i++) {
            $d = ((int) $pin[$i] - (int) $pin[$i - 1] + 10) % 10;
            if ($d !== 1) $asc = false;
            if ($d !== 9) $desc = false;
        }
        if ($asc || $desc) return 'PIN troppo semplice (sequenza)';
        // motivi ripetuti: 12121212, 123123123, 12341234
        for ($len = 1; $len <= intdiv(strlen($pin), 2); $len++) {
            if (strlen($pin) % $len === 0 && str_repeat(substr($pin, 0, $len), intdiv(strlen($pin), $len)) === $pin) {
                return 'PIN troppo semplice (motivo ripetuto)';
            }
        }
        // date: GGMMAAAA, AAAAMMGG, MMGGAAAA (anni 1900–2099)
        if (strlen($pin) === 8 && self::looksLikeDate($pin)) return 'Non usare una data come PIN';
        // meno di 3 cifre diverse
        if (count(array_unique(str_split($pin))) < 3) return 'Usa almeno 3 cifre diverse';
        if (in_array($pin, ['11223344', '12344321', '13579135', '24682468', '19283746', '00000001', '10000000'], true)) return 'PIN troppo comune';
        return null;
    }

    private static function looksLikeDate(string $p): bool
    {
        $y = static fn(string $s) => (int) $s >= 1900 && (int) $s <= 2099;
        $cands = [
            [substr($p, 0, 2), substr($p, 2, 2), substr($p, 4, 4)], // GGMMAAAA
            [substr($p, 6, 2), substr($p, 4, 2), substr($p, 0, 4)], // AAAAMMGG
            [substr($p, 2, 2), substr($p, 0, 2), substr($p, 4, 4)], // MMGGAAAA
        ];
        foreach ($cands as [$d, $m, $yr]) {
            if ($y($yr) && checkdate((int) $m, (int) $d, (int) $yr)) return true;
        }
        return false;
    }

    public static function hash(string $pin): string
    {
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($pin, PASSWORD_ARGON2ID, ['memory_cost' => 65536, 'time_cost' => 4, 'threads' => 1]);
        }
        return password_hash($pin, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public static function needsRehash(string $hash): bool
    {
        return defined('PASSWORD_ARGON2ID')
            ? password_needs_rehash($hash, PASSWORD_ARGON2ID, ['memory_cost' => 65536, 'time_cost' => 4, 'threads' => 1])
            : password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /** Hash fittizio per uniformare i tempi quando l'utente non esiste. */
    public static function dummyHash(): string
    {
        static $h = null;
        return $h ??= self::hash('00000000' . bin2hex(random_bytes(4)));
    }
}
