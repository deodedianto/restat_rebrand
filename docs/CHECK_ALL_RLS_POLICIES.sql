-- ============================================
-- CHECK RLS POLICIES FOR ALL TABLES
-- ============================================

-- Check analysts table RLS
SELECT 
  'analysts' as table_name,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'analysts'
UNION ALL
-- Check expenses table RLS
SELECT 
  'expenses' as table_name,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'expenses'
UNION ALL
-- Check analysis_prices table RLS
SELECT 
  'analysis_prices' as table_name,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'analysis_prices'
ORDER BY table_name, cmd, policyname;

-- Check if RLS is enabled on these tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('analysts', 'expenses', 'analysis_prices')
ORDER BY tablename;
