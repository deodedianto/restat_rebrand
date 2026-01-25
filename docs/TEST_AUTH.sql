-- ============================================
-- TEST AUTHENTICATION CONTEXT
-- ============================================
-- This will help verify if auth.uid() works in your context

-- Test 1: Check if you can see your own orders with SELECT
-- (This proves auth.uid() works for SELECT operations)
SELECT 
  id,
  user_id,
  research_title,
  is_record_deleted,
  payment_status,
  CASE 
    WHEN user_id = auth.uid() THEN '✅ MATCHES'
    ELSE '❌ MISMATCH'
  END as ownership_check
FROM orders
WHERE user_id = auth.uid()
LIMIT 5;

-- Test 2: Try to manually update one specific order
-- Replace this ID with one from Test 1 results
-- UPDATE orders 
-- SET is_record_deleted = TRUE 
-- WHERE id = 'YOUR-ORDER-ID-HERE';

-- Test 3: Check what auth.uid() returns
-- (This will be NULL in SQL Editor, but should work from frontend)
SELECT 
  auth.uid() as my_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠️  NULL - Use this from frontend, not SQL Editor'
    ELSE '✅ Has value'
  END as auth_status;
