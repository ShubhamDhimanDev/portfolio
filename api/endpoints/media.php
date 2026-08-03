<?php

declare(strict_types=1);

/**
 * Media (asset library) resource, dispatched by api/index.php. Generic -
 * not blog-specific, per docs/blog-section.md §4.4.
 *
 * GET    /api/admin/media?type=image|video|document  -- list (excludes soft-deleted)
 * POST   /api/admin/media/upload                       -- multipart; creates + returns the media row
 * DELETE /api/admin/media/{id}                          -- soft delete (deleted_at)
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

// file_type => [allowed mime types, max size in bytes]
const MEDIA_ALLOWED_TYPES = [
    'image' => [
        'mimes' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        'max_bytes' => 8 * 1024 * 1024, // 8MB
    ],
    'video' => [
        'mimes' => ['video/mp4', 'video/webm'],
        'max_bytes' => 100 * 1024 * 1024, // 100MB -- server php.ini upload_max_filesize/post_max_size
                                           // typically caps this much lower on shared hosting; see
                                           // docs/blog-section.md §6 open question 9.
    ],
    'document' => [
        'mimes' => ['application/pdf'],
        'max_bytes' => 20 * 1024 * 1024, // 20MB
    ],
];

switch ($routeAction) {
    case 'admin_list':
        media_admin_list($pdo);
        break;
    case 'admin_upload':
        media_admin_upload($pdo, $admin);
        break;
    case 'admin_delete':
        media_admin_delete($pdo, $routeParams);
        break;
    default:
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
}

function media_admin_list(PDO $pdo): never
{
    $type = isset($_GET['type']) ? clean_text($_GET['type']) : '';
    $allowedTypes = ['image', 'video', 'document'];

    $sql = 'SELECT id, file_name, file_path, file_type, mime_type, size_bytes, width, height,
                    alt_text, uploaded_by, created_at
             FROM media
             WHERE deleted_at IS NULL';
    $params = [];

    if ($type !== '' && in_array($type, $allowedTypes, true)) {
        $sql .= ' AND file_type = :type';
        $params['type'] = $type;
    }

    $sql .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $rows = array_map('media_with_url', $stmt->fetchAll());
    json_response(['ok' => true, 'message' => 'OK', 'data' => $rows]);
}

function media_admin_upload(PDO $pdo, array $admin): never
{
    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        json_response(['ok' => false, 'message' => 'No file uploaded (expected field "file").'], 422);
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_response(['ok' => false, 'message' => media_upload_error_message((int) $file['error'])], 422);
    }

    $mimeType = media_detect_mime_type($file['tmp_name']);
    $fileType = media_file_type_for_mime($mimeType);

    if ($fileType === null) {
        json_response(['ok' => false, 'message' => 'Unsupported file type: ' . $mimeType], 422);
    }

    $maxBytes = MEDIA_ALLOWED_TYPES[$fileType]['max_bytes'];
    if ((int) $file['size'] > $maxBytes) {
        $maxMb = (int) round($maxBytes / (1024 * 1024));
        json_response(['ok' => false, 'message' => "File is too large. Max size for {$fileType} is {$maxMb}MB."], 422);
    }

    $originalName = clean_text($file['name'] ?? 'upload');
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $extension = preg_replace('/[^a-z0-9]/', '', $extension) ?? '';
    if ($extension === '') {
        $extension = media_default_extension($mimeType);
    }

    $randomName = bin2hex(random_bytes(16)) . ($extension !== '' ? '.' . $extension : '');
    $subDir = 'media/' . date('Y') . '/' . date('m');
    $uploadDir = __DIR__ . '/../uploads/' . $subDir;

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        json_response(['ok' => false, 'message' => 'Could not create upload directory.'], 500);
    }

    $destPath = $uploadDir . '/' . $randomName;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        json_response(['ok' => false, 'message' => 'Could not save uploaded file.'], 500);
    }

    $width = null;
    $height = null;
    if ($fileType === 'image') {
        $dimensions = @getimagesize($destPath);
        if (is_array($dimensions)) {
            $width = $dimensions[0] ?? null;
            $height = $dimensions[1] ?? null;
        }
    }

    $altText = clean_text($_POST['alt_text'] ?? '');
    $relativePath = 'uploads/' . $subDir . '/' . $randomName;

    $stmt = $pdo->prepare(
        'INSERT INTO media (file_name, file_path, file_type, mime_type, size_bytes, width, height, alt_text, uploaded_by, created_at)
         VALUES (:file_name, :file_path, :file_type, :mime_type, :size_bytes, :width, :height, :alt_text, :uploaded_by, NOW())'
    );
    $stmt->execute([
        'file_name' => $originalName !== '' ? $originalName : $randomName,
        'file_path' => $relativePath,
        'file_type' => $fileType,
        'mime_type' => $mimeType,
        'size_bytes' => (int) $file['size'],
        'width' => $width,
        'height' => $height,
        'alt_text' => $altText !== '' ? $altText : null,
        'uploaded_by' => $admin['id'],
    ]);

    $id = (int) $pdo->lastInsertId();
    json_response(['ok' => true, 'message' => 'File uploaded.', 'data' => media_with_url(media_find($pdo, $id))], 201);
}

/**
 * @param array<string,string> $routeParams
 */
function media_admin_delete(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid media id.'], 400);
    }

    $existing = media_find($pdo, $id);
    if ($existing === null) {
        json_response(['ok' => false, 'message' => 'Media not found.'], 404);
    }

    // Soft delete only - a row already referenced by a published post
    // shouldn't vanish from under it (docs/blog-section.md §4.4). The file
    // on disk is intentionally left in place.
    $stmt = $pdo->prepare('UPDATE media SET deleted_at = NOW() WHERE id = :id');
    $stmt->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Media deleted.']);
}

/**
 * @return array<string,mixed>|null
 */
function media_find(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        'SELECT id, file_name, file_path, file_type, mime_type, size_bytes, width, height,
                alt_text, uploaded_by, created_at
         FROM media WHERE id = :id LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row !== false ? $row : null;
}

/**
 * @param array<string,mixed>|null $row
 * @return array<string,mixed>|null
 */
function media_with_url(?array $row): ?array
{
    if ($row === null) {
        return null;
    }
    $row['url'] = media_public_url((string) $row['file_path']);
    return $row;
}

function media_detect_mime_type(string $tmpPath): string
{
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpPath);
    return $mime !== false ? $mime : 'application/octet-stream';
}

function media_file_type_for_mime(string $mimeType): ?string
{
    foreach (MEDIA_ALLOWED_TYPES as $type => $config) {
        if (in_array($mimeType, $config['mimes'], true)) {
            return $type;
        }
    }
    return null;
}

function media_default_extension(string $mimeType): string
{
    return match ($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'application/pdf' => 'pdf',
        default => 'bin',
    };
}

function media_upload_error_message(int $errorCode): string
{
    return match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File exceeds the server upload size limit.',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded. Please try again.',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE => 'Server could not store the uploaded file.',
        UPLOAD_ERR_EXTENSION => 'Upload blocked by a server extension.',
        default => 'Upload failed. Please try again.',
    };
}
