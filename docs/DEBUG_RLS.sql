-- ============================================
-- DEBUG RLS POLICIES
-- ============================================
-- Run this to see what's blocking the update

-- Step 1: Check ALL policies on orders table (not just UPDATE)
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd, policyname;

-- Step 2: Check if there are any triggers that might interfere
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders';

-- Step 3: Check the actual table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'is_record_deleted';

-- Step 4: Try a test update with explicit session
-- This simulates what your frontend should be doing
-- First, verify you have an order to test with
SELECT 
  id,
  user_id,
  research_title,
  is_record_deleted,
  payment_status
FROM orders
WHERE payment_status = 'Belum Dibayar'
LIMIT 1;
