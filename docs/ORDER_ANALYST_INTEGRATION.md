# Order-Analyst Table Integration

## Overview

The Order table is now connected to the Analis (Analyst) table through a dropdown selector in the Order edit dialog. This ensures consistency in analyst names and provides a better user experience for assigning analysts to orders.

## Features

### 1. Analyst Dropdown Selector
- **Location**: Order edit dialog → "Analyst" field
- **Type**: Dropdown (select) instead of text input
- **Data Source**: Dynamically populated from Analis table

### 2. Dropdown Options
1. **"-- Pilih Analyst --"** - Default placeholder (empty value)
2. **"Belum Ditentukan"** - Unassigned status (value: `"-"`)
3. **Analyst Names** - All analysts from Analis table (e.g., "Lukman", "Lani", "Hamka")

### 3. Auto-Update Behavior
When an analyst is selected and the order is paid:
- `workStatus` automatically updates from `"Menunggu"` to `"Diproses"`
- This happens through the existing smart auto-update logic

## Implementation Details

### File Changes

#### 1. `components/admin/edit-data/shared/edit-dialog.tsx`

**Added:**
- `analis?: any[]` prop to interface
- Dropdown selector for analyst field
- Validation error display for analyst field

**Before:**
```typescript
<Input
  id="edit-analyst"
  value={editFormData.analyst || ""}
  onChange={(e) => setEditFormData({ ...editFormData, analyst: e.target.value })}
/>
```

**After:**
```typescript
<select
  id="edit-analyst"
  value={editFormData.analyst || ""}
  onChange={(e) => {
    const selectedAnalyst = e.target.value
    setEditFormData({ 
      ...editFormData, 
      analyst: selectedAnalyst
    })
  }}
  className="w-full h-10 px-3 rounded-md border border-input bg-background"
>
  <option value="">-- Pilih Analyst --</option>
  <option value="-">Belum Ditentukan</option>
  {analis.map((analyst) => (
    <option key={analyst.id} value={analyst.name}>
      {analyst.name}
    </option>
  ))}
</select>
```

#### 2. `components/admin/edit-data/index.tsx`

**Changed:**
- Passed `analis` data to `EditDialog` component

```typescript
<EditDialog
  // ... other props
  analis={analis}
/>
```

#### 3. `components/admin/edit-data/use-edit-data.ts`

**Enhanced:**
- Added third analyst to sample data (Hamka)
- Provides more realistic dropdown experience

## Usage

### Adding/Editing an Order

1. **Open Order Edit Dialog**
   - Click on an order row OR
   - Click "Tambahkan Order" button

2. **Select Analyst**
   - Click on "Analyst" dropdown
   - See list of available analysts
   - Select analyst name OR
   - Select "Belum Ditentukan" if not yet assigned

3. **Auto-Update Behavior**
   - If order is paid + analyst selected → Status changes to "Diproses"
   - If order is unpaid → Status stays "Menunggu"

### Adding a New Analyst

1. Go to "Analis" tab
2. Click "Tambahkan Analis"
3. Fill in analyst details
4. Save

**Result:** New analyst immediately appears in Order dropdown! 🎯

## Data Flow

```
Analis Table
    ↓
[Lukman, Lani, Hamka]
    ↓
EditDialog (analis prop)
    ↓
Analyst Dropdown
    ↓
User Selects "Lukman"
    ↓
editFormData.analyst = "Lukman"
    ↓
(If paid) workStatus = "Diproses"
    ↓
Order Saved to Database
```

## Benefits

### 1. Data Consistency ✅
- No typos in analyst names
- All orders use exact names from Analis table
- Easy to filter/search by analyst

### 2. Better UX ✅
- Dropdown is faster than typing
- See all available analysts at a glance
- Clear "unassigned" option

### 3. Real-time Sync ✅
- Add new analyst → immediately available in dropdown
- Edit analyst name → all future orders use new name
- Delete analyst → need to handle separately (TBD)

### 4. Integration Ready ✅
- When migrating to Supabase:
  - Add foreign key: `orders.analyst_id → analis.id`
  - Dropdown uses `analyst.id` as value
  - Display `analyst.name` as label

## Sample Data

### Current Analysts (Initial Data)
```typescript
[
  { 
    id: "1", 
    name: "Lukman", 
    whatsapp: "+62812345678", 
    bankName: "BCA", 
    bankAccountNumber: "1234567890" 
  },
  { 
    id: "2", 
    name: "Lani", 
    whatsapp: "+62823456789", 
    bankName: "Mandiri", 
    bankAccountNumber: "0987654321" 
  },
  { 
    id: "3", 
    name: "Hamka", 
    whatsapp: "+62834567890", 
    bankName: "BNI", 
    bankAccountNumber: "1122334455" 
  }
]
```

### Dropdown Display
```
-- Pilih Analyst --
Belum Ditentukan
Lukman
Lani
Hamka
```

## Validation

The analyst field still uses the existing validation:
- **Schema**: `textSchema(2, 100, "Analyst name")`
- **Min Length**: 2 characters
- **Max Length**: 100 characters
- **Error Display**: Red border + error message below dropdown

## Future Enhancements

### 1. Analyst Availability Status
```typescript
{ 
  id: "1", 
  name: "Lukman", 
  status: "available" | "busy" | "inactive",
  currentLoad: 5, // Number of active orders
  maxLoad: 10 // Maximum concurrent orders
}
```

Display in dropdown:
```
Lukman (5/10 orders) ✓
Lani (8/10 orders) ⚠️
Hamka (0/10 orders) ✓✓
```

### 2. Workload Distribution
- Show how many orders each analyst currently has
- Highlight analysts with available capacity
- Warn when assigning to overloaded analysts

### 3. Analyst Specialization
```typescript
{ 
  id: "1", 
  name: "Lukman",
  specializations: ["Regresi Linear", "ANOVA", "SEM"]
}
```

- Filter analysts by analysis type
- Only show analysts who can handle the selected analysis

### 4. Smart Assignment Suggestions
```typescript
// Suggest best analyst based on:
- Current workload
- Specialization match
- Past performance
- Availability
```

### 5. Analyst Fee Integration
```typescript
{ 
  id: "1", 
  name: "Lukman",
  defaultFees: {
    "Basic": 125000,
    "Standard": 250000,
    "Premium": 350000
  }
}
```

**Current Implementation:**
```typescript
onChange={(e) => {
  const selectedAnalyst = e.target.value
  const analystData = analis.find(a => a.name === selectedAnalyst)
  setEditFormData({ 
    ...editFormData, 
    analyst: selectedAnalyst,
    // Pre-fill analyst fee if available
    analystFee: analystData?.defaultFee || editFormData.analystFee || 0
  })
}}
```

Note: Currently commented out as Analis table doesn't have defaultFee field yet.

## Migration to Supabase

### 1. Update Schema
```sql
-- Add analyst_id foreign key to orders
ALTER TABLE orders 
ADD COLUMN analyst_id UUID REFERENCES analis(id);

-- Add index for faster lookups
CREATE INDEX idx_orders_analyst_id ON orders(analyst_id);
```

### 2. Update Dropdown
```typescript
<select
  value={editFormData.analyst_id || ""}
  onChange={(e) => setEditFormData({ 
    ...editFormData, 
    analyst_id: e.target.value 
  })}
>
  <option value="">-- Pilih Analyst --</option>
  <option value="unassigned">Belum Ditentukan</option>
  {analis.map((analyst) => (
    <option key={analyst.id} value={analyst.id}>
      {analyst.name}
    </option>
  ))}
</select>
```

### 3. Query with Join
```typescript
// Fetch orders with analyst details
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    analis:analyst_id (
      id,
      name,
      whatsapp,
      bank_name,
      bank_account_number
    )
  `)
```

## Testing Checklist

- [ ] Dropdown shows all analysts from Analis table
- [ ] "-- Pilih Analyst --" is default when creating new order
- [ ] "Belum Ditentukan" option works correctly
- [ ] Selecting analyst updates form data
- [ ] Validation shows error for invalid selection
- [ ] Auto-update to "Diproses" works when analyst assigned + paid
- [ ] Adding new analyst immediately shows in dropdown
- [ ] Editing analyst name updates correctly (need refresh)
- [ ] Dropdown styling matches other form fields

## Troubleshooting

### Dropdown is Empty
**Cause**: `analis` array is empty or not passed to `EditDialog`
**Solution**: 
1. Check if `analis` prop is passed in `index.tsx`
2. Verify Analis table has data
3. Check browser console for errors

### Analyst Name Shows "-" After Selection
**Cause**: Selected "Belum Ditentukan" option
**Solution**: This is intentional - it means unassigned

### Status Not Auto-Updating to "Diproses"
**Cause**: Order not paid yet OR analyst not properly assigned
**Solution**: 
1. Verify `paymentStatus === "Dibayar"`
2. Verify `analyst !== "-"` and `analyst !== ""`
3. Check if `workStatus === "Menunggu"` before assignment

### New Analyst Not Appearing in Dropdown
**Cause**: Component not re-rendering after adding analyst
**Solution**: 
- Close and reopen edit dialog
- Or switch tabs and switch back
- Will be automatic with Supabase real-time

## Related Files

- `/components/admin/edit-data/shared/edit-dialog.tsx` - Edit dialog component
- `/components/admin/edit-data/index.tsx` - Main edit data view
- `/components/admin/edit-data/use-edit-data.ts` - Data management hook
- `/components/admin/edit-data/analis-table.tsx` - Analis table component
- `/docs/ORDER_SYNC_SYSTEM.md` - Order synchronization system
- `/docs/WORKSTATUS_DIPROSES_UPDATE.md` - Work status auto-update logic

## Summary

The Order-Analyst integration provides a cleaner, more reliable way to assign analysts to orders. By using a dropdown instead of free text, we ensure data consistency and provide a better user experience. This also sets the foundation for more advanced features like workload distribution and smart assignment suggestions.

🎯 **Key Benefit**: No more typos, consistent analyst names across all orders!
