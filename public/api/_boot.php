<?php
declare(strict_types=1);
/**
 * Individua la cartella PRIVATA (server/, database/, config.php) e carica il bootstrap.
 * Ordine: variabile d'ambiente SR_PRIVATE_DIR → cartella «sulcis-private» accanto alla document root
 * → <docroot>/_private (protetta da .htaccess «Require all denied»).
 */
(static function (): void {
    $docroot = dirname(__DIR__);
    foreach ([getenv('SR_PRIVATE_DIR') ?: null, dirname($docroot) . '/sulcis-private', $docroot . '/_private'] as $dir) {
        if ($dir && is_file($dir . '/server/bootstrap.php')) { require_once $dir . '/server/bootstrap.php'; return; }
    }
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"error":"Servizio non configurato"}';
    exit;
})();
