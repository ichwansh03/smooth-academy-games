-- Migration: Add entitlement columns to user_operators
-- Run this SQL in pgAdmin before starting the app with the new code

-- 1. Add new columns (nullable first for existing rows)
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS max_level_id INTEGER;
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE user_operators ADD COLUMN IF NOT EXISTS source VARCHAR(20);

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

-- 3. Cap all existing rows at Satuan (level 1) for GUEST users
UPDATE user_operators
SET max_level_id = 1, source = 'GUEST_DEFAULT'
WHERE max_level_id IS NULL;

-- 4. Grant SUBTRACT to users who only have ADD (guest baseline)
INSERT INTO user_operators (id, user_id, operator, max_level_id, source)
SELECT gen_random_uuid(), uo.user_id, 'SUBTRACT', 1, 'GUEST_DEFAULT'
FROM user_operators uo
WHERE uo.operator = 'ADD'
  AND NOT EXISTS (
      SELECT 1 FROM user_operators uo2
      WHERE uo2.user_id = uo.user_id AND uo2.operator = 'SUBTRACT'
  )
GROUP BY uo.user_id;

-- 5. Now make source NOT NULL with default
ALTER TABLE user_operators ALTER COLUMN source SET DEFAULT 'GUEST_DEFAULT';
ALTER TABLE user_operators ALTER COLUMN source SET NOT NULL;
