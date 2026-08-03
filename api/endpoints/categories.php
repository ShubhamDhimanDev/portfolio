<?php

declare(strict_types=1);

/**
 * Categories resource, dispatched by api/index.php.
 *
 * GET    /api/categories              -- public, all categories (flat taxonomy)
 * GET    /api/admin/categories        -- admin, all categories + post counts
 * POST   /api/admin/categories        -- admin, create { name, slug?, description? }
 * PUT    /api/admin/categories/{id}   -- admin, update { name?, slug?, description? }
 * DELETE /api/admin/categories/{id}   -- admin, hard delete (no soft-delete column on this table)
 *
 * $pdo, $admin, $routeParams, $routeAction are set up by index.php.
 */

/** @var PDO $pdo */
/** @var array|null $admin */
/** @var array<string,string> $routeParams */
/** @var string $routeAction */

if (!defined('ECOMMLAB_API_ROUTED')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'Not found.']);
    exit;
}

switch ($routeAction) {
    case 'public_list':
        categories_public_list($pdo);
        break;
    case 'admin_list':
        categories_admin_list($pdo);
        break;
    case 'admin_create':
        categories_admin_create($pdo);
        break;
    case 'admin_update':
        categories_admin_update($pdo, $routeParams);
        break;
    case 'admin_delete':
        categories_admin_delete($pdo, $routeParams);
        break;
    default:
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
}

function categories_public_list(PDO $pdo): never
{
    $stmt = $pdo->query(
        'SELECT id, name, slug, description, parent_id, created_at, updated_at
         FROM categories
         ORDER BY name ASC'
    );
    json_response(['ok' => true, 'message' => 'OK', 'data' => $stmt->fetchAll()]);
}

function categories_admin_list(PDO $pdo): never
{
    $stmt = $pdo->query(
        'SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.created_at, c.updated_at,
                COUNT(pc.blog_post_id) AS post_count
         FROM categories c
         LEFT JOIN blog_post_categories pc ON pc.category_id = c.id
         GROUP BY c.id, c.name, c.slug, c.description, c.parent_id, c.created_at, c.updated_at
         ORDER BY c.name ASC'
    );
    json_response(['ok' => true, 'message' => 'OK', 'data' => $stmt->fetchAll()]);
}

function categories_admin_create(PDO $pdo): never
{
    $data = json_body();

    $name = clean_text($data['name'] ?? '');
    $description = clean_text($data['description'] ?? '');
    $slugInput = clean_slug($data['slug'] ?? '');

    if ($name === '') {
        json_response(['ok' => false, 'message' => 'Category name is required.'], 422);
    }
    if (mb_strlen($name) > 120) {
        json_response(['ok' => false, 'message' => 'Category name must be 120 characters or fewer.'], 422);
    }
    if (mb_strlen($description) > 500) {
        json_response(['ok' => false, 'message' => 'Description must be 500 characters or fewer.'], 422);
    }

    $baseSlug = $slugInput !== '' ? $slugInput : clean_slug($name);
    $slug = unique_slug($pdo, 'categories', $baseSlug);

    $stmt = $pdo->prepare(
        'INSERT INTO categories (name, slug, description, parent_id, created_at, updated_at)
         VALUES (:name, :slug, :description, NULL, NOW(), NOW())'
    );
    $stmt->execute([
        'name' => $name,
        'slug' => $slug,
        'description' => $description !== '' ? $description : null,
    ]);

    $id = (int) $pdo->lastInsertId();
    json_response(['ok' => true, 'message' => 'Category created.', 'data' => category_find($pdo, $id)], 201);
}

/**
 * @param array<string,string> $routeParams
 */
function categories_admin_update(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid category id.'], 400);
    }

    $existing = category_find($pdo, $id);
    if ($existing === null) {
        json_response(['ok' => false, 'message' => 'Category not found.'], 404);
    }

    $data = json_body();

    $name = array_key_exists('name', $data) ? clean_text($data['name']) : $existing['name'];
    $description = array_key_exists('description', $data) ? clean_text($data['description']) : (string) ($existing['description'] ?? '');

    if ($name === '') {
        json_response(['ok' => false, 'message' => 'Category name is required.'], 422);
    }
    if (mb_strlen($name) > 120) {
        json_response(['ok' => false, 'message' => 'Category name must be 120 characters or fewer.'], 422);
    }
    if (mb_strlen($description) > 500) {
        json_response(['ok' => false, 'message' => 'Description must be 500 characters or fewer.'], 422);
    }

    if (array_key_exists('slug', $data) && clean_slug($data['slug']) !== '') {
        $baseSlug = clean_slug($data['slug']);
    } else {
        $baseSlug = (string) $existing['slug'];
    }
    $slug = unique_slug($pdo, 'categories', $baseSlug, $id);

    $stmt = $pdo->prepare(
        'UPDATE categories
         SET name = :name, slug = :slug, description = :description, updated_at = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        'name' => $name,
        'slug' => $slug,
        'description' => $description !== '' ? $description : null,
        'id' => $id,
    ]);

    json_response(['ok' => true, 'message' => 'Category updated.', 'data' => category_find($pdo, $id)]);
}

/**
 * @param array<string,string> $routeParams
 */
function categories_admin_delete(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid category id.'], 400);
    }

    $existing = category_find($pdo, $id);
    if ($existing === null) {
        json_response(['ok' => false, 'message' => 'Category not found.'], 404);
    }

    // Hard delete - categories has no deleted_at column; blog_post_categories
    // rows referencing it cascade-delete automatically (see migration 0006).
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Category deleted.']);
}

/**
 * @return array<string,mixed>|null
 */
function category_find(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT id, name, slug, description, parent_id, created_at, updated_at
         FROM categories WHERE id = :id LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row !== false ? $row : null;
}
