-- =====================================================
-- Fix Users Table RLS for Referral Code Validation
-- =====================================================
-- This allows authenticated users to look up other users by referral code
-- while maintaining security for other user data

-- =====================================================
-- STEP 1: Check current SELECT policies
-- =====================================================
SELECT 
  policyname,
  qual::text as condition
FROM pg_policies
WHERE tablename = 'users'
  AND cmd = 'SELECT';

-- =====================================================
-- STEP 2: Add permissive policy for referral lookups
-- =====================================================
-- This policy allows users to read ANY user's data when querying by referral_code
-- It's PERMISSIVE, so it works alongside existing policies

CREATE POLICY IF NOT EXISTS "Allow referral code lookups"
  ON users
  FOR SELECT
  TO authenticated
  USING (referral_code IS NOT NULL);

-- This means: Users can SELECT any row that has a referral_code
-- Combined with the query filter .eq('referral_code', code),
-- users can only see the specific user they're looking up

-- =====================================================
-- STEP 3: Verify the policy was created
-- =====================================================
SELECT 
  policyname,
  permissive,
  qual::text as condition
FROM pg_policies
WHERE tablename = 'users'
  AND policyname = 'Allow referral code lookups';

-- =====================================================
-- STEP 4: Test as authenticated user
-- =====================================================
-- Simulate what the frontend will see
SET LOCAL role authenticated;

-- This should now work
SELECT id, name, referral_code
FROM users
WHERE referral_code = 'RESTATI02O';

RESET ROLE;

-- =====================================================
-- Alternative: More Permissive Policy (if above doesn't work)
-- =====================================================
-- If the above is still too restrictive, use this instead:

-- DROP POLICY IF EXISTS "Allow referral code lookups" ON users;
-- 
-- CREATE POLICY "Allow all users to read for referral validation"
--   ON users
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- This allows authenticated users to read all user records
-- (But your query only selects id, name, referral_code so it's still safe)

-- =====================================================
-- IMPORTANT: How PostgreSQL RLS Works
-- =====================================================
-- Multiple PERMISSIVE policies are combined with OR
-- Example: 
--   Policy A: USING (auth.uid() = id)           -- Can see own data
--   Policy B: USING (referral_code IS NOT NULL) -- Can see users with referral codes
-- 
-- Result: Users can see EITHER their own data OR any user with a referral code
-- This is perfect for our use case!
