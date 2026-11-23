<?php
declare(strict_types=1);

/** Logica di dominio delle auto (indipendente dagli endpoint: riusabile se si passa a Next server). */
final class Cars
{
    public const STATUSES = ['draft', 'published', 'hidden'];
    public const RENTAL_KEYS = ['price', 'priceNote', 'km', 'minAge', 'minLicenseYears', 'deposit', 'creditCard', 'delivery', 'insurance'];

    public static function schema(bool $partial = false): array
    {
        $l = static fn(int $max, bool $html = false) => ['type' => 'l10n', 'max' => $max, 'html' => $html];
        $int = static fn(int $min, int $max) => ['type' => 'int', 'min' => $min, 'max' => $max];
        $s = [
            'brand' => ['type' => 'string', 'max' => 60],
            'model' => ['type' => 'string', 'max' => 80],
            'version' => ['type' => 'string', 'max' => 80],
            'slug' => ['type' => 'slug', 'max' => 90],
            'category' => ['type' => 'slug', 'max' => 40],
            'year' => $int(1950, 2100),
            'color' => ['type' => 'object', 'fields' => ['name' => ['type' => 'string', 'max' => 40], 'hex' => ['type' => 'hex']]],
            'plate' => ['type' => 'string', 'max' => 16, 'pattern' => '/^[A-Za-z0-9 -]+$/'],
            'status' => ['type' => 'enum', 'values' => self::STATUSES],
            'featured' => ['type' => 'bool'],
            'badge' => ['type' => 'enum', 'values' => ['new', 'popular', 'offer', 'latest']],
            'specs' => ['type' => 'object', 'fields' => [
                'fuel' => ['type' => 'enum', 'values' => ['benzina', 'diesel', 'gpl', 'metano', 'ibrida', 'ibrida-plugin', 'elettrica']],
                'transmission' => ['type' => 'enum', 'values' => ['manuale', 'automatico']],
                'seats' => $int(1, 60), 'doors' => $int(1, 9),
                'luggageLarge' => $int(0, 30), 'luggageSmall' => $int(0, 30), 'luggageLiters' => $int(0, 20000),
                'engineCc' => $int(0, 10000), 'powerCv' => $int(0, 2000), 'powerKw' => $int(0, 1500),
                'drive' => ['type' => 'enum', 'values' => ['anteriore', 'posteriore', '4x4']],
                'consumption' => ['type' => 'string', 'max' => 40], 'euro' => ['type' => 'string', 'max' => 20],
                'rangeKm' => $int(0, 3000), 'chargeTime' => ['type' => 'string', 'max' => 40],
                'cargoM3' => ['type' => 'number', 'min' => 0, 'max' => 100], 'payloadKg' => $int(0, 20000),
                'cargoLength' => ['type' => 'string', 'max' => 40], 'license' => ['type' => 'string', 'max' => 20],
            ]],
            'features' => ['type' => 'array', 'items' => ['type' => 'slug', 'max' => 40], 'maxItems' => 80, 'unique' => true],
            'rental' => ['type' => 'object', 'fields' => [
                'priceDay' => ['type' => 'number', 'min' => 0, 'max' => 100000],
                'priceWeek' => ['type' => 'number', 'min' => 0, 'max' => 100000],
                'priceMonth' => ['type' => 'number', 'min' => 0, 'max' => 100000],
                'showPrice' => ['type' => 'bool'],
                'priceNote' => $l(160),
                'kmPerDay' => $int(0, 10000), 'kmUnlimited' => ['type' => 'bool'],
                'minAge' => $int(16, 99), 'minLicenseYears' => $int(0, 60),
                'deposit' => ['type' => 'number', 'min' => 0, 'max' => 100000], 'depositOnRequest' => ['type' => 'bool'],
                'creditCard' => ['type' => 'bool'],
                'delivery' => ['type' => 'object', 'fields' => ['home' => ['type' => 'bool'], 'airport' => ['type' => 'bool'], 'port' => ['type' => 'bool'], 'note' => $l(200)]],
                'insurance' => $l(200),
                'hidden' => ['type' => 'array', 'items' => ['type' => 'enum', 'values' => self::RENTAL_KEYS], 'maxItems' => 20, 'unique' => true],
            ]],
            'content' => ['type' => 'object', 'fields' => [
                'short' => $l(200),
                'long' => $l(20000, true),
                'highlights' => ['type' => 'array', 'items' => $l(80), 'maxItems' => 3],
            ]],
            'perfectFor' => ['type' => 'array', 'items' => ['type' => 'slug', 'max' => 40], 'maxItems' => 20, 'unique' => true],
            'whatsappMessage' => $l(500),
            'seo' => ['type' => 'object', 'fields' => ['title' => $l(70), 'description' => $l(170)]],
            'internalNotes' => ['type' => 'string', 'max' => 5000],
        ];
        return $s;
    }

    private const DATA_KEYS = ['color', 'specs', 'features', 'rental', 'content', 'perfectFor', 'whatsappMessage', 'seo'];

    public static function get(int $id, bool $withDeleted = false): ?array
    {
        $row = Db::one('SELECT c.*, u.name AS updated_by_name FROM cars c LEFT JOIN admin_users u ON u.id = c.updated_by WHERE c.id = ?' . ($withDeleted ? '' : ' AND c.deleted_at IS NULL'), [$id]);
        return $row ? self::toAdmin($row) : null;
    }

    public static function photos(int $carId): array
    {
        return array_map(static fn($p) => [
            'id' => (int) $p['id'], 'uuid' => $p['uuid'], 'base' => "/media/cars/$carId/{$p['uuid']}",
            'widths' => json_decode($p['widths'], true) ?: [], 'w' => (int) $p['width'], 'h' => (int) $p['height'],
            'alt' => array_filter(['it' => $p['alt_it'], 'en' => $p['alt_en']], static fn($x) => $x !== null && $x !== ''),
        ], Db::all('SELECT * FROM car_photos WHERE car_id = ? ORDER BY sort_order, id', [$carId]));
    }

    public static function toAdmin(array $r): array
    {
        $d = json_decode((string) $r['data'], true) ?: [];
        return [
            'id' => (int) $r['id'], 'slug' => $r['slug'], 'brand' => $r['brand'], 'model' => $r['model'], 'version' => $r['version'],
            'category' => $r['category'], 'year' => $r['year'] !== null ? (int) $r['year'] : null, 'plate' => $r['plate'],
            'status' => $r['status'], 'featured' => (bool) $r['featured'], 'badge' => $r['badge'], 'sortOrder' => (int) $r['sort_order'],
            'color' => $d['color'] ?? null, 'specs' => $d['specs'] ?? (object) [], 'features' => $d['features'] ?? [],
            'rental' => $d['rental'] ?? (object) [], 'content' => $d['content'] ?? (object) [], 'perfectFor' => $d['perfectFor'] ?? [],
            'whatsappMessage' => $d['whatsappMessage'] ?? null, 'seo' => $d['seo'] ?? null, 'internalNotes' => $r['internal_notes'],
            'photos' => self::photos((int) $r['id']),
            'createdAt' => $r['created_at'], 'updatedAt' => $r['updated_at'],
            'updatedBy' => isset($r['updated_by_name']) ? ['id' => (int) $r['updated_by'], 'name' => $r['updated_by_name']] : null,
            'deletedAt' => $r['deleted_at'],
        ];
    }

    public static function list(array $f): array
    {
        $where = ['c.deleted_at ' . (!empty($f['trash']) ? 'IS NOT NULL' : 'IS NULL')];
        $params = [];
        if (!empty($f['status'])) { $where[] = 'c.status = ?'; $params[] = $f['status']; }
        if (!empty($f['category'])) { $where[] = 'c.category = ?'; $params[] = $f['category']; }
        if (!empty($f['q'])) {
            $where[] = "(c.brand LIKE ? OR c.model LIKE ? OR c.version LIKE ? OR c.plate LIKE ? OR c.slug LIKE ?)";
            $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $f['q']) . '%';
            array_push($params, $like, $like, $like, $like, $like);
        }
        $rows = Db::all(
            'SELECT c.id, c.slug, c.brand, c.model, c.version, c.category, c.status, c.featured, c.sort_order, c.plate, c.updated_at, c.deleted_at, u.name AS updated_by_name,
                    (SELECT p.uuid FROM car_photos p WHERE p.car_id = c.id ORDER BY p.sort_order, p.id LIMIT 1) AS cover_uuid,
                    (SELECT COUNT(*) FROM car_photos p WHERE p.car_id = c.id) AS photo_count
               FROM cars c LEFT JOIN admin_users u ON u.id = c.updated_by
              WHERE ' . implode(' AND ', $where) . ' ORDER BY c.sort_order, c.id',
            $params
        );
        return array_map(static fn($r) => [
            'id' => (int) $r['id'], 'slug' => $r['slug'], 'brand' => $r['brand'], 'model' => $r['model'], 'version' => $r['version'],
            'category' => $r['category'], 'status' => $r['status'], 'featured' => (bool) $r['featured'], 'sortOrder' => (int) $r['sort_order'],
            'plate' => $r['plate'], 'updatedAt' => $r['updated_at'], 'updatedBy' => $r['updated_by_name'], 'deletedAt' => $r['deleted_at'],
            'cover' => $r['cover_uuid'] ? "/media/cars/{$r['id']}/{$r['cover_uuid']}" : null, 'photoCount' => (int) $r['photo_count'],
        ], $rows);
    }

    private static function uniqueSlug(string $base, ?int $exceptId = null): string
    {
        $base = $base !== '' ? $base : 'auto';
        $slug = $base;
        for ($i = 2; Db::val('SELECT 1 FROM cars WHERE slug = ? AND id <> ?', [$slug, $exceptId ?? 0]); $i++) {
            $slug = substr($base, 0, 84) . '-' . $i;
        }
        return $slug;
    }

    /** Requisiti per la pubblicazione (in bozza si salva anche incompleta). */
    public static function publishErrors(array $car): array
    {
        $e = [];
        if (trim((string) ($car['brand'] ?? '')) === '') $e['brand'] = 'obbligatorio per pubblicare';
        if (trim((string) ($car['model'] ?? '')) === '') $e['model'] = 'obbligatorio per pubblicare';
        if (empty($car['category'])) $e['category'] = 'obbligatoria per pubblicare';
        elseif (!in_array($car['category'], Catalog::keys('categories'), true)) $e['category'] = 'categoria non esistente';
        if (empty($car['photos'])) $e['photos'] = 'serve almeno una foto per pubblicare';
        return $e;
    }

    private static function checkCatalogRefs(array $in): void
    {
        $e = [];
        if (!empty($in['category']) && !in_array($in['category'], Catalog::keys('categories'), true)) $e['category'] = 'categoria non esistente';
        foreach ($in['features'] ?? [] as $i => $f) if (!in_array($f, Catalog::keys('features'), true)) $e["features.$i"] = 'dotazione non esistente';
        foreach ($in['perfectFor'] ?? [] as $i => $f) if (!in_array($f, Catalog::keys('tags'), true)) $e["perfectFor.$i"] = 'tag non esistente';
        if ($e) throw new HttpError(422, 'Dati non validi', $e);
    }

    public static function create(array $in, int $userId): array
    {
        $in = Validator::check($in, self::schema());
        self::checkCatalogRefs($in);
        $status = $in['status'] ?? 'draft';
        if ($status === 'published') throw new HttpError(422, 'Salva prima la bozza e aggiungi le foto, poi pubblica', ['status' => 'serve almeno una foto per pubblicare']);
        $slug = self::uniqueSlug($in['slug'] ?? Util::slugify(trim(($in['brand'] ?? '') . ' ' . ($in['model'] ?? ''))) ?: 'bozza-' . substr(bin2hex(random_bytes(3)), 0, 6));
        $order = (int) Db::val('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cars');
        $id = Db::insert(
            'INSERT INTO cars (slug, brand, model, version, category, year, plate, status, featured, sort_order, badge, data, internal_notes, created_at, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?)',
            [$slug, $in['brand'] ?? '', $in['model'] ?? '', $in['version'] ?? null, $in['category'] ?? null, $in['year'] ?? null,
             isset($in['plate']) ? strtoupper($in['plate']) : null, $status, !empty($in['featured']) ? 1 : 0, $order, $in['badge'] ?? null,
             self::encodeData($in), $in['internalNotes'] ?? null, $userId]
        );
        Audit::log($userId, 'create', 'car', $id, ['slug' => $slug, 'status' => $status]);
        return self::get($id);
    }

    public static function update(int $id, array $in, int $userId): array
    {
        $old = self::get($id) ?? throw new HttpError(404, 'Auto non trovata');
        $in = Validator::check($in, self::schema());
        self::checkCatalogRefs($in);
        $merged = array_merge($old, $in);
        foreach (['specs', 'rental', 'content'] as $k) $merged[$k] = (array) $merged[$k];
        $slug = isset($in['slug']) && $in['slug'] !== $old['slug'] ? self::uniqueSlug($in['slug'], $id) : $old['slug'];
        if (($merged['status'] ?? 'draft') === 'published') {
            $errs = self::publishErrors($merged);
            if ($errs) throw new HttpError(422, 'Per pubblicare completa i campi richiesti', $errs);
        }
        Db::run(
            'UPDATE cars SET slug=?, brand=?, model=?, version=?, category=?, year=?, plate=?, status=?, featured=?, badge=?, data=?, internal_notes=?, updated_at=UTC_TIMESTAMP(), updated_by=? WHERE id=?',
            [$slug, $merged['brand'] ?? '', $merged['model'] ?? '', $merged['version'], $merged['category'], $merged['year'],
             $merged['plate'] !== null ? strtoupper((string) $merged['plate']) : null, $merged['status'], $merged['featured'] ? 1 : 0, $merged['badge'],
             self::encodeData($merged), $merged['internalNotes'], $userId, $id]
        );
        $new = self::get($id);
        $cmp = static fn($c) => array_diff_key($c, array_flip(['photos', 'updatedAt', 'updatedBy']));
        Audit::log($userId, 'update', 'car', $id, Audit::diff($cmp($old), $cmp($new)));
        return $new;
    }

    private static function encodeData(array $in): string
    {
        $d = [];
        foreach (self::DATA_KEYS as $k) if (array_key_exists($k, $in) && $in[$k] !== null) $d[$k] = $in[$k];
        return json_encode($d ?: new stdClass(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function setStatus(int $id, string $status, int $userId): array
    {
        if (!in_array($status, self::STATUSES, true)) throw new HttpError(422, 'Stato non valido');
        $car = self::get($id) ?? throw new HttpError(404, 'Auto non trovata');
        if ($status === 'published' && ($errs = self::publishErrors($car))) throw new HttpError(422, 'Per pubblicare completa i campi richiesti', $errs);
        Db::run('UPDATE cars SET status = ?, updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$status, $userId, $id]);
        Audit::log($userId, 'status', 'car', $id, ['status' => [$car['status'], $status]]);
        return self::get($id);
    }

    public static function setFeatured(int $id, bool $on, int $userId): array
    {
        self::get($id) ?? throw new HttpError(404, 'Auto non trovata');
        Db::run('UPDATE cars SET featured = ?, updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$on ? 1 : 0, $userId, $id]);
        Audit::log($userId, 'featured', 'car', $id, ['featured' => $on]);
        return self::get($id);
    }

    public static function softDelete(int $id, int $userId): void
    {
        $car = self::get($id) ?? throw new HttpError(404, 'Auto non trovata');
        Db::run('UPDATE cars SET deleted_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$userId, $id]);
        Audit::log($userId, 'delete', 'car', $id, ['slug' => $car['slug'], 'name' => trim($car['brand'] . ' ' . $car['model'])]);
    }

    public static function restore(int $id, int $userId): array
    {
        $car = self::get($id, true) ?? throw new HttpError(404, 'Auto non trovata');
        if (!$car['deletedAt']) return $car;
        Db::run('UPDATE cars SET deleted_at = NULL, updated_at = UTC_TIMESTAMP(), updated_by = ? WHERE id = ?', [$userId, $id]);
        Audit::log($userId, 'restore', 'car', $id, ['slug' => $car['slug']]);
        return self::get($id);
    }

    public static function duplicate(int $id, int $userId): array
    {
        $src = Db::one('SELECT * FROM cars WHERE id = ? AND deleted_at IS NULL', [$id]) ?? throw new HttpError(404, 'Auto non trovata');
        $slug = self::uniqueSlug(substr($src['slug'], 0, 80) . '-copia');
        $order = (int) Db::val('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cars');
        $newId = Db::insert(
            'INSERT INTO cars (slug, brand, model, version, category, year, plate, status, featured, sort_order, badge, data, internal_notes, created_at, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, NULL, \'draft\', 0, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?)',
            [$slug, $src['brand'], $src['model'], $src['version'], $src['category'], $src['year'], $order, $src['badge'], $src['data'], $src['internal_notes'], $userId]
        );
        // copia delle foto (nuovi UUID, file copiati)
        $dstDir = Images::mediaDir($newId);
        foreach (Db::all('SELECT * FROM car_photos WHERE car_id = ? ORDER BY sort_order, id', [$id]) as $p) {
            $uuid = Util::uuid();
            if (!is_dir($dstDir)) mkdir($dstDir, 0755, true);
            foreach (json_decode($p['widths'], true) ?: [] as $w) {
                $from = Images::mediaDir($id) . "/{$p['uuid']}-$w.webp";
                if (is_file($from)) copy($from, "$dstDir/$uuid-$w.webp");
            }
            Db::run('INSERT INTO car_photos (car_id, uuid, sort_order, alt_it, alt_en, width, height, widths, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())',
                [$newId, $uuid, $p['sort_order'], $p['alt_it'], $p['alt_en'], $p['width'], $p['height'], $p['widths']]);
        }
        Audit::log($userId, 'duplicate', 'car', $newId, ['from' => $id]);
        return self::get($newId);
    }

    /** @param int[] $ids */
    public static function reorder(array $ids, int $userId): void
    {
        Db::tx(static function () use ($ids) {
            foreach (array_values($ids) as $i => $id) Db::run('UPDATE cars SET sort_order = ? WHERE id = ?', [$i + 1, (int) $id]);
        });
        Audit::log($userId, 'reorder', 'car', null, ['ids' => array_map('intval', $ids)]);
    }

    /** Eliminazione definitiva (record + foto). Solo per auto nel cestino. */
    public static function purge(int $id, ?int $userId): void
    {
        $car = Db::one('SELECT id, slug FROM cars WHERE id = ? AND deleted_at IS NOT NULL', [$id]);
        if (!$car) throw new HttpError(404, 'Auto non trovata nel cestino');
        Db::run('DELETE FROM cars WHERE id = ?', [$id]);
        Util::rrmdir(Images::mediaDir($id));
        Audit::log($userId, 'purge', 'car', $id, ['slug' => $car['slug']]);
    }
}
