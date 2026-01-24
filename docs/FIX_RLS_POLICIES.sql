-- Fix RLS Policies for User Registration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. FIX USERS TABLE RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;

-- Users can view their own profile (by ID)
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (by ID)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile during registration
-- This is crucial - it allows the user to create their profile after signup
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Admins can view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert users (for manual creation)
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. VERIFY RLS IS ENABLED
-- ============================================

-- Make sure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. TEST THE POLICIES
-- ============================================

-- Test query (should return 1 row - your own profile)
-- Run this after logging in to test
-- SELECT * FROM users WHERE id = auth.uid();

-- ============================================
-- 4. OPTIONAL: DISABLE EMAIL CONFIRMATION
-- ============================================

-- If you want to test without email confirmation,
-- go to: Authentication > Settings > Email Auth
-- and toggle off "Enable email confirmations"

-- ============================================
-- 5. CHECK EXISTING POLICIES
-- ============================================

-- To see all policies on users table, run:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
