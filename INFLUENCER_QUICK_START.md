# 🚀 INFLUENCER SYSTEM - QUICK START CHECKLIST

## ✅ IMMEDIATE ACTIONS (Do Today)

### 1. Database Setup (5 minutes)
```sql
-- Copy everything from influencer-system-setup.sql
-- Paste into Supabase SQL Editor
-- Click "Run"
```

### 2. Update Payment Link (2 minutes)
- [ ] Open `src/components/PromoLanding.js`
- [ ] Find line 97: `YOUR_PAYMENT_LINK_ID`
- [ ] Replace with your actual Stripe Payment Link ID
- [ ] Example: `14k5mN9KI5Wg8ow3cc`

### 3. Deploy Changes (5 minutes)
```bash
git add .
git commit -m "Add influencer tracking system"
git push origin main
```

### 4. Test the Flow (10 minutes)
- Visit: `babystepsplanner.com/with/TEST123`
- Should see the promo landing page
- Enter email → Should redirect to Stripe

## 📝 PER INFLUENCER PROCESS (Manual but Simple)

### For Each Influencer (10 minutes per influencer):

#### A. In Stripe Dashboard:
1. Products → Coupons → New
   - Amount: 100% off
   - Duration: 1 month
2. Products → Promotion codes → New
   - Code: `SARAH2` (their code)
   - Link to coupon
   - Copy the `promo_xxxxx` ID

#### B. In Supabase SQL Editor:
```sql
-- Make them an influencer (gives free premium)
SELECT make_influencer('their-email@example.com', 'SARAH2', 'Their Name');

-- Link to Stripe
UPDATE promo_codes 
SET stripe_promotion_code_id = 'promo_xxxxx'
WHERE code = 'SARAH2';
```

#### C. Send to Influencer:
```
Your link: babystepsplanner.com/with/SARAH2
Your dashboard: Login at babystepsplanner.com → Profile
```

## 🎯 How It Works

```
1. Influencer shares: babystepsplanner.com/with/SARAH2
   ↓
2. User enters email on landing page
   ↓
3. Redirects to Stripe with promo code applied
   ↓
4. User completes payment (£0 for first month)
   ↓
5. System tracks signup → Creates £6.99 commission
   ↓
6. After 3 months → £5 bonus created
   ↓
7. After 6 months → £5 bonus created
```

## 💰 Paying Influencers (Monthly)

### Check What You Owe:
```sql
SELECT * FROM influencer_commission_summary;
```

### After Bank Transfer:
```sql
SELECT mark_commissions_paid('SARAH2', NULL, 'BANK-REF-123');
```

## ⚠️ IMPORTANT NOTES

1. **Promo codes MUST be created in Stripe first** - The system doesn't create them automatically
2. **Test with code `TEST1` first** before real influencers
3. **Commissions are tracked automatically** but payments are manual (by design)
4. **Influencers get lifetime premium** when you run `make_influencer()`

## 🔧 If Something Goes Wrong

### Promo code not working?
- Check it exists in Stripe
- Check `stripe_promotion_code_id` is set in database

### Influencer can't see dashboard?
- Check `is_influencer = true` in their profile
- Make sure they're logged in

### Commissions not tracking?
- Check webhook is deployed (optional but recommended)
- Verify user has `stripe_customer_id` set

## 📊 What Influencers See

When logged in, they see:
- Total signups using their code
- Active vs cancelled users  
- Pending commission amount
- Historical performance

They DON'T see:
- User emails or personal data
- Other influencers' data
- Your total revenue

## 🎉 That's It!

The system is designed to be:
- **Simple** - Manual process keeps you in control
- **Transparent** - Influencers see their real stats
- **Scalable** - Can handle 50+ influencers
- **Cash-flow friendly** - 100% first month, bonuses later

Questions? The full guide is in `INFLUENCER_IMPLEMENTATION_GUIDE.md`