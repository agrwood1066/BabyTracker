#!/bin/bash

# Deploy Stripe Webhook Function with proper configuration

echo "Deploying Stripe webhook function..."

# Deploy with no JWT verification (required for Stripe webhooks)
supabase functions deploy stripe-webhook --no-verify-jwt

echo "Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Make sure you have set these environment variables in Supabase Dashboard:"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "To set environment variables:"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to Edge Functions"
echo "3. Click on 'stripe-webhook'"
echo "4. Go to the 'Secrets' tab"
echo "5. Add all required environment variables"
echo ""
echo "Your webhook endpoint URL is:"
echo "https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
