/*
  # Add anonymous insert policy for auth_tokens table

  1. Security Policy
    - Add policy to allow anonymous users to insert authentication tokens
    - This is required for the login/registration process where users are not yet authenticated
    - The policy allows INSERT operations for the anon role during token creation

  2. Notes
    - This policy is essential for the authentication flow
    - Without it, users cannot log in because token creation fails with RLS violation
    - The policy is secure as it only allows INSERT, not SELECT/UPDATE/DELETE
*/

-- Add policy to allow anonymous users to insert authentication tokens
CREATE POLICY "Allow anonymous token creation"
  ON auth_tokens
  FOR INSERT
  TO anon
  WITH CHECK (true);