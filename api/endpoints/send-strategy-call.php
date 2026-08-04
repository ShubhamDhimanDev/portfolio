<?php

declare(strict_types=1);

/**
 * Relocated from repo root (send-strategy-call.php). Same validation
 * strictness as the original, now backed by config/mail.php (PHPMailer via
 * SMTP) instead of raw mail(), and the shared clean_text() from
 * lib/validate.php instead of a locally duplicated copy.
 *
 * New path for frontend hand-off: POST /api/endpoints/send-strategy-call.php
 * (unchanged request/response shape from the original root-level script).
 */

require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../config/mail.php';
require __DIR__ . '/../lib/validate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Method not allowed. Use POST.'], 405);
}

$data = json_body();

$name = clean_text($data['name'] ?? '');
$company = clean_text($data['company'] ?? '');
$phone = clean_text($data['phone'] ?? '');
$email = clean_email($data['email'] ?? '');
$package = clean_text($data['packageLabel'] ?? ($data['package'] ?? ''));
$revenue = clean_text($data['revenue'] ?? '');
$notes = clean_text($data['notes'] ?? '');
$source = clean_text($data['source'] ?? 'website');

$selectedServices = $data['selectedServices'] ?? [];
if (!is_array($selectedServices)) {
    $selectedServices = [];
}
$selectedServices = array_values(array_filter(array_map('clean_text', $selectedServices)));

if ($name === '' || $company === '' || $phone === '' || $email === '') {
    json_response(['ok' => false, 'message' => 'Please fill all required fields correctly.'], 422);
}

$to = env('LEADS_TO_ADDRESS', 'shubham@ecommlab.in') ?? 'shubham@ecommlab.in';
$cc = env('LEADS_CC_ADDRESS', '') ?: null;
$subject = 'New Strategy Call Lead - ' . $company;

$serviceList = empty($selectedServices) ? 'None selected' : implode(', ', $selectedServices);

$messageLines = [
    'New strategy call form submission',
    '--------------------------------',
    'Source: ' . $source,
    'Name: ' . $name,
    'Company: ' . $company,
    'Phone: ' . $phone,
    'Email: ' . $email,
    'Package: ' . ($package !== '' ? $package : 'Not provided'),
    'Selected services: ' . $serviceList,
    'Current monthly online revenue: ' . ($revenue !== '' ? $revenue : 'Not provided'),
    'Notes: ' . ($notes !== '' ? $notes : 'None'),
    'Submitted at: ' . date('Y-m-d H:i:s'),
];

$message = implode("\n", $messageLines);

$sent = send_transactional_mail($to, $subject, $message, $email, $name, $cc);

if (!$sent) {
    json_response(['ok' => false, 'message' => 'Unable to send email right now. Please try again later.'], 500);
}

json_response(['ok' => true, 'message' => 'Lead submitted successfully.']);
