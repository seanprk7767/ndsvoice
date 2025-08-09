/*
  # Create auth_tokens table

  1. New Tables
    - `auth_tokens`
      - `id` (uuid, primary key)
      - `token` (text, unique, not null)
      - `user_id` (uuid, foreign key to users)
      - `user_role` (text, not null)
      - `user_name` (text, not null)
      - `expires_at` (timestamptz, not null)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `auth_tokens` table
    - Add policies for authenticated users to manage their own tokens
    - Add policy for admins to view all tokens

  3. Indexes
    - Index on token for fast lookups
    - Index on user_id for user-specific queries
    - Index on expires_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_role text NOT NULL CHECK (user_role IN ('admin', 'member')),
  user_name text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_is_active ON auth_tokens(is_active);

-- RLS Policies
CREATE POLICY "Users can manage own tokens"
  ON auth_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tokens"
  ON auth_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all tokens"
  ON auth_tokens
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );