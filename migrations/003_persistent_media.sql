-- Persistent media metadata for all uploaded files.
-- Apply after migrations/001_integrity_foundation.sql and 002_add_valid_id_to_studios.sql.

ALTER TABLE media_files ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) NOT NULL DEFAULT 'LEGACY';
CREATE INDEX IF NOT EXISTS media_files_purpose_idx ON media_files (purpose);