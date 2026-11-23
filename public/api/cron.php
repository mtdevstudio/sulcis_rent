<?php
declare(strict_types=1);
// Pulizia programmata via URL (per hosting con cron «a URL»): /api/cron.php?token=<cron_token>
// Preferibile il cron CLI: php server/cli/purge.php. Se nessuno dei due è disponibile, la pulizia avviene al login.
require __DIR__ . '/_boot.php';
Http::apiHeaders();
Http::allow(['GET', 'POST']);
$expected = (string) Util::cfg('cron_token', '');
$token = (string) ($_GET['token'] ?? '');
if (strlen($expected) < 32 || !hash_equals($expected, $token)) throw new HttpError(404, 'Non trovato');
Http::json(['ok' => true] + Trash::purgeExpired());
