<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
$m = Http::allow(['POST', 'PATCH', 'DELETE']);

if ($m === 'POST') {
    // multipart: car_id + file. Validazione del tipo reale e ricodifica in Images::processUpload.
    $carId = isset($_POST['car_id']) && is_string($_POST['car_id']) && preg_match('/^[1-9]\d{0,9}$/', $_POST['car_id']) ? (int) $_POST['car_id'] : 0;
    if (!$carId || !Cars::get($carId)) throw new HttpError(404, 'Auto non trovata');
    if (empty($_FILES['file']) || is_array($_FILES['file']['name'])) {
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && empty($_POST)) throw new HttpError(413, 'Foto troppo grande per il server');
        throw new HttpError(400, 'Nessun file ricevuto');
    }
    if ((int) Db::val('SELECT COUNT(*) FROM car_photos WHERE car_id = ?', [$carId]) >= 30) throw new HttpError(422, 'Massimo 30 foto per auto');
    $res = Images::processUpload($_FILES['file'], Images::mediaDir($carId));
    $order = (int) Db::val('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM car_photos WHERE car_id = ?', [$carId]);
    $id = Db::insert(
        'INSERT INTO car_photos (car_id, uuid, sort_order, width, height, widths, created_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())',
        [$carId, $res['uuid'], $order, $res['width'], $res['height'], json_encode($res['widths'])]
    );
    Db::run('UPDATE cars SET updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$user['id'], $carId]);
    Audit::log($user['id'], 'photo_add', 'car', $carId, ['photo' => $id]);
    Publisher::publishAll();
    $photo = array_values(array_filter(Cars::photos($carId), static fn($p) => $p['id'] === $id))[0];
    Http::json(['photo' => $photo], 201);
}

if ($m === 'PATCH') {
    $in = Validator::check(Http::body(), [
        'carId' => ['type' => 'int', 'required' => true, 'min' => 1],
        'order' => ['type' => 'array', 'items' => ['type' => 'int', 'min' => 1], 'maxItems' => 30, 'unique' => true],
        'alts' => ['type' => 'array', 'maxItems' => 30, 'items' => ['type' => 'object', 'fields' => [
            'id' => ['type' => 'int', 'required' => true, 'min' => 1],
            'alt' => ['type' => 'l10n', 'max' => 160],
        ]]],
    ]);
    $carId = $in['carId'];
    if (!Cars::get($carId)) throw new HttpError(404, 'Auto non trovata');
    Db::tx(static function () use ($in, $carId) {
        foreach ($in['order'] ?? [] as $i => $pid) Db::run('UPDATE car_photos SET sort_order = ? WHERE id = ? AND car_id = ?', [$i + 1, $pid, $carId]);
        foreach ($in['alts'] ?? [] as $a) Db::run('UPDATE car_photos SET alt_it = ?, alt_en = ? WHERE id = ? AND car_id = ?', [$a['alt']['it'] ?? null, $a['alt']['en'] ?? null, $a['id'], $carId]);
    });
    Db::run('UPDATE cars SET updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$user['id'], $carId]);
    Audit::log($user['id'], 'photo_update', 'car', $carId, ['order' => $in['order'] ?? null]);
    Publisher::publishAll();
    Http::json(['photos' => Cars::photos($carId)]);
}

if ($m === 'DELETE') {
    $pid = Http::qInt('id');
    $p = Db::one('SELECT p.id, p.car_id, p.uuid, c.status FROM car_photos p JOIN cars c ON c.id = p.car_id WHERE p.id = ?', [$pid]) ?? throw new HttpError(404, 'Foto non trovata');
    $count = (int) Db::val('SELECT COUNT(*) FROM car_photos WHERE car_id = ?', [$p['car_id']]);
    if ($p['status'] === 'published' && $count <= 1) throw new HttpError(422, 'Un\'auto pubblicata deve avere almeno una foto: nascondila prima di togliere l\'ultima');
    Db::run('DELETE FROM car_photos WHERE id = ?', [$pid]);
    Images::deleteFiles((int) $p['car_id'], $p['uuid']);
    Audit::log($user['id'], 'photo_delete', 'car', (int) $p['car_id'], ['photo' => $pid]);
    Publisher::publishAll();
    Http::json(['ok' => true]);
}
