<?php
declare(strict_types=1);

/** Impostazioni (tabella settings): catalogo (categorie, dotazioni, tag) e contatti. */
final class Catalog
{
    public static function get(string $name, array $default = []): array
    {
        $v = Db::val('SELECT value FROM settings WHERE name = ?', [$name]);
        if ($v === null) return $default;
        $d = json_decode((string) $v, true);
        return is_array($d) ? $d : $default;
    }

    public static function set(string $name, array $value): void
    {
        Db::run(
            'INSERT INTO settings (name, value, updated_at) VALUES (?, ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)',
            [$name, json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]
        );
    }

    public static function catalog(): array
    {
        $c = self::get('catalog', ['categories' => [], 'features' => [], 'tags' => []]);
        return ['categories' => $c['categories'] ?? [], 'features' => $c['features'] ?? [], 'tags' => $c['tags'] ?? []];
    }

    public static function keys(string $list): array
    {
        return array_values(array_map(static fn($x) => (string) $x['key'], self::catalog()[$list] ?? []));
    }

    public static function schema(): array
    {
        $item = ['type' => 'object', 'fields' => [
            'key' => ['type' => 'slug', 'required' => true, 'max' => 40],
            'label' => ['type' => 'l10n', 'required' => true, 'max' => 60],
            'icon' => ['type' => 'string', 'max' => 20, 'pattern' => '/^[a-z0-9-]+$/'],
            'active' => ['type' => 'bool'],
        ]];
        return [
            'categories' => ['type' => 'array', 'required' => true, 'items' => $item, 'maxItems' => 40],
            'features' => ['type' => 'array', 'required' => true, 'items' => $item, 'maxItems' => 80],
            'tags' => ['type' => 'array', 'required' => true, 'items' => $item, 'maxItems' => 40],
        ];
    }

    public static function contactSchema(): array
    {
        return [
            'phoneDisplay' => ['type' => 'string', 'required' => true, 'max' => 30, 'pattern' => '/^[0-9 +().-]+$/'],
            'phoneE164' => ['type' => 'string', 'required' => true, 'max' => 16, 'pattern' => '/^\+[1-9][0-9]{6,14}$/', 'patternMsg' => 'formato internazionale, es. +393313906076'],
            'whatsappNumber' => ['type' => 'string', 'required' => true, 'max' => 15, 'pattern' => '/^[1-9][0-9]{6,14}$/', 'patternMsg' => 'solo cifre con prefisso, es. 393313906076'],
            'whatsappMessage' => ['type' => 'l10n', 'max' => 500],
            'address' => ['type' => 'object', 'required' => true, 'fields' => [
                'street' => ['type' => 'string', 'required' => true, 'max' => 120],
                'postalCode' => ['type' => 'string', 'required' => true, 'max' => 10, 'pattern' => '/^[0-9]{5}$/'],
                'city' => ['type' => 'string', 'required' => true, 'max' => 80],
                'province' => ['type' => 'string', 'required' => true, 'max' => 4],
                'region' => ['type' => 'string', 'required' => true, 'max' => 40],
            ]],
            'hours' => ['type' => 'l10n', 'max' => 120],
            'instagram' => ['type' => 'url', 'max' => 300],
            'facebook' => ['type' => 'url', 'max' => 300],
            'googleReviewsUrl' => ['type' => 'url', 'max' => 500],
            'vat' => ['type' => 'string', 'max' => 20, 'pattern' => '/^[A-Z0-9 ]+$/i'],
            'email' => ['type' => 'string', 'max' => 120, 'pattern' => '/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i'],
            // zone di consegna confermate (es. «Aeroporto di Olbia»): se vuoto il sito non promette consegne
            'deliveryAreas' => ['type' => 'array', 'items' => ['type' => 'l10n', 'max' => 60], 'maxItems' => 20],
        ];
    }
}
