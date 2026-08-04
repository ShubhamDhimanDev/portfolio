<?php

declare(strict_types=1);

/**
 * Front controller for the resource-style /api/... routes (blog posts,
 * categories, comments, media, admin auth) - path-based dispatch, no
 * framework. See docs/blog-section.md §4.10 for the full route contract.
 *
 * The two lead-mail scripts are intentionally NOT routed through here - per
 * docs/api-backend.md §7 (open question 4) they stay flat files at
 * api/endpoints/send-strategy-call.php and api/endpoints/send-deck-download.php,
 * called directly by URL.
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/config/db.php';
require __DIR__ . '/lib/validate.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/csrf.php';

// Marks that we got here via the front controller (not a direct request to
// an endpoints/*.php file) - the resource endpoint files check this and
// refuse to run standalone, since they rely on $pdo/$admin/$routeParams
// being set up here first.
define('ECOMMLAB_API_ROUTED', true);

/**
 * @param string[] $paramNames route params in the order their {placeholders} appear
 */
function make_route(
    string $method,
    string $pattern,
    string $file,
    string $action,
    array $paramNames = [],
    bool $requiresAdmin = false,
    bool $requiresCsrf = false
): array {
    $regex = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', $pattern);
    return [
        'method' => $method,
        'regex' => '#^' . $regex . '$#',
        'file' => $file,
        'action' => $action,
        'params' => $paramNames,
        'admin' => $requiresAdmin,
        'csrf' => $requiresCsrf,
    ];
}

$routes = [
    // --- Public ---------------------------------------------------------
    make_route('GET', 'blog-posts', 'blog-posts.php', 'public_list'),
    make_route('GET', 'blog-posts/{slug}', 'blog-posts.php', 'public_detail', ['slug']),
    make_route('GET', 'categories', 'categories.php', 'public_list'),
    make_route('POST', 'blog-posts/{slug}/comments', 'comments.php', 'public_submit', ['slug']),

    // --- Admin: auth ------------------------------------------------------
    make_route('POST', 'admin/login', 'admin-login.php', 'login'),
    make_route('POST', 'admin/logout', 'admin-logout.php', 'logout', [], true, true),
    make_route('GET', 'admin/me', 'admin-me.php', 'me'),

    // --- Admin: blog posts --------------------------------------------------
    // NOTE: GET admin/blog-posts/{id} is not in docs/blog-section.md §4.10's
    // literal route list, but the admin editor (block editor + FAQ repeater +
    // SEO fields, per §3.2) has no other way to fetch a draft post's full
    // nested payload - the admin list below is intentionally a lightweight
    // summary, and the public slug-detail route only serves published posts.
    // Added here as a minimal, clearly-flagged fix to that gap.
    make_route('GET', 'admin/blog-posts', 'blog-posts.php', 'admin_list', [], true),
    make_route('GET', 'admin/blog-posts/{id}', 'blog-posts.php', 'admin_detail', ['id'], true),
    make_route('POST', 'admin/blog-posts', 'blog-posts.php', 'admin_create', [], true, true),
    make_route('PUT', 'admin/blog-posts/{id}', 'blog-posts.php', 'admin_update', ['id'], true, true),
    make_route('POST', 'admin/blog-posts/{id}/toggle', 'blog-posts.php', 'admin_toggle', ['id'], true, true),
    make_route('POST', 'admin/blog-posts/{id}/archive', 'blog-posts.php', 'admin_archive', ['id'], true, true),
    make_route('DELETE', 'admin/blog-posts/{id}', 'blog-posts.php', 'admin_delete', ['id'], true, true),

    // --- Admin: categories --------------------------------------------------
    make_route('GET', 'admin/categories', 'categories.php', 'admin_list', [], true),
    make_route('POST', 'admin/categories', 'categories.php', 'admin_create', [], true, true),
    make_route('PUT', 'admin/categories/{id}', 'categories.php', 'admin_update', ['id'], true, true),
    make_route('DELETE', 'admin/categories/{id}', 'categories.php', 'admin_delete', ['id'], true, true),

    // --- Admin: comments --------------------------------------------------
    make_route('GET', 'admin/comments', 'comments.php', 'admin_list', [], true),
    make_route('POST', 'admin/comments/{id}/approve', 'comments.php', 'admin_approve', ['id'], true, true),
    make_route('POST', 'admin/comments/{id}/reject', 'comments.php', 'admin_reject', ['id'], true, true),
    make_route('DELETE', 'admin/comments/{id}', 'comments.php', 'admin_delete', ['id'], true, true),

    // --- Admin: media --------------------------------------------------
    make_route('GET', 'admin/media', 'media.php', 'admin_list', [], true),
    make_route('POST', 'admin/media/upload', 'media.php', 'admin_upload', [], true, true),
    make_route('DELETE', 'admin/media/{id}', 'media.php', 'admin_delete', ['id'], true, true),

    // --- Admin: leads (contact form submissions) ---------------------------
    // Rows are created by the flat endpoints/send-contact-message.php script,
    // not through this front controller - see docs/api-backend.md §7.
    make_route('GET', 'admin/leads', 'leads.php', 'admin_list', [], true),
    make_route('POST', 'admin/leads/{id}/status', 'leads.php', 'admin_update_status', ['id'], true, true),
    make_route('DELETE', 'admin/leads/{id}', 'leads.php', 'admin_delete', ['id'], true, true),
];

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$requestPath = trim((string) $requestPath, '/');

// Strip a leading "api/" prefix - present when deployed at e.g. public_html/api/
// and REQUEST_URI is /api/blog-posts; absent when running `php -S` with api/
// itself as the document root (see router.php).
$requestPath = preg_replace('#^api/#', '', $requestPath) ?? $requestPath;
$requestPath = preg_replace('#^index\.php/?#', '', $requestPath) ?? $requestPath;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$matchedRoute = null;
$routeParams = [];
$pathMatchedAnyMethod = false;

foreach ($routes as $route) {
    if (!preg_match($route['regex'], $requestPath, $m)) {
        continue;
    }
    $pathMatchedAnyMethod = true;
    if ($route['method'] !== $method) {
        continue;
    }
    $matchedRoute = $route;
    $values = array_slice($m, 1);
    $routeParams = $route['params'] !== [] ? array_combine($route['params'], $values) : [];
    break;
}

if ($matchedRoute === null) {
    $status = $pathMatchedAnyMethod ? 405 : 404;
    json_response([
        'ok' => false,
        'message' => $status === 405 ? 'Method not allowed for this endpoint.' : 'Not found.',
    ], $status);
}

$pdo = get_pdo();
$admin = null;

if ($matchedRoute['admin']) {
    $admin = require_admin($pdo); // terminates with 401 JSON if not authenticated
}

if ($matchedRoute['csrf']) {
    require_csrf(); // terminates with 403 JSON if invalid/missing
}

$routeAction = $matchedRoute['action'];

// $pdo, $admin, $routeParams, $routeAction are all in scope for the required file.
require __DIR__ . '/endpoints/' . $matchedRoute['file'];
