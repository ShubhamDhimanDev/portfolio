CREATE TABLE IF NOT EXISTS blog_comments (
    id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    blog_post_id       BIGINT UNSIGNED NOT NULL,
    parent_comment_id  BIGINT UNSIGNED NULL,
    author_name        VARCHAR(120) NOT NULL,
    author_email       VARCHAR(255) NOT NULL,
    content            TEXT NOT NULL,
    status             ENUM('pending','approved','rejected','spam') NOT NULL DEFAULT 'pending',
    ip_address         VARCHAR(45) NULL,
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at        DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_blog_comments_post_id (blog_post_id),
    KEY idx_blog_comments_status (status),
    KEY idx_blog_comments_parent_id (parent_comment_id),
    CONSTRAINT fk_blog_comments_post FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
