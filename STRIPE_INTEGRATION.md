# Stripe Subscription Integration Guide

## Current State
The subscription system currently uses local database fields to track subscription status, but doesn't sync with Stripe in real-time. This means:
- Trial periods are calculated from `trial_ends_at` or `promo_months_granted` fields in the database
- Subscription status changes in Stripe aren't reflected immediately
- Payment failures or cancellations aren't tracked automatically

## Required Stripe Integration

### 1. Webhook Setup
To properly sync subscription data, you need to set up Stripe webhooks to listen for:

```javascript
// Key webhook events to handle:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.trial_will_end
```

### 2. Database Updates Needed

Add these fields to the profiles table if not already present:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
```

### 3. Webhook Handler (Example)

Create a webhook endpoint at `/api/stripe-webhook`:

```javascript
// api/stripe-webhook.js
import { supabase } from '../supabaseClient';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      
      // Update user's subscription in database
      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          subscription_status: mapStripeStatusToLocal(subscription.status),
          subscription_plan: getPlanFromPriceId(subscription.items.data[0].price.id)
        })
        .eq('stripe_customer_id', subscription.customer);
      break;

    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_plan: 'free',
          stripe_subscription_status: 'canceled'
        })
        .eq('stripe_customer_id', event.data.object.customer);
      break;

    case 'invoice.payment_succeeded':
      // Handle successful payment
      console.log('Payment succeeded for customer:', event.data.object.customer);
      break;

    case 'invoice.payment_failed':
      // Handle failed payment
      console.log('Payment failed for customer:', event.data.object.customer);
      // Could send an email or update subscription status
      break;
  }

  res.status(200).json({ received: true });
}

// Helper functions
function mapStripeStatusToLocal(stripeStatus) {
  const statusMap = {
    'trialing': 'trial',
    'active': 'active',
    'canceled': 'free',
    'incomplete': 'free',
    'incomplete_expired': 'free',
    'past_due': 'active', // Still active but payment issue
    'unpaid': 'free'
  };
  return statusMap[stripeStatus] || 'free';
}

function getPlanFromPriceId(priceId) {
  // Map your Stripe price IDs to plan names
  const priceMap = {
    'price_xxx_monthly': 'premium_monthly',
    'price_xxx_annual': 'premium_annual'
  };
  return priceMap[priceId] || 'free';
}
```

### 4. Update useSubscription Hook

Update the hook to check Stripe subscription status:

```javascript
// In useSubscription.js
const loadSubscription = async () => {
  try {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading subscription:', error);
    } else {
      // Check if Stripe subscription is still valid
      if (data.stripe_subscription_status && data.stripe_current_period_end) {
        const periodEnd = new Date(data.stripe_current_period_end);
        const now = new Date();
        
        // If subscription period has ended, update status
        if (periodEnd < now && data.subscription_status === 'active') {
          // Subscription expired, update to free
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'free',
              subscription_plan: 'free'
            })
            .eq('id', user.id);
          
          data.subscription_status = 'free';
          data.subscription_plan = 'free';
        }
      }
      
      setSubscription(data);
    }
  } catch (err) {
    console.error('Error in loadSubscription:', err);
  } finally {
    setLoading(false);
  }
};
```

### 5. Promo Code Handling

For promo codes with extended trials (like 1 month free), Stripe handles this automatically:

1. When user applies promo code at checkout, Stripe extends the trial period
2. The webhook will receive the updated subscription with the correct `trial_end` date
3. Store this in your database as `stripe_trial_end` or update `trial_ends_at`

### 6. Environment Variables Needed

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Stripe Payment Links or Price IDs
REACT_APP_STRIPE_MONTHLY_PRICE_ID=price_xxx
REACT_APP_STRIPE_ANNUAL_PRICE_ID=price_xxx
```

### 7. Testing Webhooks Locally

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger customer.subscription.created
```

## Temporary Fix (Currently Implemented)

Until Stripe webhooks are set up, the system:
1. Uses `promo_months_granted` field to calculate extended trial periods
2. Shows trial end date based on account creation + promo months
3. Falls back to default `trial_ends_at` field if no promo code

## Benefits of Full Stripe Integration

1. **Real-time accuracy**: Subscription status always matches Stripe
2. **Automatic handling**: Payment failures, cancellations, renewals all handled
3. **Promo code support**: Stripe manages trial extensions automatically
4. **Customer portal**: Users can manage billing directly through Stripe
5. **Compliance**: Proper handling of payment regulations

## Next Steps

1. Set up webhook endpoint in your backend
2. Configure webhook in Stripe Dashboard
3. Update database schema with Stripe fields
4. Test with Stripe test mode first
5. Deploy and configure production webhooks

## Resources

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Subscription Webhooks](https://stripe.com/docs/billing/subscriptions/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
