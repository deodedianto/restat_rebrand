-- =====================================================
-- Verify Discount Columns and Functions Exist
-- =====================================================

-- 1. Check if discount columns exist in orders table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('discount_referal', 'discount_voucher', 'referral_code_used', 'voucher_code')
ORDER BY column_name;

-- Expected result: 4 rows showing these columns exist

-- 2. If columns don't exist, add them:
-- Uncomment and run these if needed:

-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code_used TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_referal FLOAT4 DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_voucher FLOAT4 DEFAULT 0;

-- 3. Check if increment_voucher_usage function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'increment_voucher_usage';

-- Expected result: 1 row showing the function exists

-- 4. If function doesn't exist, create it:
-- Uncomment and run if needed:

-- CREATE OR REPLACE FUNCTION increment_voucher_usage(voucher_code_param TEXT)
-- RETURNS VOID
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   UPDATE vouchers
--   SET current_usage = COALESCE(current_usage, 0) + 1
--   WHERE voucher_code = voucher_code_param
--     AND is_active = true;
-- END;
-- $$;
-- 
-- GRANT EXECUTE ON FUNCTION increment_voucher_usage(TEXT) TO authenticated;

-- 5. Test updating an order with discount columns
-- Replace the order_id with an actual order ID from your database
-- SELECT id FROM orders WHERE user_id = auth.uid() LIMIT 1;

-- Test update (use a real order_id):
-- UPDATE orders 
-- SET 
--   discount_referal = 50000,
--   referral_code_used = 'TESTCODE',
--   discount_voucher = 0,
--   voucher_code = NULL
-- WHERE id = 'your-order-id-here'
--   AND user_id = auth.uid();

-- 6. Check RLS policies on orders table for UPDATE
SELECT 
  policyname,
  cmd,
  roles::text,
  qual::text as using_condition,
  with_check::text as with_check_condition
FROM pg_policies
WHERE tablename = 'orders'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Expected: Should show policies allowing authenticated users to update their own orders
