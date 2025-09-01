# Bug Fixes - January 2025

## Summary of Issues Fixed

### Bug 1: Missing "Manage my Subscription" Button ✅
**Problem:** Users with trial status and premium_monthly plan couldn't see subscription management options.

**Solution:** 
- Enhanced Profile.js subscription status section
- Added logic to detect Stripe subscriptions
- Shows "Manage my Subscription" button for trial/active users
- Creates customer portal session for subscription management

### Bug 2: Missing Promo Code Fields in Webhook ✅
**Problem:** `promo_code_used` and `stripe_promotion_code_id` weren't being captured from Stripe webhooks.

**Solution:**
- Enhanced webhook handler to extract discount/promotion data
- Added database fields for promo tracking
- Updated subscription sync functions
- Tracks promo code usage for influencer commissions

### Bug 3: Dashboard "Start 14-Day Trial" Button Not Working ✅
**Problem:** Button was navigating to /subscribe instead of opening PaywallModal.

**Solution:**
- Fixed button onClick handler in PromoStatusBanner
- Passed required props (setShowPaywall, setPaywallTrigger)
- Now opens PaywallModal with proper trial offer

## Files Modified

1. **src/components/Dashboard.js**
   - Fixed PromoStatusBanner to accept props
   - Updated "Start 14-Day Trial" button handler

2. **src/components/Profile.js**
   - Added comprehensive subscription management UI
   - Shows "Manage my Subscription" for subscribed users
   - Displays trial/billing information

3. **functions/api/stripe-webhook.js**
   - Enhanced to capture promo codes from subscriptions
   - Maps Stripe discount data to database fields
   - Updates promo_code_usage table

4. **functions/api/create-portal-session.js** (NEW)
   - Creates Stripe customer portal sessions
   - Allows users to manage subscriptions

5. **Database Schema**
   - Added `promo_code_used`, `stripe_promotion_code_id`, `promo_months_granted` fields
   - Updated subscription sync functions
   - Fixed get_user_promo_status function

## Implementation Steps

1. **Run Database Updates:**
```sql
-- Add missing fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT,
ADD COLUMN IF NOT EXISTS promo_months_granted INTEGER DEFAULT 0;
```

2. **Update Frontend Files:**
- Copy enhanced Profile.js subscription section
- Add new CSS styles to Profile.css
- Dashboard.js already updated via file edits

3. **Deploy Webhook Updates:**
```bash
cd ~/Desktop/BabyTracker
npx wrangler deploy functions/api/stripe-webhook.js
npx wrangler deploy functions/api/create-portal-session.js
```

4. **Configure Stripe:**
- Enable Customer Portal in Stripe Dashboard
- Set return URL to your app's profile page

## Testing Instructions

### Quick Test Flow:
1. Login as user with `subscription_status = 'trial'` and `subscription_plan = 'premium_monthly'`
2. Go to Profile → Should see "Manage my Subscription" button
3. Go to Dashboard as free user → "Start 14-Day Trial" should open PaywallModal
4. Create new subscription with promo code → Check database for promo fields

### Verification Query:
```sql
SELECT 
  email,
  subscription_status,
  subscription_plan,
  stripe_subscription_id,
  promo_code_used,
  stripe_promotion_code_id
FROM profiles
WHERE stripe_customer_id IS NOT NULL
ORDER BY updated_at DESC;
```

## Expected Behavior

### For Trial Users:
- See "Premium Trial" badge with days remaining
- "Manage my Subscription" button visible
- Can access Stripe portal for payment/cancellation

### For Free Users:
- See "Free Plan" with limits listed
- "Start 14-Day Trial" opens PaywallModal
- Clear upgrade path presented

### For Promo Users:
- Extended trial periods applied automatically
- Promo codes tracked in database
- Influencer commissions trackable

## Troubleshooting

**If "Manage Subscription" not showing:**
- Check user has `stripe_customer_id`
- Verify `subscription_plan = 'premium_monthly'`

**If promo codes not captured:**
- Check webhook endpoint is deployed
- Verify Stripe webhook secret is correct
- Look at stripe_webhook_logs table

**If PaywallModal not opening:**
- Check browser console for errors
- Verify props passed to PromoStatusBanner
- Ensure PaywallModal imported correctly

## Next Steps

1. Test all three fixes in development
2. Deploy webhook changes to production
3. Monitor webhook logs for any errors
4. Consider adding email notifications for subscription changes

---

**Date:** January 2025
**Version:** 1.0
**Status:** Ready for Testing