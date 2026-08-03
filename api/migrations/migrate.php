<?php

declare(strict_types=1);

/**
 * Tiny hand-rolled migration runner, per docs/blog-section.md §4.11.
 *
 * Usage (from anywhere):  php api/migrations/migrate.php
 * Usage (from api/):      php migrations/migrate.php
 *
 * - Creates schema_migrations if it doesn't exist yet.
 * - Reads migrations/*.sql in filename order.
 * - Skips any migration already recorded in schema_migrations.
 * - Runs each remaining file inside a transaction; records the filename +
 *   timestamp on success. Safe to re-run on every deploy.
 */

require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../config/db.php';

$pdo = get_pdo();

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
        migration_name VARCHAR(255) NOT NULL,
        run_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_schema_migrations_name (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$applied = [];
foreach ($pdo->query('SELECT migration_name FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN) as $name) {
    $applied[$name] = true;
}

$files = glob(__DIR__ . '/*.sql');
if ($files === false) {
    fwrite(STDERR, "Could not read migrations directory.\n");
    exit(1);
}
sort($files, SORT_STRING);

/**
 * Split a .sql file's contents into individual statements: strips full-line
 * comments, then splits on statement-terminating semicolons. Good enough
 * for this project's migrations (no semicolons inside string literals).
 *
 * @return string[]
 */
function migration_split_statements(string $sql): array
{
    $lines = preg_split('/\R/', $sql) ?: [];
    $clean = [];
    foreach ($lines as $line) {
        if (preg_match('/^\s*--/', $line)) {
            continue;
        }
        $clean[] = $line;
    }
    $sql = implode("\n", $clean);

    $parts = array_filter(array_map('trim', explode(';', $sql)), static fn($s) => $s !== '');
    return array_values($parts);
}

$ranCount = 0;

foreach ($files as $file) {
    $name = basename($file);

    if (isset($applied[$name])) {
        echo "SKIP    {$name} (already applied)\n";
        continue;
    }

    $sql = file_get_contents($file);
    if ($sql === false) {
        fwrite(STDERR, "Could not read {$file}\n");
        exit(1);
    }

    $statements = migration_split_statements($sql);

    // NOTE: MySQL/MariaDB DDL (CREATE TABLE, ...) implicitly commits any open
    // transaction - beginTransaction() here does NOT make a CREATE TABLE
    // rollback-able. It still meaningfully wraps any DML statements in the
    // same file (e.g. the seed INSERT in 0001) and, combined with every
    // CREATE TABLE being IF NOT EXISTS and every seed INSERT being IGNORE,
    // a mid-file failure is safe to retry on the next run.
    $pdo->beginTransaction();
    try {
        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }

        $record = $pdo->prepare('INSERT INTO schema_migrations (migration_name, run_at) VALUES (:name, NOW())');
        $record->execute(['name' => $name]);

        if ($pdo->inTransaction()) {
            $pdo->commit();
        }
        echo "APPLIED {$name}\n";
        $ranCount++;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        fwrite(STDERR, "FAILED  {$name}: {$e->getMessage()}\n");
        exit(1);
    }
}

echo "\nDone. {$ranCount} migration(s) applied this run.\n";
