<?php
declare(strict_types=1);
// Impostazioni contatti: SOLO owner.
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('owner');
$m = Http::allow(['GET', 'PUT']);
if ($m === 'GET') Http::json(['contact' => Catalog::get('contact'), 'catalog' => Catalog::catalog()]);
$in = Validator::check(Http::body(), Catalog::contactSchema());
$old = Catalog::get('contact');
Catalog::set('contact', array_filter($in, static fn($v) => $v !== null));
Audit::log($user['id'], 'update', 'settings', 'contact', Audit::diff($old, $in));
Publisher::publishAll();
Http::json(['contact' => Catalog::get('contact')]);
