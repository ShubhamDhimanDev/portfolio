<?php

declare(strict_types=1);

/**
 * Shared bootstrap for every entry point under api/ (index.php front controller,
 * the flat endpoints/*.php scripts, and migrations/migrate.php).
 *
 * Responsibilities:
 *  - load Composer autoload + api/.env
 *  - expose env(): typed access to configuration
 *  - configure session/cookie params (HTTP context only - CLI scripts like
 *    migrate.php never touch sessions)
 *  - set common JSON response headers + helpers (HTTP context only)
 *  - register an error/exception handler that never leaks a stack trace to
 *    the client, matching the { ok, message } response contract
 */

require __DIR__ . '/vendor/autoload.php';

// --- Environment -----------------------------------------------------------

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

/**
 * Read a config value from api/.env (falls back to $default when unset/blank).
 */
function env(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }
    return (string) $value;
}

function is_cli_context(): bool
{
    return PHP_SAPI === 'cli';
}

function app_env(): string
{
    return env('APP_ENV', 'production') ?? 'production';
}

// --- Error handling ----------------------------------------------------------

ini_set('display_errors', '0');
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e): void {
    error_log('[api] Uncaught ' . get_class($e) . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!is_cli_context() && !headers_sent()) {
        json_response(['ok' => false, 'message' => 'Something went wrong. Please try again later.'], 500);
    }
    exit(1);
});

set_error_handler(function (int $severity, string $message, string $file = '', int $line = 0): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// --- HTTP-only setup (sessions, JSON headers) --------------------------------

if (!is_cli_context()) {
    $secureCookie = app_env() === 'production';

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $secureCookie,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('ecommlab_admin_sess');
    session_start();

    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
}

/**
 * Send a { ok, message, ... } JSON response and terminate the request.
 *
 * @param array<string, mixed> $payload
 */
function json_response(array $payload, int $status = 200): never
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Build the public URL for a media row's stored file_path. Shared by the
 * media endpoint and anything that embeds resolved media (e.g. blog post
 * cover images / block images) in a JSON response.
 */
function media_public_url(string $filePath): string
{
    return '/api/' . ltrim($filePath, '/');
}

/**
 * Look up a media row by id and attach its resolved public `url`. Returns
 * null for a missing/soft-deleted id. Shared by the media endpoint, blog
 * post cover/OG/Twitter images, block media resolution (see
 * resolve_block_media() below), and api/render/blog-post.php.
 */
function media_brief(PDO $pdo, ?int $id): ?array
{
    if ($id === null) {
        return null;
    }
    $stmt = $pdo->prepare(
        'SELECT id, file_name, file_path, file_type, mime_type, alt_text, width, height
         FROM media WHERE id = :id AND deleted_at IS NULL LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if ($row === false) {
        return null;
    }
    $row['url'] = media_public_url((string) $row['file_path']);
    return $row;
}

/**
 * For image/video blocks with source='media', resolves media_id to an
 * absolute URL and attaches it as `url` (image) / `media_url` (video) - the
 * same field the frontend reads uniformly regardless of source (see
 * ImageBlockData/VideoBlockData in src/types/blog.types.ts, and
 * BlogContentRenderer.tsx). Blocks with source='url'/'embed' already carry
 * their own url/embed_url in block_data and are returned unchanged. Any
 * other block type is returned unchanged.
 *
 * @param array<string,mixed> $data
 * @return array<string,mixed>
 */
function resolve_block_media(PDO $pdo, string $blockType, array $data): array
{
    if (!in_array($blockType, ['image', 'video'], true)) {
        return $data;
    }
    if (($data['source'] ?? null) !== 'media' || !isset($data['media_id'])) {
        return $data;
    }
    $media = media_brief($pdo, (int) $data['media_id']);
    if ($media === null) {
        return $data;
    }
    if ($blockType === 'image') {
        $data['url'] = $media['url'];
    } else {
        $data['media_url'] = $media['url'];
    }
    return $data;
}

/**
 * Parse the request body as JSON, falling back to $_POST (mirrors the
 * behaviour of the original root-level lead-mail scripts).
 *
 * @return array<string, mixed>
 */
function json_body(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);

    if (!is_array($data) || empty($data)) {
        $data = $_POST;
    }

    $cache = $data;
    return $data;
}
