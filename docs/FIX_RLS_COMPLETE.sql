-- ============================================
-- COMPLETE RLS FIX FOR SOFT DELETE
-- ============================================
-- This script fixes all RLS policies to allow soft delete functionality
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Clean up ALL existing policies
-- ============================================

-- Drop all UPDATE policies on orders table
DROP POLICY IF EXISTS "orders_update_own_payment" ON orders;
DROP POLICY IF EXISTS "orders_update_own_unpaid" ON orders;
DROP POLICY IF EXISTS "users_can_update_own_orders" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON orders;

-- Drop all UPDATE policies on consultations table
DROP POLICY IF EXISTS "users_can_update_own_consultations" ON consultations;
DROP POLICY IF EXISTS "consultations_update_own" ON consultations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON consultations;

-- ============================================
-- STEP 2: Create simple, permissive policies
-- ============================================

-- Orders: Allow users to update ANY field in their own orders
CREATE POLICY "users_can_update_own_orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Consultations: Allow users to update ANY field in their own consultations
CREATE POLICY "users_can_update_own_consultations" ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 3: Verify policies are correct
-- ============================================

SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename IN ('orders', 'consultations') 
  AND cmd = 'UPDATE'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 4: Test the soft delete (IMPORTANT!)
-- ============================================

-- Get your current user ID
-- SELECT auth.uid();

-- If auth.uid() returns NULL (because you're in SQL Editor),
-- you can test by temporarily disabling RLS:

-- Test 1: Try update with RLS enabled (as authenticated user from frontend)
-- This should work from your frontend application when logged in

-- Test 2: Verify query (check your orders)
SELECT 
  id,
  user_id,
  research_title,
  payment_status,
  is_record_deleted,
  created_at
FROM orders
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- NOTES
-- ============================================
-- 1. The 'TO authenticated' clause ensures only logged-in users can update
-- 2. The 'USING' clause checks if user can ACCESS the row (can they see it?)
-- 3. The 'WITH CHECK' clause checks if the RESULTING row is valid
-- 4. Both clauses just check: "Is this your record?" - no other restrictions
-- 5. This allows updating is_record_deleted, payment_status, or any other field
