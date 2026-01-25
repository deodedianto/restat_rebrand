-- ============================================
-- FIX RLS POLICIES FOR ADMIN TABLES
-- ============================================
-- Allow admin/analyst users to manage analysts, expenses, and analysis_prices

-- ============================================
-- ANALYSTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "admin_can_manage_analysts" ON analysts;
DROP POLICY IF EXISTS "analysts_select_all" ON analysts;
DROP POLICY IF EXISTS "analysts_insert_admin" ON analysts;
DROP POLICY IF EXISTS "analysts_update_admin" ON analysts;
DROP POLICY IF EXISTS "analysts_delete_admin" ON analysts;

-- Allow admin to SELECT all analysts
CREATE POLICY "admin_can_select_analysts" ON analysts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to INSERT analysts
CREATE POLICY "admin_can_insert_analysts" ON analysts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to UPDATE analysts
CREATE POLICY "admin_can_update_analysts" ON analysts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to DELETE analysts (soft delete)
CREATE POLICY "admin_can_delete_analysts" ON analysts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- ============================================
-- EXPENSES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "admin_can_manage_expenses" ON expenses;
DROP POLICY IF EXISTS "expenses_select_all" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_admin" ON expenses;
DROP POLICY IF EXISTS "expenses_update_admin" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_admin" ON expenses;

-- Allow admin to SELECT all expenses
CREATE POLICY "admin_can_select_expenses" ON expenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to INSERT expenses
CREATE POLICY "admin_can_insert_expenses" ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to UPDATE expenses
CREATE POLICY "admin_can_update_expenses" ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to DELETE expenses
CREATE POLICY "admin_can_delete_expenses" ON expenses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- ============================================
-- ANALYSIS_PRICES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "admin_can_manage_analysis_prices" ON analysis_prices;
DROP POLICY IF EXISTS "analysis_prices_select_all" ON analysis_prices;
DROP POLICY IF EXISTS "analysis_prices_insert_admin" ON analysis_prices;
DROP POLICY IF EXISTS "analysis_prices_update_admin" ON analysis_prices;
DROP POLICY IF EXISTS "analysis_prices_delete_admin" ON analysis_prices;

-- Allow admin to SELECT all analysis prices
CREATE POLICY "admin_can_select_analysis_prices" ON analysis_prices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to INSERT analysis prices
CREATE POLICY "admin_can_insert_analysis_prices" ON analysis_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to UPDATE analysis prices
CREATE POLICY "admin_can_update_analysis_prices" ON analysis_prices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Allow admin to DELETE analysis prices (soft delete via is_active)
CREATE POLICY "admin_can_delete_analysis_prices" ON analysis_prices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- ============================================
-- VERIFY ALL POLICIES
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename IN ('analysts', 'expenses', 'analysis_prices')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Admin table RLS policies created successfully!' as message;
