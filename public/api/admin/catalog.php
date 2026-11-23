<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
// lettura: staff (serve al form auto) · modifica: solo owner
$user = Auth::requireAuth(Http::method() === 'GET' ? 'staff' : 'owner');
$m = Http::allow(['GET', 'PUT']);
if ($m === 'GET') Http::json(['catalog' => Catalog::catalog()]);
$in = Validator::check(Http::body(), Catalog::schema());
foreach (['categories', 'features', 'tags'] as $k) {
    $keys = array_column($in[$k], 'key');
    if (count($keys) !== count(array_unique($keys))) throw new HttpError(422, 'Chiavi duplicate', [$k => 'chiavi duplicate']);
}
$old = Catalog::catalog();
Catalog::set('catalog', $in);
Audit::log($user['id'], 'update', 'settings', 'catalog', Audit::diff($old, $in));
Publisher::publishAll();
Http::json(['catalog' => Catalog::catalog()]);
