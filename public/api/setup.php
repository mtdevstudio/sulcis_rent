<?php
declare(strict_types=1);
/**
 * SETUP MONOUSO (per hosting senza SSH, es. Aruba).
 * 1. Verifica requisiti  2. Applica le migrazioni  3. Crea il primo owner  4. Si autodisabilita (setup.lock).
 * Protetto da setup_token in config.php. Dopo l'uso risponde sempre 404.
 */
require __DIR__ . '/_boot.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");

$lock = Util::stateFile('setup.lock');
$token = (string) Util::cfg('setup_token', '');
$hasOwner = static function (): bool { try { return (bool) Db::val("SELECT 1 FROM admin_users WHERE role = 'owner' LIMIT 1"); } catch (Throwable $e) { return false; } };
if (is_file($lock) || strlen($token) < 32 || str_starts_with($token, 'CAMBIAMI') || $hasOwner()) {
    if (!is_file($lock) && $hasOwner()) @file_put_contents($lock, gmdate('c'));
    http_response_code(404);
    exit('Non trovato');
}

$e = static fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
$checks = [
    'PHP ≥ 8.1' => version_compare(PHP_VERSION, '8.1.0', '>='),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'mbstring' => extension_loaded('mbstring'),
    'fileinfo' => extension_loaded('fileinfo'),
    'imagick o gd con WebP' => Images::capabilities()['webp'],
    'sodium o openssl' => extension_loaded('sodium') || extension_loaded('openssl'),
    'Argon2id (altrimenti bcrypt 12)' => defined('PASSWORD_ARGON2ID'),
    'zip (backup)' => class_exists('ZipArchive'),
    'cartella data/ scrivibile' => is_writable(Util::docroot() . '/data'),
    'cartella media/ scrivibile' => is_writable(Util::docroot() . '/media'),
    'HTTPS' => (($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https',
];
$msg = ''; $ok = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = array_map(static fn($o) => rtrim((string) $o, '/'), (array) Util::cfg('allowed_origins', []));
    usleep(400000);
    if ($origin !== '' && !in_array(rtrim($origin, '/'), $allowed, true)) $msg = 'Origine non consentita.';
    elseif (!hash_equals($token, (string) ($_POST['token'] ?? ''))) $msg = 'Token non valido.';
    else {
        $name = trim((string) ($_POST['name'] ?? ''));
        $pin = (string) ($_POST['pin'] ?? '');
        $pin2 = (string) ($_POST['pin2'] ?? '');
        if (mb_strlen($name) < 2 || mb_strlen($name) > 60) $msg = 'Nome non valido (2–60 caratteri).';
        elseif ($pin !== $pin2) $msg = 'I due PIN non coincidono.';
        elseif ($err = Pin::policyError($pin)) $msg = $err . '.';
        else {
            try {
                $applied = Migrator::run();
                if ($hasOwner()) { $msg = 'Esiste già un titolare.'; }
                else {
                    $id = Db::insert("INSERT INTO admin_users (name, pin_hash, role, active, color, created_at, pin_changed_at) VALUES (?, ?, 'owner', 1, '#D11F6E', UTC_TIMESTAMP(), UTC_TIMESTAMP())", [$name, Pin::hash($pin)]);
                    Audit::log($id, 'setup_owner', 'user', $id, ['migrations' => $applied]);
                    Publisher::publishAll();
                    file_put_contents($lock, gmdate('c'));
                    $ok = true;
                }
            } catch (Throwable $ex) {
                error_log('[sulcis setup] ' . $ex->getMessage());
                $msg = 'Errore durante il setup: controlla i dati del database in config.php e il log.';
            }
        }
    }
}
?><!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Setup · Sulcis Rent</title>
<style>body{font:16px/1.5 system-ui,sans-serif;background:#F3EDE2;color:#1E1A17;max-width:34rem;margin:2rem auto;padding:0 1rem}h1{font-size:2rem;margin:.2em 0}label{display:block;margin-top:1rem;font-weight:600}input{width:100%;box-sizing:border-box;font-size:1.2rem;padding:.7rem;border:1.5px solid #1E1A17;background:#fff}button{margin-top:1.4rem;width:100%;padding:1rem;font-weight:700;border:0;background:#D11F6E;color:#fff;font-size:1rem}li{list-style:none}.ok{color:#0F4C75}.ko{color:#B0185B;font-weight:700}.msg{background:#fff;border-left:4px solid #B0185B;padding:.8rem;margin-top:1rem}.done{background:#fff;border-left:4px solid #1A6FA3;padding:1rem}</style></head><body>
<h1>Setup Sulcis Rent</h1>
<?php if ($ok): ?>
<div class="done"><p><strong>Fatto.</strong> Database pronto e titolare creato. Questa pagina ora è disattivata.</p><p><a href="/admin/">Vai all'area riservata →</a></p></div>
<?php else: ?>
<p>Pagina monouso: applica le migrazioni del database e crea il primo <strong>titolare</strong>. Dopo, si disattiva da sola.</p>
<h2>Requisiti</h2><ul><?php foreach ($checks as $k => $v): ?><li class="<?= $v ? 'ok' : 'ko' ?>"><?= $v ? '✓' : '✗' ?> <?= $e($k) ?></li><?php endforeach; ?></ul>
<?php if ($msg): ?><div class="msg"><?= $e($msg) ?></div><?php endif; ?>
<form method="post" autocomplete="off">
<label for="token">Token di setup (da config.php)</label><input id="token" name="token" type="password" required>
<label for="name">Nome del titolare</label><input id="name" name="name" required maxlength="60">
<label for="pin">PIN (almeno <?= Pin::minLength() ?> cifre, niente sequenze o date)</label><input id="pin" name="pin" type="password" inputmode="numeric" pattern="\d*" required>
<label for="pin2">Ripeti il PIN</label><input id="pin2" name="pin2" type="password" inputmode="numeric" pattern="\d*" required>
<button type="submit">Applica e crea il titolare</button>
</form>
<?php endif; ?>
</body></html>
