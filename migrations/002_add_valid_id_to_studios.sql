-- Cainta Photography MIS migration 002: Add valid_id, business_permit, and other_docs columns to studios table
ALTER TABLE studios ADD COLUMN IF NOT EXISTS business_permit LONGTEXT NULL;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS valid_id LONGTEXT NULL;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS other_docs LONGTEXT NULL;
