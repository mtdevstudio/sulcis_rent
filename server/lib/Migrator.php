<?php
declare(strict_types=1);

/** Applica le migrazioni SQL versionate di database/migrations (una sola volta ciascuna). */
final class Migrator
{
    public static function dir(): string
    {
        foreach ([SR_PRIVATE . '/database/migrations', dirname(SR_PRIVATE) . '/database/migrations'] as $d) if (is_dir($d)) return $d;
        throw new RuntimeException('Cartella database/migrations non trovata');
    }

    /** @return string[] migrazioni applicate in questa esecuzione */
    public static function run(): array
    {
        $pdo = Db::pdo();
        $pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) NOT NULL PRIMARY KEY, applied_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $done = array_flip($pdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN));
        $files = glob(self::dir() . '/*.sql') ?: [];
        sort($files, SORT_STRING);
        $applied = [];
        foreach ($files as $f) {
            $v = basename($f, '.sql');
            if (isset($done[$v])) continue;
            $sql = (string) file_get_contents($f);
            $sql = preg_replace('/^\s*--.*$/m', '', $sql) ?? '';
            foreach (preg_split('/;\s*\n/', $sql) ?: [] as $stmt) {
                if (trim($stmt) !== '') $pdo->exec($stmt);
            }
            Db::run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, UTC_TIMESTAMP())', [$v]);
            $applied[] = $v;
        }
        return $applied;
    }
}
