<?php

declare(strict_types=1);

/**
 * Session-based admin auth helpers: password_hash()/password_verify(),
 * current-admin lookup, a require_admin() guard, and a small file-based
 * login rate limiter (no extra DB table - see final build report for why).
 */

const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 900; // 15 minutes

/**
 * Attempt to authenticate an admin by email/password. Returns the admin row
 * (without password_hash) on success, or null on failure. Does NOT itself
 * enforce rate limiting - callers check login_rate_limit_check() first.
 */
function attempt_admin_login(PDO $pdo, string $email, string $password): ?array
{
    $stmt = $pdo->prepare('SELECT id, email, password_hash, created_at, last_login_at FROM admin_users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $row = $stmt->fetch();

    if ($row === false || !password_verify($password, $row['password_hash'])) {
        return null;
    }

    $update = $pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id');
    $update->execute(['id' => $row['id']]);

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $row['id'];
    $_SESSION['admin_email'] = $row['email'];

    unset($row['password_hash']);
    return $row;
}

function admin_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'],
        ]);
    }
    session_destroy();
}

/**
 * Return the currently logged-in admin (fresh row from the DB, minus the
 * password hash), or null if there is no valid session.
 */
function current_admin(PDO $pdo): ?array
{
    $id = $_SESSION['admin_id'] ?? null;
    if (!is_int($id)) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id, email, created_at, last_login_at FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    return $row !== false ? $row : null;
}

/**
 * Guard for admin-only endpoints. Terminates with 401 JSON if not logged in.
 */
function require_admin(PDO $pdo): array
{
    $admin = current_admin($pdo);
    if ($admin === null) {
        json_response(['ok' => false, 'message' => 'Not authenticated.'], 401);
    }
    return $admin;
}

// --- Login rate limiting (file-based, no DB table) --------------------------

function login_rate_limit_store_path(): string
{
    $dir = __DIR__ . '/../storage';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    return $dir . '/login_attempts.json';
}

function login_rate_limit_key(string $email): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return hash('sha256', strtolower($email) . '|' . $ip);
}

/**
 * Returns true when the caller is still allowed to attempt a login.
 */
function login_rate_limit_check(string $email): bool
{
    $entry = login_rate_limit_read(login_rate_limit_key($email));
    if ($entry === null) {
        return true;
    }
    if (time() - $entry['first_attempt'] > LOGIN_RATE_LIMIT_WINDOW_SECONDS) {
        return true;
    }
    return $entry['count'] < LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
}

function login_rate_limit_register_failure(string $email): void
{
    $key = login_rate_limit_key($email);
    $path = login_rate_limit_store_path();
    $fh = fopen($path, 'c+');
    if ($fh === false) {
        return;
    }
    flock($fh, LOCK_EX);
    $contents = stream_get_contents($fh);
    $store = json_decode($contents !== false ? $contents : '', true);
    if (!is_array($store)) {
        $store = [];
    }

    $now = time();
    $entry = $store[$key] ?? null;
    if (!is_array($entry) || ($now - ($entry['first_attempt'] ?? 0)) > LOGIN_RATE_LIMIT_WINDOW_SECONDS) {
        $entry = ['count' => 0, 'first_attempt' => $now];
    }
    $entry['count'] = ($entry['count'] ?? 0) + 1;
    $entry['last_attempt'] = $now;
    $store[$key] = $entry;

    // Prune stale entries so the file doesn't grow unbounded.
    foreach ($store as $k => $v) {
        if (!is_array($v) || ($now - ($v['first_attempt'] ?? 0)) > LOGIN_RATE_LIMIT_WINDOW_SECONDS * 4) {
            unset($store[$k]);
        }
    }

    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($store));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

function login_rate_limit_reset(string $email): void
{
    $key = login_rate_limit_key($email);
    $path = login_rate_limit_store_path();
    if (!file_exists($path)) {
        return;
    }
    $fh = fopen($path, 'c+');
    if ($fh === false) {
        return;
    }
    flock($fh, LOCK_EX);
    $contents = stream_get_contents($fh);
    $store = json_decode($contents !== false ? $contents : '', true);
    if (is_array($store) && isset($store[$key])) {
        unset($store[$key]);
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($store));
        fflush($fh);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
}

/**
 * @return array{count: int, first_attempt: int}|null
 */
function login_rate_limit_read(string $key): ?array
{
    $path = login_rate_limit_store_path();
    if (!file_exists($path)) {
        return null;
    }
    $contents = file_get_contents($path);
    $store = json_decode($contents !== false ? $contents : '', true);
    if (!is_array($store) || !isset($store[$key]) || !is_array($store[$key])) {
        return null;
    }
    return $store[$key];
}
