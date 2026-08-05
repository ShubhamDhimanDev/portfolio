<?php

declare(strict_types=1);

/**
 * Blog posts resource, dispatched by api/index.php. Content blocks, FAQs,
 * categories, and SEO fields are all handled as nested parts of the
 * create/update payload, per docs/blog-section.md §4.3/§4.7/§4.8/§4.10.
 *
 * GET    /api/blog-posts                    -- public, published only, paginated, ?category=slug
 * GET    /api/blog-posts/{slug}              -- public, full detail (blocks/faqs/categories/seo/approved comments)
 * GET    /api/admin/blog-posts               -- admin, all statuses, lightweight list, filterable
 * GET    /api/admin/blog-posts/{id}           -- admin, full nested detail (see note in index.php)
 * POST   /api/admin/blog-posts                -- admin, create (nested payload)
 * PUT    /api/admin/blog-posts/{id}           -- admin, update (same nested payload shape)
 * POST   /api/admin/blog-posts/{id}/toggle    -- admin, flip draft <-> published
 * POST   /api/admin/blog-posts/{id}/archive   -- admin, set status = archived
 * DELETE /api/admin/blog-posts/{id}           -- admin, soft delete (deleted_at)
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

final class BlogValidationException extends RuntimeException
{
}

switch ($routeAction) {
    case 'public_list':
        blog_posts_public_list($pdo);
        break;
    case 'public_detail':
        blog_posts_public_detail($pdo, $routeParams);
        break;
    case 'admin_list':
        blog_posts_admin_list($pdo);
        break;
    case 'admin_detail':
        blog_posts_admin_detail_route($pdo, $routeParams);
        break;
    case 'admin_create':
        blog_posts_admin_create($pdo);
        break;
    case 'admin_update':
        blog_posts_admin_update($pdo, $routeParams);
        break;
    case 'admin_toggle':
        blog_posts_admin_toggle($pdo, $routeParams);
        break;
    case 'admin_archive':
        blog_posts_admin_archive($pdo, $routeParams);
        break;
    case 'admin_delete':
        blog_posts_admin_delete($pdo, $routeParams);
        break;
    default:
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
}

// =============================================================================
// Public
// =============================================================================

function blog_posts_public_list(PDO $pdo): never
{
    $page = clean_int($_GET['page'] ?? null, 1) ?? 1;
    $perPage = clean_int($_GET['per_page'] ?? null, 1, 50) ?? 10;
    $categorySlug = isset($_GET['category']) ? clean_slug($_GET['category']) : '';

    $where = "p.status = 'published' AND p.deleted_at IS NULL";
    $params = [];
    $join = '';

    if ($categorySlug !== '') {
        $join = 'JOIN blog_post_categories pc ON pc.blog_post_id = p.id
                 JOIN categories cat ON cat.id = pc.category_id AND cat.slug = :category_slug';
        $params['category_slug'] = $categorySlug;
    }

    $countStmt = $pdo->prepare("SELECT COUNT(DISTINCT p.id) FROM blog_posts p {$join} WHERE {$where}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();
    $totalPages = $total > 0 ? (int) ceil($total / $perPage) : 0;
    $offset = ($page - 1) * $perPage;

    $listSql = "SELECT DISTINCT p.id, p.title, p.slug, p.excerpt, p.cover_media_id, p.author_name,
                       p.created_at, p.published_at
                FROM blog_posts p {$join}
                WHERE {$where}
                ORDER BY p.published_at DESC, p.created_at DESC
                LIMIT :limit OFFSET :offset";
    $listStmt = $pdo->prepare($listSql);
    foreach ($params as $key => $value) {
        $listStmt->bindValue(':' . $key, $value);
    }
    $listStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $listStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $listStmt->execute();
    $rows = $listStmt->fetchAll();

    $posts = blog_posts_attach_summaries($pdo, $rows);

    json_response([
        'ok' => true,
        'message' => 'OK',
        'data' => $posts,
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages,
        ],
    ]);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_public_detail(PDO $pdo, array $routeParams): never
{
    $slug = clean_text($routeParams['slug'] ?? '');
    if ($slug === '') {
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
    }

    $stmt = $pdo->prepare(
        "SELECT id, title, slug, excerpt, cover_media_id, status, allow_comments, require_comment_approval,
                author_name, author_linkedin_url, created_at, updated_at, published_at
         FROM blog_posts
         WHERE slug = :slug AND status = 'published' AND deleted_at IS NULL
         LIMIT 1"
    );
    $stmt->execute(['slug' => $slug]);
    $post = $stmt->fetch();

    if ($post === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    $post['cover_media'] = media_brief($pdo, $post['cover_media_id'] !== null ? (int) $post['cover_media_id'] : null);
    unset($post['cover_media_id']);

    $post['blocks'] = blog_post_blocks($pdo, (int) $post['id']);
    $post['faqs'] = blog_post_faqs($pdo, (int) $post['id']);
    $post['categories'] = blog_post_categories($pdo, (int) $post['id']);
    $post['seo'] = blog_post_seo($pdo, (int) $post['id']);
    $post['comments'] = (int) $post['allow_comments'] === 1
        ? blog_post_approved_comments($pdo, (int) $post['id'])
        : [];

    json_response(['ok' => true, 'message' => 'OK', 'data' => $post]);
}

// =============================================================================
// Admin: list / single detail
// =============================================================================

function blog_posts_admin_list(PDO $pdo): never
{
    $status = isset($_GET['status']) ? clean_text($_GET['status']) : '';
    $categorySlug = isset($_GET['category']) ? clean_slug($_GET['category']) : '';
    $search = isset($_GET['search']) ? clean_text($_GET['search']) : '';
    $allowedStatuses = ['draft', 'published', 'archived'];

    $where = 'p.deleted_at IS NULL';
    $params = [];
    $join = '';

    if ($status !== '' && in_array($status, $allowedStatuses, true)) {
        $where .= ' AND p.status = :status';
        $params['status'] = $status;
    }
    if ($categorySlug !== '') {
        $join = 'JOIN blog_post_categories pc ON pc.blog_post_id = p.id
                 JOIN categories cat ON cat.id = pc.category_id AND cat.slug = :category_slug';
        $params['category_slug'] = $categorySlug;
    }
    if ($search !== '') {
        $where .= ' AND p.title LIKE :search';
        $params['search'] = '%' . $search . '%';
    }

    $sql = "SELECT DISTINCT p.id, p.title, p.slug, p.excerpt, p.cover_media_id, p.status,
                   p.allow_comments, p.require_comment_approval, p.author_name,
                   p.created_at, p.updated_at, p.published_at
            FROM blog_posts p {$join}
            WHERE {$where}
            ORDER BY p.updated_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $posts = blog_posts_attach_summaries($pdo, $rows);

    json_response(['ok' => true, 'message' => 'OK', 'data' => $posts]);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_admin_detail_route(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid post id.'], 400);
    }

    $post = blog_post_admin_detail($pdo, $id);
    if ($post === null) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    json_response(['ok' => true, 'message' => 'OK', 'data' => $post]);
}

// =============================================================================
// Admin: create / update / toggle / archive / delete
// =============================================================================

function blog_posts_admin_create(PDO $pdo): never
{
    $data = json_body();

    try {
        $postId = persist_blog_post($pdo, $data, null);
    } catch (BlogValidationException $e) {
        json_response(['ok' => false, 'message' => $e->getMessage()], 422);
    }

    json_response(['ok' => true, 'message' => 'Post created.', 'data' => blog_post_admin_detail($pdo, $postId)], 201);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_admin_update(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid post id.'], 400);
    }

    $existsStmt = $pdo->prepare('SELECT id FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $existsStmt->execute(['id' => $id]);
    if ($existsStmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    $data = json_body();

    try {
        persist_blog_post($pdo, $data, $id);
    } catch (BlogValidationException $e) {
        json_response(['ok' => false, 'message' => $e->getMessage()], 422);
    }

    json_response(['ok' => true, 'message' => 'Post updated.', 'data' => blog_post_admin_detail($pdo, $id)]);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_admin_toggle(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid post id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT status, published_at FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if ($row === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    // "Toggle" flips between draft and published (docs/blog-section.md §3.2).
    // An archived post toggles back to published, mirroring "not published -> published".
    $newStatus = $row['status'] === 'published' ? 'draft' : 'published';
    $publishedAt = $row['published_at'];
    if ($newStatus === 'published' && $publishedAt === null) {
        $publishedAt = date('Y-m-d H:i:s');
    }

    $update = $pdo->prepare('UPDATE blog_posts SET status = :status, published_at = :published_at, updated_at = NOW() WHERE id = :id');
    $update->execute(['status' => $newStatus, 'published_at' => $publishedAt, 'id' => $id]);

    json_response(['ok' => true, 'message' => "Post set to {$newStatus}.", 'data' => blog_post_admin_detail($pdo, $id)]);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_admin_archive(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid post id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    $pdo->prepare("UPDATE blog_posts SET status = 'archived', updated_at = NOW() WHERE id = :id")->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Post archived.', 'data' => blog_post_admin_detail($pdo, $id)]);
}

/**
 * @param array<string,string> $routeParams
 */
function blog_posts_admin_delete(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid post id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }

    // Soft delete only, per docs/blog-section.md §3.2 ("reversible in principle").
    $pdo->prepare('UPDATE blog_posts SET deleted_at = NOW() WHERE id = :id')->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Post deleted.']);
}

// =============================================================================
// Persistence: create/update with nested blocks/faqs/categories/seo
// =============================================================================

/**
 * Validate + persist a full blog post payload (nested blocks/faqs/categories/seo)
 * inside a transaction. On update, child rows (blocks/categories/faqs) are
 * replaced wholesale - the simplest correct approach for a nested-payload editor.
 *
 * @param array<string,mixed> $data
 * @return int the post id
 * @throws BlogValidationException on any validation failure (caught by callers -> 422)
 */
function persist_blog_post(PDO $pdo, array $data, ?int $existingId): int
{
    $title = clean_text($data['title'] ?? '');
    if ($title === '') {
        throw new BlogValidationException('Title is required.');
    }
    if (mb_strlen($title) > 255) {
        throw new BlogValidationException('Title must be 255 characters or fewer.');
    }

    $excerpt = nullable_text($data['excerpt'] ?? '', 500);

    $coverMediaId = clean_int($data['cover_media_id'] ?? null, 1);
    if ($coverMediaId !== null && !media_exists($pdo, $coverMediaId)) {
        throw new BlogValidationException('cover_media_id does not reference an existing media item.');
    }

    $statusInput = $data['status'] ?? 'draft';
    $status = in_array($statusInput, ['draft', 'published', 'archived'], true) ? $statusInput : 'draft';
    $allowComments = clean_bool($data['allow_comments'] ?? false);
    $requireApproval = array_key_exists('require_comment_approval', $data)
        ? clean_bool($data['require_comment_approval'])
        : true;
    $authorName = clean_text($data['author_name'] ?? '');
    if ($authorName === '') {
        throw new BlogValidationException('Author name is required.');
    }
    if (mb_strlen($authorName) > 120) {
        throw new BlogValidationException('Author name must be 120 characters or fewer.');
    }
    $authorLinkedinUrl = nullable_url($data['author_linkedin_url'] ?? '');

    $slugInput = clean_slug($data['slug'] ?? '');
    $baseSlug = $slugInput !== '' ? $slugInput : clean_slug($title);
    if ($baseSlug === '') {
        throw new BlogValidationException('Could not derive a slug from the title; please provide one explicitly.');
    }
    $slug = unique_slug($pdo, 'blog_posts', $baseSlug, $existingId);

    $blocks = [];
    foreach (array_values(is_array($data['blocks'] ?? null) ? $data['blocks'] : []) as $index => $block) {
        if (!is_array($block)) {
            throw new BlogValidationException("Block #{$index} must be an object.");
        }
        $blocks[] = normalize_block($block, $index);
    }

    $faqs = [];
    foreach (array_values(is_array($data['faqs'] ?? null) ? $data['faqs'] : []) as $index => $faq) {
        if (!is_array($faq)) {
            throw new BlogValidationException("FAQ #{$index} must be an object.");
        }
        $question = clean_text($faq['question'] ?? '');
        $answer = clean_multiline_text($faq['answer'] ?? '', 5000);
        if ($question === '' || $answer === '') {
            throw new BlogValidationException("FAQ #{$index}: question and answer are required.");
        }
        $faqs[] = [
            'question' => mb_substr($question, 0, 500),
            'answer' => $answer,
            'sort_order' => clean_int($faq['sort_order'] ?? $index, 0) ?? $index,
        ];
    }

    $categoryIds = [];
    foreach ((is_array($data['categories'] ?? null) ? $data['categories'] : []) as $rawId) {
        $catId = clean_int($rawId, 1);
        if ($catId === null) {
            throw new BlogValidationException('Invalid category id in categories[].');
        }
        $categoryIds[] = $catId;
    }
    $categoryIds = array_values(array_unique($categoryIds));
    if ($categoryIds !== [] && !categories_all_exist($pdo, $categoryIds)) {
        throw new BlogValidationException('One or more categories do not exist.');
    }

    $seo = normalize_seo(is_array($data['seo'] ?? null) ? $data['seo'] : []);
    if ($seo['og_image_media_id'] !== null && !media_exists($pdo, $seo['og_image_media_id'])) {
        throw new BlogValidationException('seo.og_image_media_id does not reference an existing media item.');
    }
    if ($seo['twitter_image_media_id'] !== null && !media_exists($pdo, $seo['twitter_image_media_id'])) {
        throw new BlogValidationException('seo.twitter_image_media_id does not reference an existing media item.');
    }

    $pdo->beginTransaction();
    try {
        if ($existingId === null) {
            $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;
            $stmt = $pdo->prepare(
                'INSERT INTO blog_posts
                    (title, slug, excerpt, cover_media_id, status, allow_comments, require_comment_approval, author_name, author_linkedin_url, created_at, updated_at, published_at)
                 VALUES
                    (:title, :slug, :excerpt, :cover_media_id, :status, :allow_comments, :require_comment_approval, :author_name, :author_linkedin_url, NOW(), NOW(), :published_at)'
            );
            $stmt->execute([
                'title' => $title,
                'slug' => $slug,
                'excerpt' => $excerpt,
                'cover_media_id' => $coverMediaId,
                'status' => $status,
                'allow_comments' => $allowComments ? 1 : 0,
                'require_comment_approval' => $requireApproval ? 1 : 0,
                'author_name' => $authorName,
                'author_linkedin_url' => $authorLinkedinUrl,
                'published_at' => $publishedAt,
            ]);
            $postId = (int) $pdo->lastInsertId();
        } else {
            $postId = $existingId;

            $currentStmt = $pdo->prepare('SELECT published_at FROM blog_posts WHERE id = :id LIMIT 1');
            $currentStmt->execute(['id' => $postId]);
            $current = $currentStmt->fetch();
            if ($current === false) {
                throw new BlogValidationException('Post not found.');
            }

            $publishedAt = $current['published_at'];
            if ($status === 'published' && $publishedAt === null) {
                $publishedAt = date('Y-m-d H:i:s');
            }

            $stmt = $pdo->prepare(
                'UPDATE blog_posts SET
                    title = :title, slug = :slug, excerpt = :excerpt, cover_media_id = :cover_media_id,
                    status = :status, allow_comments = :allow_comments, require_comment_approval = :require_comment_approval,
                    author_name = :author_name, author_linkedin_url = :author_linkedin_url, updated_at = NOW(), published_at = :published_at
                 WHERE id = :id'
            );
            $stmt->execute([
                'title' => $title,
                'slug' => $slug,
                'excerpt' => $excerpt,
                'cover_media_id' => $coverMediaId,
                'status' => $status,
                'allow_comments' => $allowComments ? 1 : 0,
                'require_comment_approval' => $requireApproval ? 1 : 0,
                'author_name' => $authorName,
                'author_linkedin_url' => $authorLinkedinUrl,
                'published_at' => $publishedAt,
                'id' => $postId,
            ]);

            // Replace children wholesale - simplest correct approach for a nested-payload editor.
            $pdo->prepare('DELETE FROM blog_post_blocks WHERE blog_post_id = :id')->execute(['id' => $postId]);
            $pdo->prepare('DELETE FROM blog_post_categories WHERE blog_post_id = :id')->execute(['id' => $postId]);
            $pdo->prepare('DELETE FROM blog_faqs WHERE blog_post_id = :id')->execute(['id' => $postId]);
        }

        if ($blocks !== []) {
            $blockStmt = $pdo->prepare(
                'INSERT INTO blog_post_blocks (blog_post_id, block_type, block_data, sort_order, created_at, updated_at)
                 VALUES (:post_id, :block_type, :block_data, :sort_order, NOW(), NOW())'
            );
            foreach ($blocks as $index => $block) {
                $blockStmt->execute([
                    'post_id' => $postId,
                    'block_type' => $block['block_type'],
                    'block_data' => json_encode($block['block_data'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'sort_order' => $block['sort_order'] ?? $index,
                ]);
            }
        }

        if ($categoryIds !== []) {
            $catStmt = $pdo->prepare('INSERT INTO blog_post_categories (blog_post_id, category_id) VALUES (:post_id, :category_id)');
            foreach ($categoryIds as $categoryId) {
                $catStmt->execute(['post_id' => $postId, 'category_id' => $categoryId]);
            }
        }

        if ($faqs !== []) {
            $faqStmt = $pdo->prepare('INSERT INTO blog_faqs (blog_post_id, question, answer, sort_order) VALUES (:post_id, :question, :answer, :sort_order)');
            foreach ($faqs as $faq) {
                $faqStmt->execute([
                    'post_id' => $postId,
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'sort_order' => $faq['sort_order'],
                ]);
            }
        }

        persist_seo($pdo, $postId, $seo);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    return $postId;
}

/**
 * @param array<string,mixed> $seo normalized via normalize_seo()
 */
function persist_seo(PDO $pdo, int $postId, array $seo): void
{
    $hasContent = array_filter($seo, static fn($v) => $v !== null) !== [];

    $existingStmt = $pdo->prepare("SELECT id FROM seo_meta WHERE entity_type = 'blog_post' AND entity_id = :id LIMIT 1");
    $existingStmt->execute(['id' => $postId]);
    $existing = $existingStmt->fetch();

    if (!$hasContent) {
        if ($existing !== false) {
            $pdo->prepare('DELETE FROM seo_meta WHERE id = :id')->execute(['id' => $existing['id']]);
        }
        return;
    }

    if ($existing !== false) {
        $stmt = $pdo->prepare(
            'UPDATE seo_meta SET
                meta_title = :meta_title, meta_description = :meta_description, canonical_url = :canonical_url,
                robots = :robots, og_title = :og_title, og_description = :og_description,
                og_image_media_id = :og_image_media_id, og_type = :og_type, twitter_card = :twitter_card,
                twitter_title = :twitter_title, twitter_description = :twitter_description,
                twitter_image_media_id = :twitter_image_media_id, ai_summary = :ai_summary
             WHERE id = :id'
        );
        $stmt->execute($seo + ['id' => $existing['id']]);
        return;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO seo_meta
            (entity_type, entity_id, meta_title, meta_description, canonical_url, robots, og_title, og_description,
             og_image_media_id, og_type, twitter_card, twitter_title, twitter_description, twitter_image_media_id, ai_summary)
         VALUES
            ('blog_post', :entity_id, :meta_title, :meta_description, :canonical_url, :robots, :og_title, :og_description,
             :og_image_media_id, :og_type, :twitter_card, :twitter_title, :twitter_description, :twitter_image_media_id, :ai_summary)"
    );
    $stmt->execute($seo + ['entity_id' => $postId]);
}

// =============================================================================
// Block-type payload validation, per docs/blog-section.md §4.3
// =============================================================================

/**
 * @param array<string,mixed> $block
 * @return array{block_type: string, block_data: array<string,mixed>, sort_order: int}
 */
function normalize_block(array $block, int $index): array
{
    $type = is_string($block['block_type'] ?? null) ? $block['block_type'] : '';
    if (!in_array($type, allowed_block_types(), true)) {
        throw new BlogValidationException("Block #{$index}: invalid block_type \"{$type}\".");
    }

    $raw = is_array($block['block_data'] ?? null) ? $block['block_data'] : [];

    $data = match ($type) {
        'heading' => normalize_block_heading($raw, $index),
        'paragraph' => normalize_block_paragraph($raw, $index),
        'div' => normalize_block_div($raw),
        'quote' => normalize_block_quote($raw, $index),
        'image' => normalize_block_image($raw, $index),
        'video' => normalize_block_video($raw, $index),
        'list' => normalize_block_list($raw, $index),
        'divider' => [],
        'link' => normalize_block_link($raw, $index),
        'html' => normalize_block_html($raw, $index),
        default => throw new BlogValidationException("Block #{$index}: invalid block_type."),
    };

    $sortOrder = clean_int($block['sort_order'] ?? $index, 0) ?? $index;

    return ['block_type' => $type, 'block_data' => $data, 'sort_order' => $sortOrder];
}

function normalize_block_heading(array $d, int $i): array
{
    $level = clean_int($d['level'] ?? 2, 1, 6) ?? 2;
    $text = clean_text($d['text'] ?? '');
    if ($text === '') {
        throw new BlogValidationException("Block #{$i} (heading): text is required.");
    }
    return ['level' => $level, 'text' => $text];
}

function normalize_block_paragraph(array $d, int $i): array
{
    $html = sanitize_raw_html((string) ($d['html'] ?? ''));
    if ($html === '') {
        throw new BlogValidationException("Block #{$i} (paragraph): html is required.");
    }
    return ['html' => $html];
}

function normalize_block_div(array $d): array
{
    $style = in_array($d['style'] ?? '', ['default', 'muted', 'accent', 'bordered'], true) ? $d['style'] : 'default';
    $html = sanitize_raw_html((string) ($d['html'] ?? ''));
    return ['style' => $style, 'html' => $html];
}

function normalize_block_html(array $d, int $i): array
{
    $html = sanitize_raw_html((string) ($d['html'] ?? ''));
    if ($html === '') {
        throw new BlogValidationException("Block #{$i} (html): html is required.");
    }
    return ['html' => $html];
}

function normalize_block_quote(array $d, int $i): array
{
    $text = clean_text($d['text'] ?? '');
    if ($text === '') {
        throw new BlogValidationException("Block #{$i} (quote): text is required.");
    }
    $out = ['text' => $text];
    $citation = clean_text($d['citation'] ?? '');
    if ($citation !== '') {
        $out['citation'] = $citation;
    }
    return $out;
}

function normalize_block_image(array $d, int $i): array
{
    $source = in_array($d['source'] ?? '', ['media', 'url'], true) ? $d['source'] : null;
    if ($source === null) {
        throw new BlogValidationException("Block #{$i} (image): source must be \"media\" or \"url\".");
    }

    $out = ['source' => $source, 'alt' => clean_text($d['alt'] ?? '')];

    if ($source === 'media') {
        $mediaId = clean_int($d['media_id'] ?? null, 1);
        if ($mediaId === null) {
            throw new BlogValidationException("Block #{$i} (image): media_id is required when source=media.");
        }
        $out['media_id'] = $mediaId;
    } else {
        $url = clean_url($d['url'] ?? '');
        if ($url === '') {
            throw new BlogValidationException("Block #{$i} (image): a valid url is required when source=url.");
        }
        $out['url'] = $url;
    }

    $caption = clean_text($d['caption'] ?? '');
    if ($caption !== '') {
        $out['caption'] = $caption;
    }
    $link = clean_url($d['link'] ?? '');
    if ($link !== '') {
        $out['link'] = $link;
    }

    return $out;
}

function normalize_block_video(array $d, int $i): array
{
    $source = in_array($d['source'] ?? '', ['media', 'embed'], true) ? $d['source'] : null;
    if ($source === null) {
        throw new BlogValidationException("Block #{$i} (video): source must be \"media\" or \"embed\".");
    }

    $out = ['source' => $source];

    if ($source === 'media') {
        $mediaId = clean_int($d['media_id'] ?? null, 1);
        if ($mediaId === null) {
            throw new BlogValidationException("Block #{$i} (video): media_id is required when source=media.");
        }
        $out['media_id'] = $mediaId;
    } else {
        $embedUrl = clean_url($d['embed_url'] ?? '');
        if ($embedUrl === '') {
            throw new BlogValidationException("Block #{$i} (video): a valid embed_url is required when source=embed.");
        }
        $out['embed_url'] = $embedUrl;
    }

    $caption = clean_text($d['caption'] ?? '');
    if ($caption !== '') {
        $out['caption'] = $caption;
    }

    return $out;
}

function normalize_block_list(array $d, int $i): array
{
    $style = in_array($d['style'] ?? '', ['ordered', 'unordered'], true) ? $d['style'] : 'unordered';
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];

    $cleanItems = [];
    foreach ($items as $item) {
        $cleanItem = sanitize_inline_html((string) $item);
        if ($cleanItem !== '') {
            $cleanItems[] = $cleanItem;
        }
    }
    if ($cleanItems === []) {
        throw new BlogValidationException("Block #{$i} (list): at least one item is required.");
    }

    return ['style' => $style, 'items' => $cleanItems];
}

function normalize_block_link(array $d, int $i): array
{
    $href = clean_url($d['href'] ?? '');
    if ($href === '') {
        throw new BlogValidationException("Block #{$i} (link): a valid href is required.");
    }
    $label = clean_text($d['label'] ?? '');
    if ($label === '') {
        throw new BlogValidationException("Block #{$i} (link): label is required.");
    }
    $style = in_array($d['style'] ?? '', ['primary', 'secondary', 'text'], true) ? $d['style'] : 'primary';
    $openInNewTab = clean_bool($d['open_in_new_tab'] ?? false);

    return ['href' => $href, 'label' => $label, 'style' => $style, 'open_in_new_tab' => $openInNewTab];
}

// =============================================================================
// SEO payload validation, per docs/blog-section.md §4.2/§4.7
// =============================================================================

/**
 * @param array<string,mixed> $seo
 * @return array<string,mixed>
 */
function normalize_seo(array $seo): array
{
    return [
        'meta_title' => nullable_text($seo['meta_title'] ?? '', 255),
        'meta_description' => nullable_text($seo['meta_description'] ?? '', 500),
        'canonical_url' => nullable_url($seo['canonical_url'] ?? ''),
        'robots' => nullable_text($seo['robots'] ?? '', 100),
        'og_title' => nullable_text($seo['og_title'] ?? '', 255),
        'og_description' => nullable_text($seo['og_description'] ?? '', 500),
        'og_image_media_id' => clean_int($seo['og_image_media_id'] ?? null, 1),
        'og_type' => nullable_text($seo['og_type'] ?? '', 50),
        'twitter_card' => nullable_text($seo['twitter_card'] ?? '', 50),
        'twitter_title' => nullable_text($seo['twitter_title'] ?? '', 255),
        'twitter_description' => nullable_text($seo['twitter_description'] ?? '', 500),
        'twitter_image_media_id' => clean_int($seo['twitter_image_media_id'] ?? null, 1),
        'ai_summary' => nullable_text($seo['ai_summary'] ?? '', 750),
    ];
}

function nullable_text($value, int $maxLength): ?string
{
    $text = clean_text($value);
    return $text !== '' ? mb_substr($text, 0, $maxLength) : null;
}

function nullable_url($value): ?string
{
    $url = clean_url($value);
    return $url !== '' ? $url : null;
}

// =============================================================================
// Shared lookups / response assembly
// =============================================================================

function media_exists(PDO $pdo, int $id): bool
{
    $stmt = $pdo->prepare('SELECT id FROM media WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $id]);
    return $stmt->fetch() !== false;
}

/**
 * @param int[] $ids
 */
function categories_all_exist(PDO $pdo, array $ids): bool
{
    if ($ids === []) {
        return true;
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE id IN ({$placeholders})");
    $stmt->execute($ids);
    return (int) $stmt->fetchColumn() === count($ids);
}

/**
 * @return array<int,array<string,mixed>>
 */
function blog_post_blocks(PDO $pdo, int $postId): array
{
    $stmt = $pdo->prepare(
        'SELECT id, block_type, block_data, sort_order FROM blog_post_blocks
         WHERE blog_post_id = :id ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute(['id' => $postId]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $decoded = json_decode((string) $row['block_data'], true);
        if (!is_array($decoded)) {
            $decoded = [];
        }
        $decoded = resolve_block_media($pdo, (string) $row['block_type'], $decoded);
        // json_encode() can't distinguish an empty PHP array from an empty
        // object, and always emits "[]" - cast to stdClass so block types
        // with no data (e.g. divider) round-trip as "{}", per
        // docs/blog-section.md §4.3's block_data shape table.
        $row['block_data'] = $decoded === [] ? new stdClass() : $decoded;
    }
    unset($row);
    return $rows;
}

/**
 * @return array<int,array<string,mixed>>
 */
function blog_post_faqs(PDO $pdo, int $postId): array
{
    $stmt = $pdo->prepare(
        'SELECT id, question, answer, sort_order FROM blog_faqs
         WHERE blog_post_id = :id ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute(['id' => $postId]);
    return $stmt->fetchAll();
}

/**
 * @return array<int,array<string,mixed>>
 */
function blog_post_categories(PDO $pdo, int $postId): array
{
    $stmt = $pdo->prepare(
        'SELECT c.id, c.name, c.slug
         FROM categories c
         JOIN blog_post_categories pc ON pc.category_id = c.id
         WHERE pc.blog_post_id = :id
         ORDER BY c.name ASC'
    );
    $stmt->execute(['id' => $postId]);
    return $stmt->fetchAll();
}

/**
 * @return array<string,mixed>|null
 */
function blog_post_seo(PDO $pdo, int $postId): ?array
{
    $stmt = $pdo->prepare("SELECT * FROM seo_meta WHERE entity_type = 'blog_post' AND entity_id = :id LIMIT 1");
    $stmt->execute(['id' => $postId]);
    $row = $stmt->fetch();
    if ($row === false) {
        return null;
    }
    $row['og_image'] = media_brief($pdo, $row['og_image_media_id'] !== null ? (int) $row['og_image_media_id'] : null);
    $row['twitter_image'] = media_brief($pdo, $row['twitter_image_media_id'] !== null ? (int) $row['twitter_image_media_id'] : null);
    return $row;
}

/**
 * @return array<int,array<string,mixed>>
 */
function blog_post_approved_comments(PDO $pdo, int $postId): array
{
    $stmt = $pdo->prepare(
        "SELECT id, author_name, content, created_at
         FROM blog_comments
         WHERE blog_post_id = :id AND status = 'approved'
         ORDER BY created_at ASC"
    );
    $stmt->execute(['id' => $postId]);
    return $stmt->fetchAll();
}

/**
 * Attach cover_media + categories to a list of lightweight post rows
 * (used by both the public list and the admin list).
 *
 * @param array<int,array<string,mixed>> $rows
 * @return array<int,array<string,mixed>>
 */
function blog_posts_attach_summaries(PDO $pdo, array $rows): array
{
    if ($rows === []) {
        return [];
    }

    $postIds = array_map(static fn($r) => (int) $r['id'], $rows);
    $placeholders = implode(',', array_fill(0, count($postIds), '?'));

    $catStmt = $pdo->prepare(
        "SELECT pc.blog_post_id, c.id, c.name, c.slug
         FROM blog_post_categories pc
         JOIN categories c ON c.id = pc.category_id
         WHERE pc.blog_post_id IN ({$placeholders})
         ORDER BY c.name ASC"
    );
    $catStmt->execute($postIds);

    $categoriesByPost = [];
    foreach ($catStmt->fetchAll() as $row) {
        $categoriesByPost[(int) $row['blog_post_id']][] = ['id' => $row['id'], 'name' => $row['name'], 'slug' => $row['slug']];
    }

    foreach ($rows as &$row) {
        $postId = (int) $row['id'];
        $row['cover_media'] = media_brief($pdo, $row['cover_media_id'] !== null ? (int) $row['cover_media_id'] : null);
        unset($row['cover_media_id']);
        $row['categories'] = $categoriesByPost[$postId] ?? [];
    }
    unset($row);

    return $rows;
}

/**
 * Full nested detail for a single post (admin view): all columns + blocks +
 * faqs + categories + seo + resolved cover media. Returns null if not found
 * or soft-deleted.
 *
 * @return array<string,mixed>|null
 */
function blog_post_admin_detail(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT id, title, slug, excerpt, cover_media_id, status, allow_comments, require_comment_approval,
                author_name, author_linkedin_url, created_at, updated_at, published_at
         FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $post = $stmt->fetch();
    if ($post === false) {
        return null;
    }

    $post['cover_media'] = media_brief($pdo, $post['cover_media_id'] !== null ? (int) $post['cover_media_id'] : null);
    unset($post['cover_media_id']);

    $post['blocks'] = blog_post_blocks($pdo, $id);
    $post['faqs'] = blog_post_faqs($pdo, $id);
    $post['categories'] = blog_post_categories($pdo, $id);
    $post['seo'] = blog_post_seo($pdo, $id);

    return $post;
}
