<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['POST']);
Audit::log($user['id'], 'logout', 'auth', $user['id']);
Auth::endSession();
Http::json(['ok' => true]);
