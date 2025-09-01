# Missing Data Fields - Webhook Update Required

## Current Blank Fields in Your Profile Table

Looking at your test customer, these fields are blank but should have data:
- ❌ `stripe_subscription_status` (null) - Should show subscription status from Stripe
- ❌ `stripe_current_period_end` (null) - Should show next billing date
- ❌ `stripe_price_id` (null) - Should show which price plan they're on
- ❌ `stripe_trial_end` (null) - Should show when trial ends
- ❌ `payment_method_last4` (null) - Should show last 4 digits of card
- ❌ `payment_method_brand` (null) - Should show card brand (Visa, Mastercard, etc)

## Enhanced Webhook Handler

Add these handlers to your `stripe-webhook/index.ts` file to capture all the missing data:

```typescript
// Add this handler for subscription events
async function handleSubscriptionEvent(supabase: any, subscription: any, eventType: string) {
  console.log(`Processing ${eventType} for subscription:`, subscription.id);

  // Get payment method details if available
  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;
  
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        typeof subscription.default_payment_method === 'string' 
          ? subscription.default_payment_method 
          : subscription.default_payment_method.id
      );
      
      if (paymentMethod.card) {
        paymentMethodLast4 = paymentMethod.card.last4;
        paymentMethodBrand = paymentMethod.card.brand;
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  }

  // Prepare update data with ALL necessary fields
  const updateData = {
    stripe_subscription_id: subscription.id,
    stripe_subscription_status: subscription.status,
    stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    stripe_price_id: subscription.items.data[0]?.price.id || null,
    subscription_status: mapStripeStatusToLocal(subscription.status),
    subscription_plan: getPlanFromPriceId(subscription.items.data[0]?.price.id),
    updated_at: new Date().toISOString()
  };

  // Add trial end if exists
  if (subscription.trial_end) {
    updateData.stripe_trial_end = new Date(subscription.trial_end * 1000).toISOString();
  }

  // Add payment method details if available
  if (paymentMethodLast4) updateData.payment_method_last4 = paymentMethodLast4;
  if (paymentMethodBrand) updateData.payment_method_brand = paymentMethodBrand;

  // Update the profile
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    console.error('Error updating subscription data:', error);
  } else {
    console.log('Successfully updated subscription data:', updateData);
  }
}

// Update your main webhook handler
case 'customer.subscription.created':
case 'customer.subscription.updated':
  await handleSubscriptionEvent(supabase, event.data.object, event.type);
  break;

case 'customer.subscription.deleted':
  const canceledSub = event.data.object;
  await supabase.from('profiles').update({
    stripe_subscription_status: 'canceled',
    subscription_status: 'free',
    subscription_plan: 'free',
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', canceledSub.customer);
  break;

// Add this case to capture payment method updates
case 'payment_method.attached':
case 'payment_method.updated':
  const paymentMethod = event.data.object;
  if (paymentMethod.card) {
    await supabase.from('profiles').update({
      payment_method_last4: paymentMethod.card.last4,
      payment_method_brand: paymentMethod.card.brand,
      updated_at: new Date().toISOString()
    }).eq('stripe_customer_id', paymentMethod.customer);
  }
  break;
```

## Manual Data Fix for Existing Customer

Since your test customer already exists, you can manually trigger a webhook redelivery or run this SQL to populate the missing fields:

```sql
-- Run this in Supabase SQL Editor to fix your test customer
UPDATE profiles
SET 
  stripe_subscription_status = 'active',
  stripe_current_period_end = '2025-09-30 07:38:10+00', -- Adjust based on actual date
  stripe_price_id = 'price_YOUR_PRICE_ID', -- Get from Stripe Dashboard
  stripe_trial_end = '2025-09-30 07:38:10+00', -- 1 month from creation
  payment_method_last4 = '4242', -- Get from Stripe Dashboard
  payment_method_brand = 'visa' -- Get from Stripe Dashboard
WHERE email = 'jut_60_macro@icloud.com';
```

## Testing the Fix

1. **Deploy the updated webhook:**
   ```bash
   cd ~/Desktop/BabyTracker
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

2. **Trigger a test event from Stripe:**
   - Go to Stripe Dashboard → Webhooks
   - Find your webhook endpoint
   - Click "Send test webhook"
   - Choose `customer.subscription.updated`
   - Check if fields populate

3. **Or create a new test subscription:**
   - This will trigger all events fresh
   - Should populate all fields correctly

## Expected Result

After the fix, your profile table should show:
- ✅ `stripe_subscription_status`: "active" or "trialing"
- ✅ `stripe_current_period_end`: "2025-09-30T07:38:10.000Z"
- ✅ `stripe_price_id`: "price_1234..." (your actual price ID)
- ✅ `stripe_trial_end`: "2025-09-30T07:38:10.000Z"
- ✅ `payment_method_last4`: "4242"
- ✅ `payment_method_brand`: "visa"

This will ensure your Profile page shows accurate subscription information!
