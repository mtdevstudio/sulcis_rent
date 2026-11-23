<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['POST']);
$in = Validator::check(Http::body(), ['ids' => ['type' => 'array', 'required' => true, 'items' => ['type' => 'int', 'min' => 1], 'maxItems' => 500, 'unique' => true]]);
Cars::reorder($in['ids'], $user['id']);
Publisher::publishAll();
Http::json(['ok' => true]);
