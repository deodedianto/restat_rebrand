-- ============================================
-- DEBUG BANK ACCOUNT UPDATE ISSUE
-- ============================================

-- Step 1: Check if bank columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('bank_name', 'bank_account_number')
ORDER BY column_name;

-- Step 2: Check your current bank info
-- Replace with your user ID
SELECT 
  id,
  email,
  name,
  bank_name,
  bank_account_number
FROM users
WHERE id = 'fec139e6-e304-4a1b-b7c0-b80e871bc4db';

-- Step 3: Check if there are any CHECK constraints on bank fields
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'users' 
  AND con.contype = 'c'
  AND (pg_get_constraintdef(con.oid) LIKE '%bank%');

-- Step 4: Test manual update (with RLS disabled temporarily)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- UPDATE users 
-- SET bank_name = 'BCA', bank_account_number = '341321312' 
-- WHERE id = 'fec139e6-e304-4a1b-b7c0-b80e871bc4db';
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
