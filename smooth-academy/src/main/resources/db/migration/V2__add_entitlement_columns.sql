-- Migration: Add entitlement columns to user_operators
-- Run this SQL in pgAdmin before starting the app with the new code

-- 1. Add new columns
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS max_level_id INTEGER;
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'GUEST_DEFAULT';

-- 2. Add FK constraint for max_level_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_operators_max_level'
    ) THEN
        ALTER TABLE user_operators
            ADD CONSTRAINT fk_user_operators_max_level
            FOREIGN KEY (max_level_id) REFERENCES levels(id);
    END IF;
END $$;

-- 3. Migrate existing rows: set source based on current state
-- Rows with no expiry and full access → treat as SUBSCRIPTION
UPDATE user_operators SET source = 'SUBSCRIPTION' WHERE source = 'GUEST_DEFAULT' AND expires_at IS NULL AND max_level_id IS NULL;

-- 4. Migrate existing guest users: cap ADD and SUBTRACT at Satuan (level 1)
-- For users who only have ADD (or ADD+SUBTRACT) with no subscription history
UPDATE user_operators uo
SET max_level_id = 1, source = 'GUEST_DEFAULT'
WHERE uo.source = 'GUEST_DEFAULT'
  AND uo.max_level_id IS NULL
  AND uo.operator IN ('ADD', 'SUBTRACT')
  AND uo.user_id IN (
      SELECT user_id FROM user_operators
      GROUP BY user_id
      HAVING COUNT(*) <= 2
  );

-- 5. Ensure new registrations get ADD+SUBTRACT (handled by UserService.register)
-- This migration only touches existing rows
