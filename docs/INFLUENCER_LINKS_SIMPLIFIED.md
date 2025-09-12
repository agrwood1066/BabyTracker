## Simplified Influencer Link Solution

Since the redirect issues are proving problematic, here's the simplified approach that's now implemented:

### ✅ How It Works Now

1. **Influencer shares link:** `https://www.babystepsplanner.com/?code=SARAH-1`
   - Note: Using `?code=` parameter on the main domain, no `/signup` path needed

2. **When user visits:**
   - Landing page detects the `code` parameter in the URL
   - Sign-up modal automatically opens
   - Promo code field is pre-filled with "SARAH-1"
   - User sees: "Great! We'll apply the SARAH-1 promo code to your account."

3. **User signs up:**
   - Promo code is validated against the database
   - If valid, it's saved to their profile
   - Promo tracking records are created

### 🔗 Influencer Links Format

Instead of: `https://www.babystepsplanner.com/signup?code=SARAH-1`
Use: `https://www.babystepsplanner.com/?code=SARAH-1`

This avoids all redirect issues since it's just the main page with a parameter.

### 📱 Testing the Implementation

1. **Test locally:**
   ```bash
   npm start
   # Visit: http://localhost:3000/?code=TEST-1
   ```

2. **Expected behavior:**
   - Sign-up modal opens automatically
   - Promo code field shows "TEST-1"
   - Message appears: "Great! We'll apply the TEST-1 promo code to your account."

### 🗄️ Database Setup Required

Run this SQL in Supabase to handle promo codes properly:

```sql
-- Update the profiles table to ensure promo_code_used is tracked
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

-- Simple function to apply promo code after signup
CREATE OR REPLACE FUNCTION apply_promo_code_to_user(
  user_id UUID,
  promo_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_promo_id UUID;
  v_free_months INTEGER;
BEGIN
  -- Validate promo code
  SELECT id, free_months INTO v_promo_id, v_free_months
  FROM promo_codes
  WHERE code = promo_code
  AND active = true
  AND (usage_limit IS NULL OR times_used < usage_limit);
  
  IF v_promo_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update profile
  UPDATE profiles 
  SET promo_code_used = promo_code,
      promo_months_pending = v_free_months
  WHERE id = user_id;
  
  -- Record usage
  INSERT INTO promo_code_usage (promo_code_id, user_id)
  VALUES (v_promo_id, user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update usage count
  UPDATE promo_codes 
  SET times_used = times_used + 1
  WHERE id = v_promo_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 🎯 Benefits of This Approach

1. **No redirect issues** - Works directly on the main page
2. **Better UX** - User immediately sees the promo code is applied
3. **Simpler implementation** - No complex routing required
4. **Works everywhere** - No Cloudflare/wrangler configuration needed
5. **Easy to test** - Just add `?code=` to any URL

### 📊 Tracking for Influencers

Influencers can check their dashboard at:
`https://www.babystepsplanner.com/influencer/SARAH-1`

This shows:
- How many people used their code
- Conversion rates
- Commission tracking

### 🔒 Security Notes

- Invalid promo codes are silently ignored (user can still sign up)
- Promo codes are validated server-side
- Usage limits are enforced in the database
- One promo code per user account