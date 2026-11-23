<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
$m = Http::allow(['GET', 'POST', 'PUT', 'DELETE']);

if ($m === 'GET') {
    $id = Http::qInt('id', false);
    if ($id) Http::json(['car' => Cars::get($id) ?? throw new HttpError(404, 'Auto non trovata')]);
    $f = Validator::check($_GET, [
        'status' => ['type' => 'enum', 'values' => Cars::STATUSES],
        'category' => ['type' => 'slug', 'max' => 40],
        'q' => ['type' => 'string', 'max' => 80],
        'trash' => ['type' => 'enum', 'values' => ['1']],
    ]);
    Http::json(['cars' => Cars::list($f)]);
}
if ($m === 'POST') {
    $car = Cars::create(Http::body(), $user['id']);
    Publisher::publishAll();
    Http::json(['car' => $car], 201);
}
if ($m === 'PUT') {
    $car = Cars::update(Http::qInt('id'), Http::body(), $user['id']);
    Publisher::publishAll();
    Http::json(['car' => $car]);
}
if ($m === 'DELETE') {
    Cars::softDelete(Http::qInt('id'), $user['id']);
    Publisher::publishAll();
    Http::json(['ok' => true]);
}
