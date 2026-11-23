<?php
declare(strict_types=1);
// PUBBLICO (sola lettura): elenco nomi per la schermata di scelta utente. Niente ruoli, niente altro.
require __DIR__ . '/../_boot.php';
Http::apiHeaders();
Http::allow(['GET']);
$users = Db::all('SELECT id, name, color FROM admin_users WHERE active = 1 ORDER BY role = \'owner\' DESC, name');
Http::json(['users' => array_map(static fn($u) => ['id' => (int) $u['id'], 'name' => $u['name'], 'color' => $u['color']], $users)]);
