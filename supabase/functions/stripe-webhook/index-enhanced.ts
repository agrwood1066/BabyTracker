// Stripe Webhook Handler for Baby Steps - ENHANCED VERSION
// This version captures ALL missing data fields including payment methods
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

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

// Helper function to map Stripe status to local status
function mapStripeStatusToLocal(stripeStatus: string): string {
  const statusMap: { [key: string]: string } = {
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

// Helper function to get plan from price ID
function getPlanFromPriceId(priceId: string | null): string {
  if (!priceId) return 'free';
  
  const priceMap: { [key: string]: string } = {
    'price_1S0ewOFHwv9HjdNkJH5Ct2fl': 'premium_annual',
    'price_1S0evLFHwv9HjdNkTL86PAyH': 'premium_monthly',
    // Add any other price IDs here
  };
  
  return priceMap[priceId] || 'premium_monthly';
}

// ENHANCED: Comprehensive subscription handler that captures ALL fields
async function handleSubscriptionEvent(supabase: any, subscription: any, eventType: string, stripeClient: any) {
  console.log(`Processing ${eventType} for subscription:`, subscription.id);

  // Get payment method details if available
  let paymentMethodLast4 = null;
  let paymentMethodBrand = null;
  
  // Try to get payment method from default_payment_method
  if (subscription.default_payment_method) {
    try {
      const paymentMethodId = typeof subscription.default_payment_method === 'string' 
        ? subscription.default_payment_method 
        : subscription.default_payment_method.id;
      
      const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
      
      if (paymentMethod.card) {
        paymentMethodLast4 = paymentMethod.card.last4;
        paymentMethodBrand = paymentMethod.card.brand;
        console.log(`Retrieved payment method: ${paymentMethodBrand} ****${paymentMethodLast4}`);
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  }
  
  // If no payment method yet, try to get from latest invoice
  if (!paymentMethodLast4 && subscription.latest_invoice) {
    try {
      const invoiceId = typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice.id;
        
      const invoice = await stripeClient.invoices.retrieve(invoiceId, {
        expand: ['payment_intent.payment_method']
      });
      
      if (invoice.payment_intent?.payment_method?.card) {
        paymentMethodLast4 = invoice.payment_intent.payment_method.card.last4;
        paymentMethodBrand = invoice.payment_intent.payment_method.card.brand;
        console.log(`Retrieved payment method from invoice: ${paymentMethodBrand} ****${paymentMethodLast4}`);
      }
    } catch (error) {
      console.error('Error fetching invoice payment method:', error);
    }
  }

  // Extract price ID
  let priceId = null;
  if (subscription.items?.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    priceId = typeof item.price === 'object' ? item.price.id : item.price;
    console.log(`Price ID: ${priceId}`);
  }

  // Extract promo code if present
  let promoCodeUsed = null;
  let stripePromotionCodeId = null;
  
  if (subscription.discount?.promotion_code) {
    stripePromotionCodeId = subscription.discount.promotion_code.id || subscription.discount.promotion_code;
    
    // Try to get the actual code
    if (typeof subscription.discount.promotion_code === 'object' && subscription.discount.promotion_code.code) {
      promoCodeUsed = subscription.discount.promotion_code.code;
    } else {
      // Fetch from Stripe if needed
      try {
        const promotionCode = await stripeClient.promotionCodes.retrieve(stripePromotionCodeId);
        promoCodeUsed = promotionCode.code;
      } catch (error) {
        console.error('Could not fetch promotion code:', error);
      }
    }
    console.log(`Promo code: ${promoCodeUsed}`);
  }

  // Calculate locked-in price based on price ID
  let lockedInPrice = null;
  const plan = getPlanFromPriceId(priceId);
  
  if (priceId === 'price_1S0evLFHwv9HjdNkTL86PAyH') {
    lockedInPrice = 6.99; // Launch price
  } else if (plan === 'premium_monthly') {
    lockedInPrice = 7.99; // Regular price
  }

  // Prepare comprehensive update data
  const updateData: any = {
    stripe_subscription_id: subscription.id,
    stripe_subscription_status: subscription.status,
    stripe_current_period_end: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : null,
    stripe_price_id: priceId,
    subscription_status: mapStripeStatusToLocal(subscription.status),
    subscription_plan: plan,
    updated_at: new Date().toISOString()
  };

  // Add trial end if exists
  if (subscription.trial_end) {
    updateData.stripe_trial_end = new Date(subscription.trial_end * 1000).toISOString();
    console.log(`Trial ends: ${updateData.stripe_trial_end}`);
  }

  // Add payment method details if available
  if (paymentMethodLast4) {
    updateData.payment_method_last4 = paymentMethodLast4;
    updateData.payment_method_brand = paymentMethodBrand;
  }

  // Add promo code if present
  if (promoCodeUsed) {
    updateData.promo_code_used = promoCodeUsed;
    updateData.stripe_promotion_code_id = stripePromotionCodeId;
  }

  // Add locked-in price if determined
  if (lockedInPrice) {
    updateData.locked_in_price = lockedInPrice;
  }

  console.log('Comprehensive update data:', JSON.stringify(updateData, null, 2));

  // Update the profile
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    console.error('Error updating subscription data:', error);
  } else {
    console.log('Successfully updated all subscription fields');
  }
}

// ENHANCED: Handle payment method updates
async function handlePaymentMethodEvent(supabase: any, paymentMethod: any, eventType: string) {
  console.log(`Processing payment method ${eventType}:`, paymentMethod.id);
  
  if (!paymentMethod.customer) return;
  
  if (paymentMethod.card) {
    const updateData = {
      payment_method_last4: paymentMethod.card.last4,
      payment_method_brand: paymentMethod.card.brand,
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating payment method:', updateData);
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('stripe_customer_id', paymentMethod.customer);
      
    if (error) {
      console.error('Error updating payment method:', error);
    } else {
      console.log('Payment method updated successfully');
    }
  }
}

// ENHANCED: Handle invoices with payment method extraction
async function handleInvoiceEvent(supabase: any, invoice: any, eventType: string, stripeClient: any) {
  console.log(`Processing invoice ${eventType}:`, invoice.id);
  
  if (!invoice.subscription) return;
  
  let updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  // For successful payments, extract payment method
  if (eventType === 'invoice.payment_succeeded' && invoice.payment_intent) {
    try {
      // Fetch the payment intent with expanded payment method
      const paymentIntent = await stripeClient.paymentIntents.retrieve(
        invoice.payment_intent,
        { expand: ['payment_method'] }
      );
      
      if (paymentIntent.payment_method?.card) {
        updateData.payment_method_last4 = paymentIntent.payment_method.card.last4;
        updateData.payment_method_brand = paymentIntent.payment_method.card.brand;
        console.log(`Payment method from invoice: ${updateData.payment_method_brand} ****${updateData.payment_method_last4}`);
      }
      
      updateData.subscription_status = 'active';
    } catch (error) {
      console.error('Error fetching payment intent:', error);
    }
  } else if (eventType === 'invoice.payment_failed') {
    updateData.subscription_status = 'expired';
  }
  
  // Update the profile
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_subscription_id', invoice.subscription);
    
  if (error) {
    console.error('Error updating from invoice:', error);
  } else {
    console.log('Invoice data updated successfully');
  }
}

// Main webhook handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the signature from Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event with enhanced handlers
    switch (event.type) {
      case 'customer.created':
        const customer = event.data.object;
        if (customer.email) {
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customer.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', customer.email);
        }
        break;

      case 'checkout.session.completed':
        // Keep your existing handleSuccessfulPayment function
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(supabase, session, stripe);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Use enhanced handler
        await handleSubscriptionEvent(supabase, event.data.object, event.type, stripe);
        break;

      case 'customer.subscription.deleted':
        const canceledSub = event.data.object;
        await supabase.from('profiles').update({
          stripe_subscription_status: 'canceled',
          subscription_status: 'free',
          subscription_plan: 'free',
          subscription_expires_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('stripe_customer_id', canceledSub.customer);
        break;

      case 'payment_method.attached':
      case 'payment_method.updated':
        // Handle payment method updates
        await handlePaymentMethodEvent(supabase, event.data.object, event.type);
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // Use enhanced invoice handler
        await handleInvoiceEvent(supabase, event.data.object, event.type, stripe);
        break;

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

// Keep your existing handleSuccessfulPayment function as-is
async function handleSuccessfulPayment(supabase: any, session: any, stripeClient: any) {
  // ... Your existing implementation stays the same ...
  console.log('Using existing handleSuccessfulPayment implementation');
}
