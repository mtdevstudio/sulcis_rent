<?php
declare(strict_types=1);
// Recensioni: SOLO recensioni reali copiate da Google (avviso fisso nel form).
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
$m = Http::allow(['GET', 'POST', 'PUT', 'DELETE']);
$schema = [
    'author' => ['type' => 'string', 'required' => true, 'max' => 80],
    'text' => ['type' => 'string', 'required' => true, 'max' => 3000],
    'rating' => ['type' => 'int', 'required' => true, 'min' => 1, 'max' => 5],
    'date' => ['type' => 'date', 'required' => true],
    'url' => ['type' => 'url', 'max' => 500],
    'published' => ['type' => 'bool'],
    'sortOrder' => ['type' => 'int', 'min' => 0, 'max' => 100000],
];
$map = static fn($r) => ['id' => (int) $r['id'], 'author' => $r['author'], 'text' => $r['text'], 'rating' => (int) $r['rating'], 'date' => $r['review_date'],
    'url' => $r['url'], 'published' => (bool) $r['published'], 'sortOrder' => (int) $r['sort_order'], 'updatedAt' => $r['updated_at']];

if ($m === 'GET') Http::json(['reviews' => array_map($map, Db::all('SELECT * FROM reviews ORDER BY sort_order, review_date DESC'))]);
if ($m === 'POST') {
    $in = Validator::check(Http::body(), $schema);
    $id = Db::insert('INSERT INTO reviews (author, text, rating, review_date, url, source, published, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, \'Google\', ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
        [$in['author'], $in['text'], $in['rating'], $in['date'], $in['url'] ?? null, ($in['published'] ?? true) ? 1 : 0, $in['sortOrder'] ?? 0]);
    Audit::log($user['id'], 'create', 'review', $id, ['author' => $in['author']]);
    Publisher::publishAll();
    Http::json(['review' => $map(Db::one('SELECT * FROM reviews WHERE id = ?', [$id]))], 201);
}
$id = Http::qInt('id');
$old = Db::one('SELECT * FROM reviews WHERE id = ?', [$id]) ?? throw new HttpError(404, 'Recensione non trovata');
if ($m === 'PUT') {
    $in = Validator::check(Http::body(), $schema);
    Db::run('UPDATE reviews SET author=?, text=?, rating=?, review_date=?, url=?, published=?, sort_order=?, updated_at=UTC_TIMESTAMP() WHERE id=?',
        [$in['author'], $in['text'], $in['rating'], $in['date'], $in['url'] ?? null, ($in['published'] ?? true) ? 1 : 0, $in['sortOrder'] ?? (int) $old['sort_order'], $id]);
    $new = Db::one('SELECT * FROM reviews WHERE id = ?', [$id]);
    Audit::log($user['id'], 'update', 'review', $id, Audit::diff($map($old), $map($new)));
    Publisher::publishAll();
    Http::json(['review' => $map($new)]);
}
if ($m === 'DELETE') {
    Db::run('DELETE FROM reviews WHERE id = ?', [$id]);
    Audit::log($user['id'], 'delete', 'review', $id, ['author' => $old['author']]);
    Publisher::publishAll();
    Http::json(['ok' => true]);
}
