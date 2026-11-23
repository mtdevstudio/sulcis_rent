<?php
declare(strict_types=1);

/**
 * Bootstrap dell'API. Incluso da public/api/_boot.php.
 * - display_errors OFF, errori su file non pubblico, risposte JSON generiche;
 * - carica config.php dalla cartella privata;
 * - carica le classi in server/lib.
 */
const SR_PRIVATE = __DIR__ . '/..';

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

$cfgFile = null;
foreach ([getenv('SR_CONFIG') ?: null, SR_PRIVATE . '/config.php', __DIR__ . '/config.php'] as $f) {
    if ($f && is_file($f)) { $cfgFile = $f; break; }
}
if (!$cfgFile) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"error":"Servizio non configurato"}';
    exit;
}
$GLOBALS['SR_CONFIG'] = require $cfgFile;

$logDir = $GLOBALS['SR_CONFIG']['paths']['logs'] ?? null ?: SR_PRIVATE . '/logs';
if (!is_dir($logDir)) @mkdir($logDir, 0750, true);
ini_set('error_log', $logDir . '/php-error.log');

$autoload = __DIR__ . '/vendor/autoload.php';
if (is_file($autoload)) require_once $autoload;

foreach (['Util', 'Http', 'Db', 'Validator', 'Sanitizer', 'Pin', 'RateLimit', 'Auth', 'Audit', 'Notify', 'Catalog', 'Images', 'Cars', 'Publisher', 'Seo', 'Trash', 'Backup', 'Migrator'] as $c) {
    require_once __DIR__ . "/lib/$c.php";
}

set_exception_handler(static function (Throwable $e): void {
    if ($e instanceof HttpError) { Http::error($e->status, $e->getMessage(), $e->details); }
    error_log('[sulcis] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    Http::error(500, 'Errore interno. Riprova tra poco.');
});
