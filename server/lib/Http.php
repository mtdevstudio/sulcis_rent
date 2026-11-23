<?php
declare(strict_types=1);

final class Http
{
    public const MAX_JSON_BYTES = 512 * 1024;

    public static function apiHeaders(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, max-age=0');
        header('X-Content-Type-Options: nosniff');
        header('X-Robots-Tag: noindex, nofollow');
        header('Referrer-Policy: same-origin');
        header_remove('X-Powered-By');
    }

    public static function method(): string { return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'); }

    /** @param string[] $allowed */
    public static function allow(array $allowed): string
    {
        $m = self::method();
        if (!in_array($m, $allowed, true)) {
            header('Allow: ' . implode(', ', $allowed));
            throw new HttpError(405, 'Metodo non consentito');
        }
        return $m;
    }

    /** Corpo JSON della richiesta (oggetto). */
    public static function body(): array
    {
        $len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
        if ($len > self::MAX_JSON_BYTES) throw new HttpError(413, 'Richiesta troppo grande');
        $ct = $_SERVER['CONTENT_TYPE'] ?? '';
        if ($len > 0 && stripos($ct, 'application/json') !== 0) throw new HttpError(415, 'Formato non supportato');
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_JSON_BYTES + 1);
        if ($raw === '' || $raw === false) return [];
        try {
            $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new HttpError(400, 'JSON non valido');
        }
        if (!is_array($data) || array_is_list($data) && $data !== []) throw new HttpError(400, 'Atteso un oggetto JSON');
        return $data;
    }

    /** Intero positivo da query string. */
    public static function qInt(string $name, bool $required = true): ?int
    {
        $v = $_GET[$name] ?? null;
        if ($v === null || $v === '') {
            if ($required) throw new HttpError(422, 'Parametro mancante', [$name => 'obbligatorio']);
            return null;
        }
        if (!is_string($v) || !preg_match('/^[1-9][0-9]{0,9}$/', $v)) throw new HttpError(422, 'Parametro non valido', [$name => 'intero positivo']);
        return (int) $v;
    }

    public static function json($data, int $status = 200): never
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }

    public static function error(int $status, string $message, array $details = []): never
    {
        if (!headers_sent()) { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); }
        $out = ['error' => $message];
        if ($details) $out['fields'] = $details;
        echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function setCookie(string $name, string $value, int $expires, bool $httpOnly = true): void
    {
        setcookie($name, $value, [
            'expires' => $expires,
            'path' => '/',
            'secure' => true,          // __Host- richiede Secure, Path=/ e nessun Domain
            'httponly' => $httpOnly,
            'samesite' => 'Strict',
        ]);
    }
}
