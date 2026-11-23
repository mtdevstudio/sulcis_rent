<?php
declare(strict_types=1);

/** Stesse regole di src/lib/seo.ts, per le pagine auto servite da car.php. */
final class Seo
{
    public static function tr($v, string $lang): string
    {
        if (!is_array($v)) return '';
        return (string) ($lang === 'en' && !empty($v['en']) ? $v['en'] : ($v['it'] ?? ''));
    }

    public static function carPath(string $slug, string $lang): string { return $lang === 'en' ? "/en/fleet/$slug/" : "/flotta/$slug/"; }

    public static function meta(array $car, string $lang, array $cats): array
    {
        $cat = '';
        foreach ($cats as $c) if (($c['key'] ?? '') === ($car['category'] ?? '')) $cat = self::tr($c['label'] ?? null, $lang);
        $name = trim($car['brand'] . ' ' . $car['model']);
        $title = self::tr($car['seo']['title'] ?? null, $lang) ?: ($lang === 'it'
            ? "Noleggio $name" . ($cat ? " · $cat" : '') . ' a San Giovanni Suergiu'
            : "Rent a $name" . ($cat ? " · $cat" : '') . ' in South Sardinia');
        $desc = self::tr($car['seo']['description'] ?? null, $lang) ?: self::tr($car['content']['short'] ?? null, $lang) ?: ($lang === 'it'
            ? "$name a noleggio nel Sulcis Iglesiente. Scrivici su WhatsApp per disponibilità e prezzo: siamo aperti h24."
            : "$name for rent in Sulcis Iglesiente, South Sardinia. Message us on WhatsApp for availability and price: open 24/7.");
        return ['title' => $title, 'description' => mb_substr($desc, 0, 160)];
    }

    public static function jsonLd(array $car, string $lang, array $cats, string $site): array
    {
        $m = self::meta($car, $lang, $cats);
        $cat = $car['category'];
        foreach ($cats as $c) if (($c['key'] ?? '') === $car['category']) $cat = self::tr($c['label'] ?? null, $lang) ?: $cat;
        $json = [
            '@context' => 'https://schema.org', '@type' => ['Product', 'Car'],
            'name' => trim($car['brand'] . ' ' . $car['model'] . (!empty($car['version']) ? ' ' . $car['version'] : '')),
            'brand' => ['@type' => 'Brand', 'name' => $car['brand']], 'model' => $car['model'], 'description' => $m['description'],
            'url' => $site . self::carPath($car['slug'], $lang),
            'image' => array_map(static fn($i) => $site . $i['base'] . '-' . max($i['widths']) . '.webp', $car['images'] ?? []),
            'category' => $cat,
        ];
        $s = (array) ($car['specs'] ?? []);
        if (!empty($s['seats'])) $json['seatingCapacity'] = $s['seats'];
        if (!empty($s['doors'])) $json['numberOfDoors'] = $s['doors'];
        if (!empty($s['fuel'])) $json['fuelType'] = $s['fuel'];
        if (!empty($s['transmission'])) $json['vehicleTransmission'] = $s['transmission'];
        if (!empty($car['year'])) $json['vehicleModelDate'] = (string) $car['year'];
        $r = (array) ($car['rental'] ?? []);
        foreach (['priceDay' => 'DAY', 'priceWeek' => 'WEE', 'priceMonth' => 'MON'] as $k => $unit) {
            if (isset($r[$k]) && is_numeric($r[$k])) { // presente solo se «Mostra prezzo» è attivo
                $json['offers'] = ['@type' => 'Offer', 'priceCurrency' => 'EUR', 'price' => $r[$k],
                    'priceSpecification' => ['@type' => 'UnitPriceSpecification', 'price' => $r[$k], 'priceCurrency' => 'EUR', 'unitCode' => $unit],
                    'seller' => ['@id' => $site . '/#business']];
                break;
            }
        }
        return $json;
    }
}
