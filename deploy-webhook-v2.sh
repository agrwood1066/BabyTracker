#!/bin/bash

# Deploy Fixed Stripe Webhook Script - Version 2
# This script deploys the webhook without std library dependency

echo "========================================="
echo "Deploying Fixed Stripe Webhook (Native Deno)"
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
echo "🗑️ Removing old webhook deployment..."
supabase functions delete stripe-webhook --confirm

echo ""
echo "⏳ Waiting for cleanup..."
sleep 3

echo ""
echo "🔄 Deploying new webhook (native Deno version)..."
supabase functions deploy stripe-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Webhook deployed successfully!"
    
    echo ""
    echo "📝 Please verify environment variables in Supabase Dashboard:"
    echo "  → Settings → Edge Functions → stripe-webhook"
    echo ""
    echo "Required variables:"
    echo "  • STRIPE_SECRET_KEY"
    echo "  • STRIPE_WEBHOOK_SECRET" 
    echo "  • SUPABASE_URL"
    echo "  • SUPABASE_SERVICE_ROLE_KEY"
    
    echo ""
    echo "🔍 To monitor logs in real-time:"
    echo "supabase functions logs stripe-webhook --tail"
    
    echo ""
    echo "🧪 Test commands:"
    echo "# Test customer creation:"
    echo "stripe trigger customer.created"
    echo ""
    echo "# Test checkout completion:"
    echo "stripe trigger checkout.session.completed"
    echo ""
    echo "# Test subscription creation:"
    echo "stripe trigger customer.subscription.created"
    
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "Key changes in this version:"
echo "• Removed std library dependency"
echo "• Using native Deno.serve"
echo "• Keeping constructEventAsync as required"
echo "========================================="
