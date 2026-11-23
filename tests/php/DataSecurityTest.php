<?php
declare(strict_types=1);

namespace Tests;

final class DataSecurityTest extends ApiTestCase
{
    private function publishedCar(array $s, array $extra = []): array
    {
        $car = $this->createCar($s, $extra);
        $up = $this->upload($s, $car['id'], __DIR__ . '/../fixtures/gps.jpg');
        $this->assertSame(201, $up['status'], $up['body']);
        $r = $this->as($s, 'POST', '/api/admin/car-actions.php', ['id' => $car['id'], 'action' => 'publish']);
        $this->assertSame(200, $r['status'], $r['body']);
        return $r['json']['car'];
    }

    public function testPublicJsonNeverLeaksPrivateFieldsDraftsOrHidden(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $pub = $this->publishedCar($s, ['rental' => ['priceDay' => 39, 'showPrice' => false, 'deposit' => 300, 'hidden' => ['deposit']]]);
        $this->createCar($s, ['brand' => 'Bozza', 'model' => 'Segreta', 'plate' => 'ZZ999ZZ']);
        $hidden = $this->publishedCar($s, ['brand' => 'Nascosta', 'model' => 'Officina', 'plate' => 'HH111HH']);
        $this->as($s, 'POST', '/api/admin/car-actions.php', ['id' => $hidden['id'], 'action' => 'hide']);
        $trashed = $this->publishedCar($s, ['brand' => 'Cestinata', 'model' => 'Vecchia']);
        $this->as($s, 'DELETE', '/api/admin/cars.php?id=' . $trashed['id']);

        $raw = $this->http('GET', '/data/fleet.json?x=' . microtime(true), null, ['origin' => null])['body'];
        foreach (['AB123CD', 'ZZ999ZZ', 'HH111HH', 'NOTA-INTERNA-SEGRETA', 'Segreta', 'Officina', 'Cestinata', '"plate"', 'internalNotes', '"status"', 'deletedAt', 'updatedBy', '"deposit"'] as $needle) {
            $this->assertStringNotContainsString($needle, $raw, "fleet.json non deve contenere $needle");
        }
        $fleet = json_decode($raw, true);
        $this->assertCount(1, $fleet['cars']);
        $this->assertSame($pub['slug'], $fleet['cars'][0]['slug']);
        $this->assertArrayNotHasKey('priceDay', (array) $fleet['cars'][0]['rental'], 'prezzo nascosto se «Mostra prezzo» è spento');
        // con «Mostra prezzo» acceso compare
        $this->as($s, 'PUT', '/api/admin/cars.php?id=' . $pub['id'], ['rental' => ['priceDay' => 39, 'showPrice' => true]]);
        $this->assertSame(39, $this->publicJson('fleet')['cars'][0]['rental']['priceDay']);
        // nessun JSON pubblico espone tabelle di sicurezza
        foreach (['reviews', 'faq', 'settings', 'version'] as $n) {
            $b = $this->http('GET', "/data/$n.json", null, ['origin' => null])['body'];
            foreach (['pin_hash', 'token_hash', 'ip_hash', 'argon2', 'audit'] as $needle) $this->assertStringNotContainsString($needle, $b);
        }
    }

    public function testPublishRequiresBrandModelCategoryAndPhoto(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $r = $this->as($s, 'POST', '/api/admin/cars.php', ['model' => 'Solo modello']);
        $this->assertSame(201, $r['status'], 'in bozza si salva anche incompleta');
        $id = $r['json']['car']['id'];
        $r = $this->as($s, 'POST', '/api/admin/car-actions.php', ['id' => $id, 'action' => 'publish']);
        $this->assertSame(422, $r['status']);
        $this->assertArrayHasKey('brand', $r['json']['fields']);
        $this->assertArrayHasKey('category', $r['json']['fields']);
        $this->assertArrayHasKey('photos', $r['json']['fields']);
    }

    public function testUploadRejectsPhpDisguisedAsJpeg(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $car = $this->createCar($s);
        $r = $this->upload($s, $car['id'], __DIR__ . '/../fixtures/shell.php.jpg', 'image/jpeg', 'foto.jpg');
        $this->assertSame(415, $r['status'], $r['body']);
        $r = $this->upload($s, $car['id'], __DIR__ . '/../fixtures/shell.php.jpg', 'image/jpeg', 'shell.php');
        $this->assertSame(415, $r['status']);
        $this->assertSame(0, (int) self::db()->query('SELECT COUNT(*) FROM car_photos')->fetchColumn());
    }

    public function testStoredPhotosAreReencodedWebpWithoutExifOrGps(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $car = $this->createCar($s);
        $r = $this->upload($s, $car['id'], __DIR__ . '/../fixtures/gps.jpg', 'image/jpeg', 'IMG_2024 piazzale.jpg');
        $this->assertSame(201, $r['status'], $r['body']);
        $p = $r['json']['photo'];
        $this->assertMatchesRegularExpression('#^/media/cars/\d+/[a-f0-9-]{36}$#', $p['base'], 'nome file generato dal server (UUID)');
        $this->assertSame([640, 1280, 1600], $p['widths']);
        foreach ($p['widths'] as $w) {
            $img = $this->http('GET', "{$p['base']}-$w.webp", null, ['origin' => null]);
            $this->assertSame(200, $img['status']);
            $this->assertSame('RIFF', substr($img['body'], 0, 4));
            $this->assertSame('WEBP', substr($img['body'], 8, 4));
            $this->assertStringNotContainsString('EXIF', $img['body']);
            $this->assertStringNotContainsString('Exif', $img['body']);
            $this->assertStringNotContainsString('TestCam', $img['body']);
            $this->assertStringNotContainsString('GPS', $img['body']);
            $size = getimagesizefromstring($img['body']);
            $this->assertSame($w, $size[0]);
        }
        $this->assertStringNotContainsString('piazzale', json_encode($p));
    }

    public function testManuallyPlacedPhpInMediaIsNotExecuted(): void
    {
        // simula un file PHP finito in /media (es. caricato via FTP per errore)
        $dir = dirname(__DIR__, 2) . '/out/media/cars/0';
        @mkdir($dir, 0777, true);
        @chmod(dirname($dir), 0777); @chmod($dir, 0777);
        file_put_contents("$dir/evil.php", '<?php echo "PWNED-" . (6*7);');
        file_put_contents("$dir/evil.phtml", '<?php echo "PWNED-" . (6*7);');
        foreach (['evil.php', 'evil.phtml'] as $f) {
            $r = $this->http('GET', "/media/cars/0/$f", null, ['origin' => null]);
            $this->assertNotSame(200, $r['status'], "$f non deve essere servito");
            $this->assertStringNotContainsString('PWNED-42', $r['body'], "$f non deve essere eseguito");
        }
        @unlink("$dir/evil.php"); @unlink("$dir/evil.phtml"); @rmdir($dir);
    }

    public function testSqlInjectionAttemptsHaveNoEffect(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $car = $this->createCar($s);
        $before = (int) self::db()->query('SELECT COUNT(*) FROM cars')->fetchColumn();
        foreach (["1 OR 1=1", "1;DROP TABLE cars", "1' OR '1'='1", "-1 UNION SELECT pin_hash FROM admin_users"] as $evil) {
            $r = $this->as($s, 'GET', '/api/admin/cars.php?id=' . rawurlencode($evil));
            $this->assertSame(422, $r['status'], $evil);
            $r = $this->as($s, 'DELETE', '/api/admin/cars.php?id=' . rawurlencode($evil));
            $this->assertSame(422, $r['status'], $evil);
        }
        $r = $this->as($s, 'GET', '/api/admin/cars.php?q=' . rawurlencode("' OR 1=1 -- "));
        $this->assertSame(200, $r['status']);
        $this->assertSame([], $r['json']['cars'], 'la ricerca tratta l\'input come testo');
        $r = $this->as($s, 'GET', '/api/admin/cars.php?status=' . rawurlencode("draft' OR '1'='1"));
        $this->assertSame(422, $r['status']);
        $r = $this->as($s, 'PUT', '/api/admin/cars.php?id=' . $car['id'], ['brand' => "Fiat'); DROP TABLE cars; --", 'slug' => "x' OR 1=1"]);
        $this->assertSame(422, $r['status'], 'slug non valido rifiutato');
        $r = $this->as($s, 'PUT', '/api/admin/cars.php?id=' . $car['id'], ['brand' => "Fiat'); DROP TABLE cars; --"]);
        $this->assertSame(200, $r['status']);
        $this->assertSame("Fiat'); DROP TABLE cars; --", $r['json']['car']['brand'], 'salvato come testo letterale');
        $this->assertSame($before, (int) self::db()->query('SELECT COUNT(*) FROM cars')->fetchColumn());
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => "1 OR 1=1", 'pin' => "' OR '1'='1"]);
        $this->assertSame(422, $r['status']);
    }

    public function testUnknownFieldsAndRichTextAreSanitized(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $r = $this->as($s, 'POST', '/api/admin/cars.php', ['brand' => 'A', 'isAdmin' => true]);
        $this->assertSame(422, $r['status']);
        $this->assertArrayHasKey('isAdmin', $r['json']['fields']);
        $car = $this->createCar($s, ['content' => ['long' => ['it' => '<p onclick="x()">Ciao <script>alert(1)</script><strong>forte</strong> <a href="javascript:alert(1)">link</a> <a href="https://sulcisrent.it">ok</a><img src=x onerror=alert(1)></p>']]]);
        $html = $car['content']['long']['it'];
        $this->assertStringNotContainsString('script', $html);
        $this->assertStringNotContainsString('onclick', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringNotContainsString('javascript:', $html);
        $this->assertStringNotContainsString('<img', $html);
        $this->assertStringContainsString('<strong>forte</strong>', $html);
        $this->assertStringContainsString('href="https://sulcisrent.it"', $html);
    }

    public function testPrivateFilesAreNotReachable(): void
    {
        foreach (['/_private/config.php', '/_private/', '/api/_boot.php', '/server/bootstrap.php', '/database/migrations/001_init.sql',
                  '/data/.htaccess', '/.htaccess', '/media/.htaccess', '/composer.json', '/sulcis-private/config.php', '/api/admin/../../_private/config.php'] as $p) {
            $r = $this->http('GET', $p, null, ['origin' => null]);
            $this->assertContains($r['status'], [403, 404], "$p → {$r['status']}");
            $this->assertStringNotContainsString('db', strtolower(substr($r['body'], 0, 0)) ?: '');
            $this->assertStringNotContainsString('localdev', $r['body'], "$p espone credenziali");
        }
        $this->assertSame(404, $this->http('GET', '/api/setup.php', null, ['origin' => null])['status'], 'setup monouso disattivato');
        // gli errori dell'API non espongono dettagli
        $r = $this->http('POST', '/api/auth/login.php', 'non json', ['headers' => ['Content-Type: text/plain']]);
        $this->assertStringNotContainsString('.php', $r['body']);
        $this->assertStringNotContainsString('Stack', $r['body']);
    }

    public function testSoftDeleteTrashRestoreAndLazyPurge(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $car = $this->publishedCar($s);
        $this->as($s, 'DELETE', '/api/admin/cars.php?id=' . $car['id']);
        $this->assertCount(0, $this->publicJson('fleet')['cars']);
        $trash = $this->as($s, 'GET', '/api/admin/cars.php?trash=1')['json']['cars'];
        $this->assertCount(1, $trash);
        $this->as($s, 'POST', '/api/admin/car-actions.php', ['id' => $car['id'], 'action' => 'restore']);
        $this->assertCount(1, $this->publicJson('fleet')['cars']);
        // dopo 30 giorni nel cestino: pulizia definitiva (cron via URL)
        $this->as($s, 'DELETE', '/api/admin/cars.php?id=' . $car['id']);
        self::db()->exec('UPDATE cars SET deleted_at = UTC_TIMESTAMP() - INTERVAL 31 DAY');
        $r = $this->http('GET', '/api/cron.php?token=local-cron-token-0123456789abcdef0123456789', null, ['origin' => null]);
        $this->assertSame(200, $r['status'], $r['body']);
        $this->assertSame(1, $r['json']['cars']);
        $this->assertSame(0, (int) self::db()->query('SELECT COUNT(*) FROM cars')->fetchColumn());
        $this->assertSame(404, $this->http('GET', '/api/cron.php?token=sbagliato', null, ['origin' => null])['status']);
    }

    public function testCarPhpInjectsSeoAndSitemapListsCar(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $car = $this->publishedCar($s, ['brand' => 'Dacia', 'model' => 'Sandero Nuova', 'category' => 'utilitaria', 'content' => ['short' => ['it' => 'Comoda e parca nei consumi.', 'en' => 'Comfortable and thrifty.']]]);
        $r = $this->http('GET', "/flotta/{$car['slug']}/", null, ['origin' => null]);
        $this->assertSame(200, $r['status']);
        $this->assertStringContainsString('<title>Noleggio Dacia Sandero Nuova · Utilitaria a San Giovanni Suergiu</title>', $r['body']);
        $this->assertStringContainsString('<meta name="description" content="Comoda e parca nei consumi.">', $r['body']);
        $this->assertStringContainsString('"@type":["Product","Car"]', $r['body']);
        $this->assertStringNotContainsString('"offers"', $r['body'], 'niente offers senza prezzo visibile');
        $this->assertStringNotContainsString('noindex', $r['body']);
        $this->assertSame(1, substr_count($r['body'], '<title>'));
        $en = $this->http('GET', "/en/fleet/{$car['slug']}/", null, ['origin' => null]);
        $this->assertStringContainsString('Comfortable and thrifty.', $en['body']);
        $this->assertSame(404, $this->http('GET', '/flotta/non-esiste/', null, ['origin' => null])['status']);
        $sm = $this->http('GET', '/sitemap.xml', null, ['origin' => null]);
        $this->assertStringContainsString("/flotta/{$car['slug']}/", $sm['body']);
        $this->assertStringNotContainsString('/admin', $sm['body']);
    }
}
