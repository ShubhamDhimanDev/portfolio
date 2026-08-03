<?php

declare(strict_types=1);

/**
 * Comments resource, dispatched by api/index.php. See
 * docs/blog-section.md §4.5 for the allow_comments / require_comment_approval
 * branching rules.
 *
 * POST   /api/blog-posts/{slug}/comments   -- public submit (only if allow_comments=1)
 * GET    /api/admin/comments               -- admin moderation list, ?status=&post_id=
 * POST   /api/admin/comments/{id}/approve  -- admin
 * POST   /api/admin/comments/{id}/reject   -- admin
 * DELETE /api/admin/comments/{id}          -- admin, hard delete
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
    case 'public_submit':
        comments_public_submit($pdo, $routeParams);
        break;
    case 'admin_list':
        comments_admin_list($pdo);
        break;
    case 'admin_approve':
        comments_admin_set_status($pdo, $routeParams, 'approved');
        break;
    case 'admin_reject':
        comments_admin_set_status($pdo, $routeParams, 'rejected');
        break;
    case 'admin_delete':
        comments_admin_delete($pdo, $routeParams);
        break;
    default:
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
}

/**
 * @param array<string,string> $routeParams
 */
function comments_public_submit(PDO $pdo, array $routeParams): never
{
    $slug = clean_text($routeParams['slug'] ?? '');
    if ($slug === '') {
        json_response(['ok' => false, 'message' => 'Invalid post.'], 400);
    }

    $stmt = $pdo->prepare(
        "SELECT id, allow_comments, require_comment_approval
         FROM blog_posts
         WHERE slug = :slug AND status = 'published' AND deleted_at IS NULL
         LIMIT 1"
    );
    $stmt->execute(['slug' => $slug]);
    $post = $stmt->fetch();

    if ($post === false) {
        json_response(['ok' => false, 'message' => 'Post not found.'], 404);
    }
    if ((int) $post['allow_comments'] !== 1) {
        json_response(['ok' => false, 'message' => 'Comments are not enabled for this post.'], 403);
    }

    $data = json_body();
    $authorName = clean_text($data['author_name'] ?? ($data['name'] ?? ''));
    $authorEmail = clean_email($data['author_email'] ?? ($data['email'] ?? ''));
    $content = clean_multiline_text($data['content'] ?? '', 5000);

    if ($authorName === '' || $authorEmail === '' || $content === '') {
        json_response(['ok' => false, 'message' => 'Please fill all required fields correctly.'], 422);
    }
    if (mb_strlen($authorName) > 120) {
        json_response(['ok' => false, 'message' => 'Name must be 120 characters or fewer.'], 422);
    }

    $requireApproval = (int) $post['require_comment_approval'] === 1;
    $status = $requireApproval ? 'pending' : 'approved';
    $ip = clean_text($_SERVER['REMOTE_ADDR'] ?? '');
    $ip = mb_substr($ip, 0, 45);

    $stmt = $pdo->prepare(
        'INSERT INTO blog_comments (blog_post_id, author_name, author_email, content, status, ip_address, created_at, approved_at)
         VALUES (:post_id, :author_name, :author_email, :content, :status, :ip, NOW(), :approved_at)'
    );
    $stmt->execute([
        'post_id' => $post['id'],
        'author_name' => $authorName,
        'author_email' => $authorEmail,
        'content' => $content,
        'status' => $status,
        'ip' => $ip !== '' ? $ip : null,
        'approved_at' => $status === 'approved' ? date('Y-m-d H:i:s') : null,
    ]);

    $message = $requireApproval
        ? 'Thanks! Your comment has been submitted and is awaiting approval.'
        : 'Thanks! Your comment has been posted.';

    json_response(['ok' => true, 'message' => $message], 201);
}

function comments_admin_list(PDO $pdo): never
{
    $status = isset($_GET['status']) ? clean_text($_GET['status']) : '';
    $postId = isset($_GET['post_id']) ? clean_int($_GET['post_id'], 1) : null;
    $allowedStatuses = ['pending', 'approved', 'rejected', 'spam'];

    $sql = "SELECT c.id, c.blog_post_id, c.parent_comment_id, c.author_name, c.author_email, c.content,
                    c.status, c.ip_address, c.created_at, c.approved_at,
                    p.title AS post_title, p.slug AS post_slug
             FROM blog_comments c
             JOIN blog_posts p ON p.id = c.blog_post_id
             WHERE 1 = 1";
    $params = [];

    if ($status !== '' && in_array($status, $allowedStatuses, true)) {
        $sql .= ' AND c.status = :status';
        $params['status'] = $status;
    }
    if ($postId !== null) {
        $sql .= ' AND c.blog_post_id = :post_id';
        $params['post_id'] = $postId;
    }

    $sql .= ' ORDER BY c.created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    json_response(['ok' => true, 'message' => 'OK', 'data' => $stmt->fetchAll()]);
}

/**
 * @param array<string,string> $routeParams
 */
function comments_admin_set_status(PDO $pdo, array $routeParams, string $status): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid comment id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM blog_comments WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Comment not found.'], 404);
    }

    $approvedAt = $status === 'approved' ? date('Y-m-d H:i:s') : null;

    $update = $pdo->prepare('UPDATE blog_comments SET status = :status, approved_at = :approved_at WHERE id = :id');
    $update->execute(['status' => $status, 'approved_at' => $approvedAt, 'id' => $id]);

    json_response(['ok' => true, 'message' => "Comment {$status}."]);
}

/**
 * @param array<string,string> $routeParams
 */
function comments_admin_delete(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid comment id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM blog_comments WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Comment not found.'], 404);
    }

    $delete = $pdo->prepare('DELETE FROM blog_comments WHERE id = :id');
    $delete->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Comment deleted.']);
}
