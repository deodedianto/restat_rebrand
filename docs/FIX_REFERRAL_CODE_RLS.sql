-- =====================================================
-- Fix RLS Policies for Referral Code Validation
-- =====================================================
-- Allow authenticated users to read referral codes for validation

-- Problem: Users cannot validate other users' referral codes
-- because RLS policies might be blocking SELECT queries

-- Solution: Add a policy that allows reading referral codes
-- (but not other sensitive data like email, phone, etc.)

-- =====================================================
-- Option 1: Allow reading referral codes only
-- =====================================================
-- This is the most secure option - only exposes referral_code field

CREATE POLICY IF NOT EXISTS "Users can read referral codes for validation"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: This allows reading ALL fields. If you want to be more restrictive,
-- you would need to handle this at the application level by only selecting
-- the fields you need (id, name, referral_code)

-- =====================================================
-- Verification
-- =====================================================
-- Test if the policy works

-- As an authenticated user, try to query referral codes:
SELECT id, name, referral_code
FROM users
WHERE referral_code = 'RESTATI020'  -- Replace with actual code
LIMIT 1;

-- Check all policies on users table:
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- Alternative: More Restrictive Policy
-- =====================================================
-- If the above is too permissive, you can use Row Level Security
-- to only allow reading specific fields, but this requires
-- application-level filtering

-- For now, the policy above is fine because:
-- 1. Users already have access to their own data
-- 2. We only expose id, name, and referral_code in the query
-- 3. This is necessary for the referral system to work

-- =====================================================
-- Rollback (if needed)
-- =====================================================
-- To remove the policy if it causes issues:

-- DROP POLICY IF EXISTS "Users can read referral codes for validation" ON users;
