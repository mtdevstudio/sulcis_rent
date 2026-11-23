<?php
declare(strict_types=1);
// Utenti: SOLO owner. Crea staff, attiva/disattiva, rinomina, reset PIN, sblocca.
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('owner');
$m = Http::allow(['GET', 'POST', 'PUT']);
$map = static fn($u) => ['id' => (int) $u['id'], 'name' => $u['name'], 'role' => $u['role'], 'active' => (bool) $u['active'], 'color' => $u['color'],
    'createdAt' => $u['created_at'], 'lastLoginAt' => $u['last_login_at'], 'locked' => (bool) ($u['locked'] ?? false)];

if ($m === 'GET') {
    Http::json(['users' => array_map($map, Db::all(
        "SELECT u.*, (SELECT 1 FROM auth_locks l WHERE l.scope='user' AND l.scope_key = CAST(u.id AS CHAR) AND l.locked_until > UTC_TIMESTAMP()) AS locked
           FROM admin_users u ORDER BY u.role = 'owner' DESC, u.name"
    )), 'pinMinLength' => Pin::minLength()]);
}
if ($m === 'POST') {
    $in = Validator::check(Http::body(), [
        'name' => ['type' => 'string', 'required' => true, 'max' => 60, 'min' => 2],
        'pin' => ['type' => 'string', 'required' => true, 'max' => 32],
        'color' => ['type' => 'hex'],
    ]);
    if ($err = Pin::policyError($in['pin'])) throw new HttpError(422, $err, ['pin' => $err]);
    if (Db::val('SELECT 1 FROM admin_users WHERE name = ?', [$in['name']])) throw new HttpError(422, 'Nome già usato', ['name' => 'già esistente']);
    $id = Db::insert("INSERT INTO admin_users (name, pin_hash, role, active, color, created_at, pin_changed_at) VALUES (?, ?, 'staff', 1, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())",
        [$in['name'], Pin::hash($in['pin']), $in['color'] ?? null]);
    Audit::log($user['id'], 'create', 'user', $id, ['name' => $in['name'], 'role' => 'staff']);
    Http::json(['user' => $map(Db::one('SELECT * FROM admin_users WHERE id = ?', [$id]))], 201);
}
if ($m === 'PUT') {
    $id = Http::qInt('id');
    $target = Db::one('SELECT * FROM admin_users WHERE id = ?', [$id]) ?? throw new HttpError(404, 'Utente non trovato');
    $in = Validator::check(Http::body(), [
        'action' => ['type' => 'enum', 'required' => true, 'values' => ['activate', 'deactivate', 'rename', 'reset_pin', 'unlock', 'color']],
        'name' => ['type' => 'string', 'max' => 60, 'min' => 2],
        'pin' => ['type' => 'string', 'max' => 32],
        'color' => ['type' => 'hex'],
    ]);
    $isSelf = (int) $target['id'] === $user['id'];
    switch ($in['action']) {
        case 'deactivate':
            if ($isSelf || $target['role'] === 'owner') throw new HttpError(422, 'Non puoi disattivare il titolare');
            Db::run('UPDATE admin_users SET active = 0 WHERE id = ?', [$id]);
            Auth::revokeUserSessions($id);
            break;
        case 'activate':
            Db::run('UPDATE admin_users SET active = 1 WHERE id = ?', [$id]);
            break;
        case 'rename':
            if (empty($in['name'])) throw new HttpError(422, 'Nome obbligatorio', ['name' => 'obbligatorio']);
            if (Db::val('SELECT 1 FROM admin_users WHERE name = ? AND id <> ?', [$in['name'], $id])) throw new HttpError(422, 'Nome già usato', ['name' => 'già esistente']);
            Db::run('UPDATE admin_users SET name = ? WHERE id = ?', [$in['name'], $id]);
            break;
        case 'color':
            Db::run('UPDATE admin_users SET color = ? WHERE id = ?', [$in['color'] ?? null, $id]);
            break;
        case 'reset_pin':
            if ($target['role'] === 'owner' && !$isSelf) throw new HttpError(422, 'Il PIN del titolare si cambia dal suo profilo');
            if ($isSelf) throw new HttpError(422, 'Per il tuo PIN usa «Cambia PIN» (serve quello attuale)');
            $pin = (string) ($in['pin'] ?? '');
            if ($err = Pin::policyError($pin)) throw new HttpError(422, $err, ['pin' => $err]);
            Db::run('UPDATE admin_users SET pin_hash = ?, pin_changed_at = UTC_TIMESTAMP() WHERE id = ?', [Pin::hash($pin), $id]);
            Auth::revokeUserSessions($id);
            RateLimit::unlock($id);
            break;
        case 'unlock':
            RateLimit::unlock($id);
            break;
    }
    Audit::log($user['id'], $in['action'], 'user', $id, ['name' => $in['name'] ?? $target['name']]);
    Http::json(['user' => $map(Db::one('SELECT * FROM admin_users WHERE id = ?', [$id]))]);
}
