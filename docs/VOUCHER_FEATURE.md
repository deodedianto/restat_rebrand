# Voucher System Documentation

## Overview
The voucher system allows admins to create and manage discount codes that users can apply to their orders. The system supports both percentage-based and fixed-amount discounts.

## Database Schema

### Vouchers Table
```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  max_usage INTEGER DEFAULT NULL,
  current_usage INTEGER DEFAULT 0,
  valid_from DATE DEFAULT NULL,
  valid_until DATE DEFAULT NULL,
  min_order_amount INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table Extensions
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
```

## Features

### 1. Discount Types
- **Percentage**: Discount value represents percentage (1-100)
  - Example: `discount_value = 10` means 10% off
- **Fixed**: Discount value represents amount in Rupiah
  - Example: `discount_value = 50000` means Rp 50,000 off

### 2. Usage Limits
- `max_usage`: Maximum number of times the voucher can be used
  - `NULL` or `0` = unlimited usage
- `current_usage`: Tracks how many times the voucher has been used

### 3. Validity Period
- `valid_from`: Start date (optional)
- `valid_until`: End date (optional)
- Both fields are optional; if not set, voucher is always valid (if active)

### 4. Minimum Order Amount
- `min_order_amount`: Minimum order value required to use the voucher
- Optional field; if not set, no minimum is required

### 5. Active Status
- `is_active`: Boolean flag to enable/disable vouchers
- Inactive vouchers cannot be used even if within validity period

## Admin Interface

### Location
Admin Dashboard → Edit Data → Voucher Tab (positioned after "Pengeluaran")

### Features
1. **View Vouchers**: Table displaying all vouchers with:
   - Voucher code (clickable to edit)
   - Description
   - Discount type badge (Persentase/Nominal)
   - Discount value (formatted as % or Rp)
   - Usage count (current/max or "Unlimited")
   - Valid until date
   - Active status badge

2. **Add Voucher**: Form fields:
   - Kode Voucher (uppercase, alphanumeric)
   - Deskripsi (optional)
   - Jenis Diskon (dropdown: Persentase/Nominal)
   - Nilai Diskon (number, validated based on type)
   - Batas Penggunaan (0 = unlimited)
   - Min. Order (Rp)
   - Berlaku Dari (date)
   - Berlaku Sampai (date)
   - Voucher Aktif (checkbox)

3. **Edit Voucher**: Same form as add, pre-filled with existing data

4. **Delete Voucher**: Soft delete (sets `is_active = false`)

## Validation Rules

### Voucher Code
- Required
- 3-50 characters
- Only uppercase letters and numbers
- Automatically converted to uppercase

### Discount Type
- Required
- Must be either "percentage" or "fixed"

### Discount Value
- Required
- Must be positive integer
- If percentage: must be between 1-100
- If fixed: any positive amount

### Validity Dates
- Optional
- If both provided, `valid_until` must be >= `valid_from`

### Usage Limits
- Optional
- If provided, must be positive integer
- 0 or NULL = unlimited

### Minimum Order Amount
- Optional
- If provided, must be >= 0

## Row Level Security (RLS)

### Policies
1. **SELECT**: Authenticated users can view active vouchers
2. **INSERT**: Only admins can create vouchers
3. **UPDATE**: Only admins can update vouchers
4. **DELETE**: Only admins can delete vouchers (soft delete)

## Implementation Files

### Backend
- `/docs/CREATE_VOUCHERS_TABLE.sql` - Database schema and RLS policies
- `/lib/supabase/types.ts` - TypeScript type definitions

### Frontend
- `/lib/validation/admin-schemas.ts` - Zod validation schema
- `/components/admin/edit-data/voucher-table.tsx` - Voucher table component
- `/components/admin/edit-data/use-edit-data.ts` - Data management hook
- `/components/admin/edit-data/index.tsx` - Main edit data view
- `/components/admin/edit-data/shared/edit-dialog.tsx` - Edit/Add dialog

## Usage Example

### Creating a Voucher
```typescript
{
  voucherCode: "WELCOME10",
  description: "Diskon 10% untuk pelanggan baru",
  discountType: "percentage",
  discountValue: 10,
  maxUsage: 100,
  validUntil: "2026-12-31",
  minOrderAmount: 100000,
  isActive: true
}
```

### Applying a Voucher (Future Implementation)
When a user applies a voucher:
1. Validate voucher exists and is active
2. Check validity dates
3. Check usage limits
4. Check minimum order amount
5. Calculate discount based on type
6. Update `orders.voucher_code` and `orders.discount_amount`
7. Increment `vouchers.current_usage`

## Real-time Updates
The admin interface uses Supabase real-time subscriptions to automatically update the voucher list when:
- New vouchers are added
- Existing vouchers are updated
- Vouchers are deleted (deactivated)

## Sample Data
The SQL script includes 3 sample vouchers:
1. `WELCOME10` - 10% discount for new customers
2. `PROMO50K` - Rp 50,000 off for orders above Rp 500,000
3. `NEWYEAR2026` - 15% New Year discount

## Future Enhancements
1. User-facing voucher application in checkout
2. Voucher usage history/analytics
3. User-specific vouchers
4. Category-specific vouchers
5. Automatic voucher expiration notifications
6. Bulk voucher generation
7. Referral-based vouchers
