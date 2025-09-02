// Enhanced Stripe Webhook Handler with Influencer Tracking
// Real-time subscription sync with Supabase + Commission tracking

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
function getSupabaseClient(env) {
  const supabaseUrl = env.REACT_APP_SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Verify Stripe webhook signature
async function verifyStripeSignature(body, signature, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signatureBytes = new Uint8Array(
    signature.split(',')[1].split('=')[1].match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
  
  return await crypto.subtle.verify('HMAC', key, signatureBytes, data);
}

// Main webhook handler for Cloudflare
export async function onRequest(context) {
  const { request, env } = context;
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get request body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('Missing stripe signature', { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return new Response('Invalid signature', { status: 400 });
    }

    // Parse the event
    const event = JSON.parse(body);
    
    // Initialize Supabase client
    const supabase = getSupabaseClient(env);
    
    // Log the webhook event
    await logWebhookEvent(supabase, event);

    // Handle different Stripe events
    let result;
    switch (event.type) {
      case 'customer.created':
        result = await handleCustomerCreated(supabase, event, env);
        break;

      case 'customer.updated':
        result = await handleCustomerUpdated(supabase, event, env);
        break;

      case 'customer.subscription.created':
        result = await handleSubscriptionCreated(supabase, event);
        break;

      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(supabase, event);
        break;

      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(supabase, event);
        break;

      case 'invoice.payment_succeeded':
        result = await handlePaymentSucceeded(supabase, event, env);
        break;

      case 'invoice.payment_failed':
        result = await handlePaymentFailed(supabase, event);
        break;

      case 'checkout.session.completed':
        result = await handleCheckoutCompleted(supabase, event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        result = { success: true, message: 'Event logged but not processed' };
    }

    // Mark webhook as processed
    await markWebhookProcessed(supabase, event.id);
    
    return new Response(JSON.stringify({ received: true, result }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Try to log the error if possible
    try {
      const supabase = getSupabaseClient(env);
      const event = JSON.parse(body);
      await logWebhookError(supabase, event.id, error.message);
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Event Handlers
async function handleCustomerCreated(supabase, event) {
  const customer = event.data.object;
  console.log('Customer created:', customer.id);

  const { data, error } = await supabase.rpc('update_customer_from_stripe', {
    p_stripe_customer_id: customer.id,
    p_email: customer.email
  });

  if (error) throw error;
  return data;
}

async function handleCustomerUpdated(supabase, event, env) {
  const customer = event.data.object;
  console.log('Customer updated:', customer.id);

  // Get payment method info if available
  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;

  if (customer.invoice_settings?.default_payment_method) {
    try {
      // Note: In a real implementation, you'd need to call Stripe API here
      // For now, we'll skip this part as it requires Stripe secret key
      // which should be handled server-side
    } catch (error) {
      console.error('Error retrieving payment method:', error);
    }
  }

  const { data, error } = await supabase.rpc('update_customer_from_stripe', {
    p_stripe_customer_id: customer.id,
    p_email: customer.email,
    p_payment_method_last4: paymentMethodLast4,
    p_payment_method_brand: paymentMethodBrand
  });

  if (error) throw error;
  return data;
}

async function handleSubscriptionCreated(supabase, event) {
  const subscription = event.data.object;
  console.log('Subscription created:', subscription.id);

  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Extract promo code info if available
  let promoCode = null;
  let promoMonths = null;
  let stripePromotionCodeId = null;
  
  if (subscription.discount?.promotion_code) {
    stripePromotionCodeId = subscription.discount.promotion_code;
    promoCode = subscription.discount.coupon.name || subscription.discount.coupon.id;
    
    // Calculate promo months based on trial period or discount
    if (subscription.trial_end && subscription.trial_start) {
      const trialDays = (subscription.trial_end - subscription.trial_start) / (24 * 60 * 60);
      promoMonths = Math.round(trialDays / 30);
    }
  }

  // Update subscription first
  const { data: updateResult, error: updateError } = await supabase.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: subscription.status,
    p_current_period_end: currentPeriodEnd,
    p_trial_end: trialEnd,
    p_price_id: subscription.items.data[0]?.price?.id,
    p_promo_code: promoCode,
    p_promo_months: promoMonths
  });

  if (updateError) throw updateError;

  // Handle influencer tracking if promo code was used
  if (stripePromotionCodeId) {
    await trackInfluencerConversion(supabase, subscription, stripePromotionCodeId);
  }

  return updateResult;
}

// New function to track influencer conversions
async function trackInfluencerConversion(supabase, subscription, stripePromotionCodeId) {
  try {
    // Find the promo code in our database
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('stripe_promotion_code_id', stripePromotionCodeId)
      .single();

    if (promoError || !promoCode) {
      console.log('Promo code not found for tracking:', stripePromotionCodeId);
      return;
    }

    // Find the user by email (customer email from subscription)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (profileError || !profile) {
      console.log('Profile not found for customer:', subscription.customer);
      return;
    }

    // Track in promo_code_usage
    const { error: usageError } = await supabase
      .from('promo_code_usage')
      .upsert({
        promo_code_id: promoCode.id,
        user_id: profile.id,
        subscription_started_at: new Date().toISOString()
      });

    if (usageError) {
      console.error('Error tracking promo code usage:', usageError);
    }

    // Create commission record for first month (100% of subscription)
    // Get the subscription price from the first item
    const priceAmount = subscription.items.data[0]?.price?.unit_amount / 100; // Convert from cents
    
    const { error: commissionError } = await supabase
      .from('influencer_commissions')
      .insert({
        influencer_code: promoCode.code,
        user_id: profile.id,
        milestone: 'first_month',
        amount: priceAmount, // Full first month revenue
        eligible_date: new Date().toISOString()
      });

    if (commissionError) {
      console.error('Error creating commission record:', commissionError);
    }

    console.log(`Tracked influencer conversion: ${promoCode.code} for user ${profile.id}`);
  } catch (error) {
    console.error('Error in trackInfluencerConversion:', error);
  }
}

async function handleSubscriptionUpdated(supabase, event) {
  const subscription = event.data.object;
  console.log('Subscription updated:', subscription.id);

  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  const { data, error } = await supabase.rpc('update_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_status: subscription.status,
    p_current_period_end: currentPeriodEnd,
    p_trial_end: trialEnd,
    p_price_id: subscription.items.data[0]?.price?.id
  });

  if (error) throw error;
  return data;
}

async function handleSubscriptionDeleted(supabase, event) {
  const subscription = event.data.object;
  console.log('Subscription deleted:', subscription.id);

  const canceledAt = new Date(subscription.canceled_at * 1000).toISOString();

  const { data, error } = await supabase.rpc('cancel_subscription_from_stripe', {
    p_stripe_customer_id: subscription.customer,
    p_canceled_at: canceledAt
  });

  if (error) throw error;
  return data;
}

async function handlePaymentSucceeded(supabase, event, env) {
  const invoice = event.data.object;
  console.log('Payment succeeded for customer:', invoice.customer);

  // Check if this payment qualifies for milestone bonuses
  if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
    await checkMilestoneBonuses(supabase, invoice);
  }

  return { success: true, message: 'Payment logged' };
}

// New function to check for milestone bonuses
async function checkMilestoneBonuses(supabase, invoice) {
  try {
    // Get the profile associated with this customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, created_at, promo_code_used')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    if (profileError || !profile || !profile.promo_code_used) {
      return; // No promo code used, no bonuses to check
    }

    // Calculate how long the user has been subscribed
    const monthsSinceSignup = Math.floor(
      (new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24 * 30)
    );

    // Get the promo code details
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('code')
      .eq('code', profile.promo_code_used)
      .single();

    if (promoError || !promoCode) return;

    // Check for 3-month bonus
    if (monthsSinceSignup >= 3) {
      const { data: existingBonus } = await supabase
        .from('influencer_commissions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('milestone', '3_months')
        .single();

      if (!existingBonus) {
        await supabase
          .from('influencer_commissions')
          .insert({
            influencer_code: promoCode.code,
            user_id: profile.id,
            milestone: '3_months',
            amount: 5.00, // £5 bonus
            eligible_date: new Date().toISOString()
          });
        
        console.log(`3-month bonus created for user ${profile.id}`);
      }
    }

    // Check for 6-month bonus
    if (monthsSinceSignup >= 6) {
      const { data: existingBonus } = await supabase
        .from('influencer_commissions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('milestone', '6_months')
        .single();

      if (!existingBonus) {
        await supabase
          .from('influencer_commissions')
          .insert({
            influencer_code: promoCode.code,
            user_id: profile.id,
            milestone: '6_months',
            amount: 5.00, // £5 bonus
            eligible_date: new Date().toISOString()
          });
        
        console.log(`6-month bonus created for user ${profile.id}`);
      }
    }
  } catch (error) {
    console.error('Error checking milestone bonuses:', error);
  }
}

async function handlePaymentFailed(supabase, event) {
  const invoice = event.data.object;
  console.log('Payment failed for customer:', invoice.customer);

  // Log the payment failure
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

  return { success: true, message: 'Payment failure logged' };
}

async function handleCheckoutCompleted(supabase, event) {
  const session = event.data.object;
  console.log('Checkout completed:', session.id);

  // Link customer to user if this was their first purchase
  if (session.customer && session.customer_email) {
    const { data, error } = await supabase.rpc('update_customer_from_stripe', {
      p_stripe_customer_id: session.customer,
      p_email: session.customer_email
    });

    if (error) throw error;
    return data;
  }

  return { success: true, message: 'Checkout processed' };
}

// Utility Functions
async function logWebhookEvent(supabase, event) {
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

async function markWebhookProcessed(supabase, eventId) {
  try {
    await supabase
      .from('stripe_webhook_logs')
      .update({ processed: true })
      .eq('event_id', eventId);
  } catch (error) {
    console.error('Error marking webhook as processed:', error);
  }
}

async function logWebhookError(supabase, eventId, errorMessage) {
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