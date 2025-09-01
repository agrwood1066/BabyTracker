# 📋 Phase 3 & 4 Implementation Guide

## Phase 3: Stripe Webhooks Integration ✅

### What's Been Implemented:
1. **Stripe Webhook Handler** (`/supabase/functions/stripe-webhook/`)
   - Handles payment confirmations
   - Updates subscription status automatically
   - Tracks promo code usage
   - Calculates influencer commissions

2. **Subscription Success Page** (`/src/components/SubscriptionSuccess.js`)
   - Shows after successful payment
   - Verifies subscription activation
   - Displays premium features unlocked

### Setup Instructions:

#### Step 1: Deploy Supabase Edge Function
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd /Users/alexanderwood/Desktop/BabyTracker
supabase link --project-ref lzppcmkjdgunhldgcgka

# Deploy the webhook function
supabase functions deploy stripe-webhook

# Set environment variables for the function
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

#### Step 2: Configure Stripe Webhook
1. Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to Supabase secrets (see command above)

#### Step 3: Update Stripe Payment Links
In your Stripe Dashboard, update each payment link to redirect after success:
- Success URL: `https://babysteps.app/subscription-success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `https://babysteps.app/dashboard?canceled=true`

## Phase 4: Influencer System ✅

### What's Been Implemented:

1. **Influencer Dashboard** (`/src/components/InfluencerDashboard.js`)
   - Real-time stats tracking
   - Anonymised user journey
   - Weekly performance charts
   - Commission transparency
   - Share link generation

2. **Promo Code System** (`/src/components/PromoCodeInput.js`)
   - Auto-applies from URL parameters
   - Validates and applies codes
   - Extends trial periods
   - Shows success/error feedback

3. **Database Functions** (`/supabase/phase3_phase4_functions.sql`)
   - Secure stats retrieval
   - Commission tracking
   - Usage monitoring

### Setup Instructions:

#### Step 1: Run Database Functions
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/lzppcmkjdgunhldgcgka/sql)
2. Copy contents of `/supabase/phase3_phase4_functions.sql`
3. Run the SQL

#### Step 2: Create Test Promo Codes
The SQL already includes test codes:
- `SARAH-1` (1 month free - micro tier)
- `EMMA-2` (2 months free - mid tier)
- `LAUNCH50` (limited use launch promo)

#### Step 3: Test Influencer Dashboard
Visit: `http://localhost:3000/influencer/SARAH-1`

#### Step 4: Test Promo Code Application
1. Sign up new test account
2. Visit: `http://localhost:3000/signup?code=SARAH-1`
3. Code should auto-apply
4. Check extended trial in database

## 🧪 Testing Checklist

### Phase 3: Stripe Webhooks
- [ ] Create Stripe payment link
- [ ] Complete test payment (card: 4242 4242 4242 4242)
- [ ] Verify redirect to `/subscription-success`
- [ ] Check subscription status updated in database
- [ ] Confirm premium features unlocked

### Phase 4: Influencer System
- [ ] Access influencer dashboard at `/influencer/SARAH-1`
- [ ] Dashboard loads with sample data
- [ ] Share link copies to clipboard
- [ ] Apply promo code during signup
- [ ] Trial extends based on code's free_months
- [ ] Usage tracked in promo_code_usage table
- [ ] Stats update in influencer dashboard

## 📊 Database Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check promo codes exist
SELECT * FROM promo_codes;

-- Check if user has premium after payment
SELECT id, email, subscription_status, subscription_plan, trial_ends_at 
FROM profiles 
WHERE email = 'your-test@email.com';

-- Check promo code usage
SELECT pc.code, pcu.*, p.email 
FROM promo_code_usage pcu
JOIN promo_codes pc ON pc.id = pcu.promo_code_id
JOIN profiles p ON p.id = pcu.user_id;

-- Check influencer stats
SELECT * FROM get_influencer_stats('SARAH-1');
```

## 🚀 Production Deployment

### Before Going Live:
1. **Switch Stripe to Live Mode**
   - Create live payment links
   - Update webhook endpoint to live keys
   - Update environment variables

2. **Update Prices**
   ```javascript
   // In PaywallModal.js, update URLs:
   REACT_APP_STRIPE_LAUNCH_MONTHLY_URL=https://buy.stripe.com/live_xxx
   REACT_APP_STRIPE_REGULAR_MONTHLY_URL=https://buy.stripe.com/live_xxx
   REACT_APP_STRIPE_ANNUAL_URL=https://buy.stripe.com/live_xxx
   ```

3. **Configure Real Influencer Codes**
   ```sql
   INSERT INTO promo_codes (
     code, 
     influencer_name, 
     influencer_email, 
     tier, 
     free_months
   ) VALUES (
     'REALINFLUENCER-1',
     'Real Name',
     'real@email.com',
     'micro',
     1
   );
   ```

4. **Set Up Monitoring**
   - Stripe webhook logs
   - Supabase Edge Function logs
   - Conversion tracking in analytics

## 🎯 Next Steps

Your paywall system is now complete with:
- ✅ Smart data vault (Phase 1)
- ✅ Component integration (Phase 2)  
- ✅ Stripe payment processing (Phase 3)
- ✅ Influencer partnership system (Phase 4)

### To Launch:
1. Test full user journey (signup → trial → payment → premium)
2. Test influencer journey (share → signup → track → commission)
3. Create marketing materials for influencers
4. Prepare email templates for users
5. Set launch date and pricing

### Support Resources:
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://supabase.com/dashboard
- Edge Function Logs: Check Supabase Functions tab
- Webhook Events: Stripe Dashboard → Developers → Webhooks

## 🐛 Troubleshooting

### Webhook Not Firing:
- Check endpoint URL is correct
- Verify webhook secret in environment
- Look at Stripe webhook attempts log

### Subscription Not Updating:
- Check Supabase Edge Function logs
- Verify database permissions
- Ensure webhook events are selected

### Influencer Dashboard Not Loading:
- Verify promo code exists and is active
- Check browser console for errors
- Ensure database functions are created

### Promo Code Not Applying:
- Check code is uppercase
- Verify usage limits not exceeded
- Ensure code hasn't expired

---

**Congratulations!** Your Baby Steps app now has a complete, production-ready paywall and influencer system! 🎉
