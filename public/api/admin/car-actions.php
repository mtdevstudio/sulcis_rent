<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['POST']);
$in = Validator::check(Http::body(), [
    'id' => ['type' => 'int', 'required' => true, 'min' => 1],
    'action' => ['type' => 'enum', 'required' => true, 'values' => ['publish', 'hide', 'draft', 'duplicate', 'restore', 'purge', 'feature', 'unfeature']],
]);
$car = match ($in['action']) {
    'publish' => Cars::setStatus($in['id'], 'published', $user['id']),
    'hide' => Cars::setStatus($in['id'], 'hidden', $user['id']),
    'draft' => Cars::setStatus($in['id'], 'draft', $user['id']),
    'duplicate' => Cars::duplicate($in['id'], $user['id']),
    'restore' => Cars::restore($in['id'], $user['id']),
    'feature' => Cars::setFeatured($in['id'], true, $user['id']),
    'unfeature' => Cars::setFeatured($in['id'], false, $user['id']),
    'purge' => (static function () use ($in, $user) { Cars::purge($in['id'], $user['id']); return null; })(),
};
Publisher::publishAll();
Http::json(['car' => $car]);
