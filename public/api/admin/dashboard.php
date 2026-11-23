<?php
declare(strict_types=1);
require __DIR__ . '/../_boot.php';
$user = Auth::requireAuth('staff');
Http::allow(['GET']);
$counts = ['published' => 0, 'draft' => 0, 'hidden' => 0];
foreach (Db::all('SELECT status, COUNT(*) n FROM cars WHERE deleted_at IS NULL GROUP BY status') as $r) $counts[$r['status']] = (int) $r['n'];
$trash = (int) Db::val('SELECT COUNT(*) FROM cars WHERE deleted_at IS NOT NULL');
$recent = Db::all(
    "SELECT a.action, a.entity, a.entity_id, a.created_at, u.name AS user_name, c.brand, c.model
       FROM audit_log a LEFT JOIN admin_users u ON u.id = a.user_id
       LEFT JOIN cars c ON a.entity = 'car' AND c.id = a.entity_id
      WHERE a.entity IN ('car','review','faq','settings') ORDER BY a.id DESC LIMIT 8"
);
Http::json(['counts' => $counts + ['trash' => $trash], 'recent' => array_map(static fn($r) => [
    'action' => $r['action'], 'entity' => $r['entity'], 'entityId' => $r['entity_id'], 'at' => $r['created_at'],
    'user' => $r['user_name'], 'label' => $r['brand'] !== null ? trim($r['brand'] . ' ' . $r['model']) : null,
], $recent)]);
