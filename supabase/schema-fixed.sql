-- SIMPLY PREGNANCY DATABASE SCHEMA - FIXED VERSION
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (BE CAREFUL - this will delete all data)
-- Uncomment these lines only if you want to start fresh
/*
DROP TABLE IF EXISTS baby_name_votes CASCADE;
DROP TABLE IF EXISTS baby_names CASCADE;
DROP TABLE IF EXISTS hospital_bag_items CASCADE;
DROP TABLE IF EXISTS wishlist_shares CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS baby_items CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    due_date DATE,
    family_id UUID DEFAULT uuid_generate_v4(),
    role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'partner', 'family')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create all other tables
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    can_edit BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(family_id, user_id)
);

CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    expected_budget DECIMAL(10, 2) DEFAULT 0,
    family_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    added_by UUID NOT NULL REFERENCES profiles(id),
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    price DECIMAL(10, 2),
    price_source TEXT,
    starred BOOLEAN DEFAULT false,
    purchased BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS baby_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    added_by UUID NOT NULL REFERENCES profiles(id),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    purchased BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    added_by UUID NOT NULL REFERENCES profiles(id),
    item_name TEXT NOT NULL,
    description TEXT,
    link TEXT,
    price DECIMAL(10, 2),
    purchased BOOLEAN DEFAULT false,
    purchased_by UUID REFERENCES profiles(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    share_token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
    created_by UUID NOT NULL REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS hospital_bag_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    added_by UUID NOT NULL REFERENCES profiles(id),
    item_name TEXT NOT NULL,
    for_whom TEXT NOT NULL CHECK (for_whom IN ('mum', 'baby', 'partner')),
    category TEXT NOT NULL,
    packed BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS baby_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    suggested_by UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('boy', 'girl', 'neutral')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS baby_name_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_id UUID NOT NULL REFERENCES baby_names(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    vote INTEGER NOT NULL CHECK (vote >= 1 AND vote <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Family members can view budget items" ON budget_items;
DROP POLICY IF EXISTS "Family members can insert budget items" ON budget_items;
DROP POLICY IF EXISTS "Family members can update budget items" ON budget_items;
DROP POLICY IF EXISTS "Family members can delete budget items" ON budget_items;

-- Create comprehensive RLS policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Family members
CREATE POLICY "Users can view family members" ON family_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = family_members.family_id)
);

-- Budget categories
CREATE POLICY "Family members can manage budget categories" ON budget_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = budget_categories.family_id)
);

-- Budget items
CREATE POLICY "Family members can manage budget items" ON budget_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = budget_items.family_id)
);

-- Baby items
CREATE POLICY "Family members can manage baby items" ON baby_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = baby_items.family_id)
);

-- Wishlist items
CREATE POLICY "Family members can manage wishlist items" ON wishlist_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = wishlist_items.family_id)
);

-- Wishlist shares
CREATE POLICY "Family members can manage wishlist shares" ON wishlist_shares FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = wishlist_shares.family_id)
);

-- Hospital bag items
CREATE POLICY "Family members can manage hospital bag items" ON hospital_bag_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = hospital_bag_items.family_id)
);

-- Baby names
CREATE POLICY "Family members can manage baby names" ON baby_names FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = baby_names.family_id)
);

-- Baby name votes
CREATE POLICY "Family members can manage votes" ON baby_name_votes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM baby_names 
        JOIN profiles ON profiles.id = auth.uid() 
        WHERE baby_names.id = baby_name_votes.name_id 
        AND profiles.family_id = baby_names.family_id
    )
);

-- Create or replace functions
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, family_id)
  VALUES (new.id, new.email, uuid_generate_v4())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
DROP TRIGGER IF EXISTS update_baby_items_updated_at ON baby_items;
DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON wishlist_items;
DROP TRIGGER IF EXISTS update_hospital_bag_items_updated_at ON hospital_bag_items;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_baby_items_updated_at BEFORE UPDATE ON baby_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hospital_bag_items_updated_at BEFORE UPDATE ON hospital_bag_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
