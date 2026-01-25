-- ============================================
-- VERIFY USERS TABLE RLS POLICIES
-- ============================================

-- Check ALL policies on users table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Check if RLS is enabled on users table
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';
