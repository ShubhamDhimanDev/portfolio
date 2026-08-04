<?php

declare(strict_types=1);

/**
 * Public contact-form submission, backing the "Let's talk" form in
 * src/components/sections/Contact.tsx. Flat file, not routed through
 * index.php - same reasoning as send-strategy-call.php / send-deck-download.php
 * (docs/api-backend.md §7): POST /api/endpoints/send-contact-message.php.
 *
 * Unlike those two, this one also persists the lead to the `leads` table so
 * it shows up in the admin backend (see endpoints/leads.php), and requires a
 * verified Google reCAPTCHA v3 token before accepting the submission.
 */

// Must match the action name the frontend passes to grecaptcha.execute()
// (src/hooks/useRecaptchaV3.ts / ContactForm.tsx) - reCAPTCHA v3 tokens are
// scoped to a single action and verify_recaptcha() rejects a mismatch.
const RECAPTCHA_ACTION = 'contact_form_submit';

require __DIR__ . '/../bootstrap.php';
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/mail.php';
require __DIR__ . '/../lib/validate.php';
require __DIR__ . '/../lib/recaptcha.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'message' => 'Method not allowed. Use POST.'], 405);
}

$data = json_body();

$name = clean_text($data['name'] ?? '');
$email = clean_email($data['email'] ?? '');
$phone = clean_text($data['phone'] ?? '');
$message = clean_multiline_text($data['message'] ?? '', 5000);
$source = clean_text($data['source'] ?? 'contact-section');
$captchaToken = clean_text($data['captchaToken'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    json_response(['ok' => false, 'message' => 'Please fill all required fields correctly.'], 422);
}

if (!verify_recaptcha($captchaToken, RECAPTCHA_ACTION)) {
    json_response(['ok' => false, 'message' => 'Captcha verification failed. Please try again.'], 422);
}

$pdo = get_pdo();
$ip = mb_substr(clean_text($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);

$insert = $pdo->prepare(
    'INSERT INTO leads (name, email, phone, message, source, ip_address, created_at)
     VALUES (:name, :email, :phone, :message, :source, :ip, NOW())'
);
$insert->execute([
    'name' => $name,
    'email' => $email,
    'phone' => $phone !== '' ? $phone : null,
    'message' => $message,
    'source' => $source !== '' ? $source : 'contact-section',
    'ip' => $ip !== '' ? $ip : null,
]);

$to = env('LEADS_TO_ADDRESS', 'shubham@ecommlab.in') ?? 'shubham@ecommlab.in';
$cc = env('LEADS_CC_ADDRESS', '') ?: null;
$subject = 'New Contact Form Lead - ' . $name;

$messageLines = [
    'New contact form submission',
    '----------------------------',
    'Source: ' . $source,
    'Name: ' . $name,
    'Email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    'Message:',
    $message,
    '',
    'Submitted at: ' . date('Y-m-d H:i:s'),
];

// Lead is already saved above, so a transient mail failure shouldn't turn
// into a user-facing error - it's still visible in the admin backend.
send_transactional_mail($to, $subject, implode("\n", $messageLines), $email, $name, $cc);

json_response(['ok' => true, 'message' => "Thanks, {$name}! Your message has been sent."], 201);
