# Work Status "Diproses" Update

## Overview

Changed the work status value from `"Progress"` to `"Diproses"` (Indonesian) and implemented smart auto-update logic that only changes status to "Diproses" when BOTH conditions are met:
1. User has paid (`paymentStatus = "Dibayar"`)
2. Admin has assigned an analyst (`analyst != null/"-"/empty`)

## Changes Summary

### 1. Status Value Change
**Old:** `"Progress"`  
**New:** `"Diproses"`

### 2. Auto-Update Logic Change

**Old Behavior:**
- User pays → `workStatus` automatically changes to "Progress"
- Happens even if no analyst is assigned

**New Behavior:**
- User pays → `workStatus` stays "Menunggu" 
- Admin assigns analyst (to paid order) → `workStatus` automatically changes to "Diproses"
- Only when BOTH conditions met → Status becomes "Diproses"

## Status Values

### Status Pengerjaan (Work Status)
1. **`"Menunggu"`** - Waiting (Yellow badge)
   - Default when order is created
   - Stays until both paid AND analyst assigned
2. **`"Diproses"`** - Being Processed (Blue badge)
   - Auto-set when: paid + analyst assigned
3. **`"Selesai"`** - Completed (Green badge)
   - Manually set by admin when work is done

### Status Pembayaran (Payment Status)
1. **`"Belum Dibayar"`** - Not Paid (Red badge)
2. **`"Dibayar"`** - Paid (Green badge)

## Updated Logic Flow

### Scenario 1: User Creates Order
```
Order Created
    ↓
paymentStatus: "Belum Dibayar"
workStatus: "Menunggu"
analyst: "-"
```

### Scenario 2: User Pays (No Analyst Yet)
```
User Pays
    ↓
paymentStatus: "Dibayar"
workStatus: "Menunggu"  ← Stays "Menunggu"!
analyst: "-"
```

### Scenario 3: Admin Assigns Analyst (Already Paid)
```
Admin Assigns Analyst
    ↓
paymentStatus: "Dibayar"
workStatus: "Diproses"  ← Auto-updated!
analyst: "Lukman"
```

### Scenario 4: Admin Assigns Analyst (Not Paid Yet)
```
Admin Assigns Analyst
    ↓
paymentStatus: "Belum Dibayar"
workStatus: "Menunggu"  ← Stays "Menunggu"
analyst: "Lukman"
    ↓
User Pays Later
    ↓
paymentStatus: "Dibayar"
workStatus: "Diproses"  ← Auto-updated!
analyst: "Lukman"
```

## Files Modified

### 1. `lib/utils/order-sync.ts`
**Changes:**
- Updated `AdminOrder` interface: `workStatus: "Selesai" | "Diproses" | "Menunggu"`
- Modified `workHistoryToAdminOrder()`: Always starts as "Menunggu", no auto-update
- Updated `updateOrderPaymentStatus()`: Only changes to "Diproses" if analyst assigned
- Added `updateOrderAnalyst()`: New function to handle analyst assignment with auto-update

**Key Functions:**
```typescript
// When user pays
export function updateOrderPaymentStatus(orderId, status) {
  if (status === "Dibayar") {
    const hasAnalyst = order.analyst && order.analyst !== "-" && order.analyst.trim() !== ""
    if (hasAnalyst) {
      order.workStatus = "Diproses"  // Only if analyst exists
    }
    // Otherwise stays "Menunggu"
  }
}

// When admin assigns analyst (new function)
export function updateOrderAnalyst(orderId, analyst, analystFee) {
  order.analyst = analyst
  order.analystFee = analystFee
  
  const hasAnalyst = analyst && analyst !== "-" && analyst.trim() !== ""
  if (order.paymentStatus === "Dibayar" && hasAnalyst && order.workStatus === "Menunggu") {
    order.workStatus = "Diproses"  // Auto-update if paid
  }
}
```

### 2. `components/admin/edit-data/use-edit-data.ts`
**Changes:**
- Updated sample data: Changed "Progress" to "Diproses"
- Modified `handleSaveEdit()`: Added auto-update logic when analyst is changed

**Key Logic:**
```typescript
// When editing order
const analystChanged = oldOrder && oldOrder.analyst !== editFormData.analyst
if (analystChanged) {
  const hasAnalyst = editFormData.analyst && editFormData.analyst !== "-" && editFormData.analyst.trim() !== ""
  if (editFormData.paymentStatus === "Dibayar" && hasAnalyst && editFormData.workStatus === "Menunggu") {
    finalFormData.workStatus = "Diproses"  // Auto-update
  }
}
```

### 3. `components/admin/edit-data/shared/edit-dialog.tsx`
**Changes:**
- Updated dropdown option: `<option value="Diproses">Diproses</option>`

### 4. `components/admin/edit-data/order-table.tsx`
**Changes:**
- Updated badge logic: `order.workStatus === "Diproses" && "bg-blue-100 text-blue-800"`

### 5. `docs/ORDER_SYNC_SYSTEM.md`
**Changes:**
- Updated data mapping documentation
- Updated workflow descriptions
- Updated test scenarios

## Benefits

✅ **More Accurate Status** - "Menunggu" truly means waiting (for payment OR analyst)  
✅ **Better Workflow** - Admin knows exactly what needs attention  
✅ **Clearer Communication** - Order isn't "being processed" until someone is actually working on it  
✅ **Indonesian Localization** - "Diproses" is more natural for Indonesian users  
✅ **Prevents Confusion** - Paid orders without analysts won't show as "being processed"  

## Status Priority in Admin Table

The default sort order still prioritizes correctly:

1. 🔴 **Unassigned + Paid + Menunggu** (HIGHEST PRIORITY)
   - Customer paid but no analyst → Needs immediate assignment
   
2. 🟡 **Unassigned + Unpaid + Menunggu**
   - No analyst, no payment → Lower priority
   
3. 🔵 **Assigned + Paid + Diproses**
   - Work in progress → Monitor progress
   
4. 🟢 **Assigned + Paid + Selesai**
   - Work completed → Archive

## Testing Checklist

- [ ] Create new order → Status should be "Menunggu"
- [ ] User pays (no analyst) → Status should stay "Menunggu"
- [ ] Admin assigns analyst to paid order → Status should auto-change to "Diproses"
- [ ] Admin assigns analyst to unpaid order → Status should stay "Menunggu"
- [ ] User pays after analyst assigned → Status should auto-change to "Diproses"
- [ ] Admin manually changes status → Should accept "Diproses" value
- [ ] Badge colors display correctly (Yellow → Blue → Green)

## Migration Notes

**Existing Data:**
- Any orders with `workStatus: "Progress"` should be manually updated to `"Diproses"` in localStorage
- Or clear localStorage and start fresh

**Database Migration (Future):**
```sql
UPDATE orders 
SET work_status = 'Diproses' 
WHERE work_status = 'Progress';
```

## Related Documentation

- `/docs/ORDER_SYNC_SYSTEM.md` - Complete order synchronization system
- `/docs/DASHBOARD_DATA_FLOW.md` - Dashboard data flow and state management
- `/lib/utils/order-sync.ts` - Core sync utility functions
- `/components/admin/edit-data/use-edit-data.ts` - Admin order management logic
