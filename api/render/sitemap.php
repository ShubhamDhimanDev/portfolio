<?php

declare(strict_types=1);

/**
 * Dynamic sitemap.xml - homepage + published blog posts. Case studies are
 * intentionally excluded (out of scope for SEO).
 *
 * Routed here for /sitemap.xml by the root .htaccess (see public/.htaccess).
 */

require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../config/db.php';

header('Content-Type: application/xml; charset=utf-8');

function sitemap_site_url(): string
{
    $httpsHeader = (string) ($_SERVER['HTTPS'] ?? '');
    $scheme = ($httpsHeader !== '' && strtolower($httpsHeader) !== 'off') ? 'https' : 'http';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    return $scheme . '://' . $host;
}

function sitemap_url(string $loc, ?string $lastmod, string $changefreq, string $priority): string
{
    $out = '  <url>' . "\n";
    $out .= '    <loc>' . htmlspecialchars($loc, ENT_QUOTES, 'UTF-8') . '</loc>' . "\n";
    if ($lastmod !== null) {
        $out .= '    <lastmod>' . htmlspecialchars($lastmod, ENT_QUOTES, 'UTF-8') . '</lastmod>' . "\n";
    }
    $out .= '    <changefreq>' . $changefreq . '</changefreq>' . "\n";
    $out .= '    <priority>' . $priority . '</priority>' . "\n";
    $out .= '  </url>' . "\n";
    return $out;
}

$siteUrl = sitemap_site_url();
$pdo = get_pdo();

$posts = $pdo->query(
    "SELECT slug, updated_at FROM blog_posts WHERE status = 'published' AND deleted_at IS NULL ORDER BY published_at DESC"
)->fetchAll();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

echo sitemap_url($siteUrl . '/', null, 'monthly', '1.0');
echo sitemap_url($siteUrl . '/blog', null, 'daily', '0.8');

foreach ($posts as $post) {
    $lastmod = $post['updated_at'] !== null ? date('c', strtotime((string) $post['updated_at'])) : null;
    echo sitemap_url($siteUrl . '/blog/' . $post['slug'], $lastmod, 'monthly', '0.7');
}

echo '</urlset>';
