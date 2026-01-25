-- =====================================================
-- Debug Referral Codes in Database
-- =====================================================
-- Use this to check existing referral codes and troubleshoot validation issues

-- 1. Check all referral codes in users table
SELECT 
  id,
  name,
  email,
  referral_code,
  LENGTH(referral_code) as code_length,
  created_at
FROM users
WHERE referral_code IS NOT NULL
ORDER BY created_at DESC;

-- 2. Search for specific code (replace with your code)
SELECT 
  id,
  name,
  email,
  referral_code,
  LENGTH(referral_code) as code_length
FROM users
WHERE referral_code = 'RESTATI020'  -- Replace with your code
   OR referral_code LIKE '%I020%';

-- 3. Check for case sensitivity issues
SELECT 
  id,
  name,
  email,
  referral_code,
  UPPER(referral_code) as code_upper
FROM users
WHERE UPPER(referral_code) = 'RESTATI020';  -- Replace with your code

-- 4. Check for extra spaces or special characters
SELECT 
  id,
  name,
  email,
  referral_code,
  LENGTH(referral_code) as actual_length,
  LENGTH(TRIM(referral_code)) as trimmed_length,
  ASCII(SUBSTRING(referral_code, 1, 1)) as first_char_code,
  ASCII(SUBSTRING(referral_code, LENGTH(referral_code), 1)) as last_char_code
FROM users
WHERE referral_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if RLS is blocking the query (run as admin)
-- This shows what an authenticated user would see
SET LOCAL role authenticated;
SELECT 
  id,
  name,
  referral_code
FROM users
WHERE referral_code = 'RESTATI020';  -- Replace with your code
RESET ROLE;

-- 6. Check current RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Generate a new referral code to test the format
-- This shows what format the code should be
SELECT 
  'RESTAT' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)) as sample_code;

-- 8. Check if there are any codes starting with RESTAT
SELECT 
  COUNT(*) as total_referral_codes,
  COUNT(CASE WHEN referral_code LIKE 'RESTAT%' THEN 1 END) as codes_starting_with_restat
FROM users
WHERE referral_code IS NOT NULL;

-- =====================================================
-- Quick Fix Queries
-- =====================================================

-- If you need to add SELECT permission for authenticated users:
-- (Uncomment and run if needed)

-- CREATE POLICY "Users can read all referral codes"
--   ON users
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- To check a specific user's referral code:
-- SELECT id, name, email, referral_code 
-- FROM users 
-- WHERE email = 'your.email@example.com';  -- Replace with user email
