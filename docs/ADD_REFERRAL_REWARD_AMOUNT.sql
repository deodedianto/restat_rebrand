-- Add referral_reward_amount column to orders table
-- This stores the reward amount for the referrer (person who shared the code)

-- Add the column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS referral_reward_amount FLOAT4 DEFAULT 0;

-- Add comment
COMMENT ON COLUMN orders.referral_reward_amount IS 'Reward amount earned by the referrer for this order';

-- Create index for faster queries when calculating total rewards
CREATE INDEX IF NOT EXISTS idx_orders_referral_code_reward 
ON orders(referral_code_used, referral_reward_amount) 
WHERE referral_code_used IS NOT NULL;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name = 'referral_reward_amount';

-- Show sample data structure
SELECT 
  id,
  referral_code_used,
  discount_referal,
  referral_reward_amount,
  payment_status
FROM orders
WHERE referral_code_used IS NOT NULL
LIMIT 5;
