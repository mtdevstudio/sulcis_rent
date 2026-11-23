-- Sulcis Rent · schema iniziale (MySQL 5.7+/MariaDB 10.3+, utf8mb4)
-- Tutte le date in UTC.

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','staff') NOT NULL DEFAULT 'staff',
  active TINYINT(1) NOT NULL DEFAULT 1,
  color VARCHAR(7) NULL,
  created_at DATETIME NOT NULL,
  last_login_at DATETIME NULL,
  pin_changed_at DATETIME NULL,
  UNIQUE KEY uq_admin_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  csrf_hash CHAR(64) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  user_agent VARCHAR(255) NULL,
  ip_hash CHAR(64) NULL,
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY ix_sessions_user (user_id),
  KEY ix_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ip_hash CHAR(64) NOT NULL,
  user_id INT UNSIGNED NULL,
  attempted_at DATETIME(3) NOT NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  KEY ix_attempts_ip (ip_hash, attempted_at),
  KEY ix_attempts_user (user_id, attempted_at),
  KEY ix_attempts_time (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocchi con backoff crescente (15 min → 1 h → 24 h) per IP, utente e globale.
CREATE TABLE IF NOT EXISTS auth_locks (
  scope ENUM('ip','user','global') NOT NULL,
  scope_key VARCHAR(64) NOT NULL,
  locked_until DATETIME NOT NULL,
  strikes INT UNSIGNED NOT NULL DEFAULT 1,
  last_strike_at DATETIME NOT NULL,
  PRIMARY KEY (scope, scope_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dispositivi già visti (per la notifica «login da nuovo dispositivo»).
CREATE TABLE IF NOT EXISTS admin_devices (
  user_id INT UNSIGNED NOT NULL,
  device_hash CHAR(64) NOT NULL,
  first_seen_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  PRIMARY KEY (user_id, device_hash),
  CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(40) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id VARCHAR(40) NULL,
  diff JSON NULL,
  created_at DATETIME NOT NULL,
  KEY ix_audit_time (created_at),
  KEY ix_audit_entity (entity, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cars (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(90) NOT NULL,
  brand VARCHAR(60) NOT NULL DEFAULT '',
  model VARCHAR(80) NOT NULL DEFAULT '',
  version VARCHAR(80) NULL,
  category VARCHAR(40) NULL,
  year SMALLINT UNSIGNED NULL,
  plate VARCHAR(16) NULL,                       -- SOLO interna: mai nei JSON pubblici
  status ENUM('draft','published','hidden') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  badge VARCHAR(20) NULL,
  data JSON NOT NULL,                           -- specs, dotazioni, condizioni, contenuti IT/EN, SEO
  internal_notes TEXT NULL,                     -- SOLO interne
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  updated_by INT UNSIGNED NULL,
  deleted_at DATETIME NULL,                     -- cestino (soft delete, pulizia dopo 30 giorni)
  UNIQUE KEY uq_cars_slug (slug),
  KEY ix_cars_status (status, deleted_at, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS car_photos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  car_id INT UNSIGNED NOT NULL,
  uuid CHAR(36) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  alt_it VARCHAR(160) NULL,
  alt_en VARCHAR(160) NULL,
  width INT UNSIGNED NOT NULL,
  height INT UNSIGNED NOT NULL,
  widths JSON NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_photos_uuid (uuid),
  KEY ix_photos_car (car_id, sort_order),
  CONSTRAINT fk_photos_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(80) NOT NULL,
  text TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review_date DATE NOT NULL,
  url VARCHAR(500) NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'Google',
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faq (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question_it VARCHAR(300) NOT NULL,
  answer_it TEXT NOT NULL,
  question_en VARCHAR(300) NULL,
  answer_en TEXT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  name VARCHAR(60) NOT NULL PRIMARY KEY,
  value JSON NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
