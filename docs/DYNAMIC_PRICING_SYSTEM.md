# Dynamic Pricing System Documentation

## Overview
The order page now dynamically fetches analysis types and pricing from the `analysis_prices` table in Supabase, replacing the previous hardcoded data.

## Changes Made

### 1. New Custom Hook: `useAnalysisPrices`
**File**: `/lib/hooks/use-analysis-prices.ts`

This hook handles:
- Fetching all active analysis prices from Supabase
- Grouping data by analysis name to create unique analysis methods
- Extracting package pricing (Basic, Standard, Premium)
- Real-time updates via Supabase subscriptions
- Error handling and loading states

**Features**:
- 📊 Dynamically loads analysis types and prices
- 🔄 Real-time synchronization with Supabase
- ⚡ Automatic price updates when admin changes data
- 🛡️ Error handling with fallback UI
- 💰 Minimum price calculation per analysis type

### 2. Updated Order Page
**File**: `/app/order/page.tsx`

**Changes**:
- Replaced static `analysisMethods` and `pricingPackages` imports
- Integrated `useAnalysisPrices` hook
- Added loading state for price data
- Added error handling for failed price loads
- Dynamic "Mulai dari" pricing based on actual data

### 3. Data Flow

```
Supabase analysis_prices table
          ↓
  useAnalysisPrices hook
          ↓
    ┌─────────┴─────────┐
    ↓                   ↓
analysisMethods    pricingPackages
    ↓                   ↓
Order Page UI
```

## Database Structure

### analysis_prices Table
Expected columns:
- `id` (UUID)
- `name` (VARCHAR) - Analysis name (e.g., "Regresi Linear", "ANOVA")
- `package` (VARCHAR) - Package type: "Basic", "Standard", or "Premium"
- `price` (INTEGER) - Price in Rupiah
- `is_active` (BOOLEAN) - Whether the price is active
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Example Data
```sql
-- Basic package for different analyses
INSERT INTO analysis_prices (name, package, price, is_active) VALUES
('Regresi Linear', 'Basic', 250000, true),
('Regresi Linear', 'Standard', 500000, true),
('Regresi Linear', 'Premium', 700000, true),
('ANOVA', 'Basic', 250000, true),
('ANOVA', 'Standard', 500000, true),
('ANOVA', 'Premium', 700000, true);
```

## How It Works

### 1. Analysis Methods Generation
The hook fetches all active prices and groups by `name`:
- Each unique `name` becomes an analysis method
- The minimum price across all packages is calculated
- Methods are displayed with their minimum price

### 2. Pricing Packages Generation
The hook identifies unique package types:
- Extracts "Basic", "Standard", "Premium" packages
- Takes the first price found for each package type as reference
- Adds predefined descriptions and features

### 3. Real-time Updates
Supabase subscription automatically reloads prices when:
- Admin adds new analysis prices
- Admin updates existing prices
- Admin changes `is_active` status
- Any INSERT, UPDATE, or DELETE on `analysis_prices`

## User Experience

### Before (Static)
- Hardcoded list of 12 analysis methods
- Fixed prices: Rp 250,000 / 500,000 / 700,000
- No flexibility to add new analyses
- Required code deployment to update prices

### After (Dynamic)
- Analysis list from Supabase
- Prices reflect actual database values
- Admins can add new analyses via admin panel
- Price updates are instant (real-time)
- No code deployment needed for price changes

## UI States

### Loading State
```
┌─────────────────────────────┐
│     ⏳ Memuat...            │
│  Memuat daftar analisis...  │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│ ❌ Gagal memuat daftar analisis.   │
│ Silakan muat ulang halaman.         │
│                                     │
│        [Muat Ulang]                 │
└─────────────────────────────────────┘
```

### Success State
- Analysis cards displayed with icons
- Each card shows: Name + "Mulai dari Rp XXX"
- "Lainnya" card for custom analysis
- "Masih bingung?" card for consultation

## Package Configuration

Package descriptions and features are still defined in the hook:

```typescript
const packageConfig = {
  Basic: {
    description: "Untuk kebutuhan analisis sederhana",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi"],
  },
  Standard: {
    description: "Untuk analisis yang lebih lengkap",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi", "Gratis Revisi", "Analisis Deskriptif"],
  },
  Premium: {
    description: "Solusi lengkap sampai lulus",
    features: [
      "Olah Data",
      "Interpretasi Hasil",
      "Gratis Konsultasi",
      "Gratis Revisi",
      "Analisis Deskriptif",
      "Bimbingan Sampai Lulus",
      "Interpretasi Bab 4 & 5",
    ],
  },
}
```

**Why?** Features are UI/marketing content that don't change frequently. Keeping them in code:
- Simplifies database structure
- Maintains consistency across all analyses
- Easier to update in one place

## Admin Integration

### Adding New Analysis
1. Admin goes to: **Admin Dashboard → Edit Data → Harga Analisis**
2. Clicks **"Tambahkan Harga Analisis"**
3. Fills form:
   - **Nama Analisis**: e.g., "Regresi Poisson"
   - **Jenis Paket**: Basic/Standard/Premium
   - **Harga**: e.g., 300000
4. Saves
5. **Result**: New analysis immediately appears on order page!

### Updating Prices
1. Admin edits existing price in **Harga Analisis** table
2. Changes the price value
3. Saves
4. **Result**: All users see updated price instantly (real-time)

### Deactivating Analysis
1. Admin deletes (soft delete) analysis price
2. Sets `is_active = false`
3. **Result**: Analysis no longer appears on order page

## Benefits

### For Users
✅ Always see current, accurate pricing
✅ New analysis options available immediately
✅ No confusion from outdated prices

### For Admins
✅ Update prices anytime via dashboard
✅ Add new analyses without developer
✅ Instant changes, no deployment wait
✅ Control via familiar admin interface

### For Developers
✅ Single source of truth (database)
✅ No hardcoded pricing logic
✅ Easier to maintain
✅ Automatic synchronization

## Migration Notes

### Backward Compatibility
The old exports from `order-context.tsx` are still available:
```typescript
export const analysisMethods: AnalysisMethod[]
export const pricingPackages: PricingPackage[]
```

These are kept for any other parts of the app that might reference them, but the order page now uses the dynamic hook.

### Data Types
The `AnalysisMethod` and `PricingPackage` interfaces remain the same with one addition:
- `AnalysisMethod` now includes `minPrice` field

## Testing Checklist

- [ ] Order page loads without errors
- [ ] All analyses from database are displayed
- [ ] Prices match database values
- [ ] Package selection works correctly
- [ ] Error state shows if database is unreachable
- [ ] Loading state appears during fetch
- [ ] Real-time updates work (test by changing price in admin)
- [ ] Order submission includes correct analysis and package info

## Troubleshooting

### Issue: No Analyses Showing
**Cause**: No active prices in database
**Solution**: Ensure `analysis_prices` table has rows with `is_active = true`

### Issue: Wrong Prices Displayed
**Cause**: Cache or stale data
**Solution**: Refresh page or check database values

### Issue: "Gagal memuat" Error
**Cause**: Database connection issue or RLS policies
**Solution**: 
1. Check RLS policies on `analysis_prices` table
2. Ensure authenticated users can SELECT
3. Check network/Supabase connection

### Issue: Price Not Updating in Real-time
**Cause**: Supabase subscription not connected
**Solution**: Check browser console for subscription errors

## Future Enhancements

1. **Per-Analysis Package Pricing**
   - Different packages can have different prices per analysis
   - Currently uses first package price found

2. **Cached Pricing**
   - Add client-side caching to reduce database queries
   - Refresh only on subscription updates

3. **Price History**
   - Track price changes over time
   - Show users when prices last changed

4. **Dynamic Features**
   - Store package features in database
   - Allow customization per package

5. **Promotional Pricing**
   - Add discount/promotion fields
   - Display special offers on order page

## Related Files

- `/lib/hooks/use-analysis-prices.ts` - Main hook
- `/app/order/page.tsx` - Order page UI
- `/lib/order-context.tsx` - Order state management
- `/components/admin/edit-data/harga-analisis-table.tsx` - Admin interface for prices
- `/lib/supabase/types.ts` - Database type definitions
