<?php

declare(strict_types=1);

/**
 * Relocated from repo root (send-deck-download.php). Same validation
 * strictness as the original, now backed by config/mail.php (PHPMailer via
 * SMTP) instead of raw mail(), and the shared clean_text() from
 * lib/validate.php instead of a locally duplicated copy.
 *
 * New path for frontend hand-off: POST /api/endpoints/send-deck-download.php
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
$phone = clean_text($data['phone'] ?? '');
$email = clean_email($data['email'] ?? '');
$source = clean_text($data['source'] ?? 'website');

if ($name === '' || $phone === '' || $email === '') {
    json_response(['ok' => false, 'message' => 'Please fill all required fields correctly.'], 422);
}

$to = env('LEADS_TO_ADDRESS', 'shubham@ecommlab.in') ?? 'shubham@ecommlab.in';
$subject = 'New Deck Download Lead - ' . $name;

$messageLines = [
    'New deck download lead',
    '----------------------',
    'Source: ' . $source,
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . $email,
    'Submitted at: ' . date('Y-m-d H:i:s'),
];

$message = implode("\n", $messageLines);

$sent = send_transactional_mail($to, $subject, $message, $email, $name);

if (!$sent) {
    json_response(['ok' => false, 'message' => 'Unable to send email right now. Please try again later.'], 500);
}

json_response(['ok' => true, 'message' => 'Lead submitted successfully.']);
