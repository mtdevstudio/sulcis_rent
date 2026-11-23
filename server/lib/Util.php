<?php
declare(strict_types=1);

final class HttpError extends RuntimeException
{
    public int $status;
    public array $details;
    public function __construct(int $status, string $message, array $details = [])
    {
        parent::__construct($message);
        $this->status = $status;
        $this->details = $details;
    }
}

final class Util
{
    public static function cfg(string $path, $default = null)
    {
        $v = $GLOBALS['SR_CONFIG'] ?? [];
        foreach (explode('.', $path) as $k) {
            if (!is_array($v) || !array_key_exists($k, $v)) return $default;
            $v = $v[$k];
        }
        return $v ?? $default;
    }

    public static function now(): string { return gmdate('Y-m-d H:i:s'); }

    public static function uuid(): string
    {
        $b = random_bytes(16);
        $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
        $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
    }

    public static function slugify(string $s): string
    {
        $s = trim($s);
        if (function_exists('transliterator_transliterate')) {
            $s = (string) transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $s);
        } else {
            $s = strtolower((string) iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s));
        }
        $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
        return trim(substr(trim($s, '-'), 0, 80), '-');
    }

    public static function docroot(): string
    {
        $d = self::cfg('paths.docroot');
        if ($d) return rtrim($d, '/');
        if (!empty($_SERVER['DOCUMENT_ROOT'])) return rtrim($_SERVER['DOCUMENT_ROOT'], '/');
        return dirname(__DIR__, 2) . '/public';
    }

    /** File di stato (es. setup.lock): cartella privata o paths.state. */
    public static function stateFile(string $name): string
    {
        $dir = self::cfg('paths.state') ?: SR_PRIVATE;
        return rtrim($dir, '/') . '/' . $name;
    }

    public static function privateDir(string $sub): string
    {
        $map = ['logs' => self::cfg('paths.logs'), 'tmp' => self::cfg('paths.tmp')];
        $dir = $map[$sub] ?? null ?: SR_PRIVATE . '/' . $sub;
        if (!is_dir($dir)) @mkdir($dir, 0750, true);
        return $dir;
    }

    /** Scrittura atomica (tmp + rename): i lettori non vedono mai un JSON a metà. */
    public static function writeAtomic(string $file, string $content): void
    {
        $dir = dirname($file);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) throw new RuntimeException("mkdir $dir");
        $tmp = $dir . '/.' . basename($file) . '.' . bin2hex(random_bytes(4)) . '.tmp';
        if (file_put_contents($tmp, $content, LOCK_EX) === false) throw new RuntimeException("write $tmp");
        @chmod($tmp, 0644);
        if (!rename($tmp, $file)) { @unlink($tmp); throw new RuntimeException("rename $file"); }
    }

    public static function rrmdir(string $dir): void
    {
        if (!is_dir($dir)) return;
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $f) {
            $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname());
        }
        @rmdir($dir);
    }
}
