-- ============================================
-- CHECK IF BANK COLUMNS EXIST
-- ============================================

-- Step 1: List ALL columns in users table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Specifically check for bank-related columns
SELECT 
  column_name
FROM information_schema.columns
WHERE table_name = 'users'
  AND (column_name LIKE '%bank%' OR column_name LIKE '%account%')
ORDER BY column_name;
