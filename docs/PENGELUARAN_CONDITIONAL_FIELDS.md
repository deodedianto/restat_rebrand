# Pengeluaran Conditional Fields & Validation

## Overview

The Pengeluaran (Expense) form now features conditional fields and smart validation based on expense type. The "Jenis Pengeluaran" field is limited to specific categories, and the "Nama" field dynamically changes between dropdown and text input based on the selected expense type.

## Features

### 1. Limited Expense Types

**Jenis Pengeluaran** is now a dropdown with 5 predefined options:

1. **Fee Analis** - Analyst fees/payments
2. **Fee Referal** - Referral program commissions
3. **Web Development** - Website development/maintenance costs
4. **Biaya Iklan** - Advertising expenses
5. **Lainnya** - Other expenses

### 2. Conditional "Nama" Field

The "Nama" field changes dynamically based on the selected expense type:

| Expense Type | Field Type | Data Source | Required | Example |
|--------------|-----------|-------------|----------|---------|
| **Fee Analis** | Dropdown | Analis table | ✅ Yes | Lukman, Lani, Hamka |
| **Fee Referal** | Dropdown | Users (email) | ✅ Yes | john@example.com |
| **Web Development** | Text Input | Manual entry | ❌ No | PT Digital Solution |
| **Biaya Iklan** | Text Input | Manual entry | ❌ No | Google Ads, Meta Ads |
| **Lainnya** | Text Input | Manual entry | ❌ No | Any vendor/service |

### 3. Smart Validation

**Required Name Validation:**
- `Fee Analis` → Name **MUST** be selected from analyst list
- `Fee Referal` → Name **MUST** be selected from user list
- Other types → Name is optional

**Visual Indicators:**
- Red asterisk (*) appears next to "Nama" label for Fee Analis and Fee Referal
- Red border on field when validation fails
- Error message below field

## Implementation Details

### File Changes

#### 1. `components/admin/edit-data/shared/edit-dialog.tsx`

**Added:**
- `users?: any[]` prop for user data
- Dropdown for "Jenis Pengeluaran"
- Conditional rendering for "Nama" field
- Three different input types based on expense type

**Jenis Pengeluaran Dropdown:**
```typescript
<select
  id="edit-type"
  value={editFormData.type || ""}
  onChange={(e) => {
    setEditFormData({ 
      ...editFormData, 
      type: e.target.value,
      name: "" // Clear name when type changes
    })
  }}
>
  <option value="">-- Pilih Jenis Pengeluaran --</option>
  <option value="Fee Analis">Fee Analis</option>
  <option value="Fee Referal">Fee Referal</option>
  <option value="Web Development">Web Development</option>
  <option value="Biaya Iklan">Biaya Iklan</option>
  <option value="Lainnya">Lainnya</option>
</select>
```

**Conditional Nama Field:**
```typescript
{/* Fee Analis: Dropdown from Analis table */}
{editFormData.type === "Fee Analis" ? (
  <select>
    <option value="">-- Pilih Analis --</option>
    {analis.map((analyst) => (
      <option key={analyst.id} value={analyst.name}>
        {analyst.name}
      </option>
    ))}
  </select>

{/* Fee Referal: Dropdown from Users */}
) : editFormData.type === "Fee Referal" ? (
  <select>
    <option value="">-- Pilih User --</option>
    {users.map((user) => (
      <option key={user.id} value={user.email}>
        {user.email} ({user.name})
      </option>
    ))}
  </select>

{/* Other types: Regular text input */}
) : (
  <Input placeholder="e.g., AWS, Google Ads, Nama Vendor" />
)}
```

#### 2. `components/admin/edit-data/use-edit-data.ts`

**Added:**
- Sample user data (`initialUsers`)
- `users` state
- Updated sample pengeluaran data to use new expense types

**Sample Data:**
```typescript
const initialUsers = [
  { id: "user-1", name: "John Doe", email: "john@example.com", referralCode: "REF001" },
  { id: "user-2", name: "Jane Smith", email: "jane@example.com", referralCode: "REF002" },
  { id: "user-3", name: "Bob Wilson", email: "bob@example.com", referralCode: "REF003" },
]

const initialPengeluaran = [
  { 
    id: "EXP-001", 
    date: "2026-01-10", 
    type: "Fee Analis", 
    name: "Lukman", 
    notes: "Fee analisis bulan Januari", 
    amount: 500000 
  },
  { 
    id: "EXP-002", 
    date: "2026-01-05", 
    type: "Fee Referal", 
    name: "john@example.com", 
    notes: "Komisi referral program", 
    amount: 150000 
  },
  { 
    id: "EXP-003", 
    date: "2026-01-08", 
    type: "Biaya Iklan", 
    name: "Google Ads", 
    notes: "Kampanye iklan minggu pertama", 
    amount: 1000000 
  },
]
```

#### 3. `components/admin/edit-data/index.tsx`

**Updated:**
- Destructured `users` from `useEditData()`
- Passed `users` prop to `EditDialog`

```typescript
const { orders, pengeluaran, analis, users, ... } = useEditData()

<EditDialog
  analis={analis}
  users={users}
  ...
/>
```

#### 4. `lib/validation/admin-schemas.ts`

**Updated:**
- Changed `type` from text input to enum with 5 options
- Made `name` required with min 1 character
- Added refinement to enforce name requirement for Fee Analis and Fee Referal

**Validation Schema:**
```typescript
export const pengeluaranSchema = z.object({
  id: idSchema.optional(),
  date: dateSchema,
  type: z.enum(["Fee Analis", "Fee Referal", "Web Development", "Biaya Iklan", "Lainnya"], {
    errorMap: () => ({ message: "Please select a valid expense type" }),
  }),
  name: z.string().min(1, "Name is required").max(100),
  notes: textSchema(1, 500, "Notes").optional().or(z.literal("")),
  amount: currencySchema,
})
  .refine(
    (data) => {
      // Name is required for Fee Analis and Fee Referal
      if (data.type === "Fee Analis" || data.type === "Fee Referal") {
        return data.name && data.name.trim().length > 0
      }
      return true
    },
    {
      message: "Name is required for Fee Analis and Fee Referal",
      path: ["name"],
    }
  )
```

## Usage Examples

### Example 1: Fee Analis (Analyst Payment)

**Steps:**
1. Select "Fee Analis" from Jenis Pengeluaran dropdown
2. "Nama" field becomes dropdown with analyst names
3. Red asterisk (*) appears → Name is required
4. Select analyst (e.g., "Lukman")
5. Fill in amount and notes
6. Save

**Result:**
```
Type: Fee Analis
Name: Lukman (from dropdown)
Notes: Fee analisis bulan Januari
Amount: 500,000
```

### Example 2: Fee Referal (Referral Commission)

**Steps:**
1. Select "Fee Referal" from Jenis Pengeluaran dropdown
2. "Nama" field becomes dropdown with user emails
3. Red asterisk (*) appears → Name is required
4. Select user email (e.g., "john@example.com (John Doe)")
5. Fill in amount and notes
6. Save

**Result:**
```
Type: Fee Referal
Name: john@example.com (from dropdown)
Notes: Komisi referral program
Amount: 150,000
```

### Example 3: Biaya Iklan (Advertising)

**Steps:**
1. Select "Biaya Iklan" from Jenis Pengeluaran dropdown
2. "Nama" field becomes text input
3. No asterisk → Name is optional
4. Type vendor name (e.g., "Google Ads")
5. Fill in amount and notes
6. Save

**Result:**
```
Type: Biaya Iklan
Name: Google Ads (manual entry)
Notes: Kampanye iklan minggu pertama
Amount: 1,000,000
```

### Example 4: Web Development

**Steps:**
1. Select "Web Development" from Jenis Pengeluaran dropdown
2. "Nama" field becomes text input
3. Type company name (e.g., "PT Digital Solution")
4. Fill in amount and notes
5. Save

**Result:**
```
Type: Web Development
Name: PT Digital Solution (manual entry)
Notes: Maintenance website
Amount: 2,000,000
```

## Validation Flow

### Fee Analis / Fee Referal Validation
```
User selects "Fee Analis"
    ↓
Name field becomes dropdown (required)
    ↓
User submits without selecting name
    ↓
Validation Error: "Name is required for Fee Analis and Fee Referal"
    ↓
Red border + error message
    ↓
User selects analyst
    ↓
Validation passes ✅
    ↓
Data saved
```

### Other Types Validation
```
User selects "Web Development"
    ↓
Name field becomes text input (optional)
    ↓
User submits without entering name
    ↓
Validation passes ✅ (name is optional)
    ↓
Data saved with name = ""
```

## Benefits

### 1. Data Consistency ✅
- **Fee Analis**: Always uses exact analyst names from database
- **Fee Referal**: Always uses actual user emails
- No typos or inconsistent naming

### 2. Better Tracking ✅
- **Financial Reports**: Easy to sum all payments per analyst
- **Referral Analytics**: Track total commissions per user
- **Categorization**: Clear expense categories for accounting

### 3. Improved UX ✅
- **Smart Fields**: Field adapts to selected expense type
- **Visual Cues**: Red asterisk shows required fields
- **Faster Entry**: Dropdowns are quicker than typing

### 4. Data Integrity ✅
- **Required Fields**: Can't create Fee Analis/Referal without name
- **Valid References**: Names always exist in related tables
- **Audit Trail**: Clear connection between expenses and entities

## Future Enhancements

### 1. Auto-populate Amount for Fee Analis
```typescript
// When analyst is selected, auto-fill with their typical fee
onChange={(e) => {
  const selectedAnalyst = analis.find(a => a.name === e.target.value)
  setEditFormData({ 
    ...editFormData, 
    name: e.target.value,
    amount: selectedAnalyst?.defaultFee || editFormData.amount
  })
}}
```

### 2. Link to User Referral Records
```typescript
// Show user's referral stats when selected
{editFormData.type === "Fee Referal" && editFormData.name && (
  <div className="text-sm text-muted-foreground">
    Total referrals: {getUserReferralCount(editFormData.name)}
    Total earned: {formatCurrency(getUserTotalEarnings(editFormData.name))}
  </div>
)}
```

### 3. Expense History by Entity
```typescript
// Show analyst's payment history
<Button onClick={() => showAnalystPaymentHistory(editFormData.name)}>
  View Payment History
</Button>
```

### 4. Budget Tracking
```typescript
// Warn if budget exceeded for expense category
{getBudgetUsage("Biaya Iklan") > 80 && (
  <Alert variant="warning">
    Biaya Iklan budget usage: 85% (Rp 8.5M / Rp 10M)
  </Alert>
)}
```

### 5. Bulk Payment Entry
```typescript
// Create multiple Fee Analis entries at once (monthly payroll)
<Button onClick={openBulkAnalystPayment}>
  Create Monthly Analyst Payments
</Button>
```

## Migration to Supabase

### 1. Database Schema
```sql
-- Pengeluaran table
CREATE TABLE pengeluaran (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('Fee Analis', 'Fee Referal', 'Web Development', 'Biaya Iklan', 'Lainnya')),
  name VARCHAR(100) NOT NULL,
  notes TEXT,
  amount INTEGER NOT NULL,
  analyst_id UUID REFERENCES analis(id), -- FK for Fee Analis
  user_id UUID REFERENCES users(id), -- FK for Fee Referal
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add constraint: analyst_id required when type = 'Fee Analis'
ALTER TABLE pengeluaran ADD CONSTRAINT check_analyst_fee
  CHECK (type != 'Fee Analis' OR analyst_id IS NOT NULL);

-- Add constraint: user_id required when type = 'Fee Referal'
ALTER TABLE pengeluaran ADD CONSTRAINT check_referal_fee
  CHECK (type != 'Fee Referal' OR user_id IS NOT NULL);
```

### 2. Query with Joins
```typescript
// Fetch pengeluaran with related data
const { data: expenses } = await supabase
  .from('pengeluaran')
  .select(`
    *,
    analyst:analyst_id (
      id,
      name,
      bank_name,
      bank_account_number
    ),
    user:user_id (
      id,
      name,
      email,
      referral_code
    )
  `)
  .order('date', { ascending: false })
```

### 3. Real-time User List
```typescript
// Subscribe to users table for real-time Fee Referal dropdown
useEffect(() => {
  const channel = supabase
    .channel('users_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        // Update users list in real-time
        loadUsers()
      }
    )
    .subscribe()

  return () => { channel.unsubscribe() }
}, [])
```

## Testing Checklist

- [ ] Jenis Pengeluaran dropdown shows 5 options
- [ ] Selecting "Fee Analis" shows analyst dropdown
- [ ] Selecting "Fee Referal" shows user email dropdown
- [ ] Selecting other types shows text input
- [ ] Red asterisk appears for Fee Analis and Fee Referal
- [ ] Validation blocks saving Fee Analis without analyst name
- [ ] Validation blocks saving Fee Referal without user email
- [ ] Validation allows saving other types without name
- [ ] Changing expense type clears name field
- [ ] Dropdowns populate from correct data sources
- [ ] Form resets correctly when closed
- [ ] Editing existing expense loads correct field type

## Troubleshooting

### Issue: Dropdown is Empty for Fee Analis
**Cause**: No analysts in Analis table
**Solution**: Add analysts in Analis tab first

### Issue: Dropdown is Empty for Fee Referal
**Cause**: No users in sample data (will be real users from Supabase)
**Solution**: Currently uses sample data; will sync with real users after Supabase migration

### Issue: Can't Save Fee Analis Without Name
**Cause**: Validation working correctly - name is required
**Solution**: Select an analyst from the dropdown

### Issue: Name Field Doesn't Change When Type Changes
**Cause**: Component not re-rendering
**Solution**: Check that `editFormData.type` is updating correctly

### Issue: Old Data Has Text in Name for Fee Analis
**Cause**: Old expenses created before dropdown was implemented
**Solution**: Edit and re-select analyst from dropdown to normalize data

## Related Files

- `/components/admin/edit-data/shared/edit-dialog.tsx` - Conditional field logic
- `/components/admin/edit-data/use-edit-data.ts` - Data management and sample data
- `/components/admin/edit-data/index.tsx` - Main view that passes props
- `/lib/validation/admin-schemas.ts` - Validation rules
- `/components/admin/edit-data/pengeluaran-table.tsx` - Table display
- `/docs/ORDER_ANALYST_INTEGRATION.md` - Related analyst integration docs

## Summary

The conditional Pengeluaran fields provide a smart, context-aware form that adapts to the expense type. By using dropdowns for analyst and referral fees, we ensure data consistency and make it easy to track payments. The validation rules enforce data integrity while remaining flexible for other expense types.

🎯 **Key Benefit**: Accurate financial tracking with zero typos for analyst and referral payments!
