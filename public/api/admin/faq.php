<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
$m = Http::allow(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
$schema = [
    'question' => ['type' => 'l10n', 'required' => true, 'max' => 300],
    'answer' => ['type' => 'l10n', 'required' => true, 'max' => 5000, 'html' => true],
    'published' => ['type' => 'bool'],
];
$map = static fn($r) => ['id' => (int) $r['id'], 'question' => array_filter(['it' => $r['question_it'], 'en' => $r['question_en']]),
    'answer' => array_filter(['it' => $r['answer_it'], 'en' => $r['answer_en']]), 'published' => (bool) $r['published'], 'sortOrder' => (int) $r['sort_order']];
$need = static function (array $in) {
    if (empty($in['question']['it'])) throw new HttpError(422, 'Dati non validi', ['question.it' => 'obbligatorio']);
    if (empty($in['answer']['it'])) throw new HttpError(422, 'Dati non validi', ['answer.it' => 'obbligatorio']);
};

if ($m === 'GET') Http::json(['faq' => array_map($map, Db::all('SELECT * FROM faq ORDER BY sort_order, id'))]);
if ($m === 'PATCH') { // riordino
    $in = Validator::check(Http::body(), ['ids' => ['type' => 'array', 'required' => true, 'items' => ['type' => 'int', 'min' => 1], 'maxItems' => 200, 'unique' => true]]);
    Db::tx(static function () use ($in) { foreach ($in['ids'] as $i => $id) Db::run('UPDATE faq SET sort_order = ? WHERE id = ?', [$i + 1, $id]); });
    Audit::log($user['id'], 'reorder', 'faq', null, ['ids' => $in['ids']]);
    Publisher::publishAll();
    Http::json(['ok' => true]);
}
if ($m === 'POST') {
    $in = Validator::check(Http::body(), $schema); $need($in);
    $order = (int) Db::val('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM faq');
    $id = Db::insert('INSERT INTO faq (question_it, answer_it, question_en, answer_en, published, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())',
        [$in['question']['it'], $in['answer']['it'], $in['question']['en'] ?? null, $in['answer']['en'] ?? null, ($in['published'] ?? true) ? 1 : 0, $order]);
    Audit::log($user['id'], 'create', 'faq', $id);
    Publisher::publishAll();
    Http::json(['item' => $map(Db::one('SELECT * FROM faq WHERE id = ?', [$id]))], 201);
}
$id = Http::qInt('id');
$old = Db::one('SELECT * FROM faq WHERE id = ?', [$id]) ?? throw new HttpError(404, 'Domanda non trovata');
if ($m === 'PUT') {
    $in = Validator::check(Http::body(), $schema); $need($in);
    Db::run('UPDATE faq SET question_it=?, answer_it=?, question_en=?, answer_en=?, published=?, updated_at=UTC_TIMESTAMP() WHERE id=?',
        [$in['question']['it'], $in['answer']['it'], $in['question']['en'] ?? null, $in['answer']['en'] ?? null, ($in['published'] ?? true) ? 1 : 0, $id]);
    $new = Db::one('SELECT * FROM faq WHERE id = ?', [$id]);
    Audit::log($user['id'], 'update', 'faq', $id, Audit::diff($map($old), $map($new)));
    Publisher::publishAll();
    Http::json(['item' => $map($new)]);
}
if ($m === 'DELETE') {
    Db::run('DELETE FROM faq WHERE id = ?', [$id]);
    Audit::log($user['id'], 'delete', 'faq', $id);
    Publisher::publishAll();
    Http::json(['ok' => true]);
}
