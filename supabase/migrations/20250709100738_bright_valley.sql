/*
  # Fix auth_tokens RLS policies

  1. Security Updates
    - Drop existing problematic policies
    - Create new, properly configured RLS policies for auth_tokens table
    - Allow anonymous token creation for login functionality
    - Allow users to manage their own tokens
    - Allow admins to manage all tokens

  2. Policy Details
    - Anonymous users can create tokens (for login)
    - Authenticated users can view and manage their own tokens
    - Admin users can manage all tokens
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow anonymous token creation" ON auth_tokens;
DROP POLICY IF EXISTS "Users can manage own tokens" ON auth_tokens;
DROP POLICY IF EXISTS "Admins can manage all tokens" ON auth_tokens;
DROP POLICY IF EXISTS "Admins can view all tokens" ON auth_tokens;

-- Allow anonymous users to create tokens (needed for login functionality)
CREATE POLICY "Allow anonymous token creation"
  ON auth_tokens
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view their own tokens
CREATE POLICY "Users can view own tokens"
  ON auth_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to update their own tokens
CREATE POLICY "Users can update own tokens"
  ON auth_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON auth_tokens
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to view all tokens
CREATE POLICY "Admins can view all tokens"
  ON auth_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to manage all tokens
CREATE POLICY "Admins can manage all tokens"
  ON auth_tokens
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;