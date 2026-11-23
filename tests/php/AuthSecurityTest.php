<?php
declare(strict_types=1);

namespace Tests;

final class AuthSecurityTest extends ApiTestCase
{
    /** Tutti gli endpoint admin, con un metodo rappresentativo. */
    public static function adminEndpoints(): array
    {
        return [
            ['GET', '/api/auth/me.php'], ['POST', '/api/auth/logout.php'], ['POST', '/api/auth/change-pin.php'],
            ['GET', '/api/admin/dashboard.php'], ['GET', '/api/admin/cars.php'], ['POST', '/api/admin/cars.php'], ['PUT', '/api/admin/cars.php?id=1'],
            ['DELETE', '/api/admin/cars.php?id=1'], ['POST', '/api/admin/car-actions.php'], ['POST', '/api/admin/cars-order.php'],
            ['POST', '/api/admin/photos.php'], ['PATCH', '/api/admin/photos.php'], ['DELETE', '/api/admin/photos.php?id=1'],
            ['GET', '/api/admin/preview.php?id=1'], ['GET', '/api/admin/catalog.php'], ['PUT', '/api/admin/catalog.php'],
            ['GET', '/api/admin/reviews.php'], ['POST', '/api/admin/reviews.php'], ['GET', '/api/admin/faq.php'], ['POST', '/api/admin/faq.php'],
            ['GET', '/api/admin/settings.php'], ['PUT', '/api/admin/settings.php'], ['GET', '/api/admin/users.php'], ['POST', '/api/admin/users.php'],
            ['GET', '/api/admin/sessions.php'], ['DELETE', '/api/admin/sessions.php?all=1'], ['GET', '/api/admin/audit.php'], ['GET', '/api/admin/backup.php'],
        ];
    }

    /** @dataProvider adminEndpoints */
    public function testEveryAdminEndpointWithoutSessionIs401(string $method, string $path): void
    {
        $r = $this->http($method, $path, $method === 'GET' ? null : []);
        $this->assertSame(401, $r['status'], "$method $path → {$r['status']} {$r['body']}");
    }

    public function testExpiredAndRevokedSessionsAre401(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $this->assertSame(200, $this->as($s, 'GET', '/api/auth/me.php')['status']);
        // scaduta (inattività)
        self::db()->exec('UPDATE admin_sessions SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 MINUTE');
        $this->assertSame(401, $this->as($s, 'GET', '/api/admin/cars.php')['status']);
        // scadenza assoluta 7 giorni anche se expires_at è nel futuro
        $s2 = $this->login($this->staffId, self::STAFF_PIN);
        self::db()->exec('UPDATE admin_sessions SET created_at = UTC_TIMESTAMP() - INTERVAL 8 DAY, expires_at = UTC_TIMESTAMP() + INTERVAL 1 HOUR');
        $this->assertSame(401, $this->as($s2, 'GET', '/api/admin/cars.php')['status']);
        // revocata dall'owner con «Disconnetti tutti»
        $staff = $this->login($this->staffId, self::STAFF_PIN);
        $owner = $this->login($this->ownerId, self::OWNER_PIN);
        $this->assertSame(200, $this->as($owner, 'DELETE', '/api/admin/sessions.php?all=1')['status']);
        $this->assertSame(401, $this->as($staff, 'GET', '/api/admin/cars.php')['status']);
        $this->assertSame(200, $this->as($owner, 'GET', '/api/admin/cars.php')['status'], 'la sessione corrente dell\'owner resta valida');
        // logout = sessione cancellata dal DB
        $this->as($owner, 'POST', '/api/auth/logout.php', []);
        $this->assertSame(401, $this->as($owner, 'GET', '/api/auth/me.php')['status']);
    }

    public function testStaffIsForbiddenOnOwnerAreas(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        foreach ([['GET', '/api/admin/settings.php'], ['PUT', '/api/admin/settings.php'], ['GET', '/api/admin/users.php'], ['POST', '/api/admin/users.php'],
                  ['GET', '/api/admin/audit.php'], ['GET', '/api/admin/backup.php'], ['GET', '/api/admin/sessions.php'], ['PUT', '/api/admin/catalog.php']] as [$m, $p]) {
            $r = $this->as($s, $m, $p, $m === 'GET' ? null : []);
            $this->assertSame(403, $r['status'], "$m $p → {$r['status']}");
        }
        $this->assertSame(200, $this->as($s, 'GET', '/api/admin/catalog.php')['status'], 'lo staff legge il catalogo per il form');
    }

    public function testSessionCookieFlags(): void
    {
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => self::STAFF_PIN]);
        $c = implode("\n", $r['setCookie']);
        $this->assertMatchesRegularExpression('/__Host-sr_admin=[a-f0-9]{64};.*path=\/;.*secure;.*httponly;.*samesite=strict/i', $c);
        $this->assertDoesNotMatchRegularExpression('/__Host-sr_admin=[^\n]*domain=/i', $c);
        $this->assertDoesNotMatchRegularExpression('/__Host-sr_csrf=[^\n]*httponly/i', $c, 'il cookie CSRF deve essere leggibile dal JS (double submit)');
        $tok = $r['cookies']['__Host-sr_admin'];
        $row = self::db()->query('SELECT token_hash FROM admin_sessions ORDER BY id DESC LIMIT 1')->fetch();
        $this->assertSame(hash('sha256', $tok), $row['token_hash'], 'in DB solo l\'hash SHA-256 del token');
    }

    public function testWrongPinGenericMessageAndUniformDelay(): void
    {
        $t = microtime(true);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '11112222']);
        $dt = microtime(true) - $t;
        $this->assertSame(401, $r['status']);
        $this->assertSame('PIN non valido', $r['json']['error']);
        $this->assertGreaterThanOrEqual(0.48, $dt, 'ritardo artificiale ~500 ms');
        // utente inesistente: stesso messaggio, stesso ritardo
        $t = microtime(true);
        $r2 = $this->http('POST', '/api/auth/login.php', ['userId' => 999999, 'pin' => '11112222']);
        $this->assertSame(401, $r2['status']);
        $this->assertSame('PIN non valido', $r2['json']['error']);
        $this->assertGreaterThanOrEqual(0.48, microtime(true) - $t);
        // anche il successo è ritardato
        $t = microtime(true);
        $this->login($this->staffId, self::STAFF_PIN);
        $this->assertGreaterThanOrEqual(0.48, microtime(true) - $t);
    }

    public function testSixthWrongPinFromSameIpIsBlocked(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '9999888' . $i]);
            $this->assertContains($r['status'], [401, 429], "tentativo $i");
        }
        // 6° tentativo: bloccato anche con il PIN giusto, e anche su un altro utente dallo stesso IP
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => self::STAFF_PIN]);
        $this->assertSame(429, $r['status']);
        $this->assertStringContainsString('Troppi tentativi', $r['json']['error']);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->ownerId, 'pin' => self::OWNER_PIN]);
        $this->assertSame(429, $r['status'], 'blocco per IP');
        $lock = self::db()->query("SELECT TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), locked_until) m FROM auth_locks WHERE scope='ip'")->fetch();
        $this->assertEqualsWithDelta(15, (int) $lock['m'], 1, 'primo blocco: 15 minuti');
    }

    public function testBackoffGrowsTo1hThen24h(): void
    {
        $db = self::db();
        $db->exec("INSERT INTO auth_locks (scope, scope_key, locked_until, strikes, last_strike_at) VALUES ('user', '{$this->staffId}', UTC_TIMESTAMP() - INTERVAL 1 SECOND, 1, UTC_TIMESTAMP() - INTERVAL 20 MINUTE)");
        $this->failUserFromOtherIps($this->staffId, 4);
        $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '55556666']);
        $m = (int) $db->query("SELECT TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), locked_until) m FROM auth_locks WHERE scope='user'")->fetchColumn();
        $this->assertEqualsWithDelta(60, $m, 1, 'secondo blocco: 1 ora');
        $db->exec("UPDATE auth_locks SET locked_until = UTC_TIMESTAMP() - INTERVAL 1 SECOND WHERE scope='user'");
        $db->exec("DELETE FROM auth_locks WHERE scope='ip'");
        $this->failUserFromOtherIps($this->staffId, 4);
        $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '55556666']);
        $m = (int) $db->query("SELECT TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), locked_until) m FROM auth_locks WHERE scope='user'")->fetchColumn();
        $this->assertEqualsWithDelta(1440, $m, 1, 'terzo blocco: 24 ore');
    }

    /** Simula fallimenti da IP diversi (attacco distribuito) direttamente in tabella. */
    private function failUserFromOtherIps(?int $userId, int $n): void
    {
        $st = self::db()->prepare('INSERT INTO auth_attempts (ip_hash, user_id, attempted_at, success) VALUES (?, ?, UTC_TIMESTAMP(3), 0)');
        for ($i = 0; $i < $n; $i++) $st->execute([hash('sha256', 'altro-ip-' . $i . microtime()), $userId]);
    }

    public function testSameUserFromManyIpsIsBlocked(): void
    {
        $this->failUserFromOtherIps($this->staffId, 4);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '55556666']); // 5° fallimento (da questo IP: il 1°)
        $this->assertSame(429, $r['status']);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => self::STAFF_PIN]);
        $this->assertSame(429, $r['status'], 'utente bloccato anche col PIN giusto');
        // l'owner dallo stesso IP non è bloccato (1 solo fallimento da questo IP)
        $this->login($this->ownerId, self::OWNER_PIN);
    }

    public function testGlobalLockAfterMoreThan20FailuresInAnHour(): void
    {
        $lastAudit = (int) self::db()->query('SELECT COALESCE(MAX(id), 0) FROM audit_log')->fetchColumn();
        $this->failUserFromOtherIps(null, 20);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->ownerId, 'pin' => '55556666']);
        $this->assertSame(429, $r['status']);
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => self::STAFF_PIN]);
        $this->assertSame(429, $r['status'], 'blocco globale per tutti');
        $this->assertSame(1, (int) self::db()->query("SELECT COUNT(*) FROM auth_locks WHERE scope='global' AND locked_until > UTC_TIMESTAMP() + INTERVAL 55 MINUTE")->fetchColumn());
        $this->assertSame(1, (int) self::db()->query("SELECT COUNT(*) FROM audit_log WHERE action='login_global_lock' AND id > $lastAudit")->fetchColumn());
    }

    public function testIpIsStoredHashedNotInClear(): void
    {
        $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => '55556666']);
        $row = self::db()->query('SELECT ip_hash FROM auth_attempts ORDER BY id DESC LIMIT 1')->fetch();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $row['ip_hash']);
        $this->assertStringNotContainsString('.', $row['ip_hash']);
    }

    public function testCsrfAndOriginChecks(): void
    {
        $s = $this->login($this->staffId, self::STAFF_PIN);
        $body = ['brand' => 'X', 'model' => 'Y'];
        // senza token CSRF
        $r = $this->http('POST', '/api/admin/cars.php', $body, ['cookies' => $s['cookies']]);
        $this->assertSame(403, $r['status']);
        // token sbagliato
        $r = $this->http('POST', '/api/admin/cars.php', $body, ['cookies' => $s['cookies'], 'csrf' => str_repeat('a', 64)]);
        $this->assertSame(403, $r['status']);
        // Origin estraneo
        $r = $this->http('POST', '/api/admin/cars.php', $body, ['cookies' => $s['cookies'], 'csrf' => $s['csrf'], 'origin' => 'https://evil.example']);
        $this->assertSame(403, $r['status']);
        // né Origin né Referer
        $r = $this->http('POST', '/api/admin/cars.php', $body, ['cookies' => $s['cookies'], 'csrf' => $s['csrf'], 'origin' => null]);
        $this->assertSame(403, $r['status']);
        // login da origine estranea
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $this->staffId, 'pin' => self::STAFF_PIN], ['origin' => 'https://evil.example']);
        $this->assertSame(403, $r['status']);
        // tutto corretto
        $r = $this->as($s, 'POST', '/api/admin/cars.php', $body);
        $this->assertSame(201, $r['status'], $r['body']);
    }

    public function testChangePinRequiresCurrentAndRevokesOtherSessions(): void
    {
        $a = $this->login($this->staffId, self::STAFF_PIN);
        $b = $this->login($this->staffId, self::STAFF_PIN);
        $r = $this->as($a, 'POST', '/api/auth/change-pin.php', ['current' => '00000000', 'next' => '61803398']);
        $this->assertSame(401, $r['status']);
        $r = $this->as($a, 'POST', '/api/auth/change-pin.php', ['current' => self::STAFF_PIN, 'next' => '12345678']);
        $this->assertSame(422, $r['status'], 'PIN banale rifiutato');
        $r = $this->as($a, 'POST', '/api/auth/change-pin.php', ['current' => self::STAFF_PIN, 'next' => '61803398']);
        $this->assertSame(200, $r['status'], $r['body']);
        $this->assertSame(200, $this->as($a, 'GET', '/api/auth/me.php')['status'], 'sessione corrente valida');
        $this->assertSame(401, $this->as($b, 'GET', '/api/auth/me.php')['status'], 'altre sessioni invalidate');
        $hash = self::db()->query("SELECT pin_hash FROM admin_users WHERE id = {$this->staffId}")->fetchColumn();
        $this->assertTrue(password_verify('61803398', $hash));
        $this->assertStringStartsWith('$argon2id$', $hash, 'hash Argon2id');
    }

    public function testOwnerCreatesStaffWithPinPolicy(): void
    {
        $o = $this->login($this->ownerId, self::OWNER_PIN);
        foreach (['12345678', '11111111', '01012000', '1234', '12121212', 'abcdefgh'] as $bad) {
            $r = $this->as($o, 'POST', '/api/admin/users.php', ['name' => 'Nuovo ' . $bad, 'pin' => $bad]);
            $this->assertSame(422, $r['status'], "PIN $bad doveva essere rifiutato");
        }
        $r = $this->as($o, 'POST', '/api/admin/users.php', ['name' => 'Mario', 'pin' => '27182818']);
        $this->assertSame(201, $r['status'], $r['body']);
        $this->assertSame('staff', $r['json']['user']['role']);
        $this->assertArrayNotHasKey('pin_hash', $r['json']['user']);
        $u = $this->http('GET', '/api/auth/users.php', null, ['origin' => null])['json']['users'];
        foreach ($u as $x) $this->assertSame(['id', 'name', 'color'], array_keys($x), 'l\'elenco pubblico espone solo id, nome e colore');
        $log = self::db()->query("SELECT diff FROM audit_log WHERE entity='user' ORDER BY id DESC LIMIT 1")->fetchColumn();
        $this->assertStringNotContainsString('27182818', (string) $log, 'mai il PIN nel log');
    }
}
