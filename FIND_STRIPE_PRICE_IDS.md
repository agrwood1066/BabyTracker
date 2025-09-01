# Get Your Stripe Price IDs

## 🎯 **You Need to Update the Price IDs in the Webhook**

Your webhook function needs your actual Stripe price IDs to map subscriptions correctly.

## 📝 **How to Find Your Price IDs:**

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com
2. **Navigate to:** Products → Your products
3. **Copy the Price IDs** that look like: `price_1ABC123...`

## 🔧 **Update the Webhook Function:**

Edit `functions/api/stripe-webhook.js` around lines 185-188:

```javascript
// Map price ID to plan
CASE p_price_id
    WHEN 'price_YOUR_ACTUAL_MONTHLY_PRICE_ID' THEN v_subscription_plan := 'premium_monthly'; -- £6.99
    WHEN 'price_YOUR_ACTUAL_ANNUAL_PRICE_ID' THEN v_subscription_plan := 'premium_annual';  -- £69.99
    ELSE v_subscription_plan := 'free';
END CASE;
```

## 💡 **Quick Way to Find Them:**

Since you have payment links, you can extract the price IDs:

**Your current payment links:**
- Monthly: `https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01`
- Annual: `https://buy.stripe.com/5kQ6oH7Yi8D2gJveMNeME00`

**To get the price IDs:**
1. Go to **Stripe Dashboard → Payment Links**
2. Find these payment links
3. Click on them to see the associated price IDs
4. Copy those IDs to update the webhook function

## 🚀 **After Finding the Price IDs:**

1. Update the webhook function with correct price IDs
2. Redeploy to Cloudflare
3. Test a purchase to ensure mapping works correctly

This ensures your webhook correctly identifies which plan a user subscribed to!
