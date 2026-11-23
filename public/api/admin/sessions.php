<?php
declare(strict_types=1);
// Sessioni attive: SOLO owner. DELETE ?id=… revoca una sessione; DELETE ?all=1 disconnette tutti (tranne te).
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('owner');
$m = Http::allow(['GET', 'DELETE']);
if ($m === 'GET') {
    $rows = Db::all('SELECT s.id, s.user_id, u.name, s.created_at, s.last_seen_at, s.expires_at, s.user_agent FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.expires_at > UTC_TIMESTAMP() ORDER BY s.last_seen_at DESC');
    Http::json(['sessions' => array_map(static fn($s) => ['id' => (int) $s['id'], 'userId' => (int) $s['user_id'], 'name' => $s['name'], 'createdAt' => $s['created_at'],
        'lastSeenAt' => $s['last_seen_at'], 'expiresAt' => $s['expires_at'], 'userAgent' => $s['user_agent'], 'current' => (int) $s['id'] === $user['session_id']], $rows)]);
}
if (($_GET['all'] ?? '') === '1') {
    $n = Db::run('DELETE FROM admin_sessions WHERE id <> ?', [$user['session_id']])->rowCount();
    Audit::log($user['id'], 'revoke_all', 'session', null, ['count' => $n]);
    Http::json(['ok' => true, 'revoked' => $n]);
}
$id = Http::qInt('id');
$n = Db::run('DELETE FROM admin_sessions WHERE id = ?', [$id])->rowCount();
Audit::log($user['id'], 'revoke', 'session', $id);
Http::json(['ok' => true, 'revoked' => $n]);
