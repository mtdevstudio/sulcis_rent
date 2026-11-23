<?php
/**
 * SULCIS RENT · configurazione del server (COPIA questo file in config.php e compila).
 *
 * Dove metterlo (in ordine di preferenza, vedi README):
 *  1. FUORI dalla document root: /home/<utente>/sulcis-private/config.php  (accanto a server/ e database/)
 *  2. se l'hosting non lo permette: <docroot>/_private/config.php (la cartella _private ha .htaccess «Require all denied»)
 *
 * ⚠️ MAI nel repository. Il file reale è in .gitignore.
 */
return [
    // --- Database (utente MySQL dell'app con i soli permessi SELECT, INSERT, UPDATE, DELETE
    //     più CREATE, ALTER, INDEX, REFERENCES per le migrazioni; vedi README) ---
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'sulcisrent',
        'user' => 'sulcisrent_app',
        'pass' => 'CAMBIAMI',
    ],

    // --- Segreti: genera valori casuali lunghi (es. `php -r "echo bin2hex(random_bytes(32));"`) ---
    'ip_hash_salt' => 'CAMBIAMI-64-caratteri-esadecimali',
    // Token per la pagina di setup monouso (/api/setup.php). Dopo il setup la pagina si autodisabilita.
    'setup_token' => 'CAMBIAMI-almeno-32-caratteri',
    // Token per il cron via URL (/api/cron.php?token=...) se l'hosting non ha cron CLI. Vuoto = disattivato.
    'cron_token' => '',

    // --- Sicurezza ---
    'admin_pin_min_length' => 8,               // minimo 8 (valori più bassi vengono ignorati)
    'allowed_origins' => ['https://sulcisrent.it', 'https://www.sulcisrent.it'],
    // IP dei proxy fidati davanti a PHP (lascia vuoto se non sai: si usa REMOTE_ADDR).
    // Solo se il proxy è tuo/configurato si legge X-Forwarded-For.
    'trusted_proxies' => [],

    // --- Percorsi (di norma non serve toccarli) ---
    'paths' => [
        'docroot' => null,   // null = $_SERVER['DOCUMENT_ROOT'] (o la cartella sopra /api)
        'logs' => null,      // null = <cartella privata>/logs
        'tmp' => null,       // null = <cartella privata>/tmp
        'state' => null,     // null = <cartella privata> (qui va setup.lock)
    ],
    'site_url' => 'https://sulcisrent.it',

    // --- Notifiche (blocco globale dei login, login da nuovo dispositivo). Compila uno dei due. ---
    'notify' => [
        'telegram_bot_token' => '',
        'telegram_chat_id' => '',
        // SMTP dell'hosting (usa PHPMailer se presente in server/vendor; altrimenti mail())
        'smtp_host' => '',
        'smtp_port' => 587,
        'smtp_user' => '',
        'smtp_pass' => '',
        'smtp_secure' => 'tls',
        'mail_from' => '',
        'mail_to' => '',
    ],
];
