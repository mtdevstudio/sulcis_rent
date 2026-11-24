<?php
declare(strict_types=1);
/**
 * Scheda auto con meta SEO sempre aggiornati, anche per le auto aggiunte DOPO il build.
 * .htaccess: /flotta/{slug}/ e /{en|fr|es|pt|pl}/fleet/{slug}/ → car.php?slug=…&lang=…
 * - legge /data/fleet.json (nessuna query al DB);
 * - parte dall'HTML pre-renderizzato dell'auto se esiste, altrimenti dalla shell esportata;
 * - inietta title, description, canonical, hreflang, Open Graph, Twitter e JSON-LD dell'auto.
 */
require __DIR__ . '/api/_boot.php';

$root = __DIR__;
$slug = (string) ($_GET['slug'] ?? '');
$lang = in_array($_GET['lang'] ?? 'it', Seo::LANGS, true) ? (string) $_GET['lang'] : 'it';
$notFound = static function () use ($root): never {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    readfile(is_file("$root/404.html") ? "$root/404.html" : "$root/index.html");
    exit;
};
if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) || strlen($slug) > 90) $notFound();

$fleet = json_decode((string) @file_get_contents("$root/data/fleet.json"), true);
$car = null;
foreach (($fleet['cars'] ?? []) as $c) if (($c['slug'] ?? '') === $slug) { $car = $c; break; }
if (!$car) $notFound();

$pre = $lang === 'it' ? "$root/flotta/$slug/index.html" : "$root/$lang/fleet/$slug/index.html";
$shell = $lang === 'it' ? "$root/shell/flotta/index.html" : "$root/$lang/shell/fleet/index.html";
$html = (string) @file_get_contents(is_file($pre) ? $pre : $shell);
if ($html === '') $notFound();

$site = rtrim((string) Util::cfg('site_url', 'https://' . ($_SERVER['HTTP_HOST'] ?? 'sulcisrent.it')), '/');
$cats = $fleet['categories'] ?? [];
$m = Seo::meta($car, $lang, $cats);
$url = $site . Seo::carPath($slug, $lang);
$img = !empty($car['images'][0]) ? $site . $car['images'][0]['base'] . '-' . max($car['images'][0]['widths']) . '.webp' : $site . '/og.png';
$e = static fn($s) => htmlspecialchars((string) $s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$ld = json_encode(Seo::jsonLd($car, $lang, $cats, $site), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);

// 1) rimuovi i meta della pagina di partenza
$html = preg_replace([
    '#<title>.*?</title>#s',
    '#<meta\s+name="(description|robots|twitter:[a-z:]+)"[^>]*>#i',
    '#<meta\s+property="og:[a-z:_]+"[^>]*>#i',
    '#<link\s+rel="(canonical|alternate)"[^>]*>#i',
], '', $html) ?? $html;
// 2) JSON-LD: se la pagina pre-renderizzata ha già lo script, ne sostituisce il contenuto sul posto
$ldTag = '<script id="car-jsonld" type="application/ld+json">' . $ld . '</script>';
$count = 0;
$html = preg_replace_callback('#<script id="car-jsonld" type="application/ld\+json">.*?</script>#s', static fn() => $ldTag, $html, 1, $count) ?? $html;
// 3) nuovi meta in testa
$head = '<title>' . $e($m['title']) . '</title>'
    . '<meta name="description" content="' . $e($m['description']) . '">'
    . '<link rel="canonical" href="' . $e($url) . '">'
    . implode('', array_map(static fn($l) => '<link rel="alternate" hreflang="' . $l . '" href="' . $e($site . Seo::carPath($slug, $l)) . '">', Seo::LANGS))
    . '<link rel="alternate" hreflang="x-default" href="' . $e($site . Seo::carPath($slug, 'it')) . '">'
    . '<meta property="og:type" content="product"><meta property="og:url" content="' . $e($url) . '">'
    . '<meta property="og:title" content="' . $e($m['title']) . '"><meta property="og:description" content="' . $e($m['description']) . '">'
    . '<meta property="og:image" content="' . $e($img) . '"><meta property="og:site_name" content="Sulcis Rent – Autonoleggio">'
    . '<meta property="og:locale" content="' . Seo::OG_LOCALE[$lang] . '">'
    . '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' . $e($m['title']) . '">'
    . '<meta name="twitter:description" content="' . $e($m['description']) . '"><meta name="twitter:image" content="' . $e($img) . '">'
    . ($count ? '' : $ldTag);
$html = preg_replace_callback('#<head>#i', static fn() => '<head>' . $head, $html, 1) ?? $html;

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
echo $html;
