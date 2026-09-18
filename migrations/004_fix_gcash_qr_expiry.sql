-- Fix GCash QR expiry timestamps
-- Run this once on the existing cainta_photography_mis database.

USE `cainta_photography_mis`;

-- Prevent expires_at from being reset whenever the QR session status changes.
ALTER TABLE `gcash_qr_sessions`
  MODIFY COLUMN `expires_at` TIMESTAMP NOT NULL;

-- Verify that expires_at no longer has an ON UPDATE clause.
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'gcash_qr_sessions'
  AND COLUMN_NAME = 'expires_at';
