<?php

declare(strict_types=1);

/**
 * Server-rendered HTML for a single published blog post - served to
 * crawlers that don't execute JavaScript (search engines, social
 * link-unfurlers, AI answer-engine bots), which would otherwise only ever
 * see the generic SPA shell from index.html, since this app has no SSR.
 * Real browsers are transparently passed the normal SPA shell unchanged.
 *
 * Routed here for every /blog/{slug} request by the root .htaccess - this
 * script, not Apache, decides bot vs. human via the User-Agent header.
 *
 * IMPORTANT: the meta/OG/JSON-LD/content rendered here must stay in sync
 * with src/pages/blog/BlogPostPage.tsx and src/components/blog/BlogContentRenderer.tsx
 * - there's no way to share code between the PHP and TS layers, so a field
 * added to one needs the same treatment here.
 */

require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/validate.php';
require __DIR__ . '/../lib/bot_detect.php';

header('Content-Type: text/html; charset=utf-8');

$slug = clean_slug($_GET['slug'] ?? '');
$userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');

// Humans (and anything not recognized as a crawler) get the normal SPA
// shell, completely unchanged from what they'd get without this rewrite.
if (!is_crawler_bot($userAgent)) {
    serve_spa_shell();
}

$pdo = get_pdo();
$post = render_fetch_published_post($pdo, $slug);

if ($post === null) {
    http_response_code(404);
    echo render_not_found_html();
    exit;
}

echo render_post_html($post);
exit;

// =============================================================================
// Human fallback
// =============================================================================

function serve_spa_shell(): never
{
    // api/render/blog-post.php -> api/render -> api -> web root, where the
    // built dist/ output is deployed alongside api/ (see docs/api-backend.md §3).
    // __spa-fallback.html is react-router's generic minimal shell for
    // non-prerendered routes (this one - /blog/:slug - has a clientLoader +
    // HydrateFallback, see BlogPostPage.tsx) - unlike index.html, it carries
    // no baked-in homepage DOM/meta, so there's no hydration mismatch or
    // wrong content exposed to non-JS readers of this URL.
    $shellPath = dirname(__DIR__, 2) . '/__spa-fallback.html';
    if (is_file($shellPath)) {
        readfile($shellPath);
    } else {
        // Shouldn't happen in production; safe fallback for any environment
        // where the built shell isn't deployed next to api/.
        http_response_code(302);
        header('Location: /');
    }
    exit;
}

// =============================================================================
// Data fetching (mirrors blog_posts_public_detail() in endpoints/blog-posts.php,
// trimmed to what this renderer needs)
// =============================================================================

function render_fetch_published_post(PDO $pdo, string $slug): ?array
{
    if ($slug === '') {
        return null;
    }

    $stmt = $pdo->prepare(
        "SELECT id, title, slug, excerpt, cover_media_id, author_name, author_linkedin_url,
                created_at, updated_at, published_at
         FROM blog_posts
         WHERE slug = :slug AND status = 'published' AND deleted_at IS NULL
         LIMIT 1"
    );
    $stmt->execute(['slug' => $slug]);
    $post = $stmt->fetch();
    if ($post === false) {
        return null;
    }

    $post['cover_media'] = media_brief($pdo, $post['cover_media_id'] !== null ? (int) $post['cover_media_id'] : null);

    $seoStmt = $pdo->prepare("SELECT * FROM seo_meta WHERE entity_type = 'blog_post' AND entity_id = :id LIMIT 1");
    $seoStmt->execute(['id' => $post['id']]);
    $seo = $seoStmt->fetch();
    if (is_array($seo)) {
        $seo['og_image'] = media_brief($pdo, $seo['og_image_media_id'] !== null ? (int) $seo['og_image_media_id'] : null);
        $seo['twitter_image'] = media_brief($pdo, $seo['twitter_image_media_id'] !== null ? (int) $seo['twitter_image_media_id'] : null);
    }
    $post['seo'] = is_array($seo) ? $seo : null;

    $faqStmt = $pdo->prepare('SELECT question, answer FROM blog_faqs WHERE blog_post_id = :id ORDER BY sort_order ASC');
    $faqStmt->execute(['id' => $post['id']]);
    $post['faqs'] = $faqStmt->fetchAll();

    $blockStmt = $pdo->prepare('SELECT block_type, block_data FROM blog_post_blocks WHERE blog_post_id = :id ORDER BY sort_order ASC');
    $blockStmt->execute(['id' => $post['id']]);
    $post['blocks'] = array_map(
        static function (array $row) use ($pdo): array {
            $data = json_decode((string) $row['block_data'], true);
            $data = is_array($data) ? $data : [];
            $data = resolve_block_media($pdo, (string) $row['block_type'], $data);
            return ['block_type' => $row['block_type'], 'block_data' => $data];
        },
        $blockStmt->fetchAll()
    );

    return $post;
}

// =============================================================================
// HTML rendering
// =============================================================================

function current_site_url(): string
{
    $httpsHeader = (string) ($_SERVER['HTTPS'] ?? '');
    $scheme = ($httpsHeader !== '' && strtolower($httpsHeader) !== 'off') ? 'https' : 'http';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    return $scheme . '://' . $host;
}

/** Escapes a possibly-missing/null value for safe HTML text/attribute output. */
function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function render_not_found_html(): string
{
    return '<!doctype html><html lang="en"><head><meta charset="UTF-8">'
        . '<title>Post not found - Shubham Dhiman</title>'
        . '<meta name="robots" content="noindex, follow"></head>'
        . '<body><h1>Post not found</h1><p>This post does not exist or is not published.</p></body></html>';
}

function render_post_html(array $post): string
{
    $seo = $post['seo'] ?? [];
    $coverMedia = $post['cover_media'] ?? [];
    $ogImageMedia = $seo['og_image'] ?? [];
    $twitterImageMedia = $seo['twitter_image'] ?? [];

    $siteUrl = current_site_url();
    $canonicalUrl = $seo['canonical_url'] ?? ($siteUrl . '/blog/' . $post['slug']);
    $metaTitle = $seo['meta_title'] ?? ($post['title'] . ' - Shubham Dhiman');
    $metaDescription = $seo['meta_description'] ?? ($seo['ai_summary'] ?? ($post['excerpt'] ?? ''));
    $robots = $seo['robots'] ?? 'index, follow';
    $ogImageUrl = $ogImageMedia['url'] ?? ($coverMedia['url'] ?? null);
    $twitterImageUrl = $twitterImageMedia['url'] ?? $ogImageUrl;
    $authorName = $post['author_name'] ?: 'Shubham Dhiman';
    $authorUrl = $post['author_linkedin_url'] ?: null;

    $articleJsonLd = array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => $post['title'],
        'description' => $seo['ai_summary'] ?? $metaDescription,
        'image' => $ogImageUrl ? [$ogImageUrl] : null,
        'author' => array_filter([
            '@type' => 'Person',
            'name' => $authorName,
            'url' => $authorUrl,
        ], static fn($v) => $v !== null),
        'publisher' => [
            '@type' => 'Person',
            'name' => 'Shubham Dhiman',
            'logo' => ['@type' => 'ImageObject', 'url' => $siteUrl . '/og-image.png'],
        ],
        'datePublished' => $post['published_at'] ?? $post['created_at'],
        'dateModified' => $post['updated_at'],
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonicalUrl],
    ], static fn($v) => $v !== null);

    $faqJsonLd = null;
    if (!empty($post['faqs'])) {
        $faqJsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(static fn(array $f): array => [
                '@type' => 'Question',
                'name' => $f['question'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']],
            ], $post['faqs']),
        ];
    }

    // JSON_HEX_TAG/JSON_HEX_AMP neutralize a </script> breakout in any field
    // (e.g. a title containing "</script>") when embedding JSON in an inline
    // <script> tag via string templating, which - unlike React's DOM-based
    // Helmet - this raw-HTML renderer is actually exposed to.
    $jsonFlags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE;

    ob_start();
    ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title><?= h($metaTitle) ?></title>
<?php if ($metaDescription !== ''): ?><meta name="description" content="<?= h($metaDescription) ?>">
<?php endif; ?>
<meta name="robots" content="<?= h($robots) ?>">
<link rel="canonical" href="<?= h($canonicalUrl) ?>">

<meta property="og:type" content="<?= h($seo['og_type'] ?? 'article') ?>">
<meta property="og:title" content="<?= h($seo['og_title'] ?? $post['title']) ?>">
<?php $ogDescription = $seo['og_description'] ?? $metaDescription; if ($ogDescription !== ''): ?><meta property="og:description" content="<?= h($ogDescription) ?>">
<?php endif; ?>
<meta property="og:site_name" content="Shubham Dhiman">
<meta property="og:url" content="<?= h($canonicalUrl) ?>">
<?php if ($ogImageUrl): ?><meta property="og:image" content="<?= h($siteUrl . $ogImageUrl) ?>">
<?php endif; ?>

<meta name="twitter:card" content="<?= h($seo['twitter_card'] ?? 'summary_large_image') ?>">
<meta name="twitter:title" content="<?= h($seo['twitter_title'] ?? $post['title']) ?>">
<?php $twitterDescription = $seo['twitter_description'] ?? $metaDescription; if ($twitterDescription !== ''): ?><meta name="twitter:description" content="<?= h($twitterDescription) ?>">
<?php endif; ?>
<?php if ($twitterImageUrl): ?><meta name="twitter:image" content="<?= h($siteUrl . $twitterImageUrl) ?>">
<?php endif; ?>

<script type="application/ld+json"><?= json_encode($articleJsonLd, $jsonFlags) ?></script>
<?php if ($faqJsonLd !== null): ?><script type="application/ld+json"><?= json_encode($faqJsonLd, $jsonFlags) ?></script>
<?php endif; ?>
</head>
<body>
<article>
<h1><?= h($post['title']) ?></h1>
<p>
<?php if ($post['author_name']): ?>By <?= h($post['author_name']) ?><?php endif; ?>
<?php if ($post['published_at']): ?> · <?= h(date('F j, Y', strtotime((string) $post['published_at']))) ?><?php endif; ?>
</p>
<?php if (!empty($coverMedia['url'])): ?><img src="<?= h($coverMedia['url']) ?>" alt="<?= h($coverMedia['alt_text'] ?? $post['title']) ?>">
<?php endif; ?>

<?= render_blocks_html($post['blocks']) ?>

<?php if (!empty($post['faqs'])): ?>
<h2>Frequently asked questions</h2>
<?php foreach ($post['faqs'] as $faq): ?>
<h3><?= h($faq['question']) ?></h3>
<p><?= h($faq['answer']) ?></p>
<?php endforeach; ?>
<?php endif; ?>
</article>
</body>
</html>
    <?php
    return (string) ob_get_clean();
}

/**
 * Plain semantic HTML for the content blocks - mirrors BlockRenderer in
 * BlogContentRenderer.tsx. `html`-bearing fields were already sanitized at
 * write time: list items stay on the inline-tag allowlist (see
 * sanitize_inline_html() in lib/validate.php); paragraph/div/html blocks
 * allow arbitrary structural markup with scripts/event-handlers stripped
 * (see sanitize_raw_html()). Both are safe to echo verbatim here, same as
 * the React renderer's dangerouslySetInnerHTML does.
 *
 * @param array<int,array{block_type:string,block_data:array<string,mixed>}> $blocks
 */
function render_blocks_html(array $blocks): string
{
    $html = '';
    foreach ($blocks as $block) {
        $data = $block['block_data'];
        switch ($block['block_type']) {
            case 'heading':
                $level = max(1, min(6, (int) ($data['level'] ?? 2)));
                $html .= "<h{$level}>" . h($data['text'] ?? '') . "</h{$level}>\n";
                break;

            case 'paragraph':
                $html .= '<p>' . ($data['html'] ?? '') . "</p>\n";
                break;

            case 'div':
                $html .= '<div>' . ($data['html'] ?? '') . "</div>\n";
                break;

            case 'quote':
                $html .= '<blockquote><p>' . h($data['text'] ?? '') . '</p>';
                if (!empty($data['citation'])) {
                    $html .= '<cite>' . h($data['citation']) . '</cite>';
                }
                $html .= "</blockquote>\n";
                break;

            case 'image':
                if (!empty($data['url'])) {
                    $html .= '<figure><img src="' . h($data['url']) . '" alt="' . h($data['alt'] ?? '') . '">';
                    if (!empty($data['caption'])) {
                        $html .= '<figcaption>' . h($data['caption']) . '</figcaption>';
                    }
                    $html .= "</figure>\n";
                }
                break;

            case 'video':
                if (!empty($data['embed_url']) || !empty($data['media_url'])) {
                    $src = !empty($data['embed_url']) ? $data['embed_url'] : $data['media_url'];
                    $html .= '<p><a href="' . h($src) . '">Watch video</a></p>' . "\n";
                    if (!empty($data['caption'])) {
                        $html .= '<p>' . h($data['caption']) . "</p>\n";
                    }
                }
                break;

            case 'list':
                $tag = (($data['style'] ?? 'unordered') === 'ordered') ? 'ol' : 'ul';
                $html .= "<{$tag}>\n";
                foreach (($data['items'] ?? []) as $item) {
                    $html .= '<li>' . (is_string($item) ? $item : '') . "</li>\n";
                }
                $html .= "</{$tag}>\n";
                break;

            case 'divider':
                $html .= "<hr>\n";
                break;

            case 'link':
                $html .= '<p><a href="' . h($data['href'] ?? '') . '">' . h($data['label'] ?? '') . "</a></p>\n";
                break;

            case 'html':
                $html .= ($data['html'] ?? '') . "\n";
                break;
        }
    }
    return $html;
}
