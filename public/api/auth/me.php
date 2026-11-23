<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['GET']);
Http::json([
    'user' => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']],
    'capabilities' => Images::capabilities(),
    'pinMinLength' => Pin::minLength(),
]);
