<?php
declare(strict_types=1);

/**
 * Rigenera i JSON PUBBLICI statici in <docroot>/data/ dopo ogni salvataggio.
 * WHITELIST esplicita dei campi: targa, note interne, stato, bozze, auto nascoste o nel cestino
 * NON possono finire qui perché non vengono mai copiati.
 */
final class Publisher
{
    public static function publishAll(): string
    {
        $v = base_convert((string) (int) (microtime(true) * 1000), 10, 36) . bin2hex(random_bytes(2));
        $dir = Util::docroot() . '/data';
        $catalog = Catalog::catalog();
        $fleet = [
            'version' => $v,
            'categories' => array_values(array_map(static fn($c) => self::catItem($c), array_filter($catalog['categories'], static fn($c) => ($c['active'] ?? true) !== false))),
            'features' => array_values(array_map(static fn($c) => self::catItem($c), $catalog['features'])),
            'tags' => array_values(array_map(static fn($c) => self::catItem($c), $catalog['tags'])),
            'cars' => self::publicCars(),
        ];
        $reviews = ['version' => $v, 'reviews' => array_map(static fn($r) => array_filter([
            'author' => $r['author'], 'text' => $r['text'], 'rating' => (int) $r['rating'], 'date' => $r['review_date'],
            'source' => 'Google', 'url' => $r['url'] ?: null,
        ], static fn($x) => $x !== null), Db::all('SELECT author, text, rating, review_date, url FROM reviews WHERE published = 1 ORDER BY sort_order, review_date DESC'))];
        $faq = ['version' => $v, 'items' => array_map(static fn($f) => [
            'q' => array_filter(['it' => $f['question_it'], 'en' => $f['question_en']]),
            'a' => array_filter(['it' => $f['answer_it'], 'en' => $f['answer_en']]),
        ], Db::all('SELECT question_it, answer_it, question_en, answer_en FROM faq WHERE published = 1 ORDER BY sort_order, id'))];
        $c = Catalog::get('contact');
        $settings = ['version' => $v] + array_filter([
            'phoneDisplay' => $c['phoneDisplay'] ?? null, 'phoneE164' => $c['phoneE164'] ?? null, 'whatsappNumber' => $c['whatsappNumber'] ?? null,
            'whatsappMessage' => $c['whatsappMessage'] ?? null, 'address' => $c['address'] ?? null, 'hours' => $c['hours'] ?? null,
            'instagram' => $c['instagram'] ?? null, 'facebook' => $c['facebook'] ?? null, 'googleReviewsUrl' => $c['googleReviewsUrl'] ?? null,
            'vat' => $c['vat'] ?? null, 'email' => $c['email'] ?? null,
        ], static fn($x) => $x !== null && $x !== '' && $x !== []);

        $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;
        Util::writeAtomic("$dir/fleet.json", json_encode($fleet, $flags));
        Util::writeAtomic("$dir/reviews.json", json_encode($reviews, $flags));
        Util::writeAtomic("$dir/faq.json", json_encode($faq, $flags));
        Util::writeAtomic("$dir/settings.json", json_encode($settings, $flags));
        Util::writeAtomic("$dir/version.json", json_encode(['v' => $v, 'at' => gmdate('c')], $flags));
        return $v;
    }

    private static function catItem(array $c): array
    {
        return array_filter(['key' => $c['key'], 'label' => $c['label'], 'icon' => $c['icon'] ?? null], static fn($x) => $x !== null);
    }

    public static function publicCars(): array
    {
        $rows = Db::all("SELECT * FROM cars WHERE status = 'published' AND deleted_at IS NULL ORDER BY sort_order, id");
        return array_map(static fn($r) => self::publicCar(Cars::toAdmin($r)), $rows);
    }

    /** Mappa un'auto (forma admin) nella forma pubblica. Ogni campo è copiato esplicitamente. */
    public static function publicCar(array $c): array
    {
        $specKeys = ['fuel', 'transmission', 'seats', 'doors', 'luggageLarge', 'luggageSmall', 'luggageLiters', 'engineCc', 'powerCv', 'powerKw', 'drive', 'consumption', 'euro', 'rangeKm', 'chargeTime', 'cargoM3', 'payloadKg', 'cargoLength', 'license'];
        $specsIn = (array) $c['specs'];
        $specs = [];
        foreach ($specKeys as $k) if (isset($specsIn[$k]) && $specsIn[$k] !== '') $specs[$k] = $specsIn[$k];

        $r = (array) $c['rental'];
        $hidden = $r['hidden'] ?? [];
        $show = static fn(string $k) => !in_array($k, $hidden, true);
        $rental = [];
        if (!empty($r['showPrice']) && $show('price')) {
            foreach (['priceDay', 'priceWeek', 'priceMonth'] as $k) if (isset($r[$k]) && is_numeric($r[$k])) $rental[$k] = $r[$k] + 0;
            if (!empty($r['priceNote']) && $show('priceNote')) $rental['priceNote'] = $r['priceNote'];
        }
        if ($show('km')) { if (!empty($r['kmUnlimited'])) $rental['kmPerDay'] = 'unlimited'; elseif (isset($r['kmPerDay'])) $rental['kmPerDay'] = (int) $r['kmPerDay']; }
        if ($show('minAge') && isset($r['minAge'])) $rental['minAge'] = (int) $r['minAge'];
        if ($show('minLicenseYears') && isset($r['minLicenseYears'])) $rental['minLicenseYears'] = (int) $r['minLicenseYears'];
        if ($show('deposit')) { if (!empty($r['depositOnRequest'])) $rental['deposit'] = 'on_request'; elseif (isset($r['deposit'])) $rental['deposit'] = $r['deposit'] + 0; }
        if ($show('creditCard') && isset($r['creditCard'])) $rental['creditCard'] = (bool) $r['creditCard'];
        if ($show('delivery') && !empty($r['delivery'])) {
            $d = array_filter(['home' => !empty($r['delivery']['home']) ?: null, 'airport' => !empty($r['delivery']['airport']) ?: null, 'port' => !empty($r['delivery']['port']) ?: null, 'note' => $r['delivery']['note'] ?? null]);
            if ($d) $rental['delivery'] = $d;
        }
        if ($show('insurance') && !empty($r['insurance'])) $rental['insurance'] = $r['insurance'];

        $content = array_filter([
            'short' => $c['content']['short'] ?? null,
            'long' => $c['content']['long'] ?? null,
            'highlights' => !empty($c['content']['highlights']) ? array_values($c['content']['highlights']) : null,
        ]);
        $name = trim($c['brand'] . ' ' . $c['model']);
        $images = [];
        foreach ($c['photos'] as $i => $p) {
            $images[] = [
                'base' => $p['base'], 'widths' => $p['widths'], 'w' => $p['w'], 'h' => $p['h'],
                'alt' => array_filter(['it' => $p['alt']['it'] ?? "$name – vista " . ($i + 1), 'en' => $p['alt']['en'] ?? "$name – view " . ($i + 1)]),
            ];
        }
        $out = [
            'id' => $c['id'], 'slug' => $c['slug'], 'brand' => $c['brand'], 'model' => $c['model'],
            'version' => $c['version'] ?: null, 'category' => $c['category'], 'year' => $c['year'],
            'color' => !empty($c['color']['name']) ? array_filter(['name' => $c['color']['name'], 'hex' => $c['color']['hex'] ?? null]) : null,
            'specs' => (object) $specs, 'features' => array_values($c['features'] ?? []), 'rental' => (object) $rental,
            'content' => (object) $content, 'perfectFor' => array_values($c['perfectFor'] ?? []),
            'badge' => $c['badge'] ?: null, 'whatsappMessage' => $c['whatsappMessage'] ?: null,
            'seo' => !empty($c['seo']) ? $c['seo'] : null,
            'featured' => (bool) $c['featured'], 'order' => $c['sortOrder'], 'images' => $images,
            'updatedAt' => gmdate('c', strtotime($c['updatedAt'] . ' UTC')),
        ];
        return array_filter($out, static fn($x) => $x !== null);
    }
}
