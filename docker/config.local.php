<?php
// SOLO per l'ambiente Docker locale. Segreti finti, mai usare in produzione.
return [
    'db' => ['host' => 'db', 'port' => 3306, 'name' => 'sulcisrent', 'user' => 'sulcisrent_app', 'pass' => 'localdev'],
    'ip_hash_salt' => 'local-dev-salt-0123456789abcdef0123456789abcdef',
    'setup_token' => 'local-setup-token-0123456789abcdef0123',
    'cron_token' => 'local-cron-token-0123456789abcdef0123456789',
    'admin_pin_min_length' => 8,
    'allowed_origins' => ['http://localhost:8080', 'http://127.0.0.1:8080'],
    'trusted_proxies' => [],
    'paths' => ['docroot' => '/var/www/html', 'logs' => '/var/www/sulcis-private/runtime/logs', 'tmp' => '/var/www/sulcis-private/runtime/tmp', 'state' => '/var/www/sulcis-private/runtime'],
    'site_url' => 'http://localhost:8080',
    'notify' => ['telegram_bot_token' => '', 'telegram_chat_id' => '', 'smtp_host' => '', 'smtp_port' => 587, 'smtp_user' => '', 'smtp_pass' => '', 'smtp_secure' => 'tls', 'mail_from' => '', 'mail_to' => ''],
];
