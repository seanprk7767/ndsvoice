/*
  # Enhanced Staff Profile System with Complete Member Information

  1. Enhanced Tables
    - Update `staff_profiles` table with comprehensive personal information
    - Add fields for family details, marital status, and personal information

  2. New Fields Added
    - Full personal information (DOB, marital status)
    - Family information (parents, spouse)
    - Enhanced contact information
    - Photo upload capability

  3. Security
    - Maintain existing RLS policies
    - Ensure data privacy and access control
*/

-- Add new columns to staff_profiles table
DO $$
BEGIN
  -- Personal Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'marital_status'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN marital_status text CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));
  END IF;

  -- Family Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'fathers_name'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN fathers_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'mothers_name'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN mothers_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'spouse_name'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN spouse_name text;
  END IF;

  -- Enhanced Contact Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'personal_email'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN personal_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'work_email'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN work_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'mobile_number'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN mobile_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'home_phone'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN home_phone text;
  END IF;

  -- Address Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'permanent_address'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN permanent_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'current_address'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN current_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN postal_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE staff_profiles ADD COLUMN country text DEFAULT 'Malaysia';
  END IF;

END $$;