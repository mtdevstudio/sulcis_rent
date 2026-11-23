<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../bootstrap.php';
set_exception_handler(static function (Throwable $e): void { fwrite(STDERR, 'Errore: ' . $e->getMessage() . PHP_EOL); exit(1); });
function ask(string $q, bool $hidden = false): string {
    echo $q;
    if ($hidden && DIRECTORY_SEPARATOR === '/') { system('stty -echo'); $v = trim((string) fgets(STDIN)); system('stty echo'); echo PHP_EOL; return $v; }
    return trim((string) fgets(STDIN));
}
