# Stripe Webhook Setup Steps for Baby Steps

## ✅ **Step 1: Database Migration Complete**
- The SQL migration file is ready in `supabase/migrations/add_stripe_fields.sql`
- Apply this to your Supabase database via the SQL Editor

## 🔧 **Step 2: Webhook Function Created**
- Cloudflare Functions webhook is ready at `functions/api/stripe-webhook.js`
- Configured for your Cloudflare Pages deployment

## 🔑 **Step 3: Get Your Supabase Service Role Key**

You need to get your Supabase Service Role Key:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `lzppcmkjdgunhldgcgka`
3. Go to **Settings → API**
4. Copy the **service_role key** (not the anon key!)
5. This key starts with `eyJhbGciOiJIUzI1NiIs...` and is much longer than your anon key

⚠️ **Important:** The service_role key has full database access - keep it secure!

## 🌐 **Step 4: Configure Cloudflare Environment Variables**

Add these environment variables to your Cloudflare Pages project:

1. Go to your Cloudflare Pages dashboard
2. Select your project: `simply-pregnancy`
3. Go to **Settings → Environment variables**
4. Add these variables:

### **Production Environment Variables:**
```
REACT_APP_SUPABASE_URL = https://lzppcmkjdgunhldgcgka.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [YOUR_SERVICE_ROLE_KEY_FROM_STEP_3]
STRIPE_WEBHOOK_SECRET = whsec_Oxc9bw1UgXYVbyVPqYgMbPw42fGz6UbI
```

### **Preview Environment Variables (same values):**
Same as production for testing.

## 🚀 **Step 5: Deploy to Cloudflare**

Deploy your updated code:

```bash
# Build and deploy
npm run build
wrangler pages deploy build --project-name simply-pregnancy

# Or push to your connected Git repository for auto-deploy
```

Your webhook will be available at:
**https://simply-pregnancy.pages.dev/api/stripe-webhook**

## ⚙️ **Step 6: Configure Stripe Webhook**

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers → Webhooks**
3. Click **Add endpoint**
4. Configure:
   - **Endpoint URL:** `https://simply-pregnancy.pages.dev/api/stripe-webhook`
   - **Description:** \"Baby Steps Subscription Sync\"
   - **Events to send:**
     ```
     customer.created
     customer.updated
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     checkout.session.completed
     ```
5. **Save the endpoint**
6. **Copy the signing secret** and update your environment variables if different

## 🧪 **Step 7: Test the Integration**

### **Option A: Test with Stripe Dashboard**
1. Go to **Webhooks → Your endpoint → Send test webhook**
2. Send a `customer.subscription.created` test event
3. Check the webhook logs in Stripe
4. Check your Supabase `stripe_webhook_logs` table

### **Option B: Test with Real Purchase**
1. Use Stripe test card: `4242424242424242`
2. Make a test purchase through your payment links
3. Check that webhook events are received and processed

## 📊 **Step 8: Verify Database Updates**

Check your Supabase database:

```sql
-- Check webhook logs
SELECT * FROM stripe_webhook_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- Check profiles with Stripe data
SELECT 
  email,
  subscription_status,
  stripe_subscription_status,
  stripe_current_period_end,
  payment_method_brand,
  payment_method_last4
FROM profiles 
WHERE stripe_customer_id IS NOT NULL;
```

## 🎯 **Step 9: Update Your Price IDs**

In the webhook function, update the price IDs to match your actual Stripe prices:

1. Go to **Stripe Dashboard → Products**
2. Find your products and copy the price IDs
3. Update lines 185-188 in `functions/api/stripe-webhook.js`:

```javascript
CASE p_price_id
    WHEN 'price_YOUR_ACTUAL_MONTHLY_PRICE_ID' THEN v_subscription_plan := 'premium_monthly';
    WHEN 'price_YOUR_ACTUAL_ANNUAL_PRICE_ID' THEN v_subscription_plan := 'premium_annual';
    ELSE v_subscription_plan := 'free';
END CASE;
```

## ✅ **Success Checklist**

- [ ] Database migration applied
- [ ] Webhook function deployed to Cloudflare
- [ ] Environment variables configured
- [ ] Stripe webhook endpoint created and configured
- [ ] Test webhook sent successfully
- [ ] Database shows webhook logs
- [ ] Profile component shows enhanced subscription info
- [ ] Real test purchase works end-to-end

## 🚨 **Troubleshooting**

### **Webhook not receiving events:**
1. Check Cloudflare Functions logs
2. Verify webhook URL is accessible: `https://simply-pregnancy.pages.dev/api/stripe-webhook`
3. Check Stripe webhook logs for delivery attempts

### **Database not updating:**
1. Verify service_role key is correct
2. Check webhook logs for processing errors
3. Ensure database migration was applied

### **Environment variables not working:**
1. Make sure variables are set for Production environment
2. Redeploy after adding variables
3. Check Cloudflare Pages build logs

## 📞 **Need Help?**

If you encounter issues:
1. Check Cloudflare Functions logs in your dashboard
2. Check Stripe webhook delivery logs
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

Once this is working, your Profile page will show real-time subscription data synced from Stripe! 🎉
