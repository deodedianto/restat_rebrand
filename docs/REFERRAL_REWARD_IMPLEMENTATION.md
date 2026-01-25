# Referral Reward System Implementation

## Overview
The referral system now supports **separate configurations** for:
1. **Discount for Referred User** (person using the code) - reduces their order price
2. **Reward for Referrer** (person who shared the code) - earns money when their code is used

## Database Changes

### New Column: `referral_reward_amount`
Added to the `orders` table to store the reward earned by the referrer for each order.

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS referral_reward_amount FLOAT4 DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_referral_code_reward 
ON orders(referral_code_used, referral_reward_amount) 
WHERE referral_code_used IS NOT NULL;
```

**See**: `/docs/ADD_REFERRAL_REWARD_AMOUNT.sql` for the complete script.

## Admin Dashboard Changes

### 1. Referral Reward Settings Table
Located in: **Admin Dashboard → Edit Data → Voucher → Pengaturan Reward Referal**

The settings table now shows TWO rows:
- **Referred User**: Discount configuration (for the person using the code)
- **Referrer**: Reward configuration (for the person who shared the code)

### 2. Edit Dialog
The dialog has two sections:

**Section 1: Diskon untuk Referred User**
- Jenis Diskon: Persentase (%) or Nominal (Rp)
- Nilai: The discount amount/percentage

**Section 2: Reward untuk Referrer**
- Jenis Reward: Persentase (%) or Nominal (Rp)
- Nilai: The reward amount/percentage

### Example Configuration:
- **Referred User**: 10% discount (they save 10% on their order)
- **Referrer**: Rp 10,000 fixed reward (referrer earns Rp 10,000 per paid order)

## How It Works

### 1. At Checkout (when code is applied)
```
Order Price: Rp 850,000
Referral Code: RESTATI02O

Calculate:
- Discount for user = 10% × 850,000 = Rp 85,000
- Reward for referrer = Rp 10,000 (fixed)

User pays: Rp 850,000 - 85,000 = Rp 765,000
Order saved with:
  - discount_referal: 85000
  - referral_reward_amount: 10000
```

### 2. In User Dashboard
The referrer sees their **Total Reward** in two places:
- **Quick Actions card**: "Reward Referral" - Rp X
- **Referral Program section**: "Total Reward" - Rp X

The reward is calculated by:
```sql
SELECT SUM(referral_reward_amount) 
FROM orders 
WHERE referral_code_used = 'user_referral_code'
  AND payment_status = 'Dibayar'
  AND is_record_deleted = false
```

### 3. In Admin Dashboard
**Pembayaran Program Referal** section shows:
- Referrer name
- Total reward earned (sum of `referral_reward_amount`)
- Can be filtered by month

## Files Modified

### Database & Types
- `/lib/supabase/types.ts` - Added `referral_reward_amount` column
- `/docs/ADD_REFERRAL_REWARD_AMOUNT.sql` - SQL to add column

### Settings & Configuration
- `/lib/hooks/use-referral-settings.ts` - Added `rewardType` and `rewardValue`
- `/components/admin/edit-data/referral-reward-table.tsx` - Shows both settings
- `/components/admin/edit-data/referral-reward-dialog.tsx` - Edit dialog with two sections

### Checkout Flow
- `/app/checkout/page.tsx` 
  - Calculates both discount and reward amounts
  - Saves `referral_reward_amount` to order

### Dashboard
- `/app/dashboard/page.tsx` 
  - Queries and sums `referral_reward_amount`
  - Displays total earnings

## Testing Steps

1. **Set up referral rewards in admin dashboard**
   - Go to Admin → Edit Data → Voucher → Pengaturan Reward Referal
   - Click "Edit"
   - Set referred user discount (e.g., 10% or Rp 50,000)
   - Set referrer reward (e.g., Rp 10,000 or 5%)
   - Save

2. **Generate referral code as User A**
   - Login as User A
   - Go to Dashboard → Referral Program
   - Click "Generate Kode Referral" if not yet generated
   - Copy the code (e.g., RESTATI02O)

3. **Use referral code as User B**
   - Login as User B (different account)
   - Go to Order page
   - Select analysis and package
   - Click "Lanjutkan ke Checkout"
   - Enter User A's referral code
   - Click "Terapkan"
   - Verify discount is applied correctly
   - Complete the order

4. **Verify reward calculation**
   - Login as admin
   - Check the order in database - should have `referral_reward_amount` set
   - Go to Admin Dashboard → Pembayaran Program Referal
   - Verify User A appears with correct reward amount

5. **Check User A's dashboard**
   - Login as User A
   - Go to Dashboard
   - Check "Reward Referral" card - should show the reward amount
   - Check Referral Program section - should show total earnings

## RLS Policy Update

To allow users to see orders that used their referral code (needed for reward calculation):

```sql
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

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
```

**See**: `/docs/FIX_REFERRAL_EARNINGS_RLS.sql`

## Future Enhancements

- [ ] Add referral payout history tracking
- [ ] Implement automatic payout requests when threshold is reached
- [ ] Add referral code usage analytics (# of uses, conversion rate, etc.)
- [ ] Support tiered rewards (more referrals = higher rewards)
- [ ] Add expiration dates for referral codes
- [ ] Track referral code source (where it was shared)
