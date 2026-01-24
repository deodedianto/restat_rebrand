# Order Synchronization System

## Overview

The Order Synchronization System connects the user dashboard's "Riwayat Pengerjaan" table with the admin dashboard's "Order" table. When users create orders (paid or unpaid), they automatically appear in the admin dashboard for management.

## Architecture

### Data Flow

```
User Creates Order (Order Page)
    ↓
Saved to User's Work History (localStorage: work_history_{userId})
    ↓
Synced to Admin Orders (localStorage: admin_orders_all)
    ↓
Admin Dashboard Displays Order (Auto-refreshes on focus)
```

### Storage Keys

- **User Work History**: `work_history_{userId}` - Individual user's work history
- **Admin Orders**: `admin_orders_all` - Shared storage for all orders across all users
- **User Orders**: `orders_{userId}` - Legacy individual user orders (still used for order flow)

## Components

### 1. Order Sync Utility (`lib/utils/order-sync.ts`)

Central utility for syncing data between user and admin systems.

**Key Functions:**

- `getAllAdminOrders()` - Get all orders from shared storage
- `saveAllAdminOrders(orders)` - Save orders to shared storage
- `workHistoryToAdminOrder(item, userId, userName, userEmail)` - Convert work history item to admin order format
- `syncWorkHistoryToAdmin(item, userId, userName, userEmail)` - Sync single order to admin storage
- `deleteAdminOrder(orderId)` - Delete order from admin storage
- `updateOrderPaymentStatus(orderId, status)` - Update payment status

**Data Mapping:**

Work History Item → Admin Order:
- `type: "Order"` → Only these items are synced
- `orderDetails.analysisMethod.name` → `analysis`
- `orderDetails.package.name` → `package`
- `orderDetails.totalPrice` → `price`
- `status: "Belum Dibayar"` → `paymentStatus: "Belum Dibayar"`, `workStatus: "Menunggu"`
- `status: "Dibayar"` → `paymentStatus: "Dibayar"`, `workStatus: "Menunggu"` (stays until analyst assigned)
- When `analyst assigned` + `paid` → `workStatus: "Diproses"` (auto-updated)

### 2. Order Context (`lib/order-context.tsx`)

Manages order creation and payment confirmation.

**Updated Functions:**

```typescript
// Creates order and syncs to admin
createPendingPayment(userId: string, userName: string, userEmail: string): string

// Updates payment status in both user and admin storage
confirmPayment(userId: string, orderId: string): void
```

### 3. Work Progress Hook (`components/dashboard/work-progress/use-work-progress.ts`)

Manages user's work history including order deletion.

**Updated Functions:**

```typescript
// Deletes order from both user and admin storage
handleDeleteConfirm(): void
```

### 4. Admin Edit Data Hook (`components/admin/edit-data/use-edit-data.ts`)

Manages admin order table data.

**Key Changes:**

- Loads orders from shared storage on mount
- Auto-refreshes when window gains focus
- Saves changes back to shared storage
- If no orders exist, falls back to sample data

## Workflows

### 1. User Creates Order

1. User fills order form at `/order`
2. Clicks "Lanjut ke Checkout"
3. `createPendingPayment(userId, userName, userEmail)` is called
4. Order saved to:
   - User's work history: `work_history_{userId}`
   - Admin orders: `admin_orders_all`
5. Order appears in admin dashboard with:
   - Customer name and email
   - Order details (analysis, package, price)
   - Payment status: "Belum Dibayar"
   - Work status: "Menunggu"

### 2. User Pays for Order

1. User clicks "Bayar" in work history table
2. Completes checkout process
3. Clicks "Konfirmasi Pembayaran"
4. `confirmPayment(userId, orderId)` is called
5. Status updated in:
   - User's work history: `status: "Dibayar"`
   - Admin orders: `paymentStatus: "Dibayar"`, `workStatus: "Menunggu"` (or "Diproses" if analyst already assigned)

### 3. User Deletes Unpaid Order

1. User clicks delete icon in work history table
2. Confirms deletion
3. `handleDeleteConfirm()` is called
4. Order removed from:
   - User's work history
   - User's orders (`orders_{userId}`)
   - Admin orders (`admin_orders_all`)

### 4. Admin Views Orders

1. Admin opens Edit Data → Order table
2. `useEditData()` hook loads orders from shared storage
3. Orders from all users are displayed with **smart default sorting**:
   - **Priority 1**: Unassigned analyst (`analyst = "-"` or `null`) + Paid orders (oldest first)
   - **Priority 2**: Unassigned analyst + Unpaid orders (oldest first)
   - **Priority 3**: Assigned analyst + Paid orders (oldest first)
   - **Priority 4**: Assigned analyst + Unpaid orders (oldest first)
4. Table auto-refreshes when admin switches back to tab
5. Admin can click column headers to override default sort

### 5. Admin Edits Order

1. Admin clicks on order row
2. Edits fields (analyst, fee, status, etc.)
3. Saves changes
4. `handleSaveEdit()` updates shared storage
5. Changes persist across sessions

## Features

### Automatic Synchronization

- **Real-time updates**: Changes reflect immediately
- **Auto-refresh**: Admin table reloads when window gains focus
- **Bi-directional sync**: User actions update admin, admin actions persist

### Smart Default Sorting

The Order table uses an intelligent default sort to help admins prioritize their work:

**Sorting Priority (when no column is manually sorted):**

1. **🔴 Unassigned + Paid** (Highest Priority)
   - Orders with `analyst = "-"` or `null` 
   - AND `paymentStatus = "Dibayar"`
   - Sorted by date (oldest first)
   - **Action Required**: Admin needs to assign analyst

2. **🟡 Unassigned + Unpaid**
   - Orders with `analyst = "-"` or `null`
   - AND `paymentStatus = "Belum Dibayar"`
   - Sorted by date (oldest first)

3. **🟢 Assigned + Paid** (Lower Priority)
   - Orders with assigned analyst
   - AND `paymentStatus = "Dibayar"`
   - Sorted by date (oldest first)
   - **Status**: Already being processed

4. **⚪ Assigned + Unpaid** (Lowest Priority)
   - Orders with assigned analyst
   - AND `paymentStatus = "Belum Dibayar"`
   - Sorted by date (oldest first)

**Why This Order?**
- Paid orders need immediate attention (customer has paid)
- Unassigned orders block progress (no analyst to work on it)
- Oldest orders should be handled first (FIFO principle)
- Combining these creates an optimal work queue

**Manual Override:**
- Click any column header to sort by that column
- Click again to toggle ascending/descending
- Default sort resumes when all manual sorts are cleared

**Example Table View:**
```
No | Customer    | Analyst | Payment Status | Date       | Status
-----------------------------------------------------------------
5  | Alice Wong  | -       | Dibayar       | 2026-01-10 | 🔴 ASSIGN NOW
4  | Bob Chen    | -       | Dibayar       | 2026-01-12 | 🔴 ASSIGN NOW
3  | Charlie Lee | -       | Belum Dibayar | 2026-01-11 | 🟡 Waiting
2  | Diana Putra | Lukman  | Dibayar       | 2026-01-08 | 🟢 In Progress
1  | Eko Santoso | Lani    | Dibayar       | 2026-01-09 | 🟢 Completed
```

Top orders (Alice & Bob) immediately show admin what needs attention!

### Data Consistency

- **Single source of truth**: `admin_orders_all` for all orders
- **Unique order IDs**: Format `ORD-{timestamp}-{userId}`
- **Preserves admin fields**: Analyst and fee assignments survive status updates

### Filtering Rules

- **Type filter**: Only `type: "Order"` items sync to admin
- **Valid data**: Only items with `orderDetails` are processed
- **Date parsing**: Converts "DD Month YYYY" to "YYYY-MM-DD"

## Sample Data

Initial sample data is used if no orders exist in shared storage:

```typescript
const initialOrders = [
  { 
    id: "ORD-001", 
    no: 3, 
    customer: "John Doe",
    analysis: "Regresi Linear",
    package: "Premium",
    price: 700000,
    paymentStatus: "Dibayar",
    workStatus: "Selesai"
  },
  // ... more samples
]
```

## Testing

### Test User Order Creation

1. Go to `/order` as a logged-in user
2. Select analysis method and package
3. Fill in research title and description
4. Click "Lanjut ke Checkout"
5. Verify order appears in:
   - User dashboard → Proses Pengerjaan
   - Admin dashboard → Edit Data → Order table

### Test Payment Flow

1. Create an unpaid order
2. Click "Bayar" in user dashboard
3. Complete checkout
4. Click "Konfirmasi Pembayaran"
5. Verify status updates in:
   - User dashboard: "Dibayar" (green)
   - Admin dashboard: Payment Status "Dibayar", Work Status "Menunggu" (or "Diproses" if analyst assigned)

### Test Deletion

1. Create an unpaid order
2. Click delete icon in user dashboard
3. Confirm deletion
4. Verify order removed from admin dashboard

### Test Admin Edits

1. Open admin dashboard → Edit Data → Order
2. Click on any order
3. Edit analyst name or fee
4. Save changes
5. Refresh page or close/reopen tab
6. Verify changes persist

## Migration to Supabase

When migrating to Supabase, replace localStorage calls with database operations:

1. **Create Orders Table**:
```sql
CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  no INTEGER,
  user_id VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR,
  analysis VARCHAR NOT NULL,
  package VARCHAR NOT NULL,
  price INTEGER NOT NULL,
  analyst VARCHAR,
  analyst_fee INTEGER,
  work_status VARCHAR,
  payment_status VARCHAR,
  research_title TEXT,
  description TEXT,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Update Sync Functions**:
   - Replace `localStorage.getItem/setItem` with Supabase queries
   - Use real-time subscriptions for auto-updates
   - Implement row-level security (RLS) for user access

3. **Add User Relationships**:
   - Foreign key to users table
   - Query orders by `user_id` for user dashboard
   - Query all orders for admin dashboard

## Troubleshooting

### Orders Not Appearing in Admin Dashboard

**Cause**: Admin table not refreshing
**Solution**: 
- Click away and back to browser tab (triggers focus event)
- Check browser console for errors
- Verify `admin_orders_all` exists in localStorage

### Order Deleted in User Dashboard But Still in Admin

**Cause**: Delete sync not working
**Solution**:
- Check if order has `orderId` field
- Verify order `type === "Order"`
- Check browser console for errors

### Payment Status Not Updating in Admin

**Cause**: Payment confirmation not syncing
**Solution**:
- Verify `confirmPayment()` is called
- Check if order ID matches between user and admin
- Inspect `admin_orders_all` in localStorage

### Admin Changes Not Persisting

**Cause**: Changes not saved to shared storage
**Solution**:
- Verify `saveAllAdminOrders()` is called in `handleSaveEdit`
- Check browser console for errors
- Clear localStorage and test with fresh data

## Future Enhancements

1. **Real-time Sync**: Use WebSockets or Supabase real-time for instant updates
2. **Order Notifications**: Notify admin when new orders are created
3. **Status History**: Track all status changes with timestamps
4. **Bulk Operations**: Allow admin to update multiple orders at once
5. **Export Orders**: Generate reports and export to CSV/Excel
6. **Order Search**: Add advanced search/filter in admin dashboard

## Related Files

- `/lib/utils/order-sync.ts` - Sync utility functions
- `/lib/order-context.tsx` - Order creation and payment
- `/components/dashboard/work-progress/use-work-progress.ts` - User work history
- `/components/admin/edit-data/use-edit-data.ts` - Admin order management
- `/app/order/page.tsx` - Order creation page
- `/app/checkout/page.tsx` - Payment confirmation page

## Support

For issues or questions, check:
1. Browser console for error messages
2. localStorage data in DevTools → Application → Local Storage
3. Network tab for failed requests (when using Supabase)
4. This documentation for workflows and troubleshooting
