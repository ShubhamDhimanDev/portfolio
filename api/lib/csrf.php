<?php

declare(strict_types=1);

/**
 * CSRF token issuance/verification for state-changing admin requests, per
 * docs/blog-section.md §4.9. Token is bound to the PHP session (already
 * HttpOnly + Secure in production, see bootstrap.php).
 */

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Read the CSRF token supplied by the client, either as an X-CSRF-Token
 * header or a csrf_token field in the JSON/form body.
 */
function submitted_csrf_token(): string
{
    $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (is_string($header) && $header !== '') {
        return $header;
    }
    $body = json_body();
    return is_string($body['csrf_token'] ?? null) ? $body['csrf_token'] : '';
}

function verify_csrf(): bool
{
    $expected = $_SESSION['csrf_token'] ?? '';
    $actual = submitted_csrf_token();
    if ($expected === '' || $actual === '') {
        return false;
    }
    return hash_equals($expected, $actual);
}

/**
 * Enforce CSRF on the current request, terminating with 403 JSON if invalid.
 */
function require_csrf(): void
{
    if (!verify_csrf()) {
        json_response(['ok' => false, 'message' => 'Invalid or missing CSRF token.'], 403);
    }
}
