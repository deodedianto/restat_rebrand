-- ============================================
-- FIX REVIEWS TABLE RLS POLICIES
-- ============================================
-- Allow users to submit reviews and feedback

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_can_insert_own_reviews" ON reviews;
DROP POLICY IF EXISTS "users_can_select_own_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_can_select_all_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_can_manage_all_reviews" ON reviews;

-- ============================================
-- CREATE NEW POLICIES
-- ============================================

-- Policy 1: Allow authenticated users to INSERT their own reviews
CREATE POLICY "users_can_insert_own_reviews" ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to SELECT their own reviews
CREATE POLICY "users_can_select_own_reviews" ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 3: Allow admin to view all reviews
CREATE POLICY "admin_can_select_all_reviews" ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'analyst')
    )
  );

-- Policy 4: Allow admin to manage all reviews (UPDATE, DELETE)
CREATE POLICY "admin_can_manage_all_reviews" ON reviews
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
-- VERIFY POLICIES
-- ============================================
SELECT 
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
WHERE tablename = 'reviews'
ORDER BY cmd, policyname;
