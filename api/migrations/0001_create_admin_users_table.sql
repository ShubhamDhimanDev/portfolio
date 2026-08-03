CREATE TABLE IF NOT EXISTS admin_users (
    id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at  DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed admins. Both share the plaintext password 'Ecommlab@432' (each hashed with its own
-- bcrypt salt) - requested as-is; rotate to unique passwords once real usage starts, since
-- this file is checked into the repo.
INSERT IGNORE INTO admin_users (email, password_hash, created_at)
VALUES
    ('shubham@ecommlab.in', '$2y$12$sTW8H03Y409V6JkWHt4tZuTg6.9IoxAaKlpA1zjACu6bcX/EZftIi', NOW()),
    ('priyanshu@ecommlab.in', '$2y$12$FpdzVxMDgA/omVu/hLoM2OKeGJ6bTa20/BHEhxAsjDAbZc5NpZbRy', NOW());
