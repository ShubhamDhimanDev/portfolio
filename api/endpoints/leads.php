<?php

declare(strict_types=1);

/**
 * Leads (contact form submissions) resource, dispatched by api/index.php.
 * Rows are created by endpoints/send-contact-message.php, not here.
 *
 * GET    /api/admin/leads             -- admin list, ?status=
 * POST   /api/admin/leads/{id}/status -- admin, body: { status }
 * DELETE /api/admin/leads/{id}        -- admin, hard delete
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

const LEAD_STATUSES = ['new', 'contacted', 'archived'];

switch ($routeAction) {
    case 'admin_list':
        leads_admin_list($pdo);
        break;
    case 'admin_update_status':
        leads_admin_update_status($pdo, $routeParams);
        break;
    case 'admin_delete':
        leads_admin_delete($pdo, $routeParams);
        break;
    default:
        json_response(['ok' => false, 'message' => 'Not found.'], 404);
}

function leads_admin_list(PDO $pdo): never
{
    $status = isset($_GET['status']) ? clean_text($_GET['status']) : '';

    $sql = 'SELECT id, name, email, phone, message, source, status, ip_address, created_at FROM leads WHERE 1 = 1';
    $params = [];

    if ($status !== '' && in_array($status, LEAD_STATUSES, true)) {
        $sql .= ' AND status = :status';
        $params['status'] = $status;
    }

    $sql .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    json_response(['ok' => true, 'message' => 'OK', 'data' => $stmt->fetchAll()]);
}

/**
 * @param array<string,string> $routeParams
 */
function leads_admin_update_status(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid lead id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM leads WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Lead not found.'], 404);
    }

    $data = json_body();
    $status = clean_text($data['status'] ?? '');
    if (!in_array($status, LEAD_STATUSES, true)) {
        json_response(['ok' => false, 'message' => 'Invalid status.'], 422);
    }

    $update = $pdo->prepare('UPDATE leads SET status = :status WHERE id = :id');
    $update->execute(['status' => $status, 'id' => $id]);

    json_response(['ok' => true, 'message' => "Lead marked {$status}."]);
}

/**
 * @param array<string,string> $routeParams
 */
function leads_admin_delete(PDO $pdo, array $routeParams): never
{
    $id = clean_int($routeParams['id'] ?? null, 1);
    if ($id === null) {
        json_response(['ok' => false, 'message' => 'Invalid lead id.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM leads WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    if ($stmt->fetch() === false) {
        json_response(['ok' => false, 'message' => 'Lead not found.'], 404);
    }

    $delete = $pdo->prepare('DELETE FROM leads WHERE id = :id');
    $delete->execute(['id' => $id]);

    json_response(['ok' => true, 'message' => 'Lead deleted.']);
}
