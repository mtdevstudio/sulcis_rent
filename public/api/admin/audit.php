<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('owner');
Http::allow(['GET']);
$page = Http::qInt('page', false) ?? 1;
$per = 50;
$rows = Db::all(
    'SELECT a.id, a.action, a.entity, a.entity_id, a.diff, a.created_at, u.name FROM audit_log a LEFT JOIN admin_users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT ? OFFSET ?',
    [$per + 1, ($page - 1) * $per]
);
Http::json(['entries' => array_map(static fn($r) => ['id' => (int) $r['id'], 'action' => $r['action'], 'entity' => $r['entity'], 'entityId' => $r['entity_id'],
    'diff' => $r['diff'] ? json_decode($r['diff'], true) : null, 'at' => $r['created_at'], 'user' => $r['name']], array_slice($rows, 0, $per)),
    'page' => $page, 'hasMore' => count($rows) > $per]);
