<?php

declare(strict_types=1);

/**
 * PHPMailer-based mailer factory + a small send helper. Reads SMTP_* from
 * api/.env. Used by the relocated lead-mail endpoints and any future
 * admin-notification email (e.g. "new comment pending approval").
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function get_mailer(): PHPMailer
{
    $mailer = new PHPMailer(true);

    $mailer->isSMTP();
    $mailer->Host = env('SMTP_HOST', 'localhost');
    $mailer->Port = (int) env('SMTP_PORT', '587');
    $mailer->SMTPAuth = env('SMTP_USER', '') !== '';
    $mailer->Username = env('SMTP_USER', '') ?? '';
    $mailer->Password = env('SMTP_PASS', '') ?? '';

    $encryption = strtolower((string) env('SMTP_ENCRYPTION', 'tls'));
    if ($encryption === 'ssl') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($encryption === 'tls') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mailer->SMTPAutoTLS = false;
    }

    $mailer->CharSet = 'UTF-8';
    $mailer->setFrom(
        env('SMTP_FROM_ADDRESS', 'noreply@ecommlab.in') ?? 'noreply@ecommlab.in',
        env('SMTP_FROM_NAME', 'Ecomm Lab') ?? 'Ecomm Lab'
    );

    return $mailer;
}

/**
 * Send a plain-text transactional email. Returns true on success, false on
 * failure - callers are expected to translate a false into a { ok: false }
 * JSON response rather than let a PHPMailer exception bubble up.
 */
function send_transactional_mail(
    string $to,
    string $subject,
    string $body,
    ?string $replyToEmail = null,
    ?string $replyToName = null
): bool {
    try {
        $mailer = get_mailer();
        $mailer->addAddress($to);
        $mailer->Subject = $subject;
        $mailer->Body = $body;
        $mailer->isHTML(false);

        if ($replyToEmail !== null && $replyToEmail !== '') {
            $mailer->addReplyTo($replyToEmail, $replyToName ?? '');
        }

        return $mailer->send();
    } catch (PHPMailerException $e) {
        error_log('[api] Mail send failed: ' . $e->getMessage());
        return false;
    } catch (Throwable $e) {
        error_log('[api] Mail send failed (unexpected): ' . $e->getMessage());
        return false;
    }
}
