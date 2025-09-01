#!/bin/bash

# Test Stripe Webhook - Quick Verification Script

echo "🚀 Stripe Webhook Test Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Redeploy the function
echo "Step 1: Redeploying webhook function..."
supabase functions deploy stripe-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Function deployed successfully${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo "Step 2: Testing webhook with Stripe CLI..."
echo "Make sure you have Stripe CLI installed and logged in"
echo ""

# Get the project URL
echo "Enter your Supabase project ref (the part before .supabase.co):"
read PROJECT_REF

WEBHOOK_URL="https://${PROJECT_REF}.supabase.co/functions/v1/stripe-webhook"

echo ""
echo "Using webhook URL: ${WEBHOOK_URL}"
echo ""

# Test the webhook
echo "Testing customer.subscription.updated event..."
echo "Running: stripe trigger customer.subscription.updated --skip customer.created"
echo ""

stripe trigger customer.subscription.updated --skip customer.created

echo ""
echo -e "${YELLOW}Check the results:${NC}"
echo "1. Go to Stripe Dashboard → Developers → Webhooks → Recent deliveries"
echo "2. Look for the latest event to ${WEBHOOK_URL}"
echo "3. It should show '200 OK' status"
echo ""
echo "To check Supabase logs, run:"
echo -e "${GREEN}supabase functions logs stripe-webhook --tail${NC}"
echo ""
echo "Common issues:"
echo "- 401 error: Run 'supabase functions deploy stripe-webhook --no-verify-jwt'"
echo "- 400 error: Check STRIPE_WEBHOOK_SECRET environment variable"
echo "- No logs: Check SUPABASE_SERVICE_ROLE_KEY environment variable"
