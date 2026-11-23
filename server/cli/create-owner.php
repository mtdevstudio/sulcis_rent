<?php
// php server/cli/create-owner.php — crea il primo titolare (alternativa alla pagina di setup, dove c'è SSH).
require __DIR__ . '/_cli.php';
Migrator::run();
$name = $argv[1] ?? ask('Nome del titolare: ');
$pin = getenv('SR_PIN') ?: ask('PIN (almeno ' . Pin::minLength() . ' cifre): ', true);
if ($err = Pin::policyError($pin)) { fwrite(STDERR, $err . PHP_EOL); exit(1); }
if (!getenv('SR_PIN') && ask('Ripeti il PIN: ', true) !== $pin) { fwrite(STDERR, "I PIN non coincidono\n"); exit(1); }
$id = Db::insert("INSERT INTO admin_users (name, pin_hash, role, active, color, created_at, pin_changed_at) VALUES (?, ?, 'owner', 1, '#D11F6E', UTC_TIMESTAMP(), UTC_TIMESTAMP())", [$name, Pin::hash($pin)]);
Audit::log(null, 'cli_create_owner', 'user', $id, ['name' => $name]);
@file_put_contents(Util::stateFile('setup.lock'), gmdate('c'));
echo "Titolare «{$name}» creato (id $id). La pagina di setup è disattivata.\n";
