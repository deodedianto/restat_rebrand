-- ============================================
-- DEBUG REFERRAL CODE ISSUE
-- ============================================

-- Step 1: Check if referral_code column exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'referral_code';

-- Step 2: Check your current user's referral_code value
-- Replace 'fec139e6-e304-4a1b-b7c0-b80e871bc4db' with your actual user ID
SELECT 
  id,
  email,
  name,
  referral_code
FROM users
WHERE id = 'fec139e6-e304-4a1b-b7c0-b80e871bc4db';

-- Step 3: Check if there are any CHECK constraints on referral_code
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users' 
  AND con.contype = 'c'
  AND pg_get_constraintdef(con.oid) LIKE '%referral_code%';

-- Step 4: Check all UPDATE policies on users table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- Step 5: Try a manual update (TEMPORARY TEST)
-- Uncomment and run this to test if direct UPDATE works:
-- UPDATE users 
-- SET referral_code = 'TEST123' 
-- WHERE id = 'fec139e6-e304-4a1b-b7c0-b80e871bc4db' 
--   AND referral_code IS NULL;
