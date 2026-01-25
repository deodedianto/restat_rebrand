# Referral Reward Settings Documentation

## Overview
The Referral Reward Settings feature allows admins to configure the reward amount given to users when their referral code is used by other customers. Unlike other data, these settings are stored locally in the browser's localStorage, making them instantly editable without database changes.

## Storage Method
- **Storage Type**: Browser localStorage
- **Storage Key**: `restat_referral_settings`
- **Scope**: Per browser/device (admin's browser)
- **Persistence**: Survives page refreshes, lost on browser data clear

## Why localStorage?
1. **Instant Updates**: No database queries needed
2. **Simplicity**: Single configuration value, not per-user data
3. **Flexibility**: Easy to change without migrations
4. **Performance**: No network calls to fetch settings

## Data Structure

```typescript
interface ReferralSettings {
  discountType: 'percentage' | 'fixed'
  discountValue: number
}
```

### Default Settings
```json
{
  "discountType": "percentage",
  "discountValue": 10
}
```

## Features

### 1. Discount Types

#### Percentage (%)
- **Description**: Reward is calculated as a percentage of the order total
- **Example**: If set to 10%, and order is Rp 1,000,000, reward = Rp 100,000
- **Valid Range**: 1 - 100
- **Use Case**: Variable rewards that scale with order value

#### Fixed/Nominal (Rp)
- **Description**: Fixed amount reward per order
- **Example**: If set to Rp 50,000, every order gives Rp 50,000 reward
- **Valid Range**: Any positive number
- **Use Case**: Consistent rewards regardless of order value

### 2. Admin Interface

#### Location
**Admin Dashboard → Edit Data → Voucher Tab → Pengaturan Reward Referal Table** (appears above voucher data table)

#### Display Table Features
- 📊 Table format matching other data tables
- Current discount type badge (Persentase/Nominal)
- Current reward value (formatted as % or Rp)
- Edit button in table header to modify settings
- 💡 Info note about localStorage storage above the table
- Clickable row to edit settings

#### Edit Dialog Features
- Dropdown to select discount type
- Number input for discount value
- Real-time validation
- Reset to default option
- Informative help text

### 3. How Rewards Are Calculated

The reward calculation happens in the admin dashboard when displaying "Pembayaran Program Referal":

```typescript
// Percentage type
if (settings.discountType === 'percentage') {
  reward = Math.floor(orderPrice * (settings.discountValue / 100))
}

// Fixed type
if (settings.discountType === 'fixed') {
  reward = settings.discountValue
}
```

**Conditions for Reward Payout**:
1. Order has `referral_code_used` value
2. Order `payment_status` = "Dibayar"
3. Referrer user exists in database
4. Reward calculated based on current settings

## User Interface Components

### ReferralRewardTable Component
**File**: `/components/admin/edit-data/referral-reward-table.tsx`

**Features**:
- Displays current settings in a highlighted card
- Blue-themed design to differentiate from database tables
- Loading state while fetching from localStorage
- Edit button with icon

### ReferralRewardDialog Component
**File**: `/components/admin/edit-data/referral-reward-dialog.tsx`

**Features**:
- Form to edit discount type and value
- Real-time validation
- Error messages for invalid inputs
- Reset to default button
- Save confirmation

### useReferralSettings Hook
**File**: `/lib/hooks/use-referral-settings.ts`

**API**:
```typescript
const {
  settings,        // Current settings
  updateSettings,  // Function to update settings
  resetSettings,   // Function to reset to default
  isLoading        // Loading state
} = useReferralSettings()
```

## Validation Rules

### Discount Value
1. Must be greater than 0
2. If percentage: must be ≤ 100
3. Must be a valid integer

### Discount Type
- Must be either 'percentage' or 'fixed'

## Integration Points

### 1. Admin Dashboard Stats
**File**: `/components/admin/dashboard/use-dashboard-stats.ts`

The `getReferralSettings()` function is called when calculating referral payouts:
```typescript
const settings = getReferralSettings()
// Use settings to calculate reward
```

### 2. Edit Data View
**File**: `/components/admin/edit-data/index.tsx`

The Referral Reward table is displayed inside the Voucher tab, above the voucher data table.

## Example Usage Scenarios

### Scenario 1: Percentage-based Reward
**Settings**:
- Type: Percentage
- Value: 10

**Order Details**:
- Order Total: Rp 1,500,000
- Payment Status: Dibayar
- Referral Code Used: RESTAT123456

**Result**: Referrer gets Rp 150,000 (10% of Rp 1,500,000)

### Scenario 2: Fixed Reward
**Settings**:
- Type: Fixed
- Value: 50000

**Order Details**:
- Order Total: Rp 800,000
- Payment Status: Dibayar
- Referral Code Used: RESTAT123456

**Result**: Referrer gets Rp 50,000 (fixed amount)

## Troubleshooting

### Settings Not Saving
**Issue**: Changes revert after save
**Solution**: Check browser console for localStorage errors. Ensure browser allows localStorage.

### Different Settings on Different Devices
**Issue**: Settings differ between computers
**Solution**: This is expected behavior. Each browser stores its own copy. Manually sync if needed.

### Settings Reset After Browser Clear
**Issue**: Settings return to default after clearing browser data
**Solution**: This is expected. localStorage is cleared with browser data. Note down custom values.

## Migration Notes

### If Moving to Database Later
If you decide to move these settings to Supabase in the future:

1. Create `referral_settings` table
2. Create migration script to read from localStorage
3. Update `getReferralSettings()` to fetch from Supabase
4. Add caching to minimize database calls
5. Keep localStorage as fallback

## Best Practices

1. **Document Changes**: Keep a record of reward changes for accounting
2. **Communicate**: Inform team when reward rates change
3. **Test Calculations**: Verify reward amounts after changes
4. **Backup Settings**: Note down custom values before clearing browser
5. **Consistent Timing**: Change rates at the start of a period (month/quarter)

## Security Considerations

1. **Admin Only**: Only admins can access Edit Data page
2. **Client-side Storage**: Settings are stored in admin's browser only
3. **No User Manipulation**: Users cannot see or modify these settings
4. **Calculation Server-side**: While settings are client-side, actual reward tracking happens server-side

## Future Enhancements

1. **History Tracking**: Log all reward rate changes
2. **Scheduled Changes**: Set future effective dates for rate changes
3. **A/B Testing**: Different rates for different user segments
4. **Analytics**: Impact analysis of reward rate changes
5. **Sync Across Devices**: Store in database with local caching
6. **Tiered Rewards**: Different rates based on order value ranges
