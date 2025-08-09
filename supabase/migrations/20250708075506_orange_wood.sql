/*
  # Update submissions table for target manager

  1. Changes
    - Replace department column with target_manager
    - Update existing data if needed
    - Add constraint for valid manager types

  2. Security
    - Maintain existing RLS policies
*/

-- Add target_manager column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'target_manager'
  ) THEN
    ALTER TABLE submissions ADD COLUMN target_manager text;
  END IF;
END $$;

-- Add constraint for valid manager types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'submissions_target_manager_check'
  ) THEN
    ALTER TABLE submissions ADD CONSTRAINT submissions_target_manager_check 
    CHECK (target_manager IN ('operation-manager', 'hr-manager', 'area-manager'));
  END IF;
END $$;

-- Migrate existing department data to target_manager if needed
UPDATE submissions 
SET target_manager = CASE 
  WHEN department = 'Operations' THEN 'operation-manager'
  WHEN department = 'HR' THEN 'hr-manager'
  ELSE 'operation-manager'
END
WHERE target_manager IS NULL AND department IS NOT NULL;

-- Remove department column if it exists and target_manager is populated
-- (Optional - you can keep both columns if needed for backward compatibility)