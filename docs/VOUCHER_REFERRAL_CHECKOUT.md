# Voucher & Referral Code System - Checkout Integration

## Overview
The checkout page now supports voucher and referral code discounts. Users can apply one discount code (either voucher OR referral) to reduce their order total.

## Features

### 1. Code Types

#### Referral Codes
- **Format**: Starts with `RESTAT` (e.g., `RESTAT123456`)
- **Source**: User's referral code from their profile
- **Validation**: Checked against `users.referral_code`
- **Discount**: Based on settings in localStorage (percentage or fixed)
- **Stored in**: `orders.referral_code_used` and `orders.discount_referal`

#### Voucher Codes
- **Format**: Any code that doesn't start with `RESTAT`
- **Source**: Admin-created vouchers in `vouchers` table
- **Validation**: Multiple checks (validity, usage limits, minimum order)
- **Discount**: Based on voucher configuration (percentage or fixed)
- **Stored in**: `orders.voucher_code` and `orders.discount_voucher`

### 2. Discount Rules

**Only ONE discount can be applied**:
- User must choose either voucher OR referral code
- Cannot combine both discounts
- Removing applied code allows applying a different one

### 3. Code Validation

#### Referral Code Validation
✅ Code must exist in `users` table
✅ Code must match exactly (case-insensitive)
✅ User cannot use their own referral code
❌ Invalid if code not found
❌ Invalid if user tries self-referral

#### Voucher Code Validation
✅ Code must exist in `vouchers` table
✅ Must be active (`is_active = true`)
✅ Must be within validity period
✅ Must meet minimum order amount (if set)
✅ Must not exceed usage limits
❌ Invalid if code not found
❌ Invalid if expired
❌ Invalid if usage limit reached
❌ Invalid if order below minimum

## Database Schema

### New Columns in `orders` Table

```sql
-- Referral discount tracking
referral_code_used TEXT          -- The referral code that was used
discount_referal FLOAT4           -- Discount amount from referral

-- Voucher discount tracking
voucher_code TEXT                 -- The voucher code that was used
discount_voucher FLOAT4           -- Discount amount from voucher
```

### Vouchers Table (Reference)
```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY,
  voucher_code VARCHAR(50) UNIQUE,
  description TEXT,
  discount_type VARCHAR(20),      -- 'percentage' or 'fixed'
  discount_value INTEGER,
  max_usage INTEGER,
  current_usage INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  min_order_amount INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## User Interface

### Code Input Section

Located between order summary and payment methods:

```
┌─────────────────────────────────────────────┐
│  🏷️  Kode Voucher atau Referral             │
├─────────────────────────────────────────────┤
│  [Enter code here...]       [Gunakan]       │
│  💡 Kode referral dimulai dengan RESTAT     │
└─────────────────────────────────────────────┘
```

### Applied Discount Display

When code is applied:

```
┌─────────────────────────────────────────────┐
│  ✓ Kode Referral Diterapkan          [X]    │
│  RESTAT123456 • Hemat Rp 50.000             │
└─────────────────────────────────────────────┘
```

### Order Summary Updates

Shows discount breakdown:

```
Paket Standard                  Rp 500.000
🎁 Diskon (RESTAT123456)       -Rp  50.000
─────────────────────────────────────────
Total                           Rp 450.000
```

## Discount Calculation

### Percentage Discount
```typescript
const discount = Math.floor(basePrice * (percentage / 100))
// Example: Rp 500,000 × 10% = Rp 50,000
```

### Fixed Amount Discount
```typescript
const discount = fixedAmount
// Example: Rp 50,000 (fixed)
```

### Referral Discount
Uses settings from localStorage (`restat_referral_settings`):
- **Default**: 10% percentage-based
- **Configurable**: Admin can change in Edit Data → Voucher tab

## API Integration

### Validate Referral Code
```typescript
const { data: referrer } = await supabase
  .from('users')
  .select('id, name, referral_code')
  .eq('referral_code', codeUpper)
  .single()

// Check if valid and not self-referral
if (!referrer || referrer.id === user.id) {
  // Invalid
}
```

### Validate Voucher Code
```typescript
const { data: voucher } = await supabase
  .from('vouchers')
  .select('*')
  .eq('voucher_code', codeUpper)
  .eq('is_active', true)
  .single()

// Validate expiry, limits, minimum order
```

### Save to Database
```typescript
// On payment confirmation
const updateData = {
  payment_status: 'Dibayar',
  paid_at: new Date().toISOString(),
  price: finalPrice, // Price after discount
}

if (appliedDiscount.type === 'referral') {
  updateData.referral_code_used = code
  updateData.discount_referal = amount
} else {
  updateData.voucher_code = code
  updateData.discount_voucher = amount
}

await supabase.from('orders').update(updateData)
```

### Increment Voucher Usage
```typescript
// After successful voucher application
await supabase.rpc('increment_voucher_usage', {
  voucher_code_param: voucherCode
})
```

## Error Messages

| Error | Message |
|-------|---------|
| Empty input | "Masukkan kode voucher atau referral" |
| Invalid referral | "Kode referral tidak valid" |
| Self-referral | "Tidak dapat menggunakan kode referral sendiri" |
| Invalid voucher | "Kode voucher tidak valid" |
| Not yet valid | "Voucher belum dapat digunakan" |
| Expired | "Voucher sudah kadaluarsa" |
| Below minimum | "Minimal pembelian Rp XXX" |
| Usage limit | "Voucher sudah mencapai batas penggunaan" |
| General error | "Terjadi kesalahan saat memvalidasi kode" |

## User Flow

### Applying Code
1. User enters code in input field
2. User clicks "Gunakan" button (or presses Enter)
3. System validates code:
   - Check if starts with "RESTAT" → Referral
   - Otherwise → Voucher
4. Show validation status:
   - ✅ Success: Show applied discount card
   - ❌ Error: Show error message below input
5. Update order summary with discount
6. Calculate final price

### Removing Code
1. User clicks X button on applied discount card
2. Discount is removed
3. Input field resets
4. Order summary returns to original price
5. User can apply different code

### Completing Order
1. User confirms payment
2. System updates order with:
   - Final discounted price
   - Discount type and amount
   - Code that was used
3. If voucher: Increment usage count
4. Redirect to dashboard

## Admin Features

### View Discount Usage

**Admin Dashboard → Edit Data → Order**

Order table shows:
- `referral_code_used`: Which referral code was used
- `discount_referal`: Amount of referral discount
- `voucher_code`: Which voucher code was used
- `discount_voucher`: Amount of voucher discount

### Configure Referral Rewards

**Admin Dashboard → Edit Data → Voucher → Pengaturan Reward Referal**

Admin can set:
- Discount type: Percentage or Fixed
- Discount value: Amount or percentage

### Manage Vouchers

**Admin Dashboard → Edit Data → Voucher → Data Voucher**

Admin can:
- Create new vouchers
- Set expiry dates
- Set usage limits
- Set minimum order amounts
- View usage statistics
- Deactivate vouchers

## SQL Setup

Run the following script in Supabase SQL Editor:

```sql
-- File: /docs/ADD_DISCOUNT_COLUMNS.sql
-- This adds the required columns and functions
```

**Steps**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy content from `ADD_DISCOUNT_COLUMNS.sql`
4. Execute the script
5. Verify columns and functions were created

## Testing Checklist

### Referral Code
- [ ] Valid referral code applies discount correctly
- [ ] Invalid code shows error
- [ ] User's own code shows self-referral error
- [ ] Discount amount matches settings
- [ ] Order summary updates correctly
- [ ] Database saves referral_code_used and discount_referal

### Voucher Code
- [ ] Valid voucher applies discount correctly
- [ ] Invalid code shows error
- [ ] Expired voucher shows expiry error
- [ ] Usage limit is enforced
- [ ] Minimum order amount is checked
- [ ] Database saves voucher_code and discount_voucher
- [ ] Usage count increments after payment

### UI/UX
- [ ] Only one discount can be applied at a time
- [ ] Removing discount works correctly
- [ ] Error messages are clear and helpful
- [ ] Applied discount shows correct amount
- [ ] Final price calculates correctly
- [ ] Discount persists through page refresh (if pending order exists)

### Edge Cases
- [ ] Empty input shows appropriate error
- [ ] Code with spaces (trimmed correctly)
- [ ] Case-insensitive matching works
- [ ] Enter key submits code
- [ ] Loading state during validation
- [ ] Network errors handled gracefully

## Benefits

### For Users
✅ Save money with vouchers and referrals
✅ Easy code application
✅ Clear discount visibility
✅ One-click code removal

### For Business
✅ Track referral effectiveness
✅ Monitor voucher ROI
✅ Control discount distribution
✅ Prevent abuse with validation

### For Admins
✅ Full discount reporting
✅ Flexible voucher management
✅ Real-time usage tracking
✅ Easy reward configuration

## Future Enhancements

1. **Auto-apply Referral Code**
   - If user came via referral link, auto-fill code

2. **Code Suggestions**
   - Show available active vouchers to user

3. **Stacking Rules**
   - Allow specific voucher + referral combinations

4. **Discount History**
   - Show user their past applied discounts

5. **Expiry Notifications**
   - Notify when user's referral benefits will expire

6. **Loyalty Rewards**
   - Generate vouchers based on past orders

## Related Files

- `/app/checkout/page.tsx` - Checkout page with code input
- `/lib/supabase/types.ts` - Database type definitions
- `/lib/hooks/use-referral-settings.ts` - Referral settings hook
- `/docs/ADD_DISCOUNT_COLUMNS.sql` - Database setup script
- `/docs/CREATE_VOUCHERS_TABLE.sql` - Vouchers table creation
- `/docs/REFERRAL_REWARD_SETTINGS.md` - Referral system docs
- `/docs/VOUCHER_FEATURE.md` - Voucher system docs
