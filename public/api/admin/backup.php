<?php
declare(strict_types=1);
// Backup ZIP (dump SQL + foto + JSON). SOLO owner. GET → download.
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('owner');
Http::allow(['GET']);
@set_time_limit(300);
$file = Backup::create();
Audit::log($user['id'], 'backup', 'system', null, ['bytes' => filesize($file)]);
header_remove('Content-Type');
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="sulcisrent-backup-' . gmdate('Y-m-d') . '.zip"');
header('Content-Length: ' . filesize($file));
readfile($file);
@unlink($file);
exit;
