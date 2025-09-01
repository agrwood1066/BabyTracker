# Stripe Webhook Fix - Troubleshooting Guide

## Problem Fixed
The webhook was failing with the error:
```
Error: Deno.core.runMicrotasks() is not supported in this environment
```

## Root Causes & Solutions

### 1. **Outdated Deno Standard Library**
- **Old version:** `std@0.168.0`  
- **New version:** `std@0.177.1`
- This version is compatible with the current Supabase Edge Function runtime

### 2. **Updated Dependencies**
- **Supabase JS:** Updated to `@supabase/supabase-js@2.39.7`
- **Stripe SDK:** Updated to `stripe@14.14.0`
- These versions are more stable with the current runtime

### 3. **Webhook Signature Verification**
- Changed from `constructEventAsync` to `constructEvent` (synchronous)
- Added explicit port configuration for local testing

## Deployment Steps

1. **Deploy the updated webhook:**
```bash
chmod +x deploy-fixed-webhook.sh
./deploy-fixed-webhook.sh
```

Or manually:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

2. **Verify environment variables in Supabase Dashboard:**
   - Go to Settings → Edge Functions
   - Ensure these are set:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Test with a real webhook event:**
```bash
# Use Stripe CLI to trigger a test event
stripe trigger checkout.session.completed
```

## Verification Steps

### 1. Check Supabase Logs
```bash
# View real-time logs
supabase functions logs stripe-webhook --tail
```

Look for:
- ✅ "Processing webhook event: [event_type]"
- ✅ "Successfully updated profile for [email]"
- ❌ No "Deno.core.runMicrotasks()" errors

### 2. Check Database Updates
```sql
-- Check if profiles are being updated
SELECT 
    email,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    updated_at
FROM profiles
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

### 3. Test Different Event Types
Test each of these Stripe events:
- `customer.created` - Should update stripe_customer_id
- `checkout.session.completed` - Should update subscription details
- `customer.subscription.created` - Should set subscription_status
- `invoice.payment_succeeded` - Should confirm active status

### 4. Monitor in Stripe Dashboard
- Go to Developers → Webhooks
- Click on your webhook endpoint
- Check "Recent deliveries"
- All should show 200 status

## Common Issues & Solutions

### Issue: Still getting Deno errors
**Solution:** Ensure you've deployed the updated function:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt --force
```

### Issue: Webhook signature verification fails
**Solution:** Verify your webhook secret:
```bash
# Get the webhook secret from Stripe
stripe listen --print-secret

# Update in Supabase dashboard
```

### Issue: Profile not updating
**Solution:** Check if the email exists in profiles:
```sql
SELECT * FROM profiles WHERE email = 'test@example.com';
```

### Issue: 401 Unauthorized errors
**Solution:** Ensure you're using `--no-verify-jwt` flag when deploying

## Testing with Your Test Account

Use your test credentials:
- Email: `test@example.com`
- Password: `testing123`

1. Create a test subscription in Stripe
2. Check if the profile updates in Supabase
3. Verify subscription_status changes to 'active'

## Quick Debug Commands

```bash
# Check function status
supabase functions list

# View last 50 log entries
supabase functions logs stripe-webhook --limit 50

# Test with local webhook forwarding
stripe listen --forward-to https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook

# Trigger specific events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## Success Indicators

When working correctly, you should see:
1. ✅ Webhook returns 200 status in Stripe
2. ✅ No Deno runtime errors in logs
3. ✅ Profile table updates with subscription data
4. ✅ subscription_status changes from 'free' to 'active'
5. ✅ stripe_customer_id and stripe_subscription_id populated

## If Problems Persist

1. **Restart the function:**
```bash
supabase functions delete stripe-webhook
supabase functions deploy stripe-webhook --no-verify-jwt
```

2. **Check Supabase service status:**
Visit: https://status.supabase.com/

3. **Verify RLS policies:**
Ensure service role key has full access to profiles table

---

**Last Updated:** January 2025
**Fixed Version:** 2.0.0
