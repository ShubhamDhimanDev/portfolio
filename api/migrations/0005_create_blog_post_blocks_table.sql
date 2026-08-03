CREATE TABLE IF NOT EXISTS blog_post_blocks (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    blog_post_id  BIGINT UNSIGNED NOT NULL,
    block_type    VARCHAR(30) NOT NULL,
    block_data    JSON NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_blog_post_blocks_post_id (blog_post_id),
    KEY idx_blog_post_blocks_sort (blog_post_id, sort_order),
    CONSTRAINT fk_blog_post_blocks_post FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
