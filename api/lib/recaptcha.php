<?php

declare(strict_types=1);

/**
 * Server-side verification for Google reCAPTCHA v3 tokens, used by
 * endpoints/send-contact-message.php. v3 is invisible (no checkbox) - the
 * frontend mints a fresh token per action via grecaptcha.execute(), and
 * Google's siteverify response carries a 0.0-1.0 bot-likelihood score plus
 * the action name instead of a simple pass/fail. Reads RECAPTCHA_SECRET_KEY
 * (and optional RECAPTCHA_MIN_SCORE) from api/.env.
 */

/**
 * Verify a client-submitted reCAPTCHA v3 token against Google's siteverify
 * API: checks success, that the action matches what the frontend requested
 * (prevents a token minted for one action being replayed against another),
 * and that the score meets the configured minimum. If RECAPTCHA_SECRET_KEY
 * isn't configured (e.g. local dev without keys), verification is treated
 * as disabled rather than blocking every submission.
 */
function verify_recaptcha(string $token, string $expectedAction): bool
{
    $secret = env('RECAPTCHA_SECRET_KEY', '');
    if ($secret === null || $secret === '') {
        return true;
    }

    if ($token === '') {
        return false;
    }

    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        error_log('[api] reCAPTCHA verify request failed: ' . $curlError);
        return false;
    }

    $result = json_decode($response, true);
    if (!is_array($result) || ($result['success'] ?? false) !== true) {
        return false;
    }

    if (($result['action'] ?? null) !== $expectedAction) {
        error_log('[api] reCAPTCHA action mismatch: expected ' . $expectedAction . ', got ' . (string) ($result['action'] ?? ''));
        return false;
    }

    $minScore = (float) (env('RECAPTCHA_MIN_SCORE', '0.5') ?? '0.5');
    $score = is_numeric($result['score'] ?? null) ? (float) $result['score'] : 0.0;

    return $score >= $minScore;
}
