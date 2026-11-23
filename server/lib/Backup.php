<?php
declare(strict_types=1);

/** Backup ZIP: dump SQL (senza sessioni e tentativi) + foto + JSON pubblici. */
final class Backup
{
    private const SKIP_DATA = ['admin_sessions', 'auth_attempts', 'auth_locks'];

    public static function create(): string
    {
        if (!class_exists('ZipArchive')) throw new RuntimeException('Estensione zip non disponibile');
        $file = Util::privateDir('tmp') . '/backup-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.zip';
        $zip = new ZipArchive();
        if ($zip->open($file, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) throw new RuntimeException('zip open');
        $zip->addFromString('database.sql', self::dump());
        $root = Util::docroot();
        foreach (['media', 'data'] as $sub) {
            $dir = "$root/$sub";
            if (!is_dir($dir)) continue;
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)) as $f) {
                if ($f->isFile() && preg_match('/\.(webp|json)$/', $f->getFilename())) $zip->addFile($f->getPathname(), $sub . substr($f->getPathname(), strlen($dir)));
            }
        }
        $zip->addFromString('LEGGIMI.txt', "Backup Sulcis Rent del " . gmdate('c') . " (UTC)\n\nRipristino: vedi README, sezione «Backup e ripristino».\n1. Importa database.sql nel database (phpMyAdmin → Importa).\n2. Carica le cartelle media/ e data/ nella document root via FTP.\n");
        $zip->close();
        return $file;
    }

    private static function dump(): string
    {
        $pdo = Db::pdo();
        $out = "-- Sulcis Rent backup " . gmdate('c') . "\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n\n";
        foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) {
            if (!preg_match('/^[a-z_]+$/', $t)) continue;
            $create = $pdo->query("SHOW CREATE TABLE `$t`")->fetch(PDO::FETCH_NUM)[1];
            $out .= "DROP TABLE IF EXISTS `$t`;\n$create;\n\n";
            if (in_array($t, self::SKIP_DATA, true)) continue;
            $st = $pdo->query("SELECT * FROM `$t`");
            while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
                $vals = array_map(static fn($v) => $v === null ? 'NULL' : $pdo->quote((string) $v), $row);
                $out .= "INSERT INTO `$t` (`" . implode('`,`', array_keys($row)) . "`) VALUES (" . implode(',', $vals) . ");\n";
            }
            $out .= "\n";
        }
        return $out . "SET FOREIGN_KEY_CHECKS=1;\n";
    }
}
