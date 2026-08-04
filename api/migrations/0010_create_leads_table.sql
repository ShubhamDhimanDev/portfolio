CREATE TABLE IF NOT EXISTS leads (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(50) NULL,
    message     TEXT NOT NULL,
    source      VARCHAR(60) NOT NULL DEFAULT 'contact-section',
    status      ENUM('new','contacted','archived') NOT NULL DEFAULT 'new',
    ip_address  VARCHAR(45) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_leads_status (status),
    KEY idx_leads_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
