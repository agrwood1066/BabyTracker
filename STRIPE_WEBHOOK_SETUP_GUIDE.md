# 🔧 Complete Stripe Webhook Setup Guide

## Prerequisites Check

First, let's make sure you have everything needed:

### 1. Check if Supabase CLI is installed
Open Terminal and run:
```bash
supabase --version
```

If you get "command not found", install it:
```bash
npm install -g supabase
```

### 2. Check if you're logged into Supabase
```bash
supabase login
```
This will open a browser window. Log in with your Supabase account.

---

## Step-by-Step Setup

### Step 1: Initialize Supabase in Your Project

Open Terminal and navigate to your project:
```bash
cd /Users/alexanderwood/Desktop/BabyTracker
```

Initialize Supabase (if not done already):
```bash
supabase init
```

When prompted:
- Generate VS Code settings? **No**
- Generate IntelliJ settings? **No**

### Step 2: Link to Your Supabase Project

```bash
supabase link --project-ref lzppcmkjdgunhldgcgka
```

When prompted for database password, enter the password you set when creating your Supabase project.

### Step 3: Deploy the Webhook Function

Deploy the function we created:
```bash
supabase functions deploy stripe-webhook
```

You should see:
```
Deploying function stripe-webhook...
Function stripe-webhook deployed successfully!
```

### Step 4: Set Environment Variables

You need THREE keys from Stripe:

#### A. Get Your Stripe Secret Key:
1. Go to [Stripe API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy the "Secret key" (starts with `sk_test_`)

#### B. Create the Webhook and Get Signing Secret:
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter this URL: 
   ```
   https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. On the webhook details page, click "Reveal" under "Signing secret"
7. Copy the signing secret (starts with `whsec_`)

#### C. Set the Secrets in Supabase:
```bash
# Replace with your actual keys
supabase secrets set STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_SECRET_HERE"
```

You should see:
```
Secret STRIPE_SECRET_KEY set successfully
Secret STRIPE_WEBHOOK_SECRET set successfully
```

### Step 5: Verify the Function is Running

Check function status:
```bash
supabase functions list
```

You should see `stripe-webhook` in the list.

---

## Testing the Webhook

### Option 1: Test with Stripe CLI (Recommended for Local Testing)

Install Stripe CLI:
```bash
# On Mac
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to your local function:
```bash
stripe listen --forward-to https://lzppcmkjdgunhldgcgka.supabase.co/functions/v1/stripe-webhook
```

Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

### Option 2: Test with Real Payment

1. Go to your app
2. Click upgrade to premium
3. Complete payment with test card: `4242 4242 4242 4242`
4. Check if subscription activates

---

## Troubleshooting

### Error: "supabase: command not found"
```bash
# Install globally
npm install -g supabase

# Or use npx
npx supabase functions deploy stripe-webhook
```

### Error: "Project not linked"
```bash
# Link your project
supabase link --project-ref lzppcmkjdgunhldgcgka
```

### Error: "Not authenticated"
```bash
# Login first
supabase login
```

### Error: "Function already exists"
```bash
# Delete and redeploy
supabase functions delete stripe-webhook
supabase functions deploy stripe-webhook
```

### Error: "Invalid project ref"
Your project ref might be different. Find it:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"
5. Use that in the link command

### Check Function Logs

To see if your webhook is receiving events:
```bash
supabase functions logs stripe-webhook
```

Or check in Supabase Dashboard:
1. Go to your project
2. Click "Functions" in sidebar
3. Click on "stripe-webhook"
4. View logs

---

## Verify Everything Works

### 1. Check Webhook in Stripe
Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks) and you should see:
- Your endpoint listed
- Status should be "Enabled"
- Recent attempts (after testing)

### 2. Check Function in Supabase
Go to [Supabase Functions](https://supabase.com/dashboard/project/lzppcmkjdgunhldgcgka/functions) and you should see:
- `stripe-webhook` function listed
- Status should be "Active"
- Logs showing incoming requests

### 3. Test Database Updates
After a test payment, check your database:
```sql
-- Run in Supabase SQL Editor
SELECT id, email, subscription_status, stripe_subscription_id 
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

The `subscription_status` should change from `trial` to `active` after successful payment.

---

## Alternative: Manual Webhook (If Edge Functions Don't Work)

If you have issues with Edge Functions, you can use a simple webhook endpoint:

### Create a Vercel Function
Create `/api/stripe-webhook.js` in your project:

```javascript
// api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update user to premium
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'premium_monthly',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription
        })
        .eq('email', session.customer_email);
      
      break;
    // Handle other events...
  }

  res.json({ received: true });
}
```

Deploy to Vercel and use that URL for your Stripe webhook instead.

---

## Need More Help?

If you're still having issues:

1. **Share the exact error message** you're seeing
2. **Check Supabase Dashboard** → Functions → Logs for errors
3. **Check Stripe Dashboard** → Developers → Webhooks → Click your endpoint → View attempts

Common issues are usually:
- Wrong project ref
- Not logged into Supabase CLI
- Missing or incorrect secrets
- Webhook URL typo

Let me know the specific error and I can provide more targeted help!