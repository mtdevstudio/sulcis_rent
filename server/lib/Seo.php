<?php
declare(strict_types=1);

/** Stesse regole di src/lib/seo.ts, per le pagine auto servite da car.php. */
final class Seo
{
    public const LANGS = ['it', 'en', 'fr', 'es', 'pt', 'pl'];
    public const OG_LOCALE = ['it' => 'it_IT', 'en' => 'en_GB', 'fr' => 'fr_FR', 'es' => 'es_ES', 'pt' => 'pt_PT', 'pl' => 'pl_PL'];

    /** Testo localizzato: lingua → inglese → italiano (come tr() in src/lib/i18n.ts). */
    public static function tr($v, string $lang): string
    {
        if (!is_array($v)) return '';
        return (string) (($v[$lang] ?? '') ?: ($lang !== 'it' ? ($v['en'] ?? '') : '') ?: ($v['it'] ?? ''));
    }

    public static function carPath(string $slug, string $lang): string { return $lang === 'it' ? "/flotta/$slug/" : "/$lang/fleet/$slug/"; }

    /** Stesse frasi di ui[lang].seoTitle / seoDesc in src/lib/i18n-ui.ts. */
    private static function defaults(string $lang, string $name, string $cat): array
    {
        $c = $cat !== '' ? " · $cat" : '';
        return match ($lang) {
            'en' => ["Rent a $name$c in Sardinia", "$name for rent in Sardinia. Message us on WhatsApp for availability and price: open 24/7."],
            'fr' => ["Location $name$c en Sardaigne", "$name à louer en Sardaigne. Écris-nous sur WhatsApp pour la disponibilité et le prix : ouvert 24 h/24."],
            'es' => ["Alquiler $name$c en Cerdeña", "$name de alquiler en Cerdeña. Escríbenos por WhatsApp para disponibilidad y precio: abiertos 24 h."],
            'pt' => ["Aluguer $name$c na Sardenha", "$name para alugar na Sardenha. Escreve-nos no WhatsApp para disponibilidade e preço: abertos 24h."],
            'pl' => ["Wynajem $name$c na Sardynii", "$name do wynajęcia na Sardynii. Napisz do nas na WhatsApp w sprawie dostępności i ceny: czynne 24/7."],
            default => ["Noleggio $name$c in Sardegna", "$name a noleggio in Sardegna. Scrivici su WhatsApp per disponibilità e prezzo: siamo aperti h24."],
        };
    }

    public static function meta(array $car, string $lang, array $cats): array
    {
        $cat = '';
        foreach ($cats as $c) if (($c['key'] ?? '') === ($car['category'] ?? '')) $cat = self::tr($c['label'] ?? null, $lang);
        $name = trim($car['brand'] . ' ' . $car['model']);
        [$dt, $dd] = self::defaults($lang, $name, $cat);
        $title = self::tr($car['seo']['title'] ?? null, $lang) ?: $dt;
        $desc = self::tr($car['seo']['description'] ?? null, $lang) ?: self::tr($car['content']['short'] ?? null, $lang) ?: $dd;
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
