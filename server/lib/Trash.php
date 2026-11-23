<?php
declare(strict_types=1);

/** Pulizia: cestino > 30 giorni, sessioni scadute, tentativi vecchi. Da cron o «pigra» al login. */
final class Trash
{
    public const DAYS = 30;

    public static function purgeExpired(): array
    {
        $ids = array_map('intval', array_column(Db::all('SELECT id FROM cars WHERE deleted_at IS NOT NULL AND deleted_at < UTC_TIMESTAMP() - INTERVAL ? DAY', [self::DAYS]), 'id'));
        foreach ($ids as $id) Cars::purge($id, null);
        $s = Db::run('DELETE FROM admin_sessions WHERE expires_at < UTC_TIMESTAMP() OR created_at < UTC_TIMESTAMP() - INTERVAL ? DAY', [Auth::ABSOLUTE_DAYS])->rowCount();
        $a = Db::run('DELETE FROM auth_attempts WHERE attempted_at < UTC_TIMESTAMP() - INTERVAL 30 DAY')->rowCount();
        Db::run('DELETE FROM auth_locks WHERE locked_until < UTC_TIMESTAMP() - INTERVAL 2 DAY');
        if ($ids) Publisher::publishAll();
        return ['cars' => count($ids), 'sessions' => $s, 'attempts' => $a];
    }

    /** Versione «pigra»: al massimo una volta ogni 6 ore (marker su file). */
    public static function lazy(): void
    {
        $marker = Util::privateDir('tmp') . '/last-purge';
        if (is_file($marker) && filemtime($marker) > time() - 6 * 3600) return;
        @touch($marker);
        try { self::purgeExpired(); } catch (Throwable $e) { error_log('[sulcis purge] ' . $e->getMessage()); }
    }
}
