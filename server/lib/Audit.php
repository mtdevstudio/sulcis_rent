<?php
declare(strict_types=1);

/** Registro attività: chi ha fatto cosa. Mai PIN o token nel diff. */
final class Audit
{
    private const SECRET_KEYS = ['pin', 'pin_hash', 'current', 'next', 'token', 'csrf'];

    public static function log(?int $userId, string $action, string $entity, $entityId = null, ?array $diff = null): void
    {
        if ($diff) $diff = self::scrub($diff);
        Db::run(
            'INSERT INTO audit_log (user_id, action, entity, entity_id, diff, created_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())',
            [$userId, $action, $entity, $entityId === null ? null : (string) $entityId, $diff ? json_encode($diff, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null]
        );
    }

    /** Differenze tra due array (solo chiavi cambiate, ricorsivo sul primo livello di `data`). */
    public static function diff(array $old, array $new): array
    {
        $out = [];
        foreach (array_unique(array_merge(array_keys($old), array_keys($new))) as $k) {
            $a = $old[$k] ?? null; $b = $new[$k] ?? null;
            if ($a != $b) $out[$k] = [$a, $b];
        }
        return $out;
    }

    private static function scrub(array $a): array
    {
        foreach ($a as $k => $v) {
            if (is_string($k) && in_array(strtolower($k), self::SECRET_KEYS, true)) { $a[$k] = '***'; continue; }
            if (is_array($v)) $a[$k] = self::scrub($v);
        }
        return $a;
    }
}
