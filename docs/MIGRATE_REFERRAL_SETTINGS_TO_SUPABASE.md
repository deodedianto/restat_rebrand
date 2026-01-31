# Migrate Referral Settings from localStorage to Supabase

## Problem
Previously, referral settings were stored in **localStorage**, which is browser-specific:
- ❌ Admin sets values on their computer → only they see the changes
- ❌ Users on different devices see default values (Rp 10,000 / 10%)
- ❌ No shared configuration across the system

## Solution
Moved referral settings to **Supabase database** for global access:
- ✅ Admin changes settings → everyone sees the update
- ✅ Single source of truth
- ✅ Consistent values across all devices

## Migration Steps

### 1. Run SQL Migration in Supabase

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- File: docs/CREATE_REFERRAL_SETTINGS_TABLE.sql
```

This will:
- Create `referral_settings` table
- Insert default values (10% discount, Rp 10,000 reward)
- Set up RLS policies (anyone can read, only admins can update)

### 2. Code Changes (Already Applied)

✅ **`lib/hooks/use-referral-settings.ts`**
- Now fetches from Supabase instead of localStorage
- Falls back to localStorage if Supabase fails
- Caches to localStorage for performance

✅ **`components/admin/edit-data/referral-reward-dialog.tsx`**
- Updated to handle async save operations
- Shows loading state during save
- Properly waits for Supabase response

## How to Update Settings

### Admin Side:
1. Go to **Admin Dashboard → Edit Data → Voucher**
2. Find **"Pengaturan Reward Referal"** table
3. Click **Edit** button
4. Set your desired values:
   - **Referred User**: Discount for person using the code (e.g., 5%)
   - **Referrer**: Reward for person who shared code (e.g., Rp 50,000)
5. Click **Simpan Perubahan**
6. Settings are now saved to **Supabase** ✅

### User Side:
- User dashboard automatically loads latest settings from Supabase
- Scorecards display real-time values
- No manual refresh needed

## Verification

After running the SQL migration:

1. **Check in Supabase**:
   - Go to Table Editor → `referral_settings`
   - Should see one row with id=1
   
2. **Update in Admin**:
   - Change values (e.g., Rp 50,000, 5%)
   - Click Save
   
3. **Verify in User Dashboard**:
   - Open dashboard (can use different browser/incognito)
   - Check scorecards show updated values
   - Per Referral: Rp 50,000 ✅
   - Diskon Teman: 5% ✅

## Rollback (if needed)

If you need to revert:

```sql
DROP TABLE IF EXISTS referral_settings CASCADE;
```

Then the system will fallback to localStorage behavior.

## Data Flow

```
┌─────────────────┐
│  Admin Updates  │
│   via Dialog    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Supabase: referral_settings    │
│  (id=1, single row)             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  All Users/Dashboards           │
│  Read from same table           │
│  See updated values instantly   │
└─────────────────────────────────┘
```

## Current Default Values
After migration, these are the defaults:
- **Discount for Referred User**: 10% (percentage)
- **Reward for Referrer**: Rp 10,000 (fixed amount)

Admin can change these anytime via the Edit dialog.
