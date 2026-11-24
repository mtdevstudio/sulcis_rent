<?php
declare(strict_types=1);
// sitemap.xml dinamica (rewrite in .htaccess): pagine statiche + auto pubblicate in IT/EN. Niente /admin.
$root = __DIR__;
$site = 'https://' . preg_replace('/[^a-z0-9.\-:]/i', '', $_SERVER['HTTP_HOST'] ?? 'sulcisrent.it');
$cfgSite = null;
foreach ([getenv('SR_PRIVATE_DIR') ?: null, dirname($root) . '/sulcis-private', $root . '/_private'] as $d) {
    if ($d && is_file("$d/config.php")) { $c = require "$d/config.php"; $cfgSite = $c['site_url'] ?? null; break; }
}
$site = rtrim($cfgSite ?: $site, '/');
$fleet = json_decode((string) @file_get_contents("$root/data/fleet.json"), true) ?: ['cars' => []];
$langs = ['it', 'en', 'fr', 'es', 'pt', 'pl'];
$p = static fn(string $l, string $it, string $other) => $l === 'it' ? $it : "/$l$other";
// ogni voce: [percorsi per lingua, lastmod, priorità]
$urls = [];
foreach ([['/', '/', '1.0'], ['/flotta/', '/fleet/', '0.9'], ['/privacy/', '/privacy/', '0.2'], ['/cookie/', '/cookie/', '0.2']] as [$it, $other, $prio]) {
    $urls[] = [array_combine($langs, array_map(static fn($l) => $p($l, $it, $other), $langs)), null, $prio];
}
foreach ($fleet['cars'] as $c) {
    $s = (string) ($c['slug'] ?? '');
    if (!preg_match('/^[a-z0-9-]+$/', $s)) continue;
    $urls[] = [array_combine($langs, array_map(static fn($l) => $p($l, "/flotta/$s/", "/fleet/$s/"), $langs)), $c['updatedAt'] ?? null, '0.8'];
}
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$e = static fn($s) => htmlspecialchars((string) $s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
foreach ($urls as [$byLang, $mod, $prio]) {
    foreach ($byLang as $lang => $path) {
        echo '<url><loc>' . $e($site . $path) . '</loc>';
        if ($mod) echo '<lastmod>' . $e(substr((string) $mod, 0, 10)) . '</lastmod>';
        echo '<priority>' . $prio . '</priority>';
        foreach ($byLang as $l => $alt) echo '<xhtml:link rel="alternate" hreflang="' . $l . '" href="' . $e($site . $alt) . '"/>';
        echo '<xhtml:link rel="alternate" hreflang="x-default" href="' . $e($site . $byLang['it']) . '"/>';
        echo "</url>\n";
    }
}
echo '</urlset>';
