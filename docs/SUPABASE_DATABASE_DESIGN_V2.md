# Supabase Database Design Plan (Revised v2.0)

## Overview

This document outlines the complete database schema design for migrating from localStorage to Supabase. The design considers all business flows across admin and user dashboards, ensuring data integrity, scalability, and optimal performance.

**Revision Notes v2.0:**
- ✅ Merged `reviews` and `feedback` tables (users can only submit ONE review/feedback)
- ✅ Enforced one-time referral code redemption per user
- ✅ Removed article management tables (articles, authors, categories)
- ✅ Cleaned up unnecessary columns
- **Total Tables**: 11 (down from 15)

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Table Schemas](#table-schemas)
3. [Relationships & Foreign Keys](#relationships--foreign-keys)
4. [Indexes & Performance](#indexes--performance)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Database Functions & Triggers](#database-functions--triggers)
7. [Business Logic Implementation](#business-logic-implementation)
8. [Migration Strategy](#migration-strategy)

---

## Database Architecture

### Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │────────►│   orders    │────────►│  analysts   │
│             │         │             │         │             │
│ - id        │         │ - id        │         │ - id        │
│ - email     │         │ - user_id   │         │ - name      │
│ - name      │         │ - analyst_id│         │ - whatsapp  │
│ - phone     │         │ - payment   │         │ - bank_info │
│ - referral  │         │ - work      │         └─────────────┘
│   _code     │         │   _status   │                │
│ - earnings  │         └─────────────┘                │
└─────────────┘                │                       │
       │                       │                       ▼
       │                       │            ┌─────────────────┐
       │                       │            │ analyst_payments│
       │                       │            │                 │
       │                       │            │ - id            │
       │                       │            │ - analyst_id    │
       │                       │            │ - order_id      │
       │                       │            │ - amount        │
       │                       │            │ - status        │
       │                       │            └─────────────────┘
       │                       │
       │                       ▼
       │            ┌──────────────────┐
       │            │ work_history     │
       │            │                  │
       │            │ - id             │
       │            │ - user_id        │
       │            │ - order_id       │
       │            │ - type           │
       │            │ - status         │
       │            │ - metadata       │
       │            └──────────────────┘
       │
       ▼
┌─────────────────┐         ┌─────────────────┐
│ referrals       │────────►│ referral_payouts│
│                 │         │                 │
│ - id            │         │ - id            │
│ - referrer_id   │         │ - user_id       │
│ - referred_id   │         │ - amount        │
│   (UNIQUE)      │         │ - status        │
│ - code_used     │         │ - bank_info     │
│ - reward_amt    │         └─────────────────┘
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│ consultations   │         │ analysis_prices │
│                 │         │                 │
│ - id            │         │ - id            │
│ - user_id       │         │ - name          │
│ - date          │         │ - package       │
│ - time          │         │ - price         │
│ - status        │         └─────────────────┘
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   expenses      │         │   reviews       │
│                 │         │  (merged with   │
│ - id            │         │   feedback)     │
│ - type          │         │                 │
│ - name          │         │ - id            │
│ - amount        │         │ - user_id       │
│ - analyst_id    │         │   (UNIQUE)      │
│ - user_id       │         │ - order_id      │
└─────────────────┘         │ - rating        │
                            │ - comment       │
                            │ - is_order      │
                            │   _review       │
                            └─────────────────┘
```

---

## Table Schemas

### 1. Users Table (`users`) - 12 columns

**Purpose**: Store user account information, profile data, and referral details.

**Schema**:
```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication (Supabase Auth linked)
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Profile Information
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20), -- Format: +62xxxxxxxxx
  
  -- Referral System
  referral_code VARCHAR(20) UNIQUE, -- Generated once
  referral_earnings INTEGER DEFAULT 0, -- Total earnings from referrals
  
  -- Bank Account for Payouts
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  
  -- Role
  role user_role DEFAULT 'user', -- user/admin/analyst
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone ~ '^\+62\d{9,12}$' OR phone IS NULL),
  CONSTRAINT valid_referral_code CHECK (referral_code ~ '^[A-Z0-9]{6,10}$' OR referral_code IS NULL),
  CONSTRAINT non_negative_earnings CHECK (referral_earnings >= 0)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Changes from v1:**
- ✅ Removed `referred_by_code` column (handled by referrals table)

---

### 2. Analysts Table (`analysts`) - 8 columns

**Purpose**: Store analyst information for order assignment and payment tracking.

**Schema**:
```sql
CREATE TABLE analysts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  
  -- Bank Information
  bank_name VARCHAR(100) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_whatsapp CHECK (whatsapp ~ '^\+62\d{9,12}$')
);

-- Indexes
CREATE INDEX idx_analysts_active ON analysts(is_active);
CREATE INDEX idx_analysts_name ON analysts(name);
```

**No changes from v1** - Table structure is optimal.

---

### 3. Analysis Prices Table (`analysis_prices`) - 8 columns

**Purpose**: Store pricing information for different analysis types and packages.

**Schema**:
```sql
CREATE TABLE analysis_prices (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Analysis Details
  name VARCHAR(200) NOT NULL, -- e.g., "Regresi Linear", "SEM"
  package VARCHAR(20) NOT NULL, -- "Basic", "Standard", "Premium"
  price INTEGER NOT NULL, -- In Rupiah (no decimals)
  
  -- Description
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_package CHECK (package IN ('Basic', 'Standard', 'Premium')),
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT unique_analysis_package UNIQUE (name, package)
);

-- Indexes
CREATE INDEX idx_analysis_prices_name ON analysis_prices(name);
CREATE INDEX idx_analysis_prices_package ON analysis_prices(package);
CREATE INDEX idx_analysis_prices_active ON analysis_prices(is_active);
```

**Changes from v1:**
- ✅ Removed `features` column (JSONB) - not needed for MVP

---

### 4. Orders Table (`orders`) - 17 columns

**Purpose**: Central table for all customer orders with status tracking.

**Schema**:
```sql
CREATE TABLE orders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Order Number (sequential, user-friendly)
  order_number SERIAL UNIQUE NOT NULL, -- Auto-incrementing number
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analyst_id UUID REFERENCES analysts(id) ON DELETE SET NULL,
  analysis_price_id UUID REFERENCES analysis_prices(id) ON DELETE RESTRICT,
  
  -- Order Details
  research_title VARCHAR(500) NOT NULL,
  research_description TEXT NOT NULL,
  
  -- Dates
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE NOT NULL,
  deadline_date DATE NOT NULL,
  
  -- Pricing
  price INTEGER NOT NULL, -- Total price
  analyst_fee INTEGER, -- Fee paid to analyst
  
  -- Status Tracking
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Belum Dibayar',
  work_status VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
  
  -- Payment Information
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_status CHECK (
    payment_status IN ('Belum Dibayar', 'Dibayar')
  ),
  CONSTRAINT valid_work_status CHECK (
    work_status IN ('Menunggu', 'Diproses', 'Selesai', 'Dibatalkan')
  ),
  CONSTRAINT valid_dates CHECK (
    delivery_date >= order_date AND 
    deadline_date >= delivery_date
  ),
  CONSTRAINT positive_price CHECK (price > 0),
  CONSTRAINT valid_analyst_fee CHECK (
    analyst_fee IS NULL OR 
    (analyst_fee > 0 AND analyst_fee <= price)
  )
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_analyst_id ON orders(analyst_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_work_status ON orders(work_status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_deadline_date ON orders(deadline_date);

-- Composite indexes for common queries
CREATE INDEX idx_orders_status_composite ON orders(payment_status, work_status, analyst_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, work_status);
```

**Changes from v1:**
- ✅ Removed `payment_proof_url` column (not needed for MVP)
- ✅ Removed `result_file_url` column (not needed for MVP)
- ✅ Removed `revision_count` column (not needed for MVP)

---

### 5. Work History Table (`work_history`) - 10 columns

**Purpose**: Track all user activities and order lifecycle events.

**Schema**:
```sql
CREATE TABLE work_history (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  
  -- Activity Type
  type VARCHAR(50) NOT NULL, -- "Order", "Konsultasi", "Pengerjaan"
  status VARCHAR(50) NOT NULL,
  
  -- Additional Data
  notes TEXT,
  metadata JSONB, -- Flexible data storage (e.g., order details, consultation info)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_type CHECK (
    type IN ('Order', 'Konsultasi', 'Pengerjaan')
  ),
  CONSTRAINT valid_status CHECK (
    status IN (
      'Belum Dibayar', 'Dibayar', 
      'Dijadwalkan', 'Selesai', 
      'Sedang Dikerjakan', 'Menunggu Revisi'
    )
  )
);

-- Indexes
CREATE INDEX idx_work_history_user_id ON work_history(user_id);
CREATE INDEX idx_work_history_order_id ON work_history(order_id);
CREATE INDEX idx_work_history_type ON work_history(type);
CREATE INDEX idx_work_history_status ON work_history(status);
CREATE INDEX idx_work_history_created_at ON work_history(created_at);
```

**Changes from v1:**
- ✅ Removed "Review" from type enum (handled by reviews table)

---

### 6. Consultations Table (`consultations`) - 10 columns

**Purpose**: Store scheduled consultation bookings.

**Schema**:
```sql
CREATE TABLE consultations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  
  -- Details
  notes TEXT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'Dijadwalkan',
  
  -- Contact Info (snapshot at booking time)
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_consultation_status CHECK (
    status IN ('Dijadwalkan', 'Selesai', 'Dibatalkan')
  )
);

-- Indexes
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX idx_consultations_status ON consultations(status);

-- Composite index for finding past consultations
CREATE INDEX idx_consultations_date_status ON consultations(scheduled_date, status);
```

**No changes from v1** - Table structure is optimal.

---

### 7. Referrals Table (`referrals`) - 8 columns

**Purpose**: Track referral relationships and rewards. **Each user can only redeem ONE referral code.**

**Schema**:
```sql
CREATE TABLE referrals (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Referral Details
  referral_code_used VARCHAR(20) NOT NULL,
  
  -- Reward
  reward_amount INTEGER NOT NULL, -- Amount earned by referrer
  reward_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  reward_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (referrer_id != referred_user_id),
  CONSTRAINT positive_reward CHECK (reward_amount > 0),
  CONSTRAINT valid_reward_status CHECK (
    reward_status IN ('Pending', 'Approved', 'Paid')
  ),
  CONSTRAINT unique_referral UNIQUE (referred_user_id) -- Can only redeem ONE code
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(reward_status);
CREATE INDEX idx_referrals_code ON referrals(referral_code_used);
```

**Business Rule**: `referred_user_id` is UNIQUE, meaning each user can only be referred once (can only use one referral code during registration).

---

### 8. Referral Payouts Table (`referral_payouts`) - 11 columns

**Purpose**: Track referral reward redemption requests.

**Schema**:
```sql
CREATE TABLE referral_payouts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payout Details
  amount INTEGER NOT NULL, -- Amount requested
  
  -- Bank Information (snapshot at request time)
  bank_name VARCHAR(100) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'Belum Dibayar',
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id), -- Admin who processed
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_payout_status CHECK (
    status IN ('Belum Dibayar', 'Menunggu', 'Dibayar')
  )
);

-- Indexes
CREATE INDEX idx_referral_payouts_user_id ON referral_payouts(user_id);
CREATE INDEX idx_referral_payouts_status ON referral_payouts(status);
CREATE INDEX idx_referral_payouts_created_at ON referral_payouts(created_at);
```

**No changes from v1** - Table structure is optimal.

---

### 9. Analyst Payments Table (`analyst_payments`) - 10 columns

**Purpose**: Track payments to analysts for completed orders.

**Schema**:
```sql
CREATE TABLE analyst_payments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  analyst_id UUID NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount INTEGER NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'Belum Dibayar',
  
  -- Processing
  paid_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id), -- Admin who processed
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_payment_status CHECK (
    status IN ('Belum Dibayar', 'Menunggu', 'Dibayar')
  ),
  CONSTRAINT unique_order_payment UNIQUE (order_id) -- One payment per order
);

-- Indexes
CREATE INDEX idx_analyst_payments_analyst_id ON analyst_payments(analyst_id);
CREATE INDEX idx_analyst_payments_order_id ON analyst_payments(order_id);
CREATE INDEX idx_analyst_payments_status ON analyst_payments(status);
CREATE INDEX idx_analyst_payments_created_at ON analyst_payments(created_at);
```

**No changes from v1** - Table structure is optimal.

---

### 10. Expenses Table (`expenses`) - 10 columns

**Purpose**: Track all business expenses for financial reporting.

**Schema**:
```sql
CREATE TABLE expenses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Expense Details
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  notes TEXT,
  amount INTEGER NOT NULL,
  
  -- References (conditional based on type)
  analyst_id UUID REFERENCES analysts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_expense_type CHECK (
    type IN ('Fee Analis', 'Fee Referal', 'Web Development', 'Biaya Iklan', 'Lainnya')
  ),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT analyst_fee_requires_analyst CHECK (
    type != 'Fee Analis' OR analyst_id IS NOT NULL
  ),
  CONSTRAINT referral_fee_requires_user CHECK (
    type != 'Fee Referal' OR user_id IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_type ON expenses(type);
CREATE INDEX idx_expenses_analyst_id ON expenses(analyst_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
```

**No changes from v1** - Table structure is optimal.

---

### 11. Reviews Table (`reviews`) - 10 columns **[MERGED with feedback]**

**Purpose**: Store customer reviews and general feedback. **Users can only submit ONE review/feedback total.**

**Schema**:
```sql
CREATE TABLE reviews (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Review Details
  rating INTEGER NOT NULL, -- 1-5 stars
  comment TEXT NOT NULL,
  is_order_review BOOLEAN DEFAULT FALSE, -- True if order-specific
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT order_review_requires_order CHECK (
    is_order_review = FALSE OR order_id IS NOT NULL
  ),
  CONSTRAINT unique_user_review UNIQUE (user_id), -- ONE review per user
  CONSTRAINT unique_order_review UNIQUE (order_id) -- ONE review per order (if applicable)
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_published ON reviews(is_published);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
```

**Changes from v1:**
- ✅ **MERGED** `reviews` and `feedback` tables
- ✅ Added `is_order_review` boolean flag to differentiate order reviews from general feedback
- ✅ Added UNIQUE constraint on `user_id` - users can only submit ONE review/feedback total
- ✅ Removed `type` column (replaced with `is_order_review` boolean)

**Business Logic:**
- If user submits an order review: `is_order_review = TRUE`, `order_id` is set
- If user submits general feedback: `is_order_review = FALSE`, `order_id` is NULL
- User can only submit ONE entry (either order review OR general feedback, not both)

---

## Relationships & Foreign Keys

### Primary Relationships (19 total)

1. **users → orders**: One-to-Many
   - Foreign key: `orders.user_id → users.id`

2. **analysts → orders**: One-to-Many
   - Foreign key: `orders.analyst_id → analysts.id`

3. **analysis_prices → orders**: One-to-Many
   - Foreign key: `orders.analysis_price_id → analysis_prices.id`

4. **users → work_history**: One-to-Many
   - Foreign key: `work_history.user_id → users.id`

5. **orders → work_history**: One-to-Many
   - Foreign key: `work_history.order_id → orders.id`

6. **consultations → work_history**: One-to-Many
   - Foreign key: `work_history.consultation_id → consultations.id`

7. **users → consultations**: One-to-Many
   - Foreign key: `consultations.user_id → users.id`

8. **users → referrals (Referrer)**: One-to-Many
   - Foreign key: `referrals.referrer_id → users.id`

9. **users → referrals (Referred)**: One-to-One ⭐
   - Foreign key: `referrals.referred_user_id → users.id` (UNIQUE)
   - **Business Rule**: User can only redeem ONE referral code

10. **users → referral_payouts**: One-to-Many
    - Foreign key: `referral_payouts.user_id → users.id`

11. **users → referral_payouts (processed_by)**: One-to-Many
    - Foreign key: `referral_payouts.processed_by → users.id`

12. **analysts → analyst_payments**: One-to-Many
    - Foreign key: `analyst_payments.analyst_id → analysts.id`

13. **orders → analyst_payments**: One-to-One ⭐
    - Foreign key: `analyst_payments.order_id → orders.id` (UNIQUE)

14. **users → analyst_payments (processed_by)**: One-to-Many
    - Foreign key: `analyst_payments.processed_by → users.id`

15. **analysts → expenses**: One-to-Many (conditional)
    - Foreign key: `expenses.analyst_id → analysts.id`

16. **users → expenses**: One-to-Many (conditional)
    - Foreign key: `expenses.user_id → users.id`

17. **users → reviews**: One-to-One ⭐
    - Foreign key: `reviews.user_id → users.id` (UNIQUE)
    - **Business Rule**: User can only submit ONE review/feedback

18. **orders → reviews**: One-to-One (optional) ⭐
    - Foreign key: `reviews.order_id → orders.id` (UNIQUE, NULL allowed)

19. **auth.users → users**: One-to-One ⭐
    - Foreign key: `users.auth_id → auth.users.id`

---

## Indexes & Performance

### Critical Indexes

```sql
-- Orders: Most queried table
CREATE INDEX idx_orders_user_status ON orders(user_id, work_status);
CREATE INDEX idx_orders_analyst_status ON orders(analyst_id, payment_status, work_status);
CREATE INDEX idx_orders_follow_up ON orders(payment_status, order_date) 
  WHERE payment_status = 'Belum Dibayar';

-- Work History: Frequently filtered by type and status
CREATE INDEX idx_work_history_user_type_status ON work_history(user_id, type, status);

-- Referral Payouts: Admin dashboard queries
CREATE INDEX idx_referral_payouts_status_date ON referral_payouts(status, created_at);

-- Analyst Payments: Admin dashboard queries
CREATE INDEX idx_analyst_payments_status_date ON analyst_payments(status, created_at);
```

---

## Row Level Security (RLS)

### User Roles

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'analyst');
```

### Key RLS Policies

**Users Table:**
```sql
-- Users can view and update their own profile
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL
  USING (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
```

**Orders Table:**
```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
```

**Reviews Table:**
```sql
-- Users can view and manage their own review
CREATE POLICY "Users can manage own review" ON reviews
  FOR ALL
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Admins can view and publish all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Database Functions & Triggers

### 1. Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Auto-Update Work Status Function

```sql
CREATE OR REPLACE FUNCTION auto_update_work_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If order is paid AND analyst is assigned, change status to "Diproses"
  IF NEW.payment_status = 'Dibayar' 
     AND NEW.analyst_id IS NOT NULL 
     AND NEW.work_status = 'Menunggu' THEN
    NEW.work_status := 'Diproses';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_work_status
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_work_status();
```

### 3. Update Referral Earnings Function

```sql
CREATE OR REPLACE FUNCTION update_referral_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Add reward to referrer's earnings
  UPDATE users
  SET referral_earnings = referral_earnings + NEW.reward_amount
  WHERE id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_earnings
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_earnings();
```

### 4. Deduct Referral Payout Function

```sql
CREATE OR REPLACE FUNCTION process_referral_payout()
RETURNS TRIGGER AS $$
BEGIN
  -- When payout is marked as paid, deduct from user's earnings
  IF NEW.status = 'Dibayar' AND OLD.status != 'Dibayar' THEN
    UPDATE users
    SET referral_earnings = referral_earnings - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_referral_payout
  AFTER UPDATE ON referral_payouts
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_payout();
```

### 5. Auto-Update Consultation Status

```sql
CREATE OR REPLACE FUNCTION auto_update_past_consultations()
RETURNS void AS $$
BEGIN
  UPDATE consultations
  SET status = 'Selesai'
  WHERE status = 'Dijadwalkan'
    AND CONCAT(scheduled_date, ' ', scheduled_time)::timestamp < NOW();
END;
$$ LANGUAGE plpgsql;

-- Run via pg_cron (Supabase extension)
SELECT cron.schedule(
  'auto-update-consultations',
  '0 * * * *', -- Every hour
  'SELECT auto_update_past_consultations();'
);
```

### 6. Create Analyst Payment on Order Completion

```sql
CREATE OR REPLACE FUNCTION create_analyst_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is marked as "Selesai", create analyst payment
  IF NEW.work_status = 'Selesai' AND OLD.work_status != 'Selesai' THEN
    INSERT INTO analyst_payments (
      analyst_id,
      order_id,
      amount,
      status
    ) VALUES (
      NEW.analyst_id,
      NEW.id,
      NEW.analyst_fee,
      'Belum Dibayar'
    )
    ON CONFLICT (order_id) DO NOTHING; -- Prevent duplicates
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_analyst_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_analyst_payment();
```

### 7. Sync Order to Work History

```sql
CREATE OR REPLACE FUNCTION sync_order_to_work_history()
RETURNS TRIGGER AS $$
BEGIN
  -- When order is created, create work history entry
  IF TG_OP = 'INSERT' THEN
    INSERT INTO work_history (
      user_id,
      order_id,
      type,
      status,
      notes,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'Order',
      NEW.payment_status,
      NEW.research_title,
      jsonb_build_object(
        'research_title', NEW.research_title,
        'research_description', NEW.research_description,
        'delivery_date', NEW.delivery_date
      )
    );
  -- When order status changes, update work history
  ELSIF TG_OP = 'UPDATE' AND (NEW.payment_status != OLD.payment_status OR NEW.work_status != OLD.work_status) THEN
    UPDATE work_history
    SET 
      status = CASE 
        WHEN NEW.work_status = 'Diproses' THEN 'Sedang Dikerjakan'
        WHEN NEW.work_status = 'Selesai' THEN 'Selesai'
        ELSE NEW.payment_status
      END,
      updated_at = NOW()
    WHERE order_id = NEW.id AND type = 'Order';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_order_to_work_history
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_to_work_history();
```

---

## Business Logic Implementation

### Order Flow

```
1. User creates order
   ↓
2. Order status: payment_status = "Belum Dibayar", work_status = "Menunggu"
   ↓
3. Work history entry created automatically (trigger)
   ↓
4. User pays → payment_status = "Dibayar"
   ↓
5. Admin assigns analyst → analyst_id set
   ↓
6. Auto-trigger: work_status = "Diproses" (if paid AND analyst assigned)
   ↓
7. Work history updated to "Sedang Dikerjakan"
   ↓
8. Analyst completes work → work_status = "Selesai"
   ↓
9. Auto-trigger: Analyst payment created with status "Belum Dibayar"
   ↓
10. Admin processes analyst payment → status = "Dibayar"
```

### Referral Flow

```
1. User A generates referral code (one-time)
   ↓
2. User B registers using User A's code
   ↓
3. Referral record created: referrer_id = User A, referred_user_id = User B
   ↓
4. UNIQUE constraint on referred_user_id prevents User B from using another code
   ↓
5. Auto-trigger: User A's referral_earnings += reward_amount
   ↓
6. User A requests payout (must have bank account)
   ↓
7. Referral payout record created with status "Belum Dibayar"
   ↓
8. Admin processes → status = "Menunggu"
   ↓
9. Admin completes payment → status = "Dibayar"
   ↓
10. Auto-trigger: User A's referral_earnings -= payout amount
```

### Review/Feedback Flow

```
1. User completes an order
   ↓
2. User can submit ONE review/feedback (enforced by UNIQUE constraint on user_id)
   ↓
3. Option A: Order-specific review
   - is_order_review = TRUE
   - order_id is set
   - Links review to specific order
   ↓
4. Option B: General feedback
   - is_order_review = FALSE
   - order_id is NULL
   - General platform feedback
   ↓
5. Admin can publish/feature reviews
   ↓
6. User cannot submit another review (UNIQUE constraint prevents it)
```

---

## Migration Strategy

### Phase 1: Setup (Week 1)

1. **Create Supabase project**
2. **Run all CREATE TABLE statements**
3. **Create indexes**
4. **Create functions and triggers**
5. **Setup RLS policies**
6. **Configure Supabase Auth**

### Phase 2: Data Migration (Week 2)

1. **Export localStorage data**
   - Users
   - Orders
   - Work History
   - Consultations
   - Reviews (merge from reviews + feedback)

2. **Transform and Import**
   - Map localStorage structure to Supabase schema
   - Merge reviews and feedback tables
   - Verify referral code uniqueness

### Phase 3: Frontend Integration (Week 3-4)

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Update API calls**
   - Replace localStorage with Supabase queries
   - Implement real-time subscriptions
   - Handle merged reviews/feedback table

### Phase 4: Testing (Week 5)

1. **Test all business rules**
   - One review per user
   - One referral code redemption per user
   - Auto-status updates
   - Triggers

### Phase 5: Deployment (Week 6)

1. **Deploy to production**
2. **Monitor and optimize**

---

## Summary

### Database Statistics (v2.0)

- **Total Tables**: 11 (down from 15)
- **Total Columns**: 104 (down from 179)
- **Relationships**: 19 (down from 22)
- **Business Rules**: 40 (down from 45)

### Key Changes from v1

✅ **Merged Tables**:
- `reviews` + `feedback` → `reviews` (with `is_order_review` flag)

✅ **Removed Tables**:
- `articles` (17 columns)
- `authors` (11 columns)
- `categories` (8 columns)

✅ **Removed Columns**:
- `users.referred_by_code` (handled by referrals table)
- `analysis_prices.features` (not needed for MVP)
- `orders.payment_proof_url` (not needed for MVP)
- `orders.result_file_url` (not needed for MVP)
- `orders.revision_count` (not needed for MVP)

✅ **Enhanced Constraints**:
- `referrals.referred_user_id` UNIQUE (one referral code redemption per user)
- `reviews.user_id` UNIQUE (one review/feedback per user)

### Benefits

- ✅ **Simpler Schema**: 26% fewer tables, 42% fewer columns
- ✅ **Better UX**: One review per user prevents spam
- ✅ **Clearer Logic**: Merged reviews/feedback reduces confusion
- ✅ **MVP Focus**: Removed non-essential features (articles, file uploads)
- ✅ **Data Integrity**: Enforced one-time referral code redemption

---

**Document Version**: 2.0  
**Last Updated**: 2026-01-24  
**Status**: Ready for Implementation  
**Next Step**: Review CSV files and approve schema
