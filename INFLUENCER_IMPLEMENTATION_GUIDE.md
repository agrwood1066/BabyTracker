# Influencer System Implementation Guide

## 🚀 Overview

This guide walks you through setting up and managing the influencer tracking system for Baby Steps Planner. The system tracks signups, conversions, and commissions while giving influencers transparency into their performance.

## 📋 Setup Checklist

### Phase 1: Initial Setup (Do This First!)

- [ ] **1. Run SQL Setup**
  - Go to Supabase SQL Editor
  - Run the contents of `influencer-system-setup.sql`
  - This creates all necessary functions and views

- [ ] **2. Update Your Payment Link**
  - In `PromoLanding.js`, find line 97
  - Replace `YOUR_PAYMENT_LINK_ID` with your actual Stripe Payment Link ID
  - Example: `https://buy.stripe.com/14k5mN9KI5Wg8ow3cc`

- [ ] **3. Deploy the Updated Code**
  - Commit and push to GitHub
  - Cloudflare will auto-deploy

- [ ] **4. Deploy Enhanced Webhook** (Optional but recommended)
  - Replace `functions/api/stripe-webhook.js` with `stripe-webhook-influencer.js`
  - Deploy to Cloudflare

## 🎯 Manual Process for Each Influencer

### Step 1: Create Promo Code in Stripe

1. **Go to Stripe Dashboard**
   - Navigate to Products → Coupons
   
2. **Create a Coupon**
   - Name: "1 Month Free - [Influencer Name]"
   - Type: "100% off"
   - Duration: "Repeating" → 1 month
   - Or: "2 months free" for mid-tier influencers
   
3. **Create Promotion Code**
   - Go to Products → Promotion codes
   - Click "New promotion code"
   - Select the coupon you just created
   - Code: `SARAH2` (or whatever you agreed with influencer)
   - Restrictions: Can set max redemptions if desired
   - Copy the Promotion Code ID (starts with `promo_`)

### Step 2: Add Influencer to Database

Run this SQL in Supabase:

```sql
-- First, make sure the influencer has an account
-- They should sign up at babystepsplanner.com first

-- Then onboard them as an influencer
SELECT make_influencer(
  'sarah@example.com',  -- Their email
  'SARAH2',            -- Their promo code (must match Stripe)
  'Sarah Johnson'      -- Their name
);

-- Update their promo code with Stripe ID
UPDATE promo_codes 
SET 
  stripe_promotion_code_id = 'promo_xxxxx', -- From Stripe
  tier = 'micro',  -- or 'mid', 'major'
  free_months = 1  -- Match what you set in Stripe
WHERE code = 'SARAH2';
```

### Step 3: Send Influencer Their Details

Email template:

```
Subject: Your Baby Steps Influencer Dashboard is Ready! 🎉

Hi [Name],

Your influencer account is all set up! Here are your details:

🔗 Your unique link: babystepsplanner.com/with/[CODE]
📊 Your dashboard: babystepsplanner.com/influencer/[CODE]
🎁 Promo code: [CODE]
💰 Your followers get: [X] month(s) free

Log in with your email to see real-time stats on:
- How many people signed up
- Active vs cancelled users
- Your pending commissions
- Payment history

Commission Structure:
- First month: 100% of subscription (£6.99)
- 3-month bonus: £5
- 6-month bonus: £5

Need help? Just reply to this email!

Best,
[Your name]
```

## 📊 Tracking & Management

### View All Influencer Performance

Run this SQL query weekly:

```sql
-- See all influencer stats
SELECT * FROM influencer_commission_summary;

-- See all pending payments
SELECT * FROM get_all_pending_commissions();

-- See detailed commission breakdown
SELECT 
  ic.influencer_code,
  ic.milestone,
  COUNT(*) as users,
  SUM(ic.amount) as total,
  MIN(ic.eligible_date) as oldest
FROM influencer_commissions ic
WHERE paid = false
GROUP BY ic.influencer_code, ic.milestone
ORDER BY ic.influencer_code;
```

### Process Payments

When you pay an influencer via bank transfer:

```sql
-- Mark all pending commissions as paid for an influencer
SELECT mark_commissions_paid(
  'SARAH2',                    -- Promo code
  NULL,                        -- NULL = pay all, or specify milestone
  'BANK-2025-01-15-SARAH'     -- Your reference
);

-- Or pay specific milestone only
SELECT mark_commissions_paid(
  'SARAH2',
  'first_month',
  'BANK-2025-01-15'
);
```

## 🔍 Testing the System

### Test Flow (Use Test Influencer)

1. **Create Test Influencer**
   ```sql
   SELECT make_influencer('test@example.com', 'TEST1', 'Test User');
   ```

2. **Create Stripe Test Promo**
   - Use Stripe test mode
   - Create promo code "TEST1"

3. **Test Signup Flow**
   - Visit: `babystepsplanner.com/with/TEST1`
   - Enter test email
   - Should redirect to Stripe with promo applied

4. **Check Tracking**
   ```sql
   SELECT * FROM promo_code_usage WHERE promo_code_id = 
     (SELECT id FROM promo_codes WHERE code = 'TEST1');
   ```

## 📈 Monthly Reporting

### Generate Monthly Report

```sql
-- Monthly commission report
SELECT 
  DATE_TRUNC('month', ic.eligible_date) as month,
  ic.influencer_code,
  pc.influencer_name,
  COUNT(DISTINCT ic.user_id) as new_customers,
  SUM(CASE WHEN ic.milestone = 'first_month' THEN ic.amount ELSE 0 END) as first_month_commissions,
  SUM(CASE WHEN ic.milestone = '3_months' THEN ic.amount ELSE 0 END) as three_month_bonuses,
  SUM(CASE WHEN ic.milestone = '6_months' THEN ic.amount ELSE 0 END) as six_month_bonuses,
  SUM(ic.amount) as total_commission
FROM influencer_commissions ic
JOIN promo_codes pc ON ic.influencer_code = pc.code
WHERE ic.eligible_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', ic.eligible_date), ic.influencer_code, pc.influencer_name;
```

### Export for Accounting

```sql
-- Export commission data
COPY (
  SELECT 
    ic.influencer_code,
    pc.influencer_name,
    pc.influencer_email,
    ic.milestone,
    ic.amount,
    ic.eligible_date,
    ic.paid,
    ic.paid_date,
    ic.payment_reference
  FROM influencer_commissions ic
  JOIN promo_codes pc ON ic.influencer_code = pc.code
  WHERE ic.eligible_date >= '2025-01-01'
  ORDER BY ic.eligible_date
) TO '/tmp/commissions_export.csv' WITH CSV HEADER;
```

## 🚨 Troubleshooting

### Issue: Promo code not working
- Check code exists in Stripe
- Verify `stripe_promotion_code_id` is set in database
- Check promo code is active in both Stripe and database

### Issue: Commissions not tracking
- Verify webhook is receiving events (check `stripe_webhook_logs`)
- Ensure `stripe_customer_id` is set on user profile
- Check `promo_code_usage` table for tracking

### Issue: Influencer can't see dashboard
- Verify `is_influencer` = true on their profile
- Check they have a promo code assigned
- Ensure they're logged in

### Check Webhook Logs

```sql
-- Recent webhook events
SELECT 
  event_type,
  processed,
  error,
  created_at
FROM stripe_webhook_logs
ORDER BY created_at DESC
LIMIT 20;

-- Failed webhooks
SELECT * FROM stripe_webhook_logs
WHERE processed = false OR error IS NOT NULL
ORDER BY created_at DESC;
```

## 📝 Quality Control Tips

1. **Start Small**: Test with 1-2 friendly influencers first
2. **Set Limits**: Use Stripe's max redemption limits initially
3. **Monitor Daily**: Check signups and conversions daily at first
4. **Communicate**: Send weekly updates to active influencers
5. **Document**: Keep spreadsheet of payment history

## 🔐 Security Notes

- Influencers can only see anonymised user data
- Payment processing remains manual for control
- All sensitive operations require admin access
- RLS policies protect user privacy

## 📞 Support Contacts

- **Stripe Support**: For payment/promo code issues
- **Supabase Support**: For database issues
- **Your Email**: For influencer questions

---

Last Updated: January 2025
Version: 1.0
Status: Ready for Testing