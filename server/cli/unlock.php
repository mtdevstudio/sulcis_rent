<?php
// php server/cli/unlock.php [--all] — rimuove i blocchi dei tentativi PIN (tutti, o --global per il solo blocco globale).
require __DIR__ . '/_cli.php';
$n = in_array('--global', $argv, true) ? Db::run("DELETE FROM auth_locks WHERE scope='global'")->rowCount() : Db::run('DELETE FROM auth_locks')->rowCount();
Audit::log(null, 'cli_unlock', 'auth', null, ['removed' => $n]);
echo "Blocchi rimossi: $n\n";
