-- Fix for the database error when creating new users with promo codes
-- Run this in your Supabase SQL editor

-- First, ensure the profile creation trigger handles metadata correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_promo_code TEXT;
BEGIN
  -- Extract promo code from auth metadata if present
  v_promo_code := NEW.raw_user_meta_data->>'promo_code_used';
  
  -- Create the profile with promo code if provided
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    family_id,
    promo_code_used,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    uuid_generate_v4(),
    v_promo_code,
    NOW(),
    NOW()
  );
  
  -- If there's a promo code, handle it
  IF v_promo_code IS NOT NULL THEN
    -- Record promo code usage
    INSERT INTO promo_code_usage (promo_code_id, user_id, applied_at)
    SELECT id, NEW.id, NOW()
    FROM promo_codes
    WHERE code = v_promo_code
    AND active = true
    AND (usage_limit IS NULL OR times_used < usage_limit)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update promo code usage count
    UPDATE promo_codes 
    SET times_used = times_used + 1
    WHERE code = v_promo_code
    AND active = true;
    
    -- Create promo activation record
    INSERT INTO promo_activations (user_id, promo_code, free_months, status)
    SELECT NEW.id, v_promo_code, free_months, 'pending'
    FROM promo_codes
    WHERE code = v_promo_code
    AND active = true
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    -- Still try to create basic profile without promo code
    INSERT INTO public.profiles (id, email, family_id)
    VALUES (NEW.id, NEW.email, uuid_generate_v4())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Make sure the profiles table has the necessary columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_code_usage TO authenticated;
GRANT ALL ON public.promo_activations TO authenticated;