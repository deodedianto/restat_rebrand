-- ============================================
-- FIX USERS TABLE RLS POLICIES
-- ============================================
-- Allow users to update their own profile fields including referral_code

-- Drop existing UPDATE policies on users table
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Create a simple, permissive UPDATE policy for users
CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policy
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';
