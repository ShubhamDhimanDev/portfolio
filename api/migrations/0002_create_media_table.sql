CREATE TABLE IF NOT EXISTS media (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_type     ENUM('image','video','document') NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    size_bytes    BIGINT UNSIGNED NOT NULL,
    width         INT UNSIGNED NULL,
    height        INT UNSIGNED NULL,
    alt_text      VARCHAR(255) NULL,
    uploaded_by   INT UNSIGNED NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_media_file_type (file_type),
    KEY idx_media_deleted_at (deleted_at),
    KEY idx_media_uploaded_by (uploaded_by),
    CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
