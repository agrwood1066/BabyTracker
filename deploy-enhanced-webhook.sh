#!/bin/bash

# Step-by-step deployment script for enhanced webhook

echo "🔧 Baby Steps Webhook Enhancement Deployment"
echo "============================================"

# Step 1: Backup current webhook
echo ""
echo "Step 1: Backing up current webhook..."
cp supabase/functions/stripe-webhook/index.ts supabase/functions/stripe-webhook/index-backup-$(date +%Y%m%d-%H%M%S).ts
echo "✅ Backup created"

# Step 2: Copy enhanced version
echo ""
echo "Step 2: Applying enhanced webhook..."
cp supabase/functions/stripe-webhook/index-enhanced.ts supabase/functions/stripe-webhook/index.ts
echo "✅ Enhanced webhook copied"

# Step 3: Deploy to Supabase
echo ""
echo "Step 3: Deploying to Supabase..."
supabase functions deploy stripe-webhook --no-verify-jwt
echo "✅ Webhook deployed"

# Step 4: Monitor logs
echo ""
echo "Step 4: Opening webhook logs (press Ctrl+C to exit)..."
echo "Keep this running while you test the webhook"
supabase functions logs stripe-webhook --tail
