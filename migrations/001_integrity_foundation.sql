-- Cainta Photography MIS integrity foundation
-- Apply after database_setup.sql. This migration is additive and safe to rerun.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_normalized VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_normalized VARCHAR(100);
UPDATE users SET email_normalized = LOWER(TRIM(email)) WHERE email_normalized IS NULL;
UPDATE customers SET email_normalized = LOWER(TRIM(email)) WHERE email_normalized IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_uq ON users (email_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_normalized_uq ON customers (email_normalized);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_hold_expires_at TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS verified_downpayment_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50) NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS booking_status_history (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(50) NOT NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS booking_status_history_booking_idx ON booking_status_history (booking_id, created_at);

CREATE TABLE IF NOT EXISTS payment_status_history (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(50) NOT NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS payment_status_history_payment_idx ON payment_status_history (payment_id, created_at);

CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NULL,
    payment_id VARCHAR(50) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    requested_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS refunds_booking_idx ON refunds (booking_id);

CREATE TABLE IF NOT EXISTS media_files (
    id VARCHAR(50) PRIMARY KEY,
    owner_id VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    original_name VARCHAR(255) NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    storage_key VARCHAR(255) NOT NULL UNIQUE,
    access_status VARCHAR(30) NOT NULL DEFAULT 'quarantined',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS media_files_entity_idx ON media_files (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS media_files_owner_idx ON media_files (owner_id);

CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(50) PRIMARY KEY,
    actor_id VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    before_value TEXT NULL,
    after_value TEXT NULL,
    ip_address VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx ON audit_events (entity_type, entity_id, created_at);
