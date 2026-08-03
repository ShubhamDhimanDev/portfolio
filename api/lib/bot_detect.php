<?php

declare(strict_types=1);

/**
 * Detects known crawler/bot User-Agents so api/render/blog-post.php can
 * decide whether to serve a server-rendered page (meta/OG/JSON-LD/content)
 * instead of the JS-only SPA shell those crawlers can't execute.
 */

/** @return string[] */
function crawler_bot_user_agent_patterns(): array
{
    return [
        // Search engines
        'Googlebot', 'Google-InspectionTool', 'bingbot', 'Slurp', 'DuckDuckBot', 'YandexBot', 'Baiduspider',
        // Social / link-preview unfurlers
        'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'Slackbot', 'Slack-ImgProxy',
        'TelegramBot', 'Discordbot', 'redditbot', 'Pinterest',
        // AI / answer-engine crawlers (the actual point of the AEO work)
        'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
        'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bytespider', 'CCBot',
        'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'Diffbot', 'YouBot', 'Amazonbot',
        // SEO auditing tools (handy for verifying this fix itself)
        'AhrefsBot', 'SemrushBot', 'Screaming Frog',
    ];
}

function is_crawler_bot(string $userAgent): bool
{
    if ($userAgent === '') {
        return false;
    }
    foreach (crawler_bot_user_agent_patterns() as $pattern) {
        if (stripos($userAgent, $pattern) !== false) {
            return true;
        }
    }
    return false;
}
