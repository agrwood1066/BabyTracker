#!/bin/bash

# Deploy Fixed Stripe Webhook Script
# This script deploys the updated webhook with Deno runtime fixes

echo "========================================="
echo "Deploying Fixed Stripe Webhook"
echo "========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "📋 Current webhook status:"
supabase functions list

echo ""
echo "🔄 Deploying updated webhook..."
supabase functions deploy stripe-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Webhook deployed successfully!"
    
    echo ""
    echo "📝 Setting environment variables..."
    echo "Please ensure these are set in your Supabase dashboard:"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - STRIPE_WEBHOOK_SECRET"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    
    echo ""
    echo "🔍 To check logs:"
    echo "supabase functions logs stripe-webhook --tail"
    
    echo ""
    echo "🧪 To test the webhook:"
    echo "stripe trigger checkout.session.completed"
    
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
