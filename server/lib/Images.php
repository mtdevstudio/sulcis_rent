<?php
declare(strict_types=1);

/**
 * Upload foto: validazione del tipo REALE, ricodifica obbligatoria in WebP (640/1280/2048),
 * rimozione totale dei metadati (EXIF/GPS), nomi generati dal server (UUID).
 * Imagick se disponibile, altrimenti GD.
 */
final class Images
{
    public const MAX_BYTES = 15 * 1024 * 1024;
    public const WIDTHS = [640, 1280, 2048];
    private const MAX_PIXELS = 60_000_000;
    private const QUALITY = 80;

    public static function capabilities(): array
    {
        $imagick = extension_loaded('imagick') && class_exists('Imagick');
        $heic = $imagick && (in_array('HEIC', Imagick::queryFormats('HEI*'), true) || in_array('HEIF', Imagick::queryFormats('HEI*'), true));
        $webp = ($imagick && in_array('WEBP', Imagick::queryFormats('WEBP'), true)) || (function_exists('imagewebp') && (gd_info()['WebP Support'] ?? false));
        return ['imagick' => $imagick, 'heic' => $heic, 'webp' => $webp, 'maxBytes' => self::MAX_BYTES, 'serverMaxUpload' => self::iniBytes((string) ini_get('upload_max_filesize'))];
    }

    private static function iniBytes(string $v): int
    {
        $n = (int) $v; $u = strtolower(substr(trim($v), -1));
        return $u === 'g' ? $n << 30 : ($u === 'm' ? $n << 20 : ($u === 'k' ? $n << 10 : $n));
    }

    /** @return array{uuid:string,widths:int[],width:int,height:int} */
    public static function processUpload(array $file, string $destDir): array
    {
        $err = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) throw new HttpError(413, 'Foto troppo grande (massimo 15 MB)');
        if ($err !== UPLOAD_ERR_OK) throw new HttpError(400, 'Caricamento non riuscito, riprova');
        $tmp = (string) $file['tmp_name'];
        if (!is_uploaded_file($tmp) && PHP_SAPI !== 'cli') throw new HttpError(400, 'File non valido');
        $size = filesize($tmp);
        if ($size === false || $size <= 0 || $size > self::MAX_BYTES) throw new HttpError(413, 'Foto troppo grande (massimo 15 MB)');

        $caps = self::capabilities();
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp) ?: '';
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if ($caps['heic']) array_push($allowed, 'image/heic', 'image/heif');
        if (!in_array($mime, $allowed, true)) {
            throw new HttpError(415, in_array($mime, ['image/heic', 'image/heif'], true) ? 'Formato HEIC non supportato dal server: verrà convertito dal browser' : 'Formato non supportato: usa JPEG, PNG o WebP');
        }
        if (!in_array($mime, ['image/heic', 'image/heif'], true)) {
            $info = @getimagesize($tmp);
            if (!$info || $info[0] < 1 || $info[1] < 1 || !in_array($info['mime'] ?? '', $allowed, true)) throw new HttpError(415, 'Il file non è un\'immagine valida');
            if ($info[0] * $info[1] > self::MAX_PIXELS) throw new HttpError(413, 'Immagine troppo grande in pixel');
        }
        if (!$caps['webp']) throw new RuntimeException('Il server non supporta la scrittura WebP');

        $uuid = Util::uuid();
        if (!is_dir($destDir) && !mkdir($destDir, 0755, true) && !is_dir($destDir)) throw new RuntimeException('mkdir media');
        try {
            $res = $caps['imagick'] ? self::withImagick($tmp, $destDir, $uuid) : self::withGd($tmp, $mime, $destDir, $uuid);
        } catch (HttpError $e) {
            throw $e;
        } catch (Throwable $e) {
            foreach (glob($destDir . '/' . $uuid . '-*.webp') ?: [] as $f) @unlink($f);
            error_log('[sulcis images] ' . $e->getMessage());
            throw new HttpError(422, 'Impossibile elaborare questa immagine');
        }
        return ['uuid' => $uuid] + $res;
    }

    private static function targets(int $srcW): array
    {
        $t = array_values(array_filter(self::WIDTHS, static fn($w) => $w < $srcW));
        $t[] = min($srcW, max(self::WIDTHS));
        return array_values(array_unique($t));
    }

    private static function withImagick(string $tmp, string $dir, string $uuid): array
    {
        $im = new Imagick();
        $im->setResourceLimit(Imagick::RESOURCETYPE_MEMORY, 256 * 1024 * 1024);
        $im->readImage($tmp);
        $im->setIteratorIndex(0);
        $im = $im->getImage(); // primo frame soltanto
        if ($im->getImageWidth() * $im->getImageHeight() > self::MAX_PIXELS) throw new HttpError(413, 'Immagine troppo grande in pixel');
        self::imagickOrient($im);
        $im->stripImage(); // via EXIF, GPS, XMP, ICC
        $im->setImageColorspace(Imagick::COLORSPACE_SRGB);
        $srcW = $im->getImageWidth(); $srcH = $im->getImageHeight();
        $widths = [];
        foreach (self::targets($srcW) as $w) {
            $c = clone $im;
            if ($w < $srcW) $c->resizeImage($w, (int) round($srcH * $w / $srcW), Imagick::FILTER_LANCZOS, 1);
            $c->setImageFormat('webp');
            $c->setImageCompressionQuality(self::QUALITY);
            $c->stripImage();
            $c->writeImage($dir . "/$uuid-$w.webp");
            $c->clear();
            $widths[] = $w;
        }
        $maxW = max($widths);
        return ['widths' => $widths, 'width' => $maxW, 'height' => (int) round($srcH * $maxW / $srcW)];
    }

    private static function imagickOrient(Imagick $im): void
    {
        switch ($im->getImageOrientation()) {
            case Imagick::ORIENTATION_BOTTOMRIGHT: $im->rotateImage('#000', 180); break;
            case Imagick::ORIENTATION_RIGHTTOP: $im->rotateImage('#000', 90); break;
            case Imagick::ORIENTATION_LEFTBOTTOM: $im->rotateImage('#000', -90); break;
        }
        $im->setImageOrientation(Imagick::ORIENTATION_TOPLEFT);
    }

    private static function withGd(string $tmp, string $mime, string $dir, string $uuid): array
    {
        $src = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($tmp),
            'image/png' => @imagecreatefrompng($tmp),
            'image/webp' => @imagecreatefromwebp($tmp),
            default => false,
        };
        if (!$src) throw new HttpError(422, 'Impossibile leggere questa immagine');
        if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data($tmp);
            $o = (int) ($exif['Orientation'] ?? 1);
            $rot = [3 => 180, 6 => -90, 8 => 90][$o] ?? 0;
            if ($rot) { $r = imagerotate($src, $rot, 0); if ($r) { imagedestroy($src); $src = $r; } }
        }
        $srcW = imagesx($src); $srcH = imagesy($src);
        $widths = [];
        foreach (self::targets($srcW) as $w) {
            $h = (int) round($srcH * $w / $srcW);
            $dst = imagecreatetruecolor($w, $h);
            imagealphablending($dst, false); imagesavealpha($dst, true);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $w, $h, $srcW, $srcH);
            // GD non copia mai i metadati: il file WebP risultante è privo di EXIF/GPS
            if (!imagewebp($dst, $dir . "/$uuid-$w.webp", self::QUALITY)) throw new RuntimeException('imagewebp');
            imagedestroy($dst);
            $widths[] = $w;
        }
        imagedestroy($src);
        $maxW = max($widths);
        return ['widths' => $widths, 'width' => $maxW, 'height' => (int) round($srcH * $maxW / $srcW)];
    }

    public static function mediaDir(int $carId): string { return Util::docroot() . '/media/cars/' . $carId; }

    public static function deleteFiles(int $carId, string $uuid): void
    {
        if (!preg_match('/^[a-f0-9-]{36}$/', $uuid)) return;
        foreach (glob(self::mediaDir($carId) . '/' . $uuid . '-*.webp') ?: [] as $f) @unlink($f);
    }
}
