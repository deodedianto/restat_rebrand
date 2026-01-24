# Supabase ERD CSV Files (v2.0 - Revised)

## Overview

This folder contains 4 CSV files that document the complete Supabase database design in a reviewable spreadsheet format.

**Revision v2.0 Changes:**
- ✅ Merged `reviews` and `feedback` tables (users can only submit ONE review/feedback)
- ✅ Enforced one-time referral code redemption per user
- ✅ Removed article management tables (articles, authors, categories)
- ✅ Cleaned up unnecessary columns
- **Total Tables**: 11 (down from 15)

---

## 📁 CSV Files

### 1. **SUPABASE_ERD.csv** (Main Database Schema)

**Columns:**
- Table Name
- Column Name
- Data Type
- Constraints
- Foreign Key
- Description

**Purpose**: Complete database schema with all 15 tables and 179 columns.

**Use Case**: 
- Detailed review of every column
- Data type verification
- Constraint checking
- Import into database design tools

**Row Count**: 104 rows (one per column)

**Tables Included**:
1. users (12 columns)
2. analysts (8 columns)
3. analysis_prices (8 columns)
4. orders (17 columns)
5. work_history (10 columns)
6. consultations (10 columns)
7. referrals (8 columns)
8. referral_payouts (11 columns)
9. analyst_payments (10 columns)
10. expenses (10 columns)
11. reviews (10 columns) **[MERGED with feedback]**

**Removed Tables** (v2.0):
- ~~articles~~ (removed - not needed for MVP)
- ~~authors~~ (removed - not needed for MVP)
- ~~categories~~ (removed - not needed for MVP)
- ~~feedback~~ (merged into reviews)

---

### 2. **SUPABASE_RELATIONSHIPS.csv** (Table Relationships)

**Columns:**
- From Table
- From Column
- Relationship Type
- To Table
- To Column
- Description

**Purpose**: All foreign key relationships and table connections.

**Use Case**:
- Understand data flow
- Verify relationship types
- Check referential integrity
- Create ER diagrams

**Row Count**: 19 relationships

**Relationship Types**:
- **One-to-One**: 5 relationships (auth_id, referred_user_id, user_id in reviews, order_id in reviews, order_id in analyst_payments)
- **Many-to-One**: 14 relationships (most foreign keys)

---

### 3. **SUPABASE_TABLES_SUMMARY.csv** (High-Level Overview)

**Columns:**
- Table Name
- Column Count
- Primary Purpose
- Used By
- Critical Features

**Purpose**: Executive summary of each table's role and key features.

**Use Case**:
- Quick overview of database structure
- Understand business purpose of each table
- Identify critical features
- Plan development priorities

**Row Count**: 15 tables

**Categories**:
- **User Management**: users, analysts
- **Order System**: orders, work_history, consultations
- **Referral System**: referrals, referral_payouts
- **Financial**: expenses, analyst_payments
- **Feedback**: reviews, feedback
- **Content**: articles, authors, categories, analysis_prices

---

### 4. **SUPABASE_BUSINESS_RULES.csv** (Business Logic & Constraints)

**Columns:**
- Table Name
- Business Rule
- Implementation
- Impact

**Purpose**: Document all business rules, constraints, and automatic behaviors.

**Use Case**:
- Understand business logic
- Verify constraint implementation
- Plan validation logic
- Identify trigger requirements

**Row Count**: 40 business rules

**Rule Categories**:
- **Data Integrity**: UNIQUE constraints, CHECK constraints
- **Validation**: Phone format, email format, date logic
- **Automation**: Triggers, auto-updates, auto-calculations
- **Workflow**: Status transitions, approval flows
- **Security**: Access controls, data preservation

---

## 📊 How to Use These Files

### 1. **Review in Excel/Google Sheets**

```
1. Open each CSV in your preferred spreadsheet application
2. Use filters to focus on specific tables
3. Use conditional formatting to highlight important fields
4. Add comments/notes for review feedback
```

### 2. **Import into Database Design Tools**

Compatible with:
- **dbdiagram.io**: Paste CSV data
- **draw.io**: Import as CSV
- **Lucidchart**: CSV import feature
- **MySQL Workbench**: Generate from CSV
- **pgAdmin**: Schema import

### 3. **Team Review Workflow**

```
Phase 1: SUPABASE_TABLES_SUMMARY.csv
- Quick overview review
- Discuss table purposes
- Identify missing tables

Phase 2: SUPABASE_ERD.csv
- Detailed column review
- Verify data types
- Check constraints

Phase 3: SUPABASE_RELATIONSHIPS.csv
- Verify relationships
- Check foreign keys
- Validate cascade rules

Phase 4: SUPABASE_BUSINESS_RULES.csv
- Review business logic
- Verify triggers
- Approve automation
```

### 4. **Convert to SQL**

After approval, use the detailed CSV to generate SQL:

```sql
-- Example from SUPABASE_ERD.csv
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  ...
);
```

---

## 🔍 Quick Statistics

### Database Size (v2.0)
- **Tables**: 11 (down from 15)
- **Total Columns**: 104 (down from 179)
- **Relationships**: 19 (down from 22)
- **Business Rules**: 40 (down from 45)

### Table Categories
- **User/Auth**: 2 tables (users, analysts)
- **Core Business**: 5 tables (orders, work_history, consultations, analysis_prices, expenses)
- **Referral System**: 2 tables (referrals, referral_payouts)
- **Financial**: 1 table (analyst_payments)
- **Feedback**: 1 table (reviews - merged with feedback)
- **Content**: 0 tables (removed for MVP)

### Constraint Types (v2.0)
- **Primary Keys**: 11 (all UUID)
- **Foreign Keys**: 19
- **Unique Constraints**: 10
- **Check Constraints**: 22
- **Default Values**: 28
- **Auto-Triggers**: 7

### Data Types Used (v2.0)
- **UUID**: 11 (primary keys)
- **VARCHAR**: 38 (text fields)
- **TEXT**: 16 (long text)
- **INTEGER**: 13 (numbers)
- **TIMESTAMP**: 22 (dates/times)
- **BOOLEAN**: 6 (flags)
- **JSONB**: 1 (flexible data)
- **SERIAL**: 1 (auto-increment)
- **TIME**: 1 (time only)
- **DATE**: 3 (date only)

---

## ✅ Review Checklist

### Data Structure
- [ ] All necessary tables are included
- [ ] Column names are descriptive and consistent
- [ ] Data types are appropriate for each field
- [ ] Primary keys are properly defined

### Relationships
- [ ] Foreign keys are correctly defined
- [ ] Cascade rules are appropriate (CASCADE vs SET NULL vs RESTRICT)
- [ ] One-to-One relationships use UNIQUE constraint
- [ ] Many-to-Many relationships have junction tables (if needed)

### Constraints
- [ ] CHECK constraints enforce business rules
- [ ] UNIQUE constraints prevent duplicates
- [ ] NOT NULL constraints are on required fields
- [ ] DEFAULT values are sensible

### Business Logic
- [ ] Status transitions are clear
- [ ] Triggers handle automation correctly
- [ ] Calculated fields are accurate
- [ ] Timestamps are tracked appropriately

### Performance
- [ ] Foreign keys are indexed
- [ ] Frequently queried columns are indexed
- [ ] Composite indexes are planned for complex queries
- [ ] Full-text search is configured for articles

### Security
- [ ] RLS policies are planned
- [ ] Sensitive data is identified
- [ ] Admin access is controlled
- [ ] User isolation is enforced

---

## 📋 Review Notes Template

Use this template to provide feedback:

```
TABLE: [table_name]
ISSUE: [describe the issue]
SUGGESTION: [your recommendation]
PRIORITY: [High/Medium/Low]
CATEGORY: [Structure/Constraint/Relationship/Business Rule]

Example:
TABLE: orders
ISSUE: Missing index on user_id + payment_status
SUGGESTION: Add composite index for frequent queries
PRIORITY: High
CATEGORY: Performance
```

---

## 🔄 Next Steps After Review

1. **Collect Feedback**
   - Review all CSV files
   - Document issues/suggestions
   - Prioritize changes

2. **Update Schema**
   - Modify CSV files based on feedback
   - Re-export updated versions
   - Notify team of changes

3. **Generate SQL**
   - Convert approved CSV to SQL scripts
   - Add comments and documentation
   - Test in development environment

4. **Create Supabase Project**
   - Execute SQL scripts
   - Verify all tables created
   - Test constraints and triggers

5. **Implement Frontend**
   - Update API calls
   - Add Supabase client
   - Test data flow

---

## 📞 Support

For questions or clarifications:
1. Check the main documentation: `SUPABASE_DATABASE_DESIGN.md`
2. Review related docs in `/docs` folder
3. Contact development team

---

**Version**: 2.0 (Revised)  
**Last Updated**: 2026-01-24  
**Status**: Ready for Implementation  
**Files**: 4 CSV files + 1 README

**Changes in v2.0:**
- Merged `reviews` and `feedback` tables (one review per user)
- Removed article management tables (articles, authors, categories)
- Enforced one-time referral code redemption
- Cleaned up 75 unnecessary columns
- Reduced from 15 tables to 11 tables
