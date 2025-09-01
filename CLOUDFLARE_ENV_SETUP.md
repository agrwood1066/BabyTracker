# Cloudflare Pages Environment Variables Setup

## 🚨 Critical for Stripe Payment Links

Your Stripe payment links won't work in production without setting up environment variables in Cloudflare Pages!

## 📋 Required Environment Variables

Add these to your Cloudflare Pages project:

### Supabase Configuration
```
REACT_APP_SUPABASE_URL=https://lzppcmkjdgunhldgcgka.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cHBjbWtqZGd1bmhsZGdjZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODE1MTYsImV4cCI6MjA2NDM1NzUxNn0.UGY6bnBjd2-74t1djGFnMDk-JwQJZDCVk1FYADxRbgQ
```

### Stripe Configuration (CRITICAL!)
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51S0eL5FHwv9HjdNkBVILB6Bx0ZAyd8pcJVITYWRF5pd21BP3iN5uEsLiOw6fgp6PsHKWiuXG7GcwEEZw9AyY8Wv200puUiSwa5
REACT_APP_STRIPE_LAUNCH_MONTHLY_URL=https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01
REACT_APP_STRIPE_ANNUAL_URL=https://buy.stripe.com/5kQ6oH7Yi8D2gJveMNeME00
REACT_APP_STRIPE_SUCCESS_URL=https://www.babystepsplanner.com/subscription/activate
REACT_APP_STRIPE_CANCEL_URL=https://www.babystepsplanner.com/subscribe
```

### Optional Services
```
REACT_APP_LINKPREVIEW_API_KEY=5164d6582826670da6a97298ebed12bb
```

## 🔧 How to Add to Cloudflare Pages

### Method 1: Via Cloudflare Dashboard (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com

2. **Navigate to Pages**
   - Click on "Pages" in the left sidebar

3. **Select Your Project**
   - Click on your "BabyTracker" or "Baby Steps" project

4. **Go to Settings**
   - Click on "Settings" tab
   - Scroll down to "Environment variables"

5. **Add Production Variables**
   - Click "Add variable"
   - For each variable:
     - Enter the Variable name (e.g., `REACT_APP_STRIPE_LAUNCH_MONTHLY_URL`)
     - Enter the Value (e.g., `https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01`)
     - Click "Save"

6. **Add Preview Variables (Optional)**
   - Switch to "Preview" tab
   - Add the same variables for preview deployments

### Method 2: Via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Add Variables via Command**
   ```bash
   # For each variable
   wrangler pages secret put REACT_APP_STRIPE_LAUNCH_MONTHLY_URL --project-name=baby-tracker
   # Enter the value when prompted
   ```

## 🔄 Trigger Rebuild

After adding environment variables:

1. **Trigger a new deployment**
   - Push a commit to your repository, OR
   - Click "Retry deployment" in Cloudflare Pages

2. **Verify the deployment**
   - Wait for build to complete
   - Test the payment flow on your live site

## ✅ Testing

After deployment, test that payment links work:

1. Go to your live site
2. Navigate to Shopping List
3. Try to add more than 10 items
4. Click "Upgrade to Add More"
5. Click "Start 14-Day Free Trial"
6. **Should redirect to Stripe checkout** (not show an error)

## 🐛 Troubleshooting

### If you still get "Stripe payment links are not configured" error:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for console errors
   - Check if URLs are logged as `undefined`

2. **Verify Build Output**
   - In Cloudflare Pages, check the build logs
   - Ensure no build errors

3. **Clear Cache**
   - Cloudflare: Purge cache
   - Browser: Hard refresh (Ctrl+Shift+R)

4. **Check Variable Names**
   - Ensure exactly `REACT_APP_STRIPE_LAUNCH_MONTHLY_URL`
   - No typos, no extra spaces

## 🔒 Security Notes

- Never commit `.env` file to Git
- Use Cloudflare's secure environment variable storage
- Keep Stripe Secret Key (`sk_live_...`) server-side only
- The publishable key (`pk_live_...`) is safe for client-side

## 📝 Fallback URLs

The code now includes fallback URLs in case environment variables fail to load:
- Monthly: `https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01`
- Annual: `https://buy.stripe.com/5kQ6oH7Yi8D2gJveMNeME00`

But it's better to properly configure environment variables!

---

Last Updated: September 2025
