-- ================================================
-- NUCLEAR OPTION: Complete RLS Reset for Orders
-- ================================================
-- This will drop ALL RLS policies and recreate them from scratch
-- Run this if the previous fix didn't work

-- ============================================
-- STEP 1: Drop ALL policies on orders table
-- ============================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON orders', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Drop ALL policies on consultations table
-- ============================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'consultations') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON consultations', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Create NEW simple policies
-- ============================================

-- ORDERS TABLE
-- Policy 1: Users can SELECT their own orders
CREATE POLICY "users_select_own_orders" ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Admin can SELECT all orders
CREATE POLICY "admin_select_all_orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Policy 3: Users can INSERT their own orders
CREATE POLICY "users_insert_own_orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can UPDATE their own orders (INCLUDING soft delete)
CREATE POLICY "users_update_own_orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Admin can UPDATE all orders
CREATE POLICY "admin_update_all_orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- CONSULTATIONS TABLE
-- Policy 1: Users can SELECT their own consultations
CREATE POLICY "users_select_own_consultations" ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can INSERT their own consultations
CREATE POLICY "users_insert_own_consultations" ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own consultations (INCLUDING soft delete)
CREATE POLICY "users_update_own_consultations" ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admin can view and update all consultations
CREATE POLICY "admin_manage_all_consultations" ON consultations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- ============================================
-- STEP 4: Verify the new policies
-- ============================================
SELECT 
  'ORDERS' as table_name,
  policyname,
  cmd,
  permissive,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING'
    ELSE 'No USING'
  END as using_check,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as with_check_status
FROM pg_policies
WHERE tablename = 'orders'
UNION ALL
SELECT 
  'CONSULTATIONS' as table_name,
  policyname,
  cmd,
  permissive,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING'
    ELSE 'No USING'
  END as using_check,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as with_check_status
FROM pg_policies
WHERE tablename = 'consultations'
ORDER BY table_name, cmd, policyname;

-- ============================================
-- STEP 5: Test message
-- ============================================
SELECT 
  'SUCCESS: All RLS policies have been reset and recreated.' as message,
  'Please test the soft delete functionality in your dashboard now.' as next_step;
