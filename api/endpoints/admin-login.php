<?php

declare(strict_types=1);

/**
 * POST /api/admin/login
 * Body: { email, password }
 * Response: { ok, message, data?: { admin: {...}, csrf_token } }
 *
 * Session-based login with password_verify() and basic per-(email,IP)
 * rate limiting (5 failed attempts / 15 min, see lib/auth.php).
 * Invoked via the api/index.php front controller - $pdo is provided by it.
 */

/** @var PDO $pdo */

if (!defined('ECOMMLAB_API_ROUTED')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Not found.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Method not allowed. Use POST.'], 405);
}

$data = json_body();
$email = clean_email($data['email'] ?? '');
$password = is_string($data['password'] ?? null) ? $data['password'] : '';

if ($email === '' || $password === '') {
    json_response(['ok' => false, 'message' => 'Email and password are required.'], 422);
}

if (!login_rate_limit_check($email)) {
    json_response(['ok' => false, 'message' => 'Too many login attempts. Please try again in a few minutes.'], 429);
}

$admin = attempt_admin_login($pdo, $email, $password);

if ($admin === null) {
    login_rate_limit_register_failure($email);
    json_response(['ok' => false, 'message' => 'Invalid email or password.'], 401);
}

login_rate_limit_reset($email);

json_response([
    'ok' => true,
    'message' => 'Logged in.',
    'data' => [
        'admin' => $admin,
        'csrf_token' => csrf_token(),
    ],
]);
