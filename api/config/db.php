<?php

declare(strict_types=1);

/**
 * PDO connection factory. Reads DB_* from api/.env (see bootstrap.php's env()).
 * A single shared connection is reused per request (or per CLI run).
 */

function get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env('DB_HOST', 'localhost');
    $port = env('DB_PORT', '3306');
    $name = env('DB_NAME', '');
    $user = env('DB_USER', '');
    $pass = env('DB_PASS', '');

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log('[api] DB connection failed: ' . $e->getMessage());
        if (is_cli_context()) {
            fwrite(STDERR, 'Database connection failed: ' . $e->getMessage() . PHP_EOL);
            exit(1);
        }
        json_response(['ok' => false, 'message' => 'Database is currently unavailable. Please try again later.'], 503);
    }

    return $pdo;
}
