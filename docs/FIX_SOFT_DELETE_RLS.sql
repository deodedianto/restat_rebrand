-- ============================================
-- Fix RLS Policies for Soft Delete Functionality
-- ============================================
-- This script allows users to soft delete their own orders and consultations
-- by updating the is_record_deleted field from FALSE to TRUE

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "users_can_update_own_orders" ON orders;
DROP POLICY IF EXISTS "users_can_soft_delete_own_orders" ON orders;

-- Create new UPDATE policy that allows soft delete
-- USING clause: User can update their own orders
-- WITH CHECK clause: User can set any value including is_record_deleted = TRUE
CREATE POLICY "users_can_update_own_orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONSULTATIONS TABLE POLICIES
-- ============================================

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "users_can_update_own_consultations" ON consultations;
DROP POLICY IF EXISTS "users_can_soft_delete_own_consultations" ON consultations;

-- Create new UPDATE policy that allows soft delete
-- USING clause: User can update their own consultations
-- WITH CHECK clause: User can set any value including is_record_deleted = TRUE
CREATE POLICY "users_can_update_own_consultations" ON consultations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check orders policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Check consultations policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'consultations'
ORDER BY policyname;

-- ============================================
-- TEST QUERY (Optional - for verification)
-- ============================================
-- Test updating is_record_deleted field
-- Replace 'your-order-id' with an actual order ID
-- UPDATE orders 
-- SET is_record_deleted = TRUE 
-- WHERE id = 'your-order-id' AND user_id = auth.uid();
