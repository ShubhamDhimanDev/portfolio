<?php

declare(strict_types=1);

/**
 * POST /api/admin/logout
 * Requires an active admin session + valid CSRF token.
 * Response: { ok, message }
 * Invoked via the api/index.php front controller - $pdo/$admin are provided by it.
 */

/** @var PDO $pdo */
/** @var array $admin */

if (!defined('ECOMMLAB_API_ROUTED')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Not found.']);
    exit;
}

admin_logout();

json_response(['ok' => true, 'message' => 'Logged out.']);
