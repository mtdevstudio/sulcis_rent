<?php
// php server/cli/migrate.php — applica le migrazioni mancanti e rigenera i JSON pubblici.
require __DIR__ . '/_cli.php';
$applied = Migrator::run();
echo $applied ? 'Applicate: ' . implode(', ', $applied) . PHP_EOL : 'Database già aggiornato.' . PHP_EOL;
if (!empty($argv[1]) && $argv[1] === '--docroot' && !empty($argv[2])) $GLOBALS['SR_CONFIG']['paths']['docroot'] = $argv[2];
try { Publisher::publishAll(); echo "JSON pubblici rigenerati.\n"; } catch (Throwable $e) { echo "Attenzione: JSON non rigenerati (" . $e->getMessage() . ")\n"; }
