# Stripe Webhook 401 Error - Troubleshooting Guide

## Problem
You're receiving a 401 "Missing authorization header" error when Stripe tries to call your webhook endpoint for `customer.subscription.updated` events.

## Root Cause
Supabase Edge Functions by default require JWT authentication, but Stripe webhooks can't provide JWT tokens - they use webhook signatures instead.

## Solution Steps

### 1. Redeploy with No JWT Verification
```bash
# Make the deployment script executable
chmod +x deploy-webhook.sh

# Run the deployment
./deploy-webhook.sh
```

Or manually:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 2. Verify Environment Variables
In your Supabase Dashboard:
1. Go to Edge Functions → stripe-webhook → Secrets
2. Ensure these are set:
   - `STRIPE_SECRET_KEY` (starts with sk_live_ or sk_test_)
   - `STRIPE_WEBHOOK_SECRET` (starts with whsec_)
   - `SUPABASE_URL` (your project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key, not anon key)

### 3. Update Your Stripe Webhook Endpoint
In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Find your webhook endpoint
3. Ensure the URL is: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Ensure these events are selected:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Run the Database Migration
```sql
-- In Supabase SQL Editor, run:
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE;
```

### 5. Test the Webhook
Use Stripe CLI to test:
```bash
# Install Stripe CLI if not already installed
# brew install stripe/stripe-cli/stripe (Mac)
# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward events to your local endpoint for testing
stripe listen --forward-to https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook

# In another terminal, trigger a test event
stripe trigger customer.subscription.updated
```

## How to Verify It's Working

1. Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries
2. Look for 200 OK responses
3. Check your Supabase logs:
   ```bash
   supabase functions logs stripe-webhook
   ```

## Common Issues and Fixes

### Issue: Still getting 401 error
**Fix:** The function might be cached. Try:
1. Delete and recreate the function
2. Or add a version parameter to force refresh:
   ```bash
   supabase functions deploy stripe-webhook --no-verify-jwt --version 2
   ```

### Issue: 400 Bad Request instead of 401
**Fix:** This is progress! Now check:
1. Webhook secret is correct
2. Stripe signature header is being sent
3. Check function logs for specific error

### Issue: Updates not showing in database
**Fix:** Check:
1. Service role key has proper permissions
2. RLS policies aren't blocking updates
3. Check function logs for database errors

## What Happens on Cancellation

When a user cancels their subscription:

1. **Immediate Cancellation:**
   - `subscription_status` → 'free'
   - `subscription_plan` → 'free'
   - `subscription_expires_at` → current timestamp

2. **Cancel at Period End:**
   - `subscription_status` → 'active' (until period ends)
   - `stripe_cancel_at_period_end` → true
   - `subscription_expires_at` → period end date
   - When period ends, status changes to 'free'

## Monitoring

Set up monitoring to catch issues:

```sql
-- Query to check recent cancellations
SELECT 
  email,
  subscription_status,
  stripe_subscription_status,
  stripe_cancel_at_period_end,
  subscription_expires_at,
  updated_at
FROM profiles
WHERE 
  stripe_subscription_status IN ('canceled', 'unpaid')
  OR stripe_cancel_at_period_end = true
  OR subscription_expires_at < NOW()
ORDER BY updated_at DESC
LIMIT 20;
```

## Need More Help?

1. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs stripe-webhook --tail
   ```

2. Check Stripe webhook logs:
   - Stripe Dashboard → Developers → Webhooks → Your endpoint → Webhook attempts

3. Enable debug logging in the function:
   - Add more `console.log` statements
   - They'll appear in Supabase function logs

## Contact Support

If still having issues:
- Stripe Support: https://support.stripe.com
- Supabase Discord: https://discord.supabase.com
- Or reply with the specific error from your logs
