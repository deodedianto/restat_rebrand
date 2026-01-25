-- Check the is_record_deleted status of the order
SELECT 
  id,
  referral_code_used,
  payment_status,
  is_record_deleted,
  discount_referal,
  price
FROM orders
WHERE id = '1a94bb46-9cc5-4c2c-8d56-97a91af48eeb';

-- If is_record_deleted is TRUE, the query won't find it
-- If is_record_deleted is NULL, the query also won't find it (because we check = false)
