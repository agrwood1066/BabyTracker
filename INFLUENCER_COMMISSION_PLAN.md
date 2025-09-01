# Influencer Partnership & Milestone-Based Commission Plan

## 🎯 Executive Summary

This document outlines a milestone-based commission structure for influencer partnerships that protects cash flow whilst incentivising long-term user retention. Commissions are only paid after users demonstrate value by remaining subscribed for specific periods.

## 💰 Commission Structure

### Milestone-Based Payment Tiers

#### Tier 1: Micro-Influencers (1K-10K followers)
- **Promo Code Format:** `FIRSTNAME-1` (1 month free trial)
- **Influencer Benefits:**
  - 6 months free premium account (immediate)
  - £5 cash after referred user completes 3 paid months
  - £5 bonus if user upgrades to annual plan
- **Maximum Commission per User:** £10
- **Break-even Point:** Month 4

#### Tier 2: Mid-Tier Influencers (10K-50K followers)
- **Promo Code Format:** `FIRSTNAME-2` (2 months free trial)
- **Influencer Benefits:**
  - 12 months free premium account (immediate)
  - £7.50 cash after referred user completes 3 paid months
  - £7.50 cash after referred user completes 6 paid months
  - £10 bonus if user upgrades to annual plan
- **Maximum Commission per User:** £25
- **Break-even Point:** Month 7

#### Tier 3: Major Influencers (50K+ followers)
- **Custom negotiation based on:**
  - Projected conversion rates
  - Content creation commitments
  - Exclusivity agreements
- **Suggested Structure:**
  - 2 months free trial for followers
  - Lifetime premium account for influencer
  - 20% revenue share for first 12 months (capped at £30/user)

## 📊 Financial Safety Analysis

### Tier 1 Economics (1 Month Free)
```
Month 1: £0 revenue (free trial)
Month 2: £4.99 revenue, £0 commission = £4.99 profit
Month 3: £4.99 revenue, £0 commission = £4.99 profit
Month 4: £4.99 revenue, £5 commission = -£0.01 loss
Month 5+: £4.99 revenue, £0 commission = £4.99 profit
Annual upgrade: £39.99 revenue, £5 bonus = £34.99 profit
```
**Result:** Profitable from Month 5 onwards, or immediately with annual upgrade

### Tier 2 Economics (2 Months Free)
```
Months 1-2: £0 revenue (free trial)
Month 3: £4.99 revenue, £0 commission = £4.99 profit
Month 4: £4.99 revenue, £0 commission = £4.99 profit
Month 5: £4.99 revenue, £7.50 commission = -£2.51 loss
Month 6: £4.99 revenue, £0 commission = £4.99 profit
Month 7: £4.99 revenue, £7.50 commission = -£2.51 loss
Month 8+: £4.99 revenue, £0 commission = £4.99 profit
Annual upgrade: £39.99 revenue, £10 bonus = £29.99 profit
```
**Result:** Profitable from Month 8 onwards, strong profit with annual upgrade

## 🗄️ Database Schema

### Core Tables

```sql
-- Promo codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    influencer_name TEXT NOT NULL,
    influencer_email TEXT,
    influencer_handle TEXT, -- Instagram/TikTok handle
    tier TEXT CHECK (tier IN ('micro', 'mid', 'major')),
    free_months INTEGER NOT NULL DEFAULT 1,
    usage_limit INTEGER DEFAULT NULL, -- NULL = unlimited
    times_used INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Track who used which code
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID REFERENCES promo_codes(id),
    user_id UUID REFERENCES profiles(id),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    first_payment_at TIMESTAMP WITH TIME ZONE,
    churned_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Commission tracking
CREATE TABLE influencer_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_code TEXT,
    user_id UUID REFERENCES profiles(id),
    milestone TEXT CHECK (milestone IN ('3_months', '6_months', 'annual_upgrade')),
    amount DECIMAL(10,2),
    paid BOOLEAN DEFAULT false,
    eligible_date DATE,
    paid_date DATE,
    payment_method TEXT, -- 'paypal', 'bank_transfer', 'account_credit'
    payment_reference TEXT,
    UNIQUE(user_id, milestone)
);

-- Influencer accounts for free premium
CREATE TABLE influencer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_code TEXT REFERENCES promo_codes(code),
    user_id UUID REFERENCES profiles(id),
    premium_months_granted INTEGER,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table
ALTER TABLE profiles ADD COLUMN promo_code_used TEXT;
ALTER TABLE profiles ADD COLUMN referred_by_influencer TEXT;
ALTER TABLE profiles ADD COLUMN trial_months_granted INTEGER DEFAULT 0;
```

## 🔧 Implementation Functions

### Create Influencer Partnership

```sql
CREATE OR REPLACE FUNCTION create_influencer_partnership(
    p_name TEXT,
    p_handle TEXT,
    p_email TEXT,
    p_tier TEXT,
    p_custom_code TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_code TEXT;
    v_months_free INTEGER;
    v_influencer_premium_months INTEGER;
    v_code_id UUID;
BEGIN
    -- Determine benefits based on tier
    CASE p_tier
        WHEN 'micro' THEN
            v_months_free := 1;
            v_influencer_premium_months := 6;
        WHEN 'mid' THEN
            v_months_free := 2;
            v_influencer_premium_months := 12;
        WHEN 'major' THEN
            v_months_free := 2;
            v_influencer_premium_months := NULL; -- Lifetime
    END CASE;
    
    -- Generate code
    IF p_custom_code IS NOT NULL THEN
        v_code := UPPER(p_custom_code);
    ELSE
        v_code := UPPER(SPLIT_PART(p_name, ' ', 1) || '-' || v_months_free);
    END IF;
    
    -- Create promo code
    INSERT INTO promo_codes (
        code, influencer_name, influencer_email, 
        influencer_handle, tier, free_months
    )
    VALUES (
        v_code, p_name, p_email, 
        p_handle, p_tier, v_months_free
    )
    RETURNING id INTO v_code_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'code', v_code,
        'tier', p_tier,
        'share_link', 'https://babytracker.app/signup?code=' || v_code,
        'tracking_link', 'https://babytracker.app/influencer/' || v_code,
        'months_free', v_months_free,
        'influencer_benefits', 
            CASE 
                WHEN v_influencer_premium_months IS NULL THEN 'Lifetime premium'
                ELSE v_influencer_premium_months || ' months premium'
            END
    );
END;
$$ LANGUAGE plpgsql;
```

### Check and Create Commission Eligibility

```sql
CREATE OR REPLACE FUNCTION check_commission_milestones()
RETURNS void AS $$
DECLARE
    v_user RECORD;
    v_commission_amount DECIMAL(10,2);
    v_tier TEXT;
    v_months_paid INTEGER;
BEGIN
    FOR v_user IN 
        SELECT 
            p.id as user_id,
            p.promo_code_used,
            p.created_at,
            p.subscription_status,
            pc.tier,
            pcu.first_payment_at,
            -- Calculate actual paid months
            EXTRACT(MONTH FROM AGE(NOW(), pcu.first_payment_at))::INTEGER as months_since_first_payment
        FROM profiles p
        JOIN promo_code_usage pcu ON p.id = pcu.user_id
        JOIN promo_codes pc ON pcu.promo_code_id = pc.id
        WHERE p.subscription_status = 'active'
        AND pcu.first_payment_at IS NOT NULL
    LOOP
        v_tier := v_user.tier;
        v_months_paid := v_user.months_since_first_payment;
        
        -- Check 3-month milestone
        IF v_months_paid >= 3 THEN
            CASE v_tier
                WHEN 'micro' THEN v_commission_amount := 5.00;
                WHEN 'mid' THEN v_commission_amount := 7.50;
                WHEN 'major' THEN v_commission_amount := 10.00;
            END CASE;
            
            INSERT INTO influencer_commissions (
                influencer_code, user_id, milestone, amount, eligible_date
            )
            VALUES (
                v_user.promo_code_used, v_user.user_id, 
                '3_months', v_commission_amount, NOW()
            )
            ON CONFLICT (user_id, milestone) DO NOTHING;
        END IF;
        
        -- Check 6-month milestone (only for mid and major tiers)
        IF v_months_paid >= 6 AND v_tier IN ('mid', 'major') THEN
            CASE v_tier
                WHEN 'mid' THEN v_commission_amount := 7.50;
                WHEN 'major' THEN v_commission_amount := 15.00;
            END CASE;
            
            INSERT INTO influencer_commissions (
                influencer_code, user_id, milestone, amount, eligible_date
            )
            VALUES (
                v_user.promo_code_used, v_user.user_id, 
                '6_months', v_commission_amount, NOW()
            )
            ON CONFLICT (user_id, milestone) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily
SELECT cron.schedule('check-commission-milestones', '0 2 * * *', 'SELECT check_commission_milestones();');
```

### Apply Promo Code at Signup

```sql
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_user_id UUID,
    p_promo_code TEXT
)
RETURNS jsonb AS $$
DECLARE
    v_code RECORD;
    v_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get code details
    SELECT * INTO v_code
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_promo_code)
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (usage_limit IS NULL OR times_used < usage_limit);
    
    IF v_code IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code');
    END IF;
    
    -- Check if already used a code
    IF EXISTS (SELECT 1 FROM promo_code_usage WHERE user_id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already used a promo code');
    END IF;
    
    -- Calculate trial expiry
    v_expiry := NOW() + (v_code.free_months || ' months')::interval;
    
    -- Start transaction
    BEGIN
        -- Update user subscription
        UPDATE profiles SET
            subscription_status = 'trial',
            subscription_expires_at = v_expiry,
            promo_code_used = v_code.code,
            referred_by_influencer = v_code.influencer_name,
            trial_months_granted = v_code.free_months,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Record usage
        INSERT INTO promo_code_usage (promo_code_id, user_id)
        VALUES (v_code.id, p_user_id);
        
        -- Increment counter
        UPDATE promo_codes 
        SET times_used = times_used + 1
        WHERE id = v_code.id;
        
        RETURN jsonb_build_object(
            'success', true,
            'months_free', v_code.free_months,
            'expires_at', v_expiry,
            'influencer', v_code.influencer_name,
            'message', 'Welcome! You have ' || v_code.free_months || 
                      ' month(s) free thanks to ' || v_code.influencer_name
        );
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object('success', false, 'error', 'Failed to apply code');
    END;
END;
$$ LANGUAGE plpgsql;
```

## 📈 Analytics & Reporting

### Influencer Performance Dashboard

```sql
CREATE VIEW influencer_performance_dashboard AS
SELECT 
    pc.code,
    pc.influencer_name,
    pc.influencer_handle,
    pc.tier,
    pc.times_used as total_signups,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'active' THEN pcu.user_id 
    END) as active_users,
    COUNT(DISTINCT CASE 
        WHEN pcu.first_payment_at IS NOT NULL THEN pcu.user_id 
    END) as converted_users,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'cancelled' THEN pcu.user_id 
    END) as churned_users,
    ROUND(AVG(CASE 
        WHEN pcu.first_payment_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - pcu.first_payment_at))/2592000 
    END), 1) as avg_customer_months,
    COALESCE(SUM(ic.amount) FILTER (WHERE ic.paid = false), 0) as pending_commission,
    COALESCE(SUM(ic.amount) FILTER (WHERE ic.paid = true), 0) as paid_commission,
    ROUND(COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'active' THEN pcu.user_id 
    END)::numeric / NULLIF(pc.times_used, 0) * 100, 2) as conversion_rate
FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON pcu.user_id = p.id
LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code
GROUP BY pc.id, pc.code, pc.influencer_name, pc.influencer_handle, pc.tier, pc.times_used
ORDER BY pc.times_used DESC;
```

### ROI Calculator

```sql
CREATE OR REPLACE FUNCTION calculate_influencer_roi(
    p_code TEXT,
    p_months_ahead INTEGER DEFAULT 12
)
RETURNS TABLE (
    influencer_name TEXT,
    tier TEXT,
    total_signups INTEGER,
    converted_to_paid INTEGER,
    avg_customer_ltv DECIMAL(10,2),
    total_revenue_generated DECIMAL(10,2),
    total_commission_owed DECIMAL(10,2),
    net_profit DECIMAL(10,2),
    roi_percentage DECIMAL(5,2),
    cost_per_acquisition DECIMAL(10,2),
    projected_12_month_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH user_values AS (
        SELECT 
            pcu.user_id,
            pc.influencer_name,
            pc.tier,
            pcu.first_payment_at,
            p.subscription_status,
            -- Calculate actual revenue per user
            CASE 
                WHEN p.subscription_plan = 'annual' THEN 39.99
                WHEN pcu.first_payment_at IS NOT NULL THEN 
                    EXTRACT(MONTH FROM AGE(NOW(), pcu.first_payment_at)) * 4.99
                ELSE 0
            END as user_revenue,
            -- Calculate commission owed
            COALESCE(SUM(ic.amount), 0) as commission_owed
        FROM promo_codes pc
        JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
        LEFT JOIN profiles p ON pcu.user_id = p.id
        LEFT JOIN influencer_commissions ic ON ic.user_id = pcu.user_id
        WHERE pc.code = p_code
        GROUP BY pcu.user_id, pc.influencer_name, pc.tier, pcu.first_payment_at, 
                 p.subscription_status, p.subscription_plan
    )
    SELECT 
        influencer_name,
        tier,
        COUNT(*)::INTEGER as total_signups,
        COUNT(CASE WHEN first_payment_at IS NOT NULL THEN 1 END)::INTEGER as converted_to_paid,
        AVG(user_revenue)::DECIMAL(10,2) as avg_customer_ltv,
        SUM(user_revenue)::DECIMAL(10,2) as total_revenue_generated,
        SUM(commission_owed)::DECIMAL(10,2) as total_commission_owed,
        (SUM(user_revenue) - SUM(commission_owed))::DECIMAL(10,2) as net_profit,
        CASE 
            WHEN SUM(commission_owed) > 0 THEN 
                ROUND(((SUM(user_revenue) - SUM(commission_owed)) / SUM(commission_owed) * 100), 2)
            ELSE 999.99
        END as roi_percentage,
        CASE 
            WHEN COUNT(CASE WHEN first_payment_at IS NOT NULL THEN 1 END) > 0 THEN
                ROUND(SUM(commission_owed) / COUNT(CASE WHEN first_payment_at IS NOT NULL THEN 1 END), 2)
            ELSE 0
        END as cost_per_acquisition,
        -- Project future value based on retention rate
        ROUND(SUM(user_revenue) * (1 + (p_months_ahead / 12.0) * 0.7), 2) as projected_12_month_value
    FROM user_values
    GROUP BY influencer_name, tier;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Implementation Checklist

### Week 1: Database & Backend
- [ ] Create all database tables
- [ ] Implement SQL functions
- [ ] Set up commission checking cron job
- [ ] Test promo code application flow
- [ ] Create admin interface for code management

### Week 2: Frontend Integration
- [ ] Add promo code field to signup form
- [ ] Create influencer stats page
- [ ] Implement commission tracking dashboard
- [ ] Add promo code validation on signup
- [ ] Test end-to-end flow

### Week 3: Operations
- [ ] Create influencer onboarding email templates
- [ ] Set up payment processes (PayPal/bank transfer)
- [ ] Document influencer guidelines
- [ ] Create marketing materials for influencers
- [ ] Launch with 3-5 test influencers

## 📋 Influencer Onboarding Template

```
Subject: Welcome to Baby Steps Partner Programme! 🎉

Hi [Name],

Your influencer code is ready: [CODE]

Share link: https://babytracker.app/signup?code=[CODE]
Stats dashboard: https://babytracker.app/influencer/[CODE]

Your Benefits:
✅ [X] months FREE premium access (activated on first login)
✅ £[X] for each user who stays 3+ months
✅ Real-time performance dashboard
✅ Marketing materials (attached)

Quick Start:
1. Sign up using your code to activate your premium account
2. Explore all features to create authentic content
3. Share your honest experience with your audience

Commission Schedule:
- Users who stay 3 months: £[X] payment
- Users who stay 6 months: Additional £[X]
- Annual upgrades: £[X] bonus

Payments processed monthly via your preferred method.

Questions? Reply to this email or WhatsApp: [number]

Let's help parents plan better together!

Best,
[Your name]
```

## 🎯 Success Metrics

### Key Performance Indicators
- **Target Conversion Rate:** 15-25% trial to paid
- **Target Retention:** 70% at 3 months, 50% at 6 months
- **Target CAC:** Under £10 per paying customer
- **Target ROI:** 200%+ within 12 months

### Monthly Review Checklist
- [ ] Review conversion rates by influencer
- [ ] Process pending commissions
- [ ] Identify top performers for bonuses
- [ ] Remove underperforming codes
- [ ] Adjust tier benefits based on data

## 💡 Advanced Optimisations (Future)

1. **Dynamic Commission Rates:** Adjust based on influencer performance
2. **Seasonal Campaigns:** Higher rates during peak pregnancy seasons
3. **Content Bonuses:** Extra payments for video reviews, blog posts
4. **Referral Chains:** Commission on users that referred users bring in
5. **VIP Tier:** Equity or revenue share for 100K+ follower influencers

---

*Last Updated: [Date]*
*Version: 1.0*
*Author: Baby Steps Planner Team*