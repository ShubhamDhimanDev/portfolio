<?php

declare(strict_types=1);

/**
 * Shared input sanitization. clean_text() is lifted verbatim from the
 * original root-level send-strategy-call.php / send-deck-download.php
 * (previously copy-pasted in both) so every endpoint shares one definition.
 */

/**
 * Trim, strip any HTML tags, and collapse internal whitespace. This is the
 * exact pattern the two original lead-mail scripts used.
 */
function clean_text($value): string
{
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);
    $value = strip_tags($value);
    return preg_replace('/\s+/', ' ', $value) ?? '';
}

/**
 * Validate + normalize an email address. Returns the normalized address or
 * '' when invalid/blank.
 */
function clean_email($value): string
{
    $email = filter_var(trim((string) $value), FILTER_VALIDATE_EMAIL);
    return $email !== false ? $email : '';
}

/**
 * Validate a fully-qualified http(s) URL. Returns '' when invalid/blank.
 */
function clean_url($value): string
{
    $value = trim((string) $value);
    if ($value === '') {
        return '';
    }
    $url = filter_var($value, FILTER_VALIDATE_URL);
    if ($url === false) {
        return '';
    }
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if (!in_array($scheme, ['http', 'https'], true)) {
        return '';
    }
    return $url;
}

/**
 * Slugify arbitrary text into a URL-safe slug: lowercase, ASCII
 * alphanumerics and hyphens only, no leading/trailing/duplicate hyphens.
 */
function clean_slug($value): string
{
    $value = (string) $value;
    $value = trim($value);
    $value = strtolower($value);
    // Best-effort transliteration; falls back to stripping non-ASCII if the intl/iconv ext is missing.
    $transliterated = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    if (is_string($transliterated) && $transliterated !== '') {
        $value = $transliterated;
    }
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    $value = trim($value, '-');
    $value = preg_replace('/-{2,}/', '-', $value) ?? '';
    return $value;
}

/**
 * Coerce to int within optional bounds, or null when not a valid integer.
 */
function clean_int($value, ?int $min = null, ?int $max = null): ?int
{
    if ($value === null || $value === '') {
        return null;
    }
    if (!is_numeric($value)) {
        return null;
    }
    $int = (int) $value;
    if ($min !== null && $int < $min) {
        return null;
    }
    if ($max !== null && $int > $max) {
        return null;
    }
    return $int;
}

/**
 * Loose boolean coercion for JSON/form payloads (accepts true/false, 1/0,
 * "1"/"0", "true"/"false").
 */
function clean_bool($value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_int($value)) {
        return $value === 1;
    }
    if (is_string($value)) {
        return in_array(strtolower(trim($value)), ['1', 'true', 'on', 'yes'], true);
    }
    return false;
}

/**
 * Like clean_text(), but preserves line breaks (paragraphs) instead of
 * collapsing all whitespace to single spaces - used for comment bodies,
 * where clean_text()'s aggressive collapsing would destroy formatting.
 */
function clean_multiline_text($value, int $maxLength = 5000): string
{
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);
    $value = strip_tags($value);
    $value = preg_replace('/\r\n?/', "\n", $value) ?? $value;
    $value = preg_replace('/[ \t]+/', ' ', $value) ?? $value;
    $value = preg_replace('/\n{3,}/', "\n\n", $value) ?? $value;
    $value = trim($value);

    return mb_substr($value, 0, $maxLength);
}

/**
 * Sanitize inline HTML for list item content: only a small allowlist of
 * inline marks survive (bold/italic/underline/inline links/line breaks).
 * Everything else - scripts, event handlers, block-level tags - is stripped.
 * List items are short per-item text, not full documents, so structural
 * markup doesn't apply here the way it does for paragraph/div/html blocks
 * (see sanitize_raw_html()).
 */
function sanitize_inline_html(string $html): string
{
    $allowedTags = '<b><strong><i><em><u><a><br><span>';
    $html = strip_tags($html, $allowedTags);

    // Strip everything off <a> tags except href, and force safe rel/target.
    $html = preg_replace_callback('/<a\b[^>]*>/i', function (array $m): string {
        if (!preg_match('/href\s*=\s*"([^"]*)"|href\s*=\s*\'([^\']*)\'/i', $m[0], $hrefMatch)) {
            return '<a>';
        }
        $href = clean_url($hrefMatch[1] ?? $hrefMatch[2] ?? '');
        if ($href === '') {
            return '<a>';
        }
        return '<a href="' . htmlspecialchars($href, ENT_QUOTES) . '" target="_blank" rel="noopener noreferrer">';
    }, $html) ?? $html;

    // Strip everything off <span> (used only as a plain inline wrapper, e.g. for line breaks).
    $html = preg_replace('/<span\b[^>]*>/i', '<span>', $html) ?? $html;

    return trim($html);
}

/**
 * Sanitize raw HTML for the `html` block: unlike sanitize_inline_html(), this
 * allows arbitrary markup (embeds, tables, custom widgets - the whole point of
 * a raw-HTML block) but strips <script> tags, event-handler attributes (onClick,
 * onerror, ...), and javascript:/vbscript: pseudo-protocol URIs, so a compromised
 * or careless admin session can't plant persistent script-based XSS in a page
 * served to every site visitor. Authoring is admin-only (session-gated), but
 * output goes to the public blog, so this stays defense-in-depth rather than trust.
 */
function sanitize_raw_html(string $html): string
{
    // Strip <script>...</script> blocks (and any stray unclosed <script> tag) entirely.
    $html = preg_replace('/<script\b[^>]*>.*?<\/script\s*>/is', '', $html) ?? $html;
    $html = preg_replace('/<script\b[^>]*>/i', '', $html) ?? $html;

    // Strip on*="..." / on*='...' event-handler attributes.
    $html = preg_replace('/\s+on[a-z]+\s*=\s*"[^"]*"/i', '', $html) ?? $html;
    $html = preg_replace('/\s+on[a-z]+\s*=\s*\'[^\']*\'/i', '', $html) ?? $html;

    // Neutralize javascript:/vbscript: URIs in href/src/action attributes.
    $html = preg_replace_callback(
        '/\s(href|src|action)\s*=\s*(["\'])\s*(javascript|vbscript):[^"\']*\2/i',
        fn (array $m): string => ' ' . $m[1] . '=' . $m[2] . $m[2],
        $html
    ) ?? $html;

    return trim($html);
}

/**
 * Allowed block_type values for blog_post_blocks, per docs/blog-section.md §4.3.
 *
 * @return string[]
 */
function allowed_block_types(): array
{
    return ['heading', 'paragraph', 'div', 'quote', 'image', 'video', 'list', 'divider', 'link', 'html'];
}

/**
 * Given a candidate slug, append -2, -3, ... until it's unique in $table
 * (optionally ignoring $excludeId, for updates). $table/$column are never
 * user input, so this is safe to interpolate directly.
 */
function unique_slug(PDO $pdo, string $table, string $baseSlug, ?int $excludeId = null, string $column = 'slug'): string
{
    if ($baseSlug === '') {
        $baseSlug = 'item';
    }

    $slug = $baseSlug;
    $suffix = 2;

    while (true) {
        $sql = "SELECT id FROM {$table} WHERE {$column} = :slug";
        $params = ['slug' => $slug];
        if ($excludeId !== null) {
            $sql .= ' AND id != :excludeId';
            $params['excludeId'] = $excludeId;
        }
        $sql .= ' LIMIT 1';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->fetch() === false) {
            return $slug;
        }

        $slug = $baseSlug . '-' . $suffix;
        $suffix++;
    }
}
