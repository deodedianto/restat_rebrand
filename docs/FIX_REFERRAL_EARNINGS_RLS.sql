-- Fix RLS to allow users to see orders that used their referral code
-- This is needed to calculate referral earnings

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new SELECT policy that allows:
-- 1. Users to see their own orders
-- 2. Users to see orders that used their referral code (for earnings calculation)
CREATE POLICY "Users can view their own orders and referral orders"
ON orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  referral_code_used IN (
    SELECT referral_code 
    FROM users 
    WHERE id = auth.uid() 
    AND referral_code IS NOT NULL
  )
);

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  permissive,
  qual
FROM pg_policies
WHERE tablename = 'orders' AND cmd = 'SELECT';
