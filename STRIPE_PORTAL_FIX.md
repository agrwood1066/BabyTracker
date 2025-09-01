# Stripe Customer Portal Fix Guide

## Issue
The "Manage Subscription" button was using an incorrect URL (`https://billing.stripe.com/p/login/`) which doesn't exist. 

## Solution
We need to create a proper Stripe Customer Portal session using the Stripe API.

## Steps to Implement

### 1. Deploy the New Edge Function

I've created a new Supabase Edge Function at `supabase/functions/create-portal-session/index.ts`.

Deploy it with:
```bash
cd ~/Desktop/BabyTracker
supabase functions deploy create-portal-session --no-verify-jwt
```

### 2. Configure Stripe Customer Portal

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Customer Portal**
3. Configure the following settings:

#### Portal Features
- ✅ **Allow customers to update payment methods**
- ✅ **Allow customers to update their email address**
- ✅ **Allow customers to view their billing history**
- ✅ **Allow customers to download invoices**

#### Subscription Management
- ✅ **Allow customers to cancel subscriptions**
- ✅ **Allow customers to switch plans** (if you have multiple plans)
- ✅ **Allow customers to update quantities** (if applicable)

#### Business Information
- Add your business name: "Baby Steps Planner"
- Add your support email: hello@babystepsplanner.com
- Add your website: https://babystepsplanner.com
- Upload your logo (optional)

#### Terms & Policies
- Link to your Terms of Service
- Link to your Privacy Policy

Click **Save** to activate the portal.

### 3. Test the Portal

After deployment:

1. **Test with your existing account:**
   - Go to your Profile page
   - Click "Manage Subscription in Stripe"
   - Should open Stripe Customer Portal

2. **What users can do in the portal:**
   - View subscription details
   - Update payment method
   - Download invoices
   - Cancel subscription
   - Update billing email

### 4. Troubleshooting

If you get an error when clicking the button:

**"No Stripe customer found for this user"**
- User needs a `stripe_customer_id` in their profile
- This is set when they first subscribe through checkout

**"Not authenticated"**
- User needs to be logged in
- Check authentication token is valid

**Portal doesn't open**
- Check browser popup blocker
- Check console for errors
- Verify Edge Function is deployed

### 5. Alternative Quick Fix (Temporary)

If you need a quick fix while setting up the portal, you can use the Stripe-hosted login page:

```javascript
// In Profile.js, temporarily replace the onClick with:
onClick={async () => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();
    
  if (profile?.stripe_customer_id) {
    // This creates a magic link for the customer
    alert('Please check your email for a link to manage your subscription.');
    // You'll need to trigger an email from your backend
  } else {
    alert('No subscription found. Please contact support.');
  }
}}
```

### 6. Verify Everything Works

After implementation:
1. ✅ Customer Portal opens successfully
2. ✅ Users can update payment methods
3. ✅ Users can cancel subscriptions
4. ✅ Changes sync back to your database via webhooks
5. ✅ Profile page reflects changes after portal actions

## Database Fields That Should Update

When users make changes in the Stripe Portal, your webhook should update:

- `stripe_subscription_status` - When cancelled/reactivated
- `stripe_current_period_end` - Billing cycle dates
- `payment_method_last4` - When payment method updated
- `payment_method_brand` - Card brand changes
- `subscription_status` - Your app's status (active/cancelled/etc)

## Next Steps

1. Deploy the Edge Function
2. Configure Stripe Portal settings
3. Test with a real customer account
4. Monitor webhook logs for portal events

The portal provides a secure, Stripe-hosted way for customers to manage their subscriptions without you handling sensitive payment data.
