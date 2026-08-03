<?php

declare(strict_types=1);

/**
 * Local dev router for PHP's built-in server, mirroring the .htaccess logic
 * used in production (Apache). Run from inside api/:
 *
 *   cd api
 *   php -S localhost:8000 router.php
 *
 * Then point vite.config.ts's server.proxy at /api -> http://localhost:8000,
 * per docs/blog-section.md §4.12.
 */

$uri = urldecode((string) (parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/'));

// Never serve api/.env or any dotfile directly.
if (str_starts_with(basename($uri), '.env')) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}

// Block direct access to internal-only directories, same as .htaccess.
foreach (['/vendor/', '/config/', '/lib/', '/migrations/', '/storage/'] as $blockedPrefix) {
    if (str_starts_with($uri, $blockedPrefix)) {
        http_response_code(403);
        echo 'Forbidden';
        return true;
    }
}

$file = __DIR__ . $uri;
if ($uri !== '/' && is_file($file)) {
    // Let the built-in server handle static files and flat endpoint scripts
    // (endpoints/*.php) directly, same as the .htaccess "-f" rule.
    return false;
}

require __DIR__ . '/index.php';
