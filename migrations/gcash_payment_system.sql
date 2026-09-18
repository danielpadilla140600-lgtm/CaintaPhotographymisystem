-- ============================================================
-- GCash QR Payment System Migration
-- Cainta Photography Studio MIS
-- Run this AFTER the base schema (cainta_photography_mis.sql)
-- ============================================================

-- 1. Alter payments table — add GCash QR tracking columns
ALTER TABLE `payments`
  ADD COLUMN `gcash_session_id` VARCHAR(50) NULL AFTER `id`,
  ADD COLUMN `gateway_transaction_id` VARCHAR(255) NULL AFTER `reference_number`,
  ADD COLUMN `fraud_score` INT NULL AFTER `gateway_transaction_id`,
  ADD COLUMN `payment_channel` VARCHAR(50) NOT NULL DEFAULT 'manual_upload' AFTER `fraud_score`;
-- payment_channel values: 'manual_upload' | 'gcash_qr' | 'qrph' | 'cash' | 'bank_transfer'

ALTER TABLE `print_orders`
  ADD COLUMN `gcash_session_id` VARCHAR(50) NULL AFTER `id`,
  ADD COLUMN `gateway_transaction_id` VARCHAR(255) NULL AFTER `reference_number`;

-- 2. GCash QR sessions table
-- Tracks each dynamic QR code generated; single-use, 30min expiry
CREATE TABLE IF NOT EXISTS `gcash_qr_sessions` (
  `id` VARCHAR(50) NOT NULL,
  `payment_id` VARCHAR(50) NULL,                -- links to payments.id (set after payment created)
  `booking_id` VARCHAR(50) NULL,                -- for booking downpayments / balance
  `print_order_id` VARCHAR(50) NULL,            -- for print order payments
  `studio_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `gateway` VARCHAR(20) NOT NULL DEFAULT 'paymongo',   -- 'paymongo' | 'xendit'
  `gateway_payment_intent_id` VARCHAR(255) NULL,        -- PayMongo pi_* ID
  `gateway_source_id` VARCHAR(255) NULL,                -- PayMongo src_* ID
  `gateway_checkout_url` TEXT NULL,                     -- Redirect URL if needed
  `qr_code_data` LONGTEXT NULL,                         -- base64 PNG QR image
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_type` VARCHAR(30) NOT NULL DEFAULT 'Downpayment',  -- 'Downpayment' | 'Balance' | 'PrintOrder'
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- status: pending | paid | expired | failed | cancelled
  `expires_at` TIMESTAMP NOT NULL,                      -- QR valid for 30 minutes
  `webhook_event_id` VARCHAR(255) NULL,                 -- idempotency: store evt_* ID from gateway
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gcash_sessions_booking` (`booking_id`),
  INDEX `idx_gcash_sessions_customer` (`customer_id`),
  INDEX `idx_gcash_sessions_intent` (`gateway_payment_intent_id`),
  INDEX `idx_gcash_sessions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Fix existing installations created from the original schema.
ALTER TABLE `gcash_qr_sessions`
  MODIFY COLUMN `expires_at` TIMESTAMP NOT NULL;

-- 3. Webhook events idempotency log
-- Prevents replay attacks by deduplicating processed events
CREATE TABLE IF NOT EXISTS `webhook_events` (
  `event_id` VARCHAR(255) NOT NULL,       -- gateway's unique evt_* ID
  `gateway` VARCHAR(20) NOT NULL,         -- 'paymongo' | 'xendit'
  `event_type` VARCHAR(100) NOT NULL,     -- e.g. 'payment.paid'
  `payment_id` VARCHAR(50) NULL,          -- our internal payment ID
  `session_id` VARCHAR(50) NULL,          -- our internal session ID
  `raw_payload` MEDIUMTEXT NULL,          -- full webhook body for audit
  `processed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  INDEX `idx_webhook_events_payment` (`payment_id`),
  INDEX `idx_webhook_events_processed` (`processed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Per-studio payment credentials (for future multi-tenant sub-merchant)
-- AES-256 encrypted keys stored at rest
CREATE TABLE IF NOT EXISTS `studio_payment_credentials` (
  `id` VARCHAR(50) NOT NULL,
  `studio_id` VARCHAR(50) NOT NULL,
  `gateway` VARCHAR(20) NOT NULL DEFAULT 'paymongo',
  -- For Xendit xenPlatform: sub-account ID
  `gateway_sub_account_id` VARCHAR(255) NULL,
  -- PayMongo keys (AES-256 encrypted; NULL = use platform master key)
  `public_key_encrypted` TEXT NULL,
  `secret_key_encrypted` TEXT NULL,
  `webhook_secret_encrypted` TEXT NULL,
  -- Display info shown to customers on the QR payment screen
  `gcash_merchant_name` VARCHAR(100) NULL,    -- e.g. "Ellacapstudio"
  `gcash_number` VARCHAR(20) NULL,            -- e.g. "09XX XXX XXXX"
  `is_live_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_studio_payment_creds` (`studio_id`, `gateway`),
  CONSTRAINT `fk_studio_payment_creds_studio`
    FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- Verification queries (run after migration to confirm success)
-- ============================================================
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME IN ('gcash_session_id', 'gateway_transaction_id', 'fraud_score', 'payment_channel');
-- SELECT COUNT(*) FROM gcash_qr_sessions;
-- SELECT COUNT(*) FROM webhook_events;
-- SELECT COUNT(*) FROM studio_payment_credentials;
