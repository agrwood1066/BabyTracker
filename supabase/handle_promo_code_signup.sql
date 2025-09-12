-- Database function to handle promo code on user creation
-- This should be added to your Supabase SQL editor

-- Function to handle promo code on profile creation
CREATE OR REPLACE FUNCTION handle_promo_code_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_promo_code TEXT;
  v_promo_id UUID;
  v_free_months INTEGER;
BEGIN
  -- Get the promo code from the auth metadata
  v_promo_code := NEW.raw_user_meta_data->>'promo_code_used';
  
  -- If there's a promo code, validate and apply it
  IF v_promo_code IS NOT NULL THEN
    -- Find the promo code details
    SELECT id, free_months INTO v_promo_id, v_free_months
    FROM promo_codes
    WHERE code = v_promo_code
    AND active = true
    AND (usage_limit IS NULL OR times_used < usage_limit)
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF v_promo_id IS NOT NULL THEN
      -- Update the profile with the promo code
      UPDATE profiles 
      SET 
        promo_code_used = v_promo_code,
        promo_months_pending = v_free_months,
        trial_ends_at = NOW() + INTERVAL '14 days' -- Standard trial period
      WHERE id = NEW.id;
      
      -- Record the promo code usage
      INSERT INTO promo_code_usage (
        promo_code_id,
        user_id,
        applied_at
      ) VALUES (
        v_promo_id,
        NEW.id,
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      -- Create promo activation record
      INSERT INTO promo_activations (
        user_id,
        promo_code,
        free_months,
        status,
        created_at
      ) VALUES (
        NEW.id,
        v_promo_code,
        v_free_months,
        'pending',
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      -- Increment the usage count
      UPDATE promo_codes 
      SET times_used = times_used + 1
      WHERE id = v_promo_id;
      
      -- Track the visit conversion
      INSERT INTO promo_visits (
        promo_code,
        visited_at,
        created_at
      ) VALUES (
        v_promo_code,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_promo ON auth.users;
CREATE TRIGGER on_auth_user_created_promo
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_promo_code_on_signup();

-- Update existing profile creation function to not override promo code data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, family_id)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    uuid_generate_v4()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW()
  WHERE profiles.promo_code_used IS NULL; -- Don't override if promo code already set
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;