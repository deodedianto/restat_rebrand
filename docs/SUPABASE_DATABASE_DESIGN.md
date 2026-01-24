# Supabase Database Design Plan

## Overview

This document outlines the complete database schema design for migrating from localStorage to Supabase. The design considers all business flows across admin and user dashboards, ensuring data integrity, scalability, and optimal performance.

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
9. [Testing Plan](#testing-plan)

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
│ - phone     │         │ - status    │         │ - bank_name │
│ - referral  │         └─────────────┘         └─────────────┘
│   _code     │                │                       │
└─────────────┘                │                       │
       │                       │                       │
       │                       ▼                       ▼
       │            ┌──────────────────┐    ┌─────────────────┐
       │            │ work_history     │    │ analyst_payments│
       │            │                  │    │                 │
       │            │ - id             │    │ - id            │
       │            │ - user_id        │    │ - analyst_id    │
       │            │ - order_id       │    │ - order_id      │
       │            │ - type           │    │ - amount        │
       │            │ - status         │    │ - status        │
       │            └──────────────────┘    └─────────────────┘
       │
       ▼
┌─────────────────┐         ┌─────────────────┐
│ referrals       │         │ referral_payouts│
│                 │────────►│                 │
│ - id            │         │ - id            │
│ - referrer_id   │         │ - user_id       │
│ - referred_id   │         │ - amount        │
│ - code_used     │         │ - status        │
│ - reward_earned │         │ - bank_name     │
└─────────────────┘         └─────────────────┘
       │
       │            ┌─────────────────┐
       └───────────►│   expenses      │
                    │                 │
                    │ - id            │
                    │ - type          │
                    │ - name          │
                    │ - amount        │
                    │ - analyst_id    │◄──┐
                    │ - user_id       │   │
                    └─────────────────┘   │
                                          │
┌─────────────────┐         ┌─────────────────┐
│ analysis_prices │         │ consultations   │
│                 │         │                 │
│ - id            │         │ - id            │
│ - name          │         │ - user_id       │
│ - package       │         │ - date          │
│ - price         │         │ - status        │
└─────────────────┘         └─────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   articles      │────────►│   authors       │         │  categories     │
│                 │         │                 │         │                 │
│ - id            │         │ - id            │         │ - id            │
│ - title         │         │ - name          │         │ - name          │
│ - slug          │         │ - bio           │         │ - slug          │
│ - author_id     │         │ - avatar        │         │ - color         │
│ - category_id   │────────►└─────────────────┘         └─────────────────┘
│ - content       │
│ - featured      │
│ - published_at  │
└─────────────────┘

┌─────────────────┐
│   reviews       │
│                 │
│ - id            │
│ - user_id       │◄──────────┐
│ - order_id      │           │
│ - rating        │           │
│ - comment       │           │
│ - type          │           │
└─────────────────┘           │
                              │
                    ┌─────────────────┐
                    │   feedback      │
                    │                 │
                    │ - id            │
                    │ - user_id       │
                    │ - rating        │
                    │ - comment       │
                    └─────────────────┘
```

---

## Table Schemas

### 1. Users Table (`users`)

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
  referred_by_code VARCHAR(20), -- Who referred this user
  referral_earnings INTEGER DEFAULT 0, -- Total earnings from referrals
  
  -- Bank Account for Payouts
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  
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
CREATE INDEX idx_users_referred_by ON users(referred_by_code);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Email must be unique
- Referral code is generated only once and cannot be changed
- Phone number must start with +62
- Referral earnings cannot be negative

---

### 2. Analysts Table (`analysts`)

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

-- Trigger for updated_at
CREATE TRIGGER update_analysts_updated_at
  BEFORE UPDATE ON analysts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- WhatsApp number must start with +62
- Bank details required for payment processing
- Analysts can be deactivated but not deleted (for historical data)

---

### 3. Analysis Prices Table (`analysis_prices`)

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
  features JSONB, -- Array of features for this package
  
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

-- Trigger for updated_at
CREATE TRIGGER update_analysis_prices_updated_at
  BEFORE UPDATE ON analysis_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Each analysis type can have 3 packages (Basic, Standard, Premium)
- Prices must be positive integers
- Combination of name + package must be unique

---

### 4. Orders Table (`orders`)

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
  payment_proof_url TEXT,
  
  -- Work Progress
  result_file_url TEXT,
  revision_count INTEGER DEFAULT 0,
  
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
  ),
  CONSTRAINT non_negative_revision CHECK (revision_count >= 0)
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_analyst_id ON orders(analyst_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_work_status ON orders(work_status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_deadline_date ON orders(deadline_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_orders_status_composite ON orders(payment_status, work_status, analyst_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, work_status);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Order number is auto-incrementing and user-friendly (e.g., 1, 2, 3...)
- Payment status: Belum Dibayar → Dibayar
- Work status: Menunggu → Diproses → Selesai (or Dibatalkan)
- Work status auto-updates to "Diproses" only when paid AND analyst assigned
- Deadline must be after or equal to delivery date
- Analyst fee cannot exceed order price

---

### 5. Work History Table (`work_history`)

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
  type VARCHAR(50) NOT NULL, -- "Order", "Konsultasi", "Pengerjaan", "Review"
  status VARCHAR(50) NOT NULL,
  
  -- Additional Data
  notes TEXT,
  metadata JSONB, -- Flexible data storage (e.g., order details, consultation info)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_type CHECK (
    type IN ('Order', 'Konsultasi', 'Pengerjaan', 'Review')
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

-- Trigger for updated_at
CREATE TRIGGER update_work_history_updated_at
  BEFORE UPDATE ON work_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Links to either order or consultation (not both)
- Type determines which reference must be present
- Metadata stores flexible information based on type

---

### 6. Consultations Table (`consultations`)

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

-- Trigger for updated_at
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Status auto-updates to "Selesai" after scheduled date/time passes
- Stores snapshot of contact info at booking time

---

### 7. Referrals Table (`referrals`)

**Purpose**: Track referral relationships and rewards.

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
  CONSTRAINT unique_referral UNIQUE (referred_user_id) -- Can only be referred once
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(reward_status);
CREATE INDEX idx_referrals_code ON referrals(referral_code_used);
```

**Business Rules**:
- Users cannot refer themselves
- Each user can only be referred once
- Reward status: Pending → Approved → Paid
- Reward amount set at time of referral (constant from app config)

---

### 8. Referral Payouts Table (`referral_payouts`)

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

-- Trigger for updated_at
CREATE TRIGGER update_referral_payouts_updated_at
  BEFORE UPDATE ON referral_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Stores snapshot of bank info at request time
- Status priority: Belum Dibayar → Menunggu → Dibayar
- Admin can add processing notes

---

### 9. Analyst Payments Table (`analyst_payments`)

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

-- Trigger for updated_at
CREATE TRIGGER update_analyst_payments_updated_at
  BEFORE UPDATE ON analyst_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- One payment per order
- Status priority: Belum Dibayar → Menunggu → Dibayar
- Amount must match order's analyst_fee

---

### 10. Expenses Table (`expenses`)

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

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Fee Analis must have analyst_id
- Fee Referal must have user_id
- Other types don't require references
- All amounts must be positive

---

### 11. Reviews Table (`reviews`)

**Purpose**: Store customer reviews and ratings for completed orders.

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
  type VARCHAR(20) NOT NULL, -- "order" or "general"
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT valid_review_type CHECK (type IN ('order', 'general')),
  CONSTRAINT order_review_requires_order CHECK (
    type != 'order' OR order_id IS NOT NULL
  ),
  CONSTRAINT unique_order_review UNIQUE (order_id) -- One review per order
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_type ON reviews(type);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_published ON reviews(is_published);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Rating must be 1-5
- Type "order" requires order_id
- Type "general" doesn't require order_id
- One review per order
- Admin can publish/feature reviews

---

### 12. Feedback Table (`feedback`)

**Purpose**: Store general user feedback separate from order reviews.

**Schema**:
```sql
CREATE TABLE feedback (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Feedback Details
  rating INTEGER NOT NULL, -- 1-5 stars
  comment TEXT NOT NULL,
  
  -- Category (optional)
  category VARCHAR(50), -- e.g., "Website", "Service", "Support"
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_feedback_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Users can submit multiple feedback entries
- Rating must be 1-5

---

### 13. Articles Table (`articles`)

**Purpose**: Store blog articles for content marketing.

**Schema**:
```sql
CREATE TABLE articles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  
  -- Content
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Can be Markdown or HTML
  
  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER, -- In minutes
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT non_negative_views CHECK (view_count >= 0),
  CONSTRAINT positive_reading_time CHECK (reading_time > 0)
);

-- Indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_articles_featured ON articles(is_featured);
CREATE INDEX idx_articles_published_at ON articles(published_at);

-- Full-text search index
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || content));

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Slug must be unique
- Published_at set automatically when is_published changes to true
- View count incremented on article view

---

### 14. Authors Table (`authors`)

**Purpose**: Store article author information.

**Schema**:
```sql
CREATE TABLE authors (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Author Details
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  
  -- Social Media
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Stats
  article_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT non_negative_articles CHECK (article_count >= 0)
);

-- Indexes
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_authors_name ON authors(name);

-- Trigger for updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Slug must be unique
- Article count updated via trigger

---

### 15. Categories Table (`categories`)

**Purpose**: Store article categories for organization.

**Schema**:
```sql
CREATE TABLE categories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Category Details
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  
  -- Stats
  article_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT non_negative_articles CHECK (article_count >= 0),
  CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$' OR color IS NULL)
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_name ON categories(name);

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Rules**:
- Slug must be unique
- Color must be valid hex code
- Article count updated via trigger

---

## Relationships & Foreign Keys

### Primary Relationships

1. **Users → Orders**: One-to-Many
   - A user can have multiple orders
   - Foreign key: `orders.user_id → users.id`

2. **Analysts → Orders**: One-to-Many
   - An analyst can handle multiple orders
   - Foreign key: `orders.analyst_id → analysts.id`

3. **Analysis Prices → Orders**: One-to-Many
   - A price can be used for multiple orders
   - Foreign key: `orders.analysis_price_id → analysis_prices.id`

4. **Users → Work History**: One-to-Many
   - A user has multiple work history entries
   - Foreign key: `work_history.user_id → users.id`

5. **Orders → Work History**: One-to-Many
   - An order can have multiple history entries
   - Foreign key: `work_history.order_id → orders.id`

6. **Users → Consultations**: One-to-Many
   - A user can book multiple consultations
   - Foreign key: `consultations.user_id → users.id`

7. **Users → Referrals (Referrer)**: One-to-Many
   - A user can refer multiple people
   - Foreign key: `referrals.referrer_id → users.id`

8. **Users → Referrals (Referred)**: One-to-One
   - A user can be referred by only one person
   - Foreign key: `referrals.referred_user_id → users.id` (UNIQUE)

9. **Users → Referral Payouts**: One-to-Many
   - A user can request multiple payouts
   - Foreign key: `referral_payouts.user_id → users.id`

10. **Analysts → Analyst Payments**: One-to-Many
    - An analyst can receive multiple payments
    - Foreign key: `analyst_payments.analyst_id → analysts.id`

11. **Orders → Analyst Payments**: One-to-One
    - Each order has one analyst payment
    - Foreign key: `analyst_payments.order_id → orders.id` (UNIQUE)

12. **Analysts → Expenses**: One-to-Many (conditional)
    - Foreign key: `expenses.analyst_id → analysts.id`

13. **Users → Expenses**: One-to-Many (conditional)
    - Foreign key: `expenses.user_id → users.id`

14. **Users → Reviews**: One-to-Many
    - Foreign key: `reviews.user_id → users.id`

15. **Orders → Reviews**: One-to-One
    - Foreign key: `reviews.order_id → orders.id` (UNIQUE)

16. **Users → Feedback**: One-to-Many
    - Foreign key: `feedback.user_id → users.id`

17. **Authors → Articles**: One-to-Many
    - Foreign key: `articles.author_id → authors.id`

18. **Categories → Articles**: One-to-Many
    - Foreign key: `articles.category_id → categories.id`

---

## Indexes & Performance

### Strategy

1. **Primary Keys**: All tables use UUID as primary key
2. **Foreign Keys**: All foreign keys are indexed
3. **Frequently Queried Columns**: Status, dates, user_id
4. **Composite Indexes**: For complex queries

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

-- Articles: Public website queries
CREATE INDEX idx_articles_published_featured ON articles(is_published, is_featured, published_at);
```

---

## Row Level Security (RLS)

### Overview

Supabase RLS policies ensure users can only access their own data, while admins have full access.

### User Roles

```sql
-- Create roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'analyst');

-- Add role column to users table
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';
```

### RLS Policies

#### Users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
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

#### Orders Table

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can update own unpaid orders
CREATE POLICY "Users can update own unpaid orders" ON orders
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
    AND payment_status = 'Belum Dibayar'
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Analysts can view their assigned orders
CREATE POLICY "Analysts can view assigned orders" ON orders
  FOR SELECT
  USING (
    analyst_id IN (
      SELECT a.id FROM analysts a
      JOIN users u ON u.name = a.name
      WHERE u.auth_id = auth.uid() AND u.role = 'analyst'
    )
  );
```

#### Work History Table

```sql
-- Enable RLS
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view own history" ON work_history
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can create their own history
CREATE POLICY "Users can create own history" ON work_history
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Admins can view all history
CREATE POLICY "Admins can view all history" ON work_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
```

#### Similar RLS policies for:
- Consultations
- Referrals
- Referral Payouts
- Reviews
- Feedback
- (Admin-only tables: analysts, expenses, analysis_prices, analyst_payments)

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

### 5. Update Article Count for Authors

```sql
CREATE OR REPLACE FUNCTION update_author_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE authors
    SET article_count = article_count + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE authors
    SET article_count = article_count - 1
    WHERE id = OLD.author_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.author_id != OLD.author_id THEN
    UPDATE authors SET article_count = article_count - 1 WHERE id = OLD.author_id;
    UPDATE authors SET article_count = article_count + 1 WHERE id = NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_author_article_count
  AFTER INSERT OR UPDATE OR DELETE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_author_article_count();
```

### 6. Update Category Article Count

```sql
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories
    SET article_count = article_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories
    SET article_count = article_count - 1
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
    UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
    UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_article_count
  AFTER INSERT OR UPDATE OR DELETE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_category_article_count();
```

### 7. Auto-Update Consultation Status

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

### 8. Create Analyst Payment on Order Completion

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

### 9. Sync Order to Work History

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
4. Auto-trigger: User A's referral_earnings += reward_amount
   ↓
5. User A requests payout (must have bank account)
   ↓
6. Referral payout record created with status "Belum Dibayar"
   ↓
7. Admin processes → status = "Menunggu"
   ↓
8. Admin completes payment → status = "Dibayar"
   ↓
9. Auto-trigger: User A's referral_earnings -= payout amount
```

### Consultation Flow

```
1. User books consultation
   ↓
2. Consultation created with status "Dijadwalkan"
   ↓
3. Work history entry created
   ↓
4. Scheduled date/time passes
   ↓
5. Cron job runs hourly: status = "Selesai"
   ↓
6. Work history updated
```

### Financial Dashboard Logic

```sql
-- Total Pendapatan (current month)
SELECT COALESCE(SUM(price), 0) as total_pendapatan
FROM orders
WHERE payment_status = 'Dibayar'
  AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Total Pengeluaran (current month)
SELECT COALESCE(SUM(amount), 0) as total_pengeluaran
FROM expenses
WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);

-- Pendapatan Bersih
SELECT (total_pendapatan - total_pengeluaran) as pendapatan_bersih;

-- Orders needing analyst assignment (priority)
SELECT *
FROM orders
WHERE analyst_id IS NULL
  AND payment_status = 'Dibayar'
ORDER BY order_date ASC;

-- Follow-up orders (unpaid)
SELECT 
  o.*,
  u.name as customer_name,
  u.email,
  u.phone,
  (CURRENT_DATE - o.order_date) as days_overdue
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = 'Belum Dibayar'
ORDER BY days_overdue DESC;
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
   - Create migration scripts to export current data
   - Transform to match new schema

2. **Import to Supabase**
   - Users
   - Analysts
   - Analysis Prices
   - Orders
   - Work History
   - Consultations
   - Reviews/Feedback

3. **Verify data integrity**
   - Check all foreign key relationships
   - Validate constraints

### Phase 3: Frontend Integration (Week 3-4)

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase utilities**
   - `/lib/supabase/client.ts` - Client instance
   - `/lib/supabase/queries.ts` - Query functions
   - `/lib/supabase/mutations.ts` - Mutation functions

3. **Replace localStorage with Supabase**
   - Update contexts (AuthContext, OrderContext)
   - Update hooks (useEditData, useDashboardStats)
   - Update components to use Supabase queries

4. **Implement real-time subscriptions**
   ```typescript
   supabase
     .channel('orders_changes')
     .on('postgres_changes', 
       { event: '*', schema: 'public', table: 'orders' },
       (payload) => {
         // Update UI in real-time
       }
     )
     .subscribe()
   ```

### Phase 4: Testing (Week 5)

1. **Unit tests** for database functions
2. **Integration tests** for API endpoints
3. **E2E tests** for user flows
4. **Performance testing** with realistic data volume
5. **Security testing** for RLS policies

### Phase 5: Deployment (Week 6)

1. **Backup localStorage data**
2. **Deploy to production**
3. **Monitor errors and performance**
4. **Gradual rollout** (beta users first)
5. **Full production release**

---

## Testing Plan

### Unit Tests

```typescript
// Test: Auto-update work status
test('should update work status to Diproses when paid and analyst assigned', async () => {
  const order = await createOrder({ payment_status: 'Belum Dibayar', work_status: 'Menunggu' })
  
  await updateOrder(order.id, { 
    payment_status: 'Dibayar',
    analyst_id: 'test-analyst-id'
  })
  
  const updated = await getOrder(order.id)
  expect(updated.work_status).toBe('Diproses')
})

// Test: Referral earnings increment
test('should increment referrer earnings when referral created', async () => {
  const referrer = await createUser({ name: 'Referrer' })
  const referred = await createUser({ name: 'Referred', referred_by_code: referrer.referral_code })
  
  const updatedReferrer = await getUser(referrer.id)
  expect(updatedReferrer.referral_earnings).toBe(REFERRAL_REWARD_AMOUNT)
})

// Test: Analyst payment creation
test('should create analyst payment when order completed', async () => {
  const order = await createOrder({ work_status: 'Diproses', analyst_fee: 500000 })
  
  await updateOrder(order.id, { work_status: 'Selesai' })
  
  const payment = await getAnalystPaymentByOrder(order.id)
  expect(payment).toBeDefined()
  expect(payment.amount).toBe(500000)
  expect(payment.status).toBe('Belum Dibayar')
})
```

### Integration Tests

```typescript
// Test: Complete order flow
test('complete order flow from creation to completion', async () => {
  // 1. User creates order
  const order = await createOrder({
    user_id: testUser.id,
    research_title: 'Test Research',
    price: 1000000
  })
  expect(order.payment_status).toBe('Belum Dibayar')
  
  // 2. Verify work history created
  const history = await getWorkHistory({ order_id: order.id })
  expect(history).toHaveLength(1)
  
  // 3. User pays
  await confirmPayment(order.id)
  const paidOrder = await getOrder(order.id)
  expect(paidOrder.payment_status).toBe('Dibayar')
  
  // 4. Admin assigns analyst
  await assignAnalyst(order.id, testAnalyst.id)
  const assignedOrder = await getOrder(order.id)
  expect(assignedOrder.work_status).toBe('Diproses')
  
  // 5. Complete order
  await completeOrder(order.id)
  const completedOrder = await getOrder(order.id)
  expect(completedOrder.work_status).toBe('Selesai')
  
  // 6. Verify analyst payment created
  const payment = await getAnalystPaymentByOrder(order.id)
  expect(payment).toBeDefined()
})
```

### RLS Tests

```typescript
// Test: User can only see own orders
test('user can only access their own orders', async () => {
  const user1 = await createUser({ email: 'user1@test.com' })
  const user2 = await createUser({ email: 'user2@test.com' })
  
  await createOrder({ user_id: user1.id })
  await createOrder({ user_id: user2.id })
  
  // Login as user1
  const { data: user1Orders } = await supabase.auth.signInWithPassword({
    email: 'user1@test.com',
    password: 'password'
  }).then(() => supabase.from('orders').select())
  
  expect(user1Orders).toHaveLength(1)
  expect(user1Orders[0].user_id).toBe(user1.id)
})

// Test: Admin can see all orders
test('admin can access all orders', async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' })
  const user1 = await createUser({ email: 'user1@test.com' })
  const user2 = await createUser({ email: 'user2@test.com' })
  
  await createOrder({ user_id: user1.id })
  await createOrder({ user_id: user2.id })
  
  // Login as admin
  const { data: allOrders } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'password'
  }).then(() => supabase.from('orders').select())
  
  expect(allOrders).toHaveLength(2)
})
```

### Performance Tests

```typescript
// Test: Query performance with large dataset
test('orders query should complete within 100ms', async () => {
  // Create 10,000 orders
  await bulkCreateOrders(10000)
  
  const start = Date.now()
  const orders = await getOrders({ limit: 50, offset: 0 })
  const duration = Date.now() - start
  
  expect(duration).toBeLessThan(100)
  expect(orders).toHaveLength(50)
})

// Test: Real-time subscription performance
test('real-time updates should be received within 500ms', async () => {
  const received = []
  
  supabase
    .channel('test-orders')
    .on('postgres_changes', { event: 'INSERT', table: 'orders' }, (payload) => {
      received.push(payload)
    })
    .subscribe()
  
  const start = Date.now()
  await createOrder({ user_id: testUser.id })
  
  await waitFor(() => expect(received).toHaveLength(1), { timeout: 1000 })
  
  const duration = Date.now() - start
  expect(duration).toBeLessThan(500)
})
```

---

## Summary

This database design provides:

✅ **Scalability**: Proper indexing and relationships for growth  
✅ **Security**: RLS policies for data isolation  
✅ **Data Integrity**: Constraints and foreign keys  
✅ **Automation**: Triggers for business logic  
✅ **Performance**: Optimized indexes and queries  
✅ **Maintainability**: Clear schema and documentation  
✅ **Real-time**: Supabase subscriptions for live updates  
✅ **Audit Trail**: Timestamps and history tracking  

### Next Steps

1. **Review and approve** this design
2. **Create Supabase project**
3. **Run migration scripts**
4. **Test thoroughly**
5. **Deploy to production**

### Estimated Timeline

- **Setup**: 1 week
- **Data Migration**: 1 week
- **Frontend Integration**: 2 weeks
- **Testing**: 1 week
- **Deployment**: 1 week

**Total**: ~6 weeks for complete migration

---

## Related Documentation

- `/docs/ORDER_SYNC_SYSTEM.md` - Order synchronization logic
- `/docs/REFERRAL_SYSTEM.md` - Referral system implementation
- `/docs/DASHBOARD_DATA_FLOW.md` - Dashboard data flow
- `/docs/WORKSTATUS_DIPROSES_UPDATE.md` - Work status logic
- `/docs/ORDER_ANALYST_INTEGRATION.md` - Order-analyst integration
- `/docs/PENGELUARAN_CONDITIONAL_FIELDS.md` - Expense conditional fields

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-24  
**Author**: Development Team  
**Status**: Ready for Review
