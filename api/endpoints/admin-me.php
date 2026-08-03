<?php

declare(strict_types=1);

/**
 * GET /api/admin/me
 * Response (logged in):  { ok: true, message, data: { admin, csrf_token } }
 * Response (logged out): { ok: false, message: "Not authenticated.", data: null }  -- HTTP 200, not 401
 *
 * Deliberately does NOT use require_admin()/401 here - this is the
 * "am I logged in" probe the frontend polls on load, and docs/api-backend.md
 * §6 calls out GET /api/admin/me as the smoke-test endpoint that should
 * return "a clean 'not logged in' JSON response rather than a 500", so a
 * logged-out call is a normal 200 with ok:false, not an error status.
 * Invoked via the api/index.php front controller - $pdo is provided by it.
 */

/** @var PDO $pdo */

if (!defined('ECOMMLAB_API_ROUTED')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Not found.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['ok' => false, 'message' => 'Method not allowed. Use GET.'], 405);
}

$admin = current_admin($pdo);

if ($admin === null) {
    json_response(['ok' => false, 'message' => 'Not authenticated.', 'data' => null]);
}

json_response([
    'ok' => true,
    'message' => 'Authenticated.',
    'data' => [
        'admin' => $admin,
        'csrf_token' => csrf_token(),
    ],
]);
