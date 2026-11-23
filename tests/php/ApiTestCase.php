<?php
declare(strict_types=1);

namespace Tests;

use PDO;
use PHPUnit\Framework\TestCase;

/**
 * Test di integrazione HTTP contro l'ambiente Docker (Apache + PHP 8.1 + MariaDB):
 *   npm run build && docker compose up -d && composer test
 * Il DB viene preparato direttamente (utente root sulla porta 3307) prima di ogni test.
 */
abstract class ApiTestCase extends TestCase
{
    protected const OWNER_PIN = '48151623';
    protected const STAFF_PIN = '73920481';
    protected static ?PDO $pdo = null;
    protected int $ownerId = 0;
    protected int $staffId = 0;

    protected static function db(): PDO
    {
        return self::$pdo ??= new PDO(getenv('SR_TEST_DB_DSN'), getenv('SR_TEST_DB_USER'), getenv('SR_TEST_DB_PASS'), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }

    protected function setUp(): void
    {
        $db = self::db();
        $db->exec("SET time_zone = '+00:00'");
        foreach (['auth_attempts', 'auth_locks', 'admin_sessions', 'admin_devices'] as $t) $db->exec("DELETE FROM $t");
        $db->exec('DELETE FROM cars');
        $db->exec("DELETE FROM admin_users WHERE name NOT IN ('Titolare', 'Staff Test')");
        $hash = static fn(string $p) => password_hash($p, PASSWORD_BCRYPT, ['cost' => 10]);
        foreach ([['Titolare', 'owner', self::OWNER_PIN], ['Staff Test', 'staff', self::STAFF_PIN]] as [$name, $role, $pin]) {
            $st = $db->prepare('SELECT id FROM admin_users WHERE name = ?'); $st->execute([$name]);
            $id = $st->fetchColumn();
            if ($id) $db->prepare('UPDATE admin_users SET pin_hash = ?, role = ?, active = 1 WHERE id = ?')->execute([$hash($pin), $role, $id]);
            else { $db->prepare("INSERT INTO admin_users (name, pin_hash, role, active, created_at) VALUES (?, ?, ?, 1, UTC_TIMESTAMP())")->execute([$name, $hash($pin), $role]); $id = $db->lastInsertId(); }
            if ($role === 'owner') $this->ownerId = (int) $id; else $this->staffId = (int) $id;
        }
    }

    /** @return array{status:int, json:mixed, body:string, headers:array<string,string>, cookies:array<string,string>, setCookie:string[]} */
    protected function http(string $method, string $path, $body = null, array $opts = []): array
    {
        $ch = curl_init(getenv('SR_TEST_BASE') . $path);
        $headers = $opts['headers'] ?? [];
        if (!array_key_exists('origin', $opts)) $headers[] = 'Origin: ' . getenv('SR_TEST_BASE');
        elseif ($opts['origin'] !== null) $headers[] = 'Origin: ' . $opts['origin'];
        if (!empty($opts['cookies'])) $headers[] = 'Cookie: ' . implode('; ', array_map(static fn($k, $v) => "$k=$v", array_keys($opts['cookies']), $opts['cookies']));
        if (!empty($opts['csrf'])) $headers[] = 'X-CSRF-Token: ' . $opts['csrf'];
        if (isset($opts['multipart'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $opts['multipart']);
        } elseif ($body !== null) {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        $respHeaders = [];
        $setCookie = [];
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers, CURLOPT_TIMEOUT => 30,
            CURLOPT_HEADERFUNCTION => static function ($c, $line) use (&$respHeaders, &$setCookie) {
                if (str_contains($line, ':')) {
                    [$k, $v] = explode(':', $line, 2);
                    $respHeaders[strtolower(trim($k))] = trim($v);
                    if (strtolower(trim($k)) === 'set-cookie') $setCookie[] = trim($v);
                }
                return strlen($line);
            },
        ]);
        $raw = (string) curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        $cookies = [];
        foreach ($setCookie as $c) { [$kv] = explode(';', $c, 2); [$k, $v] = explode('=', $kv, 2); $cookies[$k] = $v; }
        return ['status' => $status, 'json' => json_decode($raw, true), 'body' => $raw, 'headers' => $respHeaders, 'cookies' => $cookies, 'setCookie' => $setCookie];
    }

    /** Login: ritorna ['cookies' => [...], 'csrf' => '...'] */
    protected function login(int $userId, string $pin): array
    {
        $r = $this->http('POST', '/api/auth/login.php', ['userId' => $userId, 'pin' => $pin]);
        $this->assertSame(200, $r['status'], 'login fallito: ' . $r['body']);
        return ['cookies' => array_intersect_key($r['cookies'], array_flip(['__Host-sr_admin', '__Host-sr_csrf'])), 'csrf' => $r['json']['csrf']];
    }

    protected function as(array $s, string $method, string $path, $body = null, array $extra = []): array
    {
        return $this->http($method, $path, $body, $extra + ['cookies' => $s['cookies'], 'csrf' => $s['csrf']]);
    }

    protected function createCar(array $s, array $data = []): array
    {
        $r = $this->as($s, 'POST', '/api/admin/cars.php', $data + ['brand' => 'Fiat', 'model' => 'Panda Test', 'category' => 'citycar', 'plate' => 'AB123CD', 'internalNotes' => 'NOTA-INTERNA-SEGRETA']);
        $this->assertSame(201, $r['status'], $r['body']);
        return $r['json']['car'];
    }

    protected function upload(array $s, int $carId, string $file, string $mime = 'image/jpeg', string $name = 'foto.jpg'): array
    {
        return $this->as($s, 'POST', '/api/admin/photos.php', null, ['multipart' => ['car_id' => (string) $carId, 'file' => new \CURLFile($file, $mime, $name)]]);
    }

    protected function publicJson(string $name): array
    {
        $r = $this->http('GET', "/data/$name.json?t=" . microtime(true), null, ['origin' => null]);
        $this->assertSame(200, $r['status']);
        return $r['json'];
    }
}
