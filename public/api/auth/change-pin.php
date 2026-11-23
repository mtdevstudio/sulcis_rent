<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$start = microtime(true);
$user = Auth::requireAuth('staff');
Http::allow(['POST']);
$in = Validator::check(Http::body(), [
    'current' => ['type' => 'string', 'required' => true, 'max' => 32, 'pattern' => '/^\d+$/'],
    'next' => ['type' => 'string', 'required' => true, 'max' => 32],
]);
$ipHash = RateLimit::ipHash();
if (RateLimit::lockedFor($ipHash, $user['id']) > 0) { Auth::uniformDelay($start); Http::error(429, 'Troppi tentativi, riprova più tardi'); }
$hash = (string) Db::val('SELECT pin_hash FROM admin_users WHERE id = ?', [$user['id']]);
if (!password_verify($in['current'], $hash)) {
    RateLimit::record($ipHash, $user['id'], false);
    RateLimit::afterFailure($ipHash, $user['id']);
    Auth::uniformDelay($start);
    Http::error(401, 'PIN attuale non valido');
}
if ($err = Pin::policyError($in['next'])) { Auth::uniformDelay($start); Http::error(422, $err, ['next' => $err]); }
if (hash_equals($in['current'], $in['next'])) { Auth::uniformDelay($start); Http::error(422, 'Il nuovo PIN deve essere diverso', ['next' => 'uguale al precedente']); }
Db::run('UPDATE admin_users SET pin_hash = ?, pin_changed_at = UTC_TIMESTAMP() WHERE id = ?', [Pin::hash($in['next']), $user['id']]);
$revoked = Auth::revokeUserSessions($user['id'], $user['session_id']);
Audit::log($user['id'], 'change_pin', 'user', $user['id'], ['revoked_sessions' => $revoked]);
Auth::uniformDelay($start);
Http::json(['ok' => true, 'revokedSessions' => $revoked]);
