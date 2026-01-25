-- =====================================================
-- Add Discount Columns to Orders Table
-- =====================================================
-- Add columns for voucher and referral discount tracking

-- Add referral discount columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_referal FLOAT4 DEFAULT 0;

-- Add voucher discount columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_voucher FLOAT4 DEFAULT 0;

-- Note: referral_code_used and voucher_code columns should already exist
-- If not, add them:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code_used TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;

-- =====================================================
-- Function to Increment Voucher Usage
-- =====================================================
-- This function safely increments the current_usage count for a voucher

CREATE OR REPLACE FUNCTION increment_voucher_usage(voucher_code_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vouchers
  SET current_usage = COALESCE(current_usage, 0) + 1
  WHERE voucher_code = voucher_code_param
    AND is_active = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_voucher_usage(TEXT) TO authenticated;

-- =====================================================
-- Update RLS Policies for Vouchers (if needed)
-- =====================================================
-- Ensure authenticated users can SELECT active vouchers for validation

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Anyone can view active vouchers" ON vouchers;

-- Create new SELECT policy
CREATE POLICY "Authenticated users can view active vouchers"
  ON vouchers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- =====================================================
-- Indexes for Performance
-- =====================================================
-- Add indexes for faster queries

CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_orders_voucher_code ON orders(voucher_code);
CREATE INDEX IF NOT EXISTS idx_vouchers_code_active ON vouchers(voucher_code, is_active);

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the changes

-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('discount_referal', 'discount_voucher', 'referral_code_used', 'voucher_code')
ORDER BY column_name;

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'increment_voucher_usage';

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders'
  AND indexname LIKE '%referral%' OR indexname LIKE '%voucher%';
