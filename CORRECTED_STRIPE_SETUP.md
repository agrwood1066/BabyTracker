# ✅ Updated Stripe Webhook Setup - YOUR CONFIGURATION

## 🎯 **Your Specific Setup:**
- **Webhook URL:** `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`
- **Cloudflare Page:** `uptheduff`  
- **Service Role Key:** Added to `.env` as `REACT_APP_SUPABASE_SERVICE_ROLE_KEY`
- **Using:** Supabase Edge Functions (better than Cloudflare Functions!)

## ✅ **Step 1: COMPLETED** 
✅ Database migration applied
✅ Supabase Edge Function created at `supabase/functions/stripe-webhook/index.ts`

## 🔧 **Step 2: Deploy Supabase Edge Function**

Deploy your webhook function to Supabase:

```bash
# Navigate to your project
cd /Users/alexanderwood/Desktop/BabyTracker

# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase (if not already)
supabase login

# Link your project
supabase link --project-ref lzppcmkjdgunhldgcgka

# Set up your environment secrets
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_Oxc9bw1UgXYVbyVPqYgMbPw42fGz6UbI

# Deploy the function
supabase functions deploy stripe-webhook
```

**Your webhook will be live at:** `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`

## ⚙️ **Step 3: Configure Stripe Webhook**

1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Click:** \"Add endpoint\"
3. **Enter YOUR endpoint URL:** `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`
4. **Select these events:**
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
5. **Click:** \"Add endpoint\"
6. **Verify signing secret** matches what you have: `whsec_Oxc9bw1UgXYVbyVPqYgMbPw42fGz6UbI`

## 🔑 **Step 4: Update Your .env File**

Make sure your `.env` file has your service role key:

```bash
# Add this line to your .env file (replace with your actual key)
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=[YOUR_ACTUAL_SERVICE_ROLE_KEY]
```

**To get your service role key:**
1. Go to: https://supabase.com/dashboard/project/lzppcmkjdgunhldgcgka/settings/api
2. Copy the `service_role` key (the secret one)
3. Add it to your `.env` file

## 🚀 **Step 5: Deploy Your React App** 

Deploy your updated React app to Cloudflare:

```bash
# Build your React app
npm run build

# Deploy to your Cloudflare page 'uptheduff'
# (Use whichever method you normally use - Git push or direct deploy)
```

## 🧪 **Step 6: Test the Integration**

### **Test 1: Direct Webhook Test**
```bash
curl -X POST https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook \\
  -H \"Content-Type: application/json\" \\
  -d '{\"type\": \"test\"}'
```

### **Test 2: Stripe Dashboard Test**
1. Go to your webhook endpoint in Stripe Dashboard
2. Click \"Send test webhook\" 
3. Choose `customer.subscription.created`
4. Send it
5. Check for successful delivery

### **Test 3: Check Webhook Logs**
Go to Supabase SQL Editor and run:
```sql
SELECT * FROM stripe_webhook_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📱 **Step 7: Verify Profile Integration**

1. **Go to your app:** https://uptheduff.pages.dev/profile
2. **Check that the Profile page shows:**
   - Enhanced subscription information
   - Stripe sync status
   - Real-time billing data (once webhooks are working)

## 🎯 **Step 8: Find Your Stripe Price IDs**

You need to update the price IDs in your webhook function:

1. **Go to:** https://dashboard.stripe.com/products
2. **Find your products and copy the price IDs**
3. **Update lines 180-183 in `supabase/functions/stripe-webhook/index.ts`:**

```typescript
// Replace the placeholder price IDs with your real ones
CASE p_price_id
    WHEN 'price_YOUR_MONTHLY_PRICE_ID' THEN v_subscription_plan := 'premium_monthly';
    WHEN 'price_YOUR_ANNUAL_PRICE_ID' THEN v_subscription_plan := 'premium_annual';  
    ELSE v_subscription_plan := 'free';
END CASE;
```

4. **Redeploy the function:** `supabase functions deploy stripe-webhook`

## ✅ **Success Checklist**

- [ ] Database migration applied ✅
- [ ] Service role key added to `.env`
- [ ] Supabase Edge Function deployed 
- [ ] Stripe webhook endpoint created and configured
- [ ] Test webhook sent successfully  
- [ ] Webhook logs appear in database
- [ ] Price IDs updated in function
- [ ] React app deployed to `uptheduff`
- [ ] Profile page shows enhanced subscription info

## 🚨 **Troubleshooting**

### **Function won't deploy:**
- Check you're logged into Supabase CLI: `supabase status`
- Verify project link: `supabase projects list`
- Check function syntax in `supabase/functions/stripe-webhook/index.ts`

### **Webhook not receiving events:**
- Verify URL: `https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook`
- Check Stripe webhook logs for delivery attempts
- Verify webhook secret matches

### **Database not updating:**
- Check Supabase function logs
- Verify service role key permissions
- Check `stripe_webhook_logs` table for errors

## 🎉 **Once Complete**

Your Profile page will show:
- ✅ Real-time subscription status from Stripe
- ✅ Accurate trial periods including promo codes  
- ✅ Next billing dates from Stripe
- ✅ Payment method information
- ✅ Sync status indicators

**You'll have a fully integrated, real-time Stripe subscription system!** 🚀

---

**Need help with any step? Let me know where you're stuck!**
