-- Check the order that used the referral code
-- to see why it's not being counted

SELECT 
  id,
  referral_code_used,
  payment_status,
  is_record_deleted,
  discount_referal,
  price,
  created_at
FROM orders
WHERE referral_code_used = 'RESTATI02O'
ORDER BY created_at DESC;

-- This will show:
-- 1. If payment_status is 'Dibayar' or something else
-- 2. If is_record_deleted is true or false
-- 3. The discount_referal amount
