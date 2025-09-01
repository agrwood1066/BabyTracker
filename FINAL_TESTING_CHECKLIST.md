# ✅ Baby Steps Paywall - Final Setup Verification

## Your Current Configuration

### ✅ Pricing Structure (Simplified)
- **Monthly**: £6.99/month (single tier)
- **Annual**: £69.99/year (save £14)
- **Trial Period**: 14 days for all plans

### ✅ Files Updated
1. **useSubscription.js** - Simplified to use only one monthly URL
2. **.env** - Contains:
   - `REACT_APP_STRIPE_LAUNCH_MONTHLY_URL` (your £6.99 monthly)
   - `REACT_APP_STRIPE_ANNUAL_URL` (your £69.99 annual)
   - No regular monthly URL (correctly removed)

### ✅ Stripe Configuration
- Payment links redirect to: `https://www.babystepsplanner.com/subscription-success?success=true`
- No cancel URL needed (Stripe Payment Links handle this automatically)
- Webhook endpoint: `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`

---

## 🧪 Local Testing Checklist

### Step 1: Start Your App
```bash
cd /Users/alexanderwood/Desktop/BabyTracker
npm start
```

### Step 2: Test Free User Limits
1. **Sign up** as a new test user (use a different email)
2. **Try these actions**:
   - Add 11 shopping items → Should trigger paywall at item 11
   - Add 4 budget categories → Should trigger paywall at category 4
   - Add 6 baby names → Should trigger paywall at name 6
   - Click on Wishlist → Should show "Premium only" screen
   - Click on Hospital Bag → Should show template only
   - Click on Parenting Vows → Should show "Premium only" screen

### Step 3: Test Paywall Modal
1. **When paywall appears**, verify:
   - Monthly shows £6.99/month ✓
   - Annual shows £69.99/year with "Save £14" ✓
   - Both plan cards are clickable
   - "Start Free Trial" button appears

### Step 4: Test Payment Flow
1. **Click "Start Free Trial"** in the paywall
2. **Verify redirect** to Stripe checkout page
3. **Use test card**: `4242 4242 4242 4242`
   - Any future expiry (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
   - Any 5-digit ZIP (e.g., 12345)
4. **Complete payment**
5. **Verify redirect** to `/subscription-success`
6. **Check success page** shows:
   - "Payment Successful!" message
   - List of unlocked features
   - Auto-redirect to dashboard after 3 seconds

### Step 5: Verify Premium Access
After successful payment:
1. **Go to Dashboard** - Should show "Premium" badge
2. **Try adding items**:
   - Add 20+ shopping items → Should work
   - Add 10+ budget categories → Should work
   - Add unlimited baby names → Should work
3. **Access premium features**:
   - Wishlist → Should be fully accessible
   - Hospital Bag → Should allow customisation
   - Parenting Vows → Should be fully accessible
   - Family Sharing → Should allow invites

### Step 6: Test Promo Codes
1. **Log out** and sign up with new email
2. **Visit**: `http://localhost:3000/?code=SARAH-1`
3. **Verify**:
   - Code auto-applies
   - Trial extends to 1 month instead of 14 days
   - Message shows "Promo code applied!"

### Step 7: Test Influencer Dashboard
1. **Visit**: `http://localhost:3000/influencer/SARAH-1`
2. **Verify dashboard shows**:
   - Stats (signups, trials, conversions)
   - Share link with code
   - Commission structure
   - Tips for success

---

## 🔍 Database Verification

Run these queries in [Supabase SQL Editor](https://supabase.com/dashboard/project/lzppcmkjdgunhldgcgka/sql):

```sql
-- Check if your test user has correct subscription status
SELECT id, email, subscription_status, subscription_plan, 
       trial_ends_at, locked_in_price, stripe_subscription_id
FROM profiles 
WHERE email = 'your-test@email.com';

-- Verify VIP users still have lifetime access
SELECT email, subscription_status 
FROM profiles 
WHERE subscription_status = 'lifetime_admin';

-- Check promo code usage
SELECT pc.code, pcu.applied_at, p.email, p.trial_ends_at
FROM promo_code_usage pcu
JOIN promo_codes pc ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON p.id = pcu.user_id
ORDER BY pcu.applied_at DESC;
```

---

## ⚠️ Common Issues & Solutions

### Issue: Payment doesn't update subscription
**Solution**: 
1. Check webhook logs in Stripe Dashboard
2. Verify webhook secret is correct in Supabase
3. Wait 5-10 seconds for webhook to process

### Issue: Paywall modal shows wrong prices
**Solution**: 
1. Hard refresh browser (Cmd+Shift+R)
2. Check .env has correct URLs
3. Restart npm after .env changes

### Issue: "URL not configured" error
**Solution**:
1. Ensure payment links are in .env
2. Format should be full URL starting with `https://buy.stripe.com/`
3. Restart app after updating .env

### Issue: Promo code doesn't apply
**Solution**:
1. Check code exists in database
2. Verify code is uppercase (e.g., SARAH-1)
3. Check usage limits haven't been exceeded

---

## ✅ Everything Is Ready!

Your simplified paywall system is configured correctly with:
- ✅ Single monthly tier (£6.99)
- ✅ Annual option (£69.99) 
- ✅ Stripe webhook integration
- ✅ Influencer dashboard
- ✅ Promo code system
- ✅ Data vault (preserves all user data)

## 🚀 Ready for Production

Once local testing is complete:
1. Switch Stripe to **Live Mode**
2. Create live payment links
3. Update webhook with live endpoint
4. Deploy to production
5. Test with real (small) payment

---

**You're all set to test!** Start with Step 1 above and work through the checklist. Let me know if you encounter any issues during testing.