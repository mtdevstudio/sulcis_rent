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
$urls = [
    ['/', '/en/', null, '1.0'], ['/flotta/', '/en/fleet/', null, '0.9'], ['/privacy/', '/en/privacy/', null, '0.2'], ['/cookie/', '/en/cookie/', null, '0.2'],
];
foreach ($fleet['cars'] as $c) {
    if (!preg_match('/^[a-z0-9-]+$/', (string) ($c['slug'] ?? ''))) continue;
    $urls[] = ["/flotta/{$c['slug']}/", "/en/fleet/{$c['slug']}/", $c['updatedAt'] ?? null, '0.8'];
}
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$e = static fn($s) => htmlspecialchars((string) $s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
foreach ($urls as [$it, $en, $mod, $prio]) {
    foreach ([[$it, 'it'], [$en, 'en']] as [$path, $lang]) {
        echo '<url><loc>' . $e($site . $path) . '</loc>';
        if ($mod) echo '<lastmod>' . $e(substr((string) $mod, 0, 10)) . '</lastmod>';
        echo '<priority>' . $prio . '</priority>';
        echo '<xhtml:link rel="alternate" hreflang="it" href="' . $e($site . $it) . '"/>';
        echo '<xhtml:link rel="alternate" hreflang="en" href="' . $e($site . $en) . '"/>';
        echo "</url>\n";
    }
}
echo '</urlset>';
