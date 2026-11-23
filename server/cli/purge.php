<?php
// Cron: php /percorso/sulcis-private/server/cli/purge.php — svuota il cestino (>30 giorni), sessioni scadute e vecchi tentativi.
require __DIR__ . '/_cli.php';
$r = Trash::purgeExpired();
echo json_encode($r) . PHP_EOL;
