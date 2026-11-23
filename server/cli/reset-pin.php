<?php
// php server/cli/reset-pin.php "Nome" — reimposta il PIN di un utente (anche del titolare), chiude le sue sessioni e lo sblocca.
require __DIR__ . '/_cli.php';
$name = $argv[1] ?? ask('Nome utente: ');
$u = Db::one('SELECT id, name FROM admin_users WHERE name = ?', [$name]) ?? throw new RuntimeException('Utente non trovato');
$pin = getenv('SR_PIN') ?: ask('Nuovo PIN: ', true);
if ($err = Pin::policyError($pin)) { fwrite(STDERR, $err . PHP_EOL); exit(1); }
Db::run('UPDATE admin_users SET pin_hash = ?, pin_changed_at = UTC_TIMESTAMP(), active = 1 WHERE id = ?', [Pin::hash($pin), $u['id']]);
Auth::revokeUserSessions((int) $u['id']);
RateLimit::unlock((int) $u['id']);
Audit::log(null, 'cli_reset_pin', 'user', $u['id']);
echo "PIN reimpostato per {$u['name']}.\n";
