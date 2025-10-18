/*
  # Coffee Shop Membership System Schema

  ## Overview
  This migration creates the complete database schema for a coffee shop membership program with:
  - User authentication (members and admins)
  - Invitation code system for registration
  - User profiles with customizable usernames
  
  ## New Tables
  
  ### 1. `user_profiles`
  Stores user profile information
  - `id` (uuid, primary key) - References auth.users
  - `phone` (text, unique) - User's phone number
  - `username` (text) - Customizable display name
  - `is_admin` (boolean) - Whether user has admin privileges
  - `pending_invitation_code` (text, nullable) - Invitation code pending verification
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `invitation_codes`
  Manages invitation codes for registration
  - `id` (uuid, primary key) - Unique identifier
  - `code` (text, unique) - The invitation code itself
  - `created_by` (uuid) - Admin who created the code
  - `used_by` (uuid, nullable) - User who used the code
  - `is_used` (boolean) - Whether code has been used
  - `created_at` (timestamptz) - Code generation timestamp
  - `used_at` (timestamptz, nullable) - When code was used
  
  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:
  
  #### user_profiles policies:
  1. Users can view their own profile
  2. Admins can view all profiles
  3. Users can update their own profile
  4. Admins can update any profile
  
  #### invitation_codes policies:
  1. Anyone can check if a code exists and is unused (for registration)
  2. Admins can view all codes
  3. Admins can create new codes
  4. System can mark codes as used during registration
  
  ## Important Notes
  - All users start as regular members (is_admin = false)
  - First user should be manually promoted to admin via SQL
  - Invitation codes are required for registration
  - Phone numbers must be unique
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  username text DEFAULT 'Coffee Lover',
  is_admin boolean DEFAULT false,
  pending_invitation_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "New users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- invitation_codes policies
CREATE POLICY "Anyone can verify unused codes"
  ON invitation_codes FOR SELECT
  TO authenticated
  USING (is_used = false);

CREATE POLICY "Admins can view all codes"
  ON invitation_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create codes"
  ON invitation_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "System can mark codes as used"
  ON invitation_codes FOR UPDATE
  TO authenticated
  USING (is_used = false)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_is_used ON invitation_codes(is_used);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();