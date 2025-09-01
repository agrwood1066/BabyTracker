// Stripe Webhook Handler for Baby Steps - Complete Fixed Version
// Using native Deno.serve to avoid std library issues
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature'
};

// Use native Deno.serve instead of std library
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    // Get the signature from Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe-signature header found');
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook signature - MUST use constructEventAsync in Edge Functions
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event
    switch(event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        await handleCustomerCreated(supabase, customer);
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(supabase, session, stripe);
        }
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(supabase, subscription, stripe);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription, stripe);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabase, subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabase, invoice, stripe);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }
      
      case 'payment_method.attached':
      case 'payment_method.updated': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        if (paymentMethod.customer && paymentMethod.card) {
          await supabase
            .from('profiles')
            .update({
              payment_method_last4: paymentMethod.card.last4,
              payment_method_brand: paymentMethod.card.brand,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', paymentMethod.customer as string);
          
          console.log(`Updated payment method: ${paymentMethod.card.brand} ****${paymentMethod.card.last4}`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// Helper function: Handle customer creation
async function handleCustomerCreated(supabase: any, customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);
  
  if (!customer.email) {
    console.log('No email in customer data, skipping profile creation');
    return;
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customer.email)
    .single();

  if (existingProfile) {
    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', customer.email);

    if (error) {
      console.error('Error updating profile with customer ID:', error);
    } else {
      console.log(`Updated profile for ${customer.email} with Stripe customer ID: ${customer.id}`);
    }
  } else {
    console.log(`Profile not found for ${customer.email}, will be created on checkout completion`);
  }
}

// Helper function: Handle successful payment from checkout
async function handleSuccessfulPayment(supabase: any, session: Stripe.Checkout.Session, stripeClient: Stripe) {
  console.log('Processing successful payment for session:', session.id);
  
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) {
    console.error('No customer email found in session');
    return;
  }

  const fullName = session.customer_details?.name || null;
  let promoCodeUsed = null;
  let stripePromotionCodeId = null;
  
  // Check for promo codes
  if (session.discounts && session.discounts.length > 0) {
    const discount = session.discounts[0];
    if (discount.promotion_code) {
      stripePromotionCodeId = discount.promotion_code;
      console.log(`Found promotion code ID: ${stripePromotionCodeId}`);
      
      const { data: dbPromoCode } = await supabase
        .from('promo_codes')
        .select('code')
        .eq('stripe_promotion_code_id', stripePromotionCodeId)
        .single();
        
      if (dbPromoCode) {
        promoCodeUsed = dbPromoCode.code;
      } else {
        try {
          const promotionCode = await stripeClient.promotionCodes.retrieve(stripePromotionCodeId);
          promoCodeUsed = promotionCode.code;
        } catch (error) {
          console.error('Could not fetch promotion code from Stripe:', error);
          promoCodeUsed = stripePromotionCodeId;
        }
      }
    }
  }

  const subscriptionId = session.subscription;
  const customerId = session.customer;
  const amount = session.amount_total || 0;
  let plan = 'premium_monthly';
  let lockedInPrice = null;
  let priceId = null;
  let subscriptionStatus = null;
  let currentPeriodEnd = null;
  let trialEnd = null;

  // Get subscription details if available
  if (subscriptionId) {
    try {
      const subscription = await stripeClient.subscriptions.retrieve(subscriptionId as string);
      subscriptionStatus = subscription.status;
      currentPeriodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null;
      trialEnd = subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null;

      if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        priceId = typeof item.price === 'object' && item.price.id 
          ? item.price.id 
          : item.price as string;
      }

      if (!promoCodeUsed && subscription.discount && subscription.discount.promotion_code) {
        stripePromotionCodeId = typeof subscription.discount.promotion_code === 'string'
          ? subscription.discount.promotion_code
          : subscription.discount.promotion_code.id;
        promoCodeUsed = typeof subscription.discount.promotion_code === 'object'
          ? subscription.discount.promotion_code.code
          : stripePromotionCodeId;
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    }
  }

  // Map price ID to plan
  if (priceId === 'price_1S0ewOFHwv9HjdNkJH5Ct2fl') {
    plan = 'premium_annual';
  } else if (priceId === 'price_1S0evLFHwv9HjdNkTL86PAyH') {
    plan = 'premium_monthly';
    lockedInPrice = 6.99;
  } else if (amount === 6999) {
    plan = 'premium_annual';
  } else if (amount === 699 || amount === 0) {
    plan = 'premium_monthly';
    lockedInPrice = 6.99;
  } else if (amount === 799) {
    plan = 'premium_monthly';
    lockedInPrice = 7.99;
  }

  const supabaseStatus = subscriptionStatus === 'trialing' ? 'trial' : 
                         subscriptionStatus === 'active' ? 'active' : 'free';

  const updateData = {
    full_name: fullName,
    subscription_status: supabaseStatus,
    subscription_plan: plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_subscription_status: subscriptionStatus || null,
    stripe_current_period_end: currentPeriodEnd || null,
    stripe_price_id: priceId || null,
    stripe_trial_end: trialEnd || null,
    stripe_promotion_code_id: stripePromotionCodeId,
    locked_in_price: lockedInPrice,
    subscription_expires_at: null,
    promo_code_used: promoCodeUsed,
    updated_at: new Date().toISOString()
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('email', customerEmail)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return;
  }

  console.log(`Successfully updated profile for ${customerEmail}`);

  if (promoCodeUsed && profile) {
    await trackPromoCodeUsage(supabase, promoCodeUsed, stripePromotionCodeId, profile.id);
  }
}

// Helper function: Track promo code usage
async function trackPromoCodeUsage(supabase: any, promoCode: string, stripePromotionCodeId: string | null, userId: string) {
  const { data: trackedPromoCode } = await supabase
    .from('promo_codes')
    .select('*')
    .or(`code.eq.${promoCode},code.ilike.${promoCode}`)
    .single();

  if (trackedPromoCode) {
    console.log(`Tracking usage for promo code: ${trackedPromoCode.code}`);

    const { data: existingUsage } = await supabase
      .from('promo_code_usage')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingUsage) {
      await supabase
        .from('promo_code_usage')
        .update({
          promo_code_id: trackedPromoCode.id,
          subscription_started_at: new Date().toISOString(),
          first_payment_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('promo_code_usage')
        .insert({
          promo_code_id: trackedPromoCode.id,
          user_id: userId,
          applied_at: new Date().toISOString(),
          subscription_started_at: new Date().toISOString(),
          first_payment_at: new Date().toISOString()
        });
    }

    await supabase
      .from('promo_codes')
      .update({
        times_used: (trackedPromoCode.times_used || 0) + 1
      })
      .eq('id', trackedPromoCode.id);
  }
}

// Helper function: Handle subscription creation
async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription, stripeClient: Stripe) {
  console.log('Subscription created:', subscription.id);

  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;

  if (subscription.default_payment_method) {
    try {
      const paymentMethodId = typeof subscription.default_payment_method === 'string' 
        ? subscription.default_payment_method 
        : subscription.default_payment_method.id;
      const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
      if (paymentMethod.card) {
        paymentMethodLast4 = paymentMethod.card.last4;
        paymentMethodBrand = paymentMethod.card.brand;
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  }

  const customer = await stripeClient.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted || !customer.email) return;

  let promoCodeUsed = null;
  let stripePromotionCodeId = null;
  
  if (subscription.discount && subscription.discount.promotion_code) {
    stripePromotionCodeId = typeof subscription.discount.promotion_code === 'string'
      ? subscription.discount.promotion_code
      : subscription.discount.promotion_code.id;
    promoCodeUsed = typeof subscription.discount.promotion_code === 'object'
      ? subscription.discount.promotion_code.code
      : stripePromotionCodeId;
  }

  const status = subscription.status === 'trialing' ? 'trial' : 
                 subscription.status === 'active' ? 'active' : 'expired';

  let priceId = null;
  if (subscription.items?.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    priceId = typeof item.price === 'object' ? item.price.id : item.price;
  }

  const updateData: any = {
    subscription_status: status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    stripe_subscription_status: subscription.status,
    stripe_current_period_end: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : null,
    stripe_price_id: priceId,
    stripe_promotion_code_id: stripePromotionCodeId,
    promo_code_used: promoCodeUsed,
    updated_at: new Date().toISOString()
  };

  if (subscription.trial_end) {
    updateData.stripe_trial_end = new Date(subscription.trial_end * 1000).toISOString();
  }

  if (paymentMethodLast4) {
    updateData.payment_method_last4 = paymentMethodLast4;
    updateData.payment_method_brand = paymentMethodBrand;
  }

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('email', customer.email);

  console.log('Subscription created with full data');
}

// Helper function: Handle subscription updates
async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription, stripeClient: Stripe) {
  console.log('Subscription updated:', subscription.id);
  console.log('Subscription status:', subscription.status);
  console.log('Cancel at period end:', subscription.cancel_at_period_end);
  
  // Handle cancellation
  if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    console.log('Subscription cancelled or set to cancel at period end');
    
    if (subscription.cancel_at_period_end && subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active', // Still active until period end
          subscription_expires_at: periodEnd,
          stripe_subscription_status: subscription.status,
          stripe_cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      
      console.log(`Subscription will expire at: ${periodEnd}`);
    } else {
      // Immediate cancellation
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_plan: 'free',
          subscription_expires_at: new Date().toISOString(),
          stripe_subscription_status: 'canceled',
          stripe_cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      
      console.log('Subscription cancelled immediately');
    }
    
    return;
  }
  
  // Handle reactivation or other updates
  const status = subscription.status === 'trialing' ? 'trial' : 
                 subscription.status === 'active' ? 'active' : 
                 'expired';
  
  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;
  
  if (subscription.default_payment_method) {
    try {
      const paymentMethodId = typeof subscription.default_payment_method === 'string' 
        ? subscription.default_payment_method 
        : subscription.default_payment_method.id;
      const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
      if (paymentMethod.card) {
        paymentMethodLast4 = paymentMethod.card.last4;
        paymentMethodBrand = paymentMethod.card.brand;
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  }
  
  let priceId = null;
  if (subscription.items?.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    priceId = typeof item.price === 'object' ? item.price.id : item.price;
  }
  
  const updateData: any = {
    subscription_status: status,
    stripe_subscription_status: subscription.status,
    stripe_current_period_end: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : null,
    stripe_cancel_at_period_end: subscription.cancel_at_period_end || false,
    stripe_price_id: priceId,
    updated_at: new Date().toISOString()
  };
  
  // Clear expiration if subscription is reactivated
  if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
    updateData.subscription_expires_at = null;
  }
  
  if (subscription.trial_end) {
    updateData.stripe_trial_end = new Date(subscription.trial_end * 1000).toISOString();
  }
  
  if (paymentMethodLast4) {
    updateData.payment_method_last4 = paymentMethodLast4;
    updateData.payment_method_brand = paymentMethodBrand;
  }
  
  await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id);
  
  console.log('Subscription updated with full data:', updateData);
}

// Helper function: Handle subscription cancellation
async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  console.log('Subscription deleted/cancelled:', subscription.id);
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'free',
      subscription_plan: 'free',
      subscription_expires_at: new Date().toISOString(),
      stripe_subscription_status: 'canceled',
      stripe_cancel_at_period_end: false,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (profile) {
    await supabase
      .from('promo_code_usage')
      .update({
        churned_at: new Date().toISOString()
      })
      .eq('user_id', profile.id);
  }
}

// Helper function: Handle successful invoice payment
async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice, stripeClient: Stripe) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  if (!invoice.subscription) return;

  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;

  if (invoice.payment_intent) {
    try {
      const paymentIntent = await stripeClient.paymentIntents.retrieve(
        invoice.payment_intent as string, 
        { expand: ['payment_method'] }
      );
      if (paymentIntent.payment_method && 
          typeof paymentIntent.payment_method === 'object' && 
          paymentIntent.payment_method.card) {
        paymentMethodLast4 = paymentIntent.payment_method.card.last4;
        paymentMethodBrand = paymentIntent.payment_method.card.brand;
      }
    } catch (error) {
      console.error('Error fetching payment intent:', error);
    }
  }

  const updateData: any = {
    subscription_status: 'active',
    updated_at: new Date().toISOString()
  };

  if (paymentMethodLast4) updateData.payment_method_last4 = paymentMethodLast4;
  if (paymentMethodBrand) updateData.payment_method_brand = paymentMethodBrand;

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_subscription_id', invoice.subscription);

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, created_at')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (profile) {
    const accountAge = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (accountAge >= 3) {
      await checkCommissionMilestone(supabase, profile.id, '3_months');
    }
    if (accountAge >= 6) {
      await checkCommissionMilestone(supabase, profile.id, '6_months');
    }
  }
}

// Helper function: Handle failed invoice payment
async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

// Helper function: Check commission milestones
async function checkCommissionMilestone(supabase: any, userId: string, milestone: string) {
  const { data: promoUsage } = await supabase
    .from('promo_code_usage')
    .select('promo_code_id')
    .eq('user_id', userId)
    .single();

  if (!promoUsage) return;

  const { data: promoCode } = await supabase
    .from('promo_codes')
    .select('code, tier')
    .eq('id', promoUsage.promo_code_id)
    .single();

  if (!promoCode) return;

  const { data: existingCommission } = await supabase
    .from('influencer_commissions')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone', milestone)
    .single();

  if (existingCommission) return;

  let amount = 0;
  if (milestone === '3_months') {
    amount = promoCode.tier === 'micro' ? 5 : promoCode.tier === 'mid' ? 7.50 : 10;
  } else if (milestone === '6_months') {
    amount = promoCode.tier === 'mid' ? 7.50 : 10;
  }

  if (amount > 0) {
    await supabase
      .from('influencer_commissions')
      .insert({
        influencer_code: promoCode.code,
        user_id: userId,
        milestone: milestone,
        amount: amount,
        eligible_date: new Date().toISOString()
      });
    
    console.log(`Created ${milestone} commission of £${amount} for code ${promoCode.code}`);
  }
}
