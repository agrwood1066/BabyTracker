// Express/Node.js Stripe Webhook Handler
// Use this if deploying to Vercel, Netlify Functions, or a Node.js server

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this to your .env
);

// Express middleware for raw body (required for Stripe webhook verification)
const express = require('express');
const router = express.Router();

// Webhook endpoint
router.post('/api/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
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
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log webhook event
    console.log(`Received webhook: ${event.type}`);
    
    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          // Send reminder email 3 days before trial ends
          await handleTrialEndingSoon(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

// Handle initial checkout completion
async function handleCheckoutCompleted(session) {
  console.log('Processing checkout.session.completed');
  
  // Get the full subscription object
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Find the user by email
  const email = session.customer_email;
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !profile) {
    console.error('User not found for email:', email);
    return;
  }

  // Check for promo code usage
  let promoCode = null;
  let promoMonths = 0;
  
  if (session.discount?.coupon) {
    promoCode = session.discount.coupon.id;
    if (session.discount.coupon.duration === 'repeating') {
      promoMonths = session.discount.coupon.duration_in_months;
    } else if (session.discount.coupon.duration === 'once') {
      promoMonths = 1;
    }
  }

  // Update user's Stripe customer ID
  await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: session.customer,
      promo_code_used: promoCode,
      promo_months_granted: promoMonths
    })
    .eq('id', profile.id);

  // Update subscription details
  await updateSubscriptionInDB(subscription);
}

// Handle subscription changes
async function handleSubscriptionChange(subscription) {
  console.log('Processing subscription change:', subscription.id);
  await updateSubscriptionInDB(subscription);
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription cancellation:', subscription.id);
  
  // Update user to free plan
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'free',
      subscription_plan: 'free',
      stripe_subscription_status: 'canceled',
      stripe_subscription_id: null,
      stripe_current_period_end: null
    })
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    console.error('Error updating canceled subscription:', error);
  }
}

// Handle trial ending soon (3 days before)
async function handleTrialEndingSoon(subscription) {
  console.log('Trial ending soon for:', subscription.id);
  
  // Get user email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (profile) {
    console.log(`Send trial ending email to: ${profile.email}`);
    // TODO: Integrate with your email service (SendGrid, Postmark, etc.)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // Refresh subscription status
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await updateSubscriptionInDB(subscription);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Get user details
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (profile) {
    console.log(`Payment failed for: ${profile.email}`);
    // TODO: Send payment failed email
    
    // Update subscription status to show payment issue
    await supabaseAdmin
      .from('profiles')
      .update({
        stripe_subscription_status: 'past_due'
      })
      .eq('stripe_customer_id', invoice.customer);
  }
}

// Helper function to update subscription in database
async function updateSubscriptionInDB(subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const customerId = subscription.customer;
  
  // Map Stripe status to our status
  let localStatus = 'free';
  switch (subscription.status) {
    case 'trialing':
      localStatus = 'trial';
      break;
    case 'active':
      localStatus = 'active';
      break;
    case 'past_due':
      localStatus = 'active'; // Still active but with payment issues
      break;
    default:
      localStatus = 'free';
  }
  
  // Determine plan type from price ID
  // Update these to match your actual Stripe price IDs
  let plan = 'free';
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) {
    plan = 'premium_monthly';
  } else if (priceId === process.env.STRIPE_PRICE_ANNUAL) {
    plan = 'premium_annual';
  }
  
  // Calculate dates
  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString() 
    : null;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  
  // Update profile
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: subscription.status,
      stripe_current_period_end: currentPeriodEnd,
      stripe_trial_end: trialEnd,
      stripe_price_id: priceId,
      subscription_status: localStatus,
      subscription_plan: plan,
      trial_ends_at: trialEnd || undefined
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log(`Updated subscription for customer: ${customerId}`);
  }
}

module.exports = router;
