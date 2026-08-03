CREATE TABLE IF NOT EXISTS blog_post_categories (
    blog_post_id  BIGINT UNSIGNED NOT NULL,
    category_id   BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (blog_post_id, category_id),
    KEY idx_blog_post_categories_category_id (category_id),
    CONSTRAINT fk_blog_post_categories_post FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_post_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
