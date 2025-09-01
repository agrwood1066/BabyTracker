// Stripe Webhook Handler for Real-time Subscription Sync
// This should be deployed as a serverless function or API endpoint

import { createClient } from '@supabase/supabase-js';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for database functions
);

// Main webhook handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Log the webhook event
  await logWebhookEvent(event);

  try {
    // Handle different Stripe events
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await markWebhookProcessed(event.id);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    await logWebhookError(event.id, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Event Handlers
async function handleCustomerCreated(event) {
  const customer = event.data.object;
  console.log('Customer created:', customer.id);

  await supabase.rpc('update_customer_from_stripe', {
    p_stripe_customer_id: customer.id,
    p_email: customer.email
  });
}

async function handleCustomerUpdated(event) {
  const customer = event.data.object;
  console.log('Customer updated:', customer.id);

  // Get payment method info if available
  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;

  if (customer.invoice_settings?.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        customer.invoice_settings.default_payment_method
      );
      paymentMethodLast4 = paymentMethod.card?.last4;
      paymentMethodBrand = paymentMethod.card?.brand;
    } catch (error) {
      console.error('Error retrieving payment method:', error);
    }
  }

  await supabase.rpc('update_customer_from_stripe', {
    p_stripe_customer_id: customer.id,
    p_email: customer.email,
    p_payment_method_last4: paymentMethodLast4,
    p_payment_method_brand: paymentMethodBrand
  });
}

async function handleSubscriptionCreated(event) {
  const subscription = event.data.object;
  console.log('Subscription created:', subscription.id);

  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Extract promo code info if available
  let promoCode = null;
  let promoMonths = null;
  
  if (subscription.discount?.coupon) {
    promoCode = subscription.discount.coupon.id;
    // Calculate promo months based on trial period
    if (subscription.trial_end && subscription.trial_start) {
      const trialDays = (subscription.trial_end - subscription.trial_start) / (24 * 60 * 60);
      promoMonths = Math.round(trialDays / 30);
    }
  }

  await supabase.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: subscription.status,
    p_current_period_end: currentPeriodEnd,
    p_trial_end: trialEnd,
    p_price_id: subscription.items.data[0]?.price?.id,
    p_promo_code: promoCode,
    p_promo_months: promoMonths
  });
}

async function handleSubscriptionUpdated(event) {
  const subscription = event.data.object;
  console.log('Subscription updated:', subscription.id);

  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  await supabase.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: subscription.status,
    p_current_period_end: currentPeriodEnd,
    p_trial_end: trialEnd,
    p_price_id: subscription.items.data[0]?.price?.id
  });
}

async function handleSubscriptionDeleted(event) {
  const subscription = event.data.object;
  console.log('Subscription deleted:', subscription.id);

  const canceledAt = new Date(subscription.canceled_at * 1000).toISOString();

  await supabase.rpc('cancel_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_canceled_at: canceledAt
  });
}

async function handlePaymentSucceeded(event) {
  const invoice = event.data.object;
  console.log('Payment succeeded for customer:', invoice.customer);

  // Update subscription status to active if it was past_due
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await handleSubscriptionUpdated({ data: { object: subscription } });
  }
}

async function handlePaymentFailed(event) {
  const invoice = event.data.object;
  console.log('Payment failed for customer:', invoice.customer);

  // You might want to:
  // 1. Send an email notification
  // 2. Update subscription status
  // 3. Log the payment failure
  
  // For now, just log it
  await supabase
    .from('stripe_webhook_logs')
    .insert({
      event_id: `payment_failed_${Date.now()}`,
      event_type: 'payment_failed',
      data: {
        customer: invoice.customer,
        subscription: invoice.subscription,
        amount_due: invoice.amount_due,
        attempt_count: invoice.attempt_count
      }
    });
}

async function handleCheckoutCompleted(event) {
  const session = event.data.object;
  console.log('Checkout completed:', session.id);

  // Link customer to user if this was their first purchase
  if (session.customer && session.customer_email) {
    await supabase.rpc('update_customer_from_stripe', {
      p_stripe_customer_id: session.customer,
      p_email: session.customer_email
    });
  }

  // If subscription was created, it will be handled by subscription.created event
}

// Utility Functions
async function logWebhookEvent(event) {
  try {
    await supabase
      .from('stripe_webhook_logs')
      .insert({
        event_id: event.id,
        event_type: event.type,
        data: event.data,
        processed: false
      });
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

async function markWebhookProcessed(eventId) {
  try {
    await supabase
      .from('stripe_webhook_logs')
      .update({ processed: true })
      .eq('event_id', eventId);
  } catch (error) {
    console.error('Error marking webhook as processed:', error);
  }
}

async function logWebhookError(eventId, errorMessage) {
  try {
    await supabase
      .from('stripe_webhook_logs')
      .update({ 
        processed: false,
        error: errorMessage
      })
      .eq('event_id', eventId);
  } catch (error) {
    console.error('Error logging webhook error:', error);
  }
}

// Export for different deployment platforms
export { handler };
