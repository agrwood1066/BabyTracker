-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    due_date DATE,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'partner', 'family')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Family members table for managing family relationships
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL,
    can_edit BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(family_id, user_id)
);

-- Budget categories table
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    expected_budget DECIMAL(10, 2) DEFAULT 0,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Budget items table
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

-- Baby items table
CREATE TABLE baby_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

-- Wishlist items table
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

-- Wishlist shares table for sharing wishlists
CREATE TABLE wishlist_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
    created_by UUID NOT NULL REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hospital bag items table
CREATE TABLE hospital_bag_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
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

-- Baby names table
CREATE TABLE baby_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    suggested_by UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('boy', 'girl', 'neutral')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Baby name votes table
CREATE TABLE baby_name_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_id UUID NOT NULL REFERENCES baby_names(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    vote INTEGER NOT NULL CHECK (vote >= 1 AND vote <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name_id, user_id)
);

-- Enable RLS for all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
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

-- Example RLS policies (add more as needed)
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Family members policies
CREATE POLICY "Users can view family members" ON family_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = family_members.family_id
    )
);

-- Budget items policies
CREATE POLICY "Family members can view budget items" ON budget_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = budget_items.family_id
    )
);
CREATE POLICY "Family members can insert budget items" ON budget_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = budget_items.family_id
    )
);
CREATE POLICY "Family members can update budget items" ON budget_items FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = budget_items.family_id
    )
);

-- (Repeat similar RLS policies for other tables as needed...)

-- Functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- If you want each user to have their own family by default:
  new_family_id := uuid_generate_v4();
  INSERT INTO families (id, name) VALUES (new_family_id, new.email || ' family');
  INSERT INTO public.profiles (id, email, family_id)
  VALUES (new.id, new.email, new_family_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at triggers for relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_baby_items_updated_at BEFORE UPDATE ON baby_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hospital_bag_items_updated_at BEFORE UPDATE ON hospital_bag_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
