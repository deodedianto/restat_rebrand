# Referral System Documentation

## Overview

The ReStat referral system allows users to earn rewards by inviting friends to use the platform. Each user gets a unique referral code that can be shared with others.

## Key Features

### 1. **Unique Referral Codes**
- Format: `RESTAT-XXXXXX` (where X is alphanumeric A-Z, 0-9)
- **One code per user** - Once generated, the code is permanent
- **System-wide uniqueness** - No two users can have the same code
- Automatically validated during generation

### 2. **Code Generation**

```typescript
// User clicks "Generate Kode Referral" button
generateReferralCode()
  → Checks if user already has a code (returns existing if found)
  → Gets all existing codes from all users
  → Generates random code
  → Checks uniqueness against all existing codes
  → Retries up to 100 times if duplicate found
  → Saves code permanently to user account
```

**Important Rules:**
- ✅ Code can only be generated **once per user**
- ✅ Code is **permanent** and cannot be changed
- ✅ Code is guaranteed to be **unique** across all users
- ❌ Users cannot generate a new code if they already have one

### 3. **Reward Structure**

| Event | Reward |
|-------|--------|
| Friend registers with your code | Rp 10,000 to referrer |
| Friend makes first purchase | Tracked in referralCount |
| Minimum redemption | Rp 10,000 |
| Processing time | 1-3 business days |

### 4. **Bank Account Information**

Before users can redeem their referral points, they must provide their bank account information:

**Required Fields:**
- **Nama Bank** (Bank Name) - e.g., "Bank BCA", "Bank Mandiri"
  - Must be 3-50 characters
  - Only letters and spaces allowed
- **Nomor Rekening** (Account Number) - e.g., "1234567890"
  - Must be 5-20 digits
  - Only numbers allowed

**Validation Rules:**
```typescript
bankName: /^[a-zA-Z\s]+$/ (letters and spaces only)
bankAccountNumber: /^\d+$/ (digits only, 5-20 length)
```

**User Flow:**
1. User opens Referral Program section
2. Fills in bank name and account number
3. Clicks "Simpan Rekening" button
4. System validates and saves information
5. User can now redeem points

### 5. **Using a Referral Code**

When registering, users can enter a referral code:

```typescript
register(name, email, phone, password, referralCode?)
  → Validates referral code exists
  → Credits Rp 10,000 to referrer
  → Increments referrer's referralCount
  → Creates new user account
```

### 6. **Points Redemption**

Users can redeem their points for cash:
- **Requirement**: Bank account information must be saved first
- **Minimum**: Rp 10,000
- **Processing time**: 1-3 business days
- **Points**: Deducted immediately upon redemption
- **Transfer**: To the registered bank account

**Redemption Flow:**
1. User has bank account information saved
2. User enters amount to redeem (minimum Rp 10,000)
3. System validates:
   - Bank account exists
   - Sufficient points available
   - Amount is valid
4. Points are deducted
5. Transfer processed to bank account

## Technical Implementation

### Data Structure

```typescript
interface User {
  id: string
  name: string
  email: string
  phone: string
  referralCode: string        // User's unique code (empty until generated)
  referralEarnings: number     // Earnings from referrals
  referralCount: number        // Number of successful referrals
  bankName?: string            // Bank name for redemption
  bankAccountNumber?: string   // Account number for redemption
}
```

### Code Generation Algorithm

```typescript
function generateCode(existingCodes: string[]): string {
  // 1. Generate random code: RESTAT-XXXXXX
  // 2. Check if code exists in existingCodes array
  // 3. If exists, try again (max 100 attempts)
  // 4. If 100 attempts fail, use timestamp-based code
  // 5. Return unique code
}
```

### Uniqueness Guarantee

The system ensures code uniqueness through:
1. **Pre-check**: All existing codes are loaded before generation
2. **Collision detection**: Generated code is checked against all existing codes
3. **Retry mechanism**: Up to 100 attempts to find unique code
4. **Fallback**: Timestamp-based code if random generation fails
5. **Post-validation**: Double-check before saving to storage

## User Interface

### Before Code Generation
- Warning message: "Kode referral hanya dapat dibuat sekali dan bersifat permanen"
- "Generate Kode Referral" button
- Disabled state during generation

### After Code Generation
- Display code in large, copyable format
- "Salin" (Copy) button with success feedback
- Success message: "Kode referral Anda telah dibuat dan bersifat permanen"
- No option to regenerate

### Statistics Display
- Total users referred
- Total points earned
- Reward per referral
- Friend discount percentage

## API Reference

### `generateReferralCode()`
Generates a unique referral code for the current user.

**Returns:** `string` - The generated code or existing code if already generated

**Behavior:**
- Returns existing code if user already has one
- Generates new unique code if user doesn't have one
- Saves code permanently to user account

### `validateReferralCode(code: string)`
Validates if a referral code exists in the system.

**Parameters:**
- `code`: The referral code to validate

**Returns:** `boolean` - True if code exists and belongs to a user

### `updateBankAccount(data: { bankName: string; bankAccountNumber: string })`
Updates user's bank account information for point redemption.

**Parameters:**
- `data.bankName`: Name of the bank (3-50 characters, letters and spaces only)
- `data.bankAccountNumber`: Bank account number (5-20 digits)

**Returns:** `Promise<boolean>` - True if update successful

**Validation:**
- Bank name: Must match `/^[a-zA-Z\s]+$/`
- Account number: Must match `/^\d{5,20}$/`

### `redeemPoints(points: number)`
Redeems user points for cash.

**Prerequisites:**
- User must have bank account information saved

**Parameters:**
- `points`: Amount to redeem (minimum 10,000)

**Returns:** `Promise<boolean>` - True if redemption successful

**Errors:**
- Returns false if bank account not set
- Returns false if insufficient points
- Returns false if amount below minimum

## Testing Scenarios

### Test 1: First-time Code Generation
1. User has no referral code
2. Click "Generate Kode Referral"
3. ✅ Unique code is generated
4. ✅ Code is displayed
5. ✅ Code is saved permanently
6. ✅ Button is replaced with code display

### Test 2: Attempt to Regenerate
1. User already has a code
2. Page loads
3. ✅ Code is displayed immediately
4. ✅ No generate button shown
5. ✅ Success message displayed

### Test 3: Code Uniqueness
1. User A generates code: RESTAT-ABC123
2. User B generates code
3. ✅ User B gets different code
4. ✅ System prevents duplicate codes

### Test 4: Using Referral Code
1. New user registers with code: RESTAT-ABC123
2. ✅ Referrer gets Rp 10,000
3. ✅ Referrer's count increases by 1
4. ✅ New user account created

### Test 5: Invalid Referral Code
1. User enters non-existent code
2. ✅ Code is ignored (no bonus applied)
3. ✅ Registration proceeds normally

### Test 6: Bank Account Setup
1. User opens Referral Program
2. Enters bank name: "Bank BCA"
3. Enters account: "1234567890"
4. ✅ Clicks save
5. ✅ Information is saved
6. ✅ Redeem button becomes enabled

### Test 7: Bank Account Validation
1. User enters invalid bank name: "Bank123"
2. ✅ Error: "Nama bank hanya boleh berisi huruf dan spasi"
3. User enters invalid account: "12ABC"
4. ✅ Error: "Nomor rekening hanya boleh berisi angka"

### Test 8: Redeem Without Bank Account
1. User has points but no bank account
2. ✅ Redeem button is disabled
3. ✅ Warning message displayed
4. ✅ User must add bank account first

## Future Enhancements

- [ ] Add code expiration dates
- [ ] Implement tiered rewards (more referrals = higher rewards)
- [ ] Track referral conversion rates
- [ ] Add referral leaderboard
- [ ] Send email notifications when points are earned
- [ ] Add referral link generator (URL-based sharing)
- [ ] Integration with marketing tools

## Migration to Supabase

When migrating to Supabase:

1. **Database Schema**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  referral_code TEXT UNIQUE, -- UNIQUE constraint for system-wide uniqueness
  referral_points INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  bank_name TEXT, -- Bank name for redemption
  bank_account_number TEXT, -- Account number for redemption
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast referral code lookups
CREATE INDEX idx_referral_code ON users(referral_code);

-- Table for redemption history
CREATE TABLE referral_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Index for user redemptions
CREATE INDEX idx_redemptions_user ON referral_redemptions(user_id, created_at DESC);
```

2. **Code Generation Logic**
```typescript
// Use database transaction to ensure atomicity
// Check uniqueness with database query
// Use database-level UNIQUE constraint for safety
```

3. **Benefits**
- Database-enforced uniqueness
- Better performance for code lookups
- Persistent storage
- Multi-user safety with transactions

## Support

For questions about the referral system, contact the development team.
