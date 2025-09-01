// Stripe Webhook Handler for Supabase Edge Functions
// Deploy this as a Supabase Edge Function or use with a Node.js backend

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Main webhook handler
export async function handleStripeWebhook(request: Request): Promise<Response> {
  try {
    // Get the webhook signature from headers
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    // Get the raw body
    const body = await request.text();

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Log the webhook event
    await logWebhookEvent(event);

    // Handle the event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

// Handle checkout session completed (initial subscription creation)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.completed:', session.id);

  // Get the subscription details
  if (!session.subscription || !session.customer) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
    { expand: ['latest_invoice.payment_intent'] }
  );

  // Get customer details
  const customer = await stripe.customers.retrieve(session.customer as string);
  
  // Extract promo code if used
  let promoCode = null;
  let promoMonths = 0;
  
  if (session.total_details?.breakdown?.discounts) {
    const discount = session.total_details.breakdown.discounts[0];
    if (discount?.discount?.coupon) {
      promoCode = discount.discount.coupon.name || discount.discount.coupon.id;
      // If coupon provides free trial months
      if (discount.discount.coupon.duration === 'repeating') {
        promoMonths = discount.discount.coupon.duration_in_months || 0;
      } else if (discount.discount.coupon.duration === 'once') {
        promoMonths = 1;
      }
    }
  }

  // Find user by email
  const email = (customer as any).email || session.customer_email;
  if (!email) {
    console.error('No email found for customer');
    return;
  }

  // Update user profile with Stripe data
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    console.error('User not found:', email);
    return;
  }

  // Update the user's Stripe customer ID first
  await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: session.customer as string,
    })
    .eq('id', profile.id);

  // Then update subscription details
  await updateSubscriptionInDatabase(subscription, promoCode, promoMonths);
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Handling subscription update:', subscription.id);
  await updateSubscriptionInDatabase(subscription);
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Handling subscription deletion:', subscription.id);

  const { error } = await supabaseAdmin.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer as string,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: 'canceled',
    p_current_period_end: null,
    p_trial_end: null,
    p_price_id: null,
  });

  if (error) {
    console.error('Error updating subscription deletion:', error);
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial ending soon for subscription:', subscription.id);
  
  // You could send an email notification here
  // For now, just log it
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (profile) {
    console.log(`Trial ending soon for user: ${profile.email}`);
    // TODO: Send email notification
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  // Update subscription if needed
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await updateSubscriptionInDatabase(subscription);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  
  // Log the failure and potentially send notification
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (profile) {
    console.log(`Payment failed for user: ${profile.email}`);
    // TODO: Send email notification about payment failure
  }
}

// Update subscription in database
async function updateSubscriptionInDatabase(
  subscription: Stripe.Subscription,
  promoCode?: string | null,
  promoMonths?: number
) {
  const priceId = subscription.items.data[0]?.price.id;
  
  // Calculate trial end if in trial
  let trialEnd = null;
  if (subscription.trial_end) {
    trialEnd = new Date(subscription.trial_end * 1000).toISOString();
  }

  // Calculate current period end
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000
  ).toISOString();

  // Update subscription in database
  const { data, error } = await supabaseAdmin.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer as string,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: subscription.status,
    p_current_period_end: currentPeriodEnd,
    p_trial_end: trialEnd,
    p_price_id: priceId,
    p_promo_code: promoCode || null,
    p_promo_months: promoMonths || null,
  });

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log('Subscription updated successfully:', data);
  }
}

// Log webhook events for debugging
async function logWebhookEvent(event: Stripe.Event) {
  try {
    await supabaseAdmin
      .from('stripe_webhook_logs')
      .insert({
        event_id: event.id,
        event_type: event.type,
        data: event.data.object as any,
        processed: true,
      });
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

// Export for Supabase Edge Function
export default handleStripeWebhook;
