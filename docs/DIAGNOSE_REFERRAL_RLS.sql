-- =====================================================
-- Comprehensive Diagnostic for Referral Code RLS Issue
-- =====================================================
-- Run each section and share the results

-- =====================================================
-- STEP 1: Check all SELECT policies on users table
-- =====================================================
SELECT 
  policyname,
  cmd,
  roles::text as roles,
  permissive as is_permissive,
  qual::text as using_condition,
  with_check::text as with_check_condition
FROM pg_policies
WHERE tablename = 'users'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Expected: Should show at least one policy allowing SELECT for 'authenticated' role

-- =====================================================
-- STEP 2: Test as authenticated user
-- =====================================================
-- This simulates what the frontend sees
SET LOCAL role authenticated;

SELECT 
  id,
  name,
  referral_code,
  'Found by authenticated user' as status
FROM users
WHERE referral_code = 'RESTATI02O';

RESET ROLE;

-- Expected: Should return 1 row with the user data

-- =====================================================
-- STEP 3: Check if RLS is enabled
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- Expected: rls_enabled should be TRUE

-- =====================================================
-- STEP 4: Test with ANON role (what Supabase client uses)
-- =====================================================
SET LOCAL role anon;

SELECT 
  id,
  name,
  referral_code,
  'Found by anon user' as status
FROM users
WHERE referral_code = 'RESTATI02O';

RESET ROLE;

-- Expected: Should return 0 rows (anon shouldn't see data)
-- But this helps verify the role switching works

-- =====================================================
-- STEP 5: Check for conflicting policies
-- =====================================================
-- Look for RESTRICTIVE policies that might block access
SELECT 
  policyname,
  permissive,
  qual::text as condition
FROM pg_policies
WHERE tablename = 'users'
  AND permissive = 'RESTRICTIVE';

-- Expected: Should be empty (no restrictive policies)

-- =====================================================
-- STEP 6: Verify the exact code in database
-- =====================================================
SELECT 
  id,
  email,
  referral_code,
  LENGTH(referral_code) as code_length,
  referral_code = 'RESTATI02O' as exact_match,
  UPPER(referral_code) = 'RESTATI02O' as case_match,
  encode(referral_code::bytea, 'hex') as hex_representation
FROM users
WHERE referral_code LIKE '%STATI02%';

-- This shows the exact bytes to catch hidden characters

-- =====================================================
-- SOLUTION: Add or replace the SELECT policy
-- =====================================================
-- If the above tests show the policy is missing or wrong, run this:

-- Drop existing conflicting policies (if any)
DROP POLICY IF EXISTS "Users can only read their own data" ON users;
DROP POLICY IF EXISTS "Users read own profile" ON users;

-- Create the correct policy
CREATE POLICY "Authenticated users can read all users data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Verify it was created
SELECT policyname, qual::text
FROM pg_policies
WHERE tablename = 'users'
  AND policyname = 'Authenticated users can read all users data';
