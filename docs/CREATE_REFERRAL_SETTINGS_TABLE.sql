-- Create referral_settings table
-- This table stores global referral program configuration
-- Only one row should exist (singleton pattern)

CREATE TABLE IF NOT EXISTS referral_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value FLOAT NOT NULL CHECK (discount_value > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('percentage', 'fixed')),
  reward_value FLOAT NOT NULL CHECK (reward_value > 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO referral_settings (id, discount_type, discount_value, reward_type, reward_value)
VALUES (1, 'percentage', 10, 'fixed', 10000)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Anyone can view referral settings"
ON referral_settings FOR SELECT
TO authenticated
USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "Only admins can update referral settings"
ON referral_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_settings_updated ON referral_settings(updated_at DESC);

-- Add comment
COMMENT ON TABLE referral_settings IS 'Global referral program settings - singleton table with only one row (id=1)';
