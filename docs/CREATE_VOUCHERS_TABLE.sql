-- =====================================================
-- Vouchers Table
-- =====================================================
-- Purpose: Store discount vouchers/promo codes
-- Features: Support both percentage and fixed amount discounts

CREATE TABLE vouchers (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Voucher Details
  voucher_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  
  -- Discount Type
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  -- percentage = % discount (e.g., 10%)
  -- fixed = Rp amount (e.g., Rp 50,000)
  
  -- Discount Value
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  -- If discount_type = 'percentage': value is 1-100 (e.g., 10 means 10%)
  -- If discount_type = 'fixed': value is amount in Rupiah (e.g., 50000 means Rp 50,000)
  
  -- Usage Limits (optional)
  max_usage INTEGER DEFAULT NULL, -- NULL = unlimited
  current_usage INTEGER DEFAULT 0,
  
  -- Validity Period (optional)
  valid_from DATE DEFAULT NULL,
  valid_until DATE DEFAULT NULL,
  
  -- Minimum Order Amount (optional)
  min_order_amount INTEGER DEFAULT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active);
CREATE INDEX idx_vouchers_valid_dates ON vouchers(valid_from, valid_until);

-- =====================================================
-- Trigger for updated_at
-- =====================================================
CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to SELECT active vouchers (for validation)
CREATE POLICY "Anyone can view active vouchers"
  ON vouchers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Only admins can INSERT vouchers
CREATE POLICY "Admins can insert vouchers"
  ON vouchers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can UPDATE vouchers
CREATE POLICY "Admins can update vouchers"
  ON vouchers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can DELETE vouchers
CREATE POLICY "Admins can delete vouchers"
  ON vouchers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- Sample Data (Optional)
-- =====================================================
INSERT INTO vouchers (voucher_code, description, discount_type, discount_value, max_usage, valid_until, min_order_amount) VALUES
('WELCOME10', 'Diskon 10% untuk pelanggan baru', 'percentage', 10, 100, '2026-12-31', 100000),
('PROMO50K', 'Diskon Rp 50.000 untuk order di atas Rp 500.000', 'fixed', 50000, NULL, '2026-06-30', 500000),
('NEWYEAR2026', 'Diskon tahun baru 15%', 'percentage', 15, 50, '2026-02-28', NULL);

-- =====================================================
-- Add voucher_code column to orders table (if not exists)
-- =====================================================
-- This allows tracking which voucher was used for each order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Add foreign key constraint (optional)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_voucher
--   FOREIGN KEY (voucher_code) REFERENCES vouchers(voucher_code);
