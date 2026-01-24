# Dashboard Data Flow Documentation

## Overview

This document explains how data flows through the ReStat dashboard, ensuring all scorecards and statistics are synchronized and accurate.

## Data Sources

### 1. **User Data** (from `lib/auth-context.tsx`)
```typescript
interface User {
  id: string
  name: string
  email: string
  phone: string
  referralCode: string
  referralEarnings: number    // ← Used in scorecards
  referralCount: number
}
```

### 2. **Work History Data** (from `components/dashboard/work-progress.tsx`)
```typescript
interface WorkHistoryItem {
  id: number
  type: string                // "Konsultasi" | "Pembayaran" | "Pengerjaan"
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan"
  note: string
}
```

### 3. **Order Data** (from `lib/order-context.tsx`)
```typescript
interface Order {
  id: string
  userId: string
  analysisMethod: AnalysisMethod
  package: PricingPackage
  researchTitle: string
  description: string
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: string
  totalPrice: number
}
```

## Dashboard Component Structure

```
app/dashboard/page.tsx (Main Dashboard)
├── QuickActions (4 scorecards)
│   ├── Jadwalkan Konsultasi Gratis
│   ├── Pesan Baru
│   ├── Sedang Dikerjakan ← Synchronized with WorkProgress
│   └── Poin Referral ← Synchronized with ReferralProgram
├── ProfileSettings
├── WorkProgress ← Source of truth for work history
├── ReferralProgram ← Displays referral points
└── ReviewsRating
```

## Data Synchronization

### 1. **Sedang Dikerjakan Scorecard**

**Requirement:** Count items where:
- `type === "Pengerjaan"` (actual work, not consultation or payment)
- `status === "Sedang Dikerjakan"` (currently in progress)

**Implementation:**

```typescript
// dashboard/page.tsx
const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([])

// Calculate count based on work history
const sedangDikerjakanCount = workHistory.filter(
  (item) => item.type === "Pengerjaan" && item.status === "Sedang Dikerjakan"
).length

// Pass to QuickActions
<QuickActions ordersCount={sedangDikerjakanCount} />
```

**Data Flow:**
```
WorkProgress Component
  └─> onWorkHistoryChange callback
      └─> setWorkHistory (dashboard state)
          └─> sedangDikerjakanCount calculation
              └─> QuickActions component (ordersCount prop)
                  └─> "Sedang Dikerjakan" scorecard display
```

### 2. **Poin Referral Scorecard**

**Requirement:** Display the same referral points value as shown in the ReferralProgram section.

**Implementation:**

```typescript
// dashboard/page.tsx
const { user } = useAuth()

// Both components use the same source
<QuickActions referralEarnings={user.referralEarnings || 0} />
<ReferralProgram user={user} />
```

**Data Flow:**
```
AuthContext (user.referralEarnings)
  ├─> QuickActions component
  │     └─> "Poin Referral" scorecard display
  │
  └─> ReferralProgram component
        └─> "Total Poin" card display
```

**Synchronization Guarantee:**
Both components read from the same source (`user.referralEarnings`), ensuring they always display the same value.

## Real-time Updates

### When Work History Changes

1. User edits a note in WorkProgress
2. `handleSaveNote` updates local state
3. `onWorkHistoryChange` callback fires
4. Dashboard receives updated work history
5. `sedangDikerjakanCount` recalculates automatically
6. QuickActions re-renders with new count

### When Referral Points Change

1. New user registers with referral code
2. `register()` function updates referrer's points
3. User state updates in localStorage
4. Both QuickActions and ReferralProgram re-render
5. Same value displayed in both places

## Helper Functions

Located in `lib/utils/work-history-helpers.ts`:

```typescript
// Count "Sedang Dikerjakan" items
countSedangDikerjakan(workHistory: WorkHistoryItem[]): number

// Count by status
countByStatus(workHistory, status): number

// Count by type
countByType(workHistory, type): number

// Get filtered items
getWorkItemsByTypeAndStatus(workHistory, type, status): WorkHistoryItem[]

// Get all statistics
getWorkStatistics(workHistory): Statistics
```

## Testing Synchronization

### Test 1: Sedang Dikerjakan Count

```typescript
// Given: Work history with 2 "Pengerjaan" items with status "Sedang Dikerjakan"
const workHistory = [
  { type: "Konsultasi", status: "Selesai" },
  { type: "Pengerjaan", status: "Sedang Dikerjakan" },  // ✓ Counted
  { type: "Pengerjaan", status: "Sedang Dikerjakan" },  // ✓ Counted
  { type: "Pengerjaan", status: "Selesai" },            // ✗ Not counted (completed)
  { type: "Konsultasi", status: "Sedang Dikerjakan" },  // ✗ Not counted (not "Pengerjaan")
]

// Expected: sedangDikerjakanCount === 2
```

### Test 2: Referral Points Synchronization

```typescript
// Given: User with 50,000 referral points
const user = { referralEarnings: 50000 }

// Expected:
// QuickActions "Poin Referral" card: "Rp 50.000"
// ReferralProgram "Total Poin" card: "Rp 50.000"
// Both should match exactly
```

### Test 3: Real-time Update

```typescript
// 1. Initial state: 2 items "Sedang Dikerjakan"
// 2. User completes one item (changes status to "Selesai")
// 3. WorkProgress updates
// 4. Dashboard recalculates
// 5. QuickActions shows 1 item "Sedang Dikerjakan"
```

## Common Issues and Solutions

### Issue 1: Scorecard shows wrong count
**Cause:** Not filtering by both `type` AND `status`
**Solution:** Use the filter: `type === "Pengerjaan" && status === "Sedang Dikerjakan"`

### Issue 2: Referral points don't match
**Cause:** Different data sources or stale state
**Solution:** Ensure both components use `user.referralEarnings` from the same `useAuth()` hook

### Issue 3: Scorecard doesn't update after change
**Cause:** Missing callback or state not updating
**Solution:** Ensure `onWorkHistoryChange` is called whenever work history changes

## Future Enhancements

- [ ] Add real-time sync with Supabase
- [ ] Implement optimistic updates
- [ ] Add loading states
- [ ] Cache calculated values
- [ ] Add analytics tracking
- [ ] Implement data persistence
- [ ] Add error boundaries

## Migration to Supabase

When migrating to Supabase:

1. **Work History Table:**
```sql
CREATE TABLE work_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  time TEXT,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast filtering
CREATE INDEX idx_work_history_user_type_status 
ON work_history(user_id, type, status);
```

2. **Real-time Subscriptions:**
```typescript
// Subscribe to work history changes
supabase
  .from('work_history')
  .on('*', payload => {
    // Update dashboard state
    loadWorkHistory()
  })
  .subscribe()
```

3. **Optimized Counting:**
```typescript
// Use database aggregation instead of client-side filtering
const { count } = await supabase
  .from('work_history')
  .select('*', { count: 'exact', head: true })
  .eq('type', 'Pengerjaan')
  .eq('status', 'Sedang Dikerjakan')
```

## Support

For questions about dashboard data flow, contact the development team.
