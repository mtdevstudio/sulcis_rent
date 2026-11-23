<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$start = microtime(true);
Http::apiHeaders();
Http::allow(['POST']);
Auth::checkOrigin();
$in = Validator::check(Http::body(), [
    'userId' => ['type' => 'int', 'required' => true, 'min' => 1, 'max' => 1000000],
    'pin' => ['type' => 'string', 'required' => true, 'max' => 32, 'pattern' => '/^\d{1,32}$/'],
]);
$ipHash = RateLimit::ipHash();
$userId = $in['userId'];

$wait = RateLimit::lockedFor($ipHash, $userId);
if ($wait > 0) {
    Auth::uniformDelay($start);
    $min = (int) ceil($wait / 60);
    Http::error(429, $min >= 90 ? 'Troppi tentativi, riprova tra ' . (int) ceil($min / 60) . ' ore' : "Troppi tentativi, riprova tra $min minut" . ($min === 1 ? 'o' : 'i'), ['retryAfter' => (string) $wait]);
}

$user = Db::one('SELECT id, name, role, pin_hash FROM admin_users WHERE id = ? AND active = 1', [$userId]);
// verifica sempre un hash (anche fittizio) per tempi uniformi
$ok = password_verify($in['pin'], $user['pin_hash'] ?? Pin::dummyHash()) && $user !== null;
RateLimit::record($ipHash, $user ? (int) $user['id'] : null, $ok);

if (!$ok) {
    $locked = RateLimit::afterFailure($ipHash, $user ? (int) $user['id'] : null);
    Auth::uniformDelay($start);
    if ($locked) Http::error(429, 'Troppi tentativi, riprova tra 15 minuti');
    Http::error(401, 'PIN non valido');
}

$uid = (int) $user['id'];
if (Pin::needsRehash($user['pin_hash'])) Db::run('UPDATE admin_users SET pin_hash = ? WHERE id = ?', [Pin::hash($in['pin']), $uid]);
Db::run('UPDATE admin_users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [$uid]);
$csrf = Auth::startSession($uid, $ipHash);
Audit::log($uid, 'login', 'auth', $uid);
if (Auth::isNewDevice($uid)) {
    Notify::send('Sulcis Rent · accesso da un nuovo dispositivo', "{$user['name']} ha effettuato l'accesso all'admin da un dispositivo nuovo (" . substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'sconosciuto'), 0, 120) . ").");
}
Trash::lazy();
Auth::uniformDelay($start);
Http::json(['user' => ['id' => $uid, 'name' => $user['name'], 'role' => $user['role']], 'csrf' => $csrf]);
