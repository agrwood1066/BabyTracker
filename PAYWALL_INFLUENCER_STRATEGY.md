# Baby Steps Paywall & Influencer Partnership Strategy

## 🎯 Executive Summary

This document outlines a comprehensive paywall and influencer partnership strategy for Baby Steps that protects cash flow, maximises conversion, and ensures sustainable growth. The strategy includes a 14-day free trial, data vault approach, milestone-based commissions, and premium-only family sharing.

## 💎 Pricing Structure

### **Simple Monthly Pricing**
- **Monthly Plan:** £6.99/month for all users
- **Annual Plan:** £69.99/year (save £14 - 2 months free)
- **Messaging:** "Simple, transparent pricing - £6.99/month or save with annual"

### **Trial & Conversion Flow**
```
Day 1-14: Full Premium Trial
├── All features unlocked
├── Daily reminder: "X days left in trial"
├── No payment required
└── Build habits with full features

Day 15: Convert or Downgrade
├── Existing data: PRESERVED (Data Vault)
├── Restricted to free tier limits
├── Clear upgrade prompts at friction points
└── "Your data is safe - upgrade anytime"
```

## 🔒 The Data Vault Approach

### **Core Principle: Never Delete User Data**

When users downgrade from trial/premium to free, their data enters "vault mode":

```javascript
const dataVaultRules = {
  shopping_items: {
    limit: 10,
    behaviour: "VIEW all, EDIT first 10, cannot ADD if over 10",
    message: "📦 X items in vault - Upgrade to access all"
  },
  budget_categories: {
    limit: 3,
    behaviour: "VIEW all, EDIT first 3, cannot ADD if over 3",
    message: "💰 X categories saved - Upgrade to manage all"
  },
  baby_names: {
    limit: 5,
    behaviour: "VIEW all, VOTE on first 5, cannot ADD if over 5",
    message: "👶 X names saved - Upgrade to access all"
  },
  family_sharing: {
    limit: 0,
    behaviour: "Connections preserved but read-only",
    message: "👨‍👩‍👧 Family sharing is Premium only"
  }
};
```

## 📊 Free vs Premium Feature Matrix

### **Free Tier (After 14-Day Trial)**
```
Shopping List:      10 items (view all, edit first 10)
Budget Categories:  3 categories (view all, edit first 3)
Baby Names:         5 names (view all, vote on first 5)
Hospital Bag:       View templates only (no customisation)
Wishlist:          ❌ Premium only
Family Sharing:    ❌ Premium only
Partner Features:  ❌ Premium only
Data Export:       Basic text only
Support:           Standard (48-hour response)
```

### **Premium Tier**
```
Shopping List:      ♾️ Unlimited items
Budget Categories:  ♾️ Unlimited + spending analytics
Baby Names:         ♾️ Unlimited + popularity trends
Hospital Bag:       ✅ Full customisation
Wishlist:          ✅ Create & share wishlists
Family Sharing:    ✅ Unlimited family members
Partner Features:  ✅ Voting, collaboration
Data Export:       ✅ PDF & Excel export
Weekly Insights:   ✅ Personalised tips
Priority Support:  ✅ 24-hour response
```

## 🚀 Smart Upgrade Triggers

### **Strategic Friction Points**
```javascript
const upgradeTriggers = {
  limitReached: {
    title: "You've Reached Your Free Limit",
    message: "Free accounts can have up to {limit} {type}",
    cta: "Start 14-Day Free Trial"
  },
  familyShare: {
    title: "Family Sharing is Premium Only",
    message: "Share lists and collaborate with your partner",
    cta: "Unlock Family Features"
  },
  export: {
    title: "Export to PDF Requires Premium",
    message: "Download beautiful PDFs of your lists and budget",
    cta: "Unlock Export Features"
  },
  milestone: {
    title: "You're {weeks} Weeks Pregnant!",
    message: "Unlock trimester-specific features and insights",
    cta: "Get Premium Features"
  }
};
```

## 💰 Competitive Influencer Commission Structure (Revenue-Based)

### **📊 Market Analysis Foundation**

**Competitive Intelligence:**
- **Major Pregnancy Apps:** Ovia (£1 per download), BabyCenter (discontinued program)
- **SaaS Industry Standard:** 20-40% of first month + recurring bonuses
- **Our Estimated LTV:** £28-35 per user (4-5 month average retention at £6.99/month)
- **Opportunity:** Fill massive gap in pregnancy app influencer programs

### **🎯 Revenue-Based Commission Structure**

### **Tier 1: Micro-Influencers (1K-10K followers)**
- **Promo Code:** `FIRSTNAME-1` (1 month free trial for followers)
- **Commission Structure:**
  - **First Month:** 60% of first month's revenue (£4.19)
  - **Month 3 Bonus:** £3 per retained user
  - **Annual Upgrade Bonus:** £8 per user
- **Influencer Benefits:** 6 months free premium (immediate)
- **Total Potential:** £15.19 per user
- **Payment Timeline:** 30 days after first payment, then at milestones

### **Tier 2: Mid-Tier Influencers (10K-50K followers)**
- **Promo Code:** `FIRSTNAME-2` (2 months free trial for followers)
- **Commission Structure:**
  - **First Month:** 70% of first month's revenue (£4.89)
  - **Month 3 Bonus:** £5 per retained user
  - **Month 6 Bonus:** £3 per retained user
  - **Annual Upgrade Bonus:** £12 per user
- **Influencer Benefits:** 12 months free premium (immediate)
- **Total Potential:** £24.89 per user
- **Payment Timeline:** 30 days after first payment, then at milestones

### **Tier 3: Major Influencers (50K+ followers)**
- **Promo Code:** `FIRSTNAME-3` (2 months free trial for followers)
- **Commission Structure:**
  - **First Month:** 80% of first month's revenue (£5.59)
  - **Month 3 Bonus:** £8 per retained user
  - **Month 6 Bonus:** £5 per retained user
  - **Annual Upgrade Bonus:** £15 per user
- **Influencer Benefits:** Lifetime premium + exclusive features preview
- **Total Potential:** £33.59 per user
- **Custom Negotiations:** Available for 100K+ followers or exclusive deals

### **💡 Why This Structure Works**

**Financial Rationale:**
- **Eliminates Fraud Risk:** Revenue-based payments prevent fake signups
- **ROI Positive from Month 1:** We retain £2.80, £2.10, £1.40 respectively to cover costs
- **Within LTV Bounds:** Max £33.59 commission vs £28-35 customer lifetime value
- **Competitive Advantage:** 3-5x higher than existing pregnancy app programs

**Market Positioning:**
- **"Best in Category":** Easily marketed as highest-paying pregnancy app program
- **Quality Focus:** Attracts serious influencers who expect fair compensation
- **Industry Standard:** Matches successful SaaS subscription app rates

**Risk Mitigation:**
- **No Upfront Risk:** Only pay when revenue is generated
- **Milestone Gates:** Larger bonuses only paid when users stick around
- **Performance Tracking:** Clear attribution and ROI measurement

## 🔍 Influencer Transparency & Tracking

### **Complete Tracking Transparency**

Influencers can track their performance in real-time with full transparency to build trust and encourage authentic promotion.

### **What Influencers Can See**

```javascript
const influencerDashboard = {
  // Real-time stats
  aggregateStats: {
    totalSignups: 47,
    activeTrials: 23,
    paidConversions: 18,
    conversionRate: "38.3%",
    totalRevenueGenerated: "£125.82",
    pendingCommission: "£45.00",
    paidCommission: "£15.00"
  },
  
  // Anonymised user journey (privacy-protected)
  userJourney: [
    { date: "2025-01-15", status: "Trial Started", userId: "User #001" },
    { date: "2025-01-29", status: "Converted to Paid", userId: "User #001", plan: "Monthly" },
    { date: "2025-02-01", status: "Cancelled", userId: "User #002" }
  ],
  
  // Performance trends
  chartData: {
    weekly: [5, 8, 12, 7, 9], // signups per week
    conversion: [20, 25, 38, 35, 40] // conversion % per week
  }
};
```

### **Database Views for Influencer Tracking**

```sql
-- Secure view for influencer stats (no personal data)
CREATE VIEW influencer_dashboard AS
SELECT 
    pc.code,
    pc.influencer_name,
    COUNT(DISTINCT pcu.user_id) as total_signups,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'trial' 
        AND p.trial_ends_at > NOW() 
        THEN pcu.user_id 
    END) as active_trials,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'active' 
        THEN pcu.user_id 
    END) as paid_conversions,
    ROUND(
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT pcu.user_id), 0) * 100, 1
    ) as conversion_rate,
    COALESCE(SUM(
        CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
    ), 0) as pending_commission,
    COALESCE(SUM(
        CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
    ), 0) as paid_commission,
    COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END) * 6.99 as monthly_revenue
FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON pcu.user_id = p.id
LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code
GROUP BY pc.code, pc.influencer_name;

-- Anonymised user journey for transparency
CREATE VIEW influencer_user_journey AS
SELECT 
    pc.code,
    'User #' || SUBSTRING(pcu.user_id::text, 1, 3) as anonymous_user_id,
    DATE(pcu.applied_at) as signup_date,
    CASE 
        WHEN p.subscription_status = 'trial' THEN 'In Trial'
        WHEN p.subscription_status = 'active' THEN 'Paid Customer'
        WHEN p.subscription_status = 'cancelled' THEN 'Cancelled'
        ELSE 'Free User'
    END as current_status,
    CASE 
        WHEN p.subscription_plan = 'premium_monthly' THEN 'Monthly'
        WHEN p.subscription_plan = 'premium_annual' THEN 'Annual'
        ELSE NULL
    END as plan_type,
    DATE(pcu.first_payment_at) as conversion_date,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM influencer_commissions ic 
            WHERE ic.user_id = pcu.user_id 
            AND ic.milestone = '3_months'
        ) THEN '3-month milestone reached'
        ELSE NULL
    END as commission_status
FROM promo_codes pc
JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON pcu.user_id = p.id
WHERE pcu.applied_at > NOW() - INTERVAL '90 days'
ORDER BY pcu.applied_at DESC;
```

### **Influencer Portal Implementation**

```javascript
// src/pages/InfluencerPortal.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';

const InfluencerPortal = () => {
  const { code } = useParams(); // URL: /influencer/SARAH-2
  const [stats, setStats] = useState(null);
  const [journey, setJourney] = useState([]);
  
  useEffect(() => {
    loadInfluencerData();
  }, [code]);

  const loadInfluencerData = async () => {
    // Load aggregate stats
    const { data: statsData } = await supabase
      .from('influencer_dashboard')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    // Load user journey (anonymised)
    const { data: journeyData } = await supabase
      .from('influencer_user_journey')
      .select('*')
      .eq('code', code.toUpperCase())
      .limit(20);

    setStats(statsData);
    setJourney(journeyData || []);
  };

  return (
    <div className="influencer-portal">
      {/* Real-time metrics display */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>{stats?.total_signups}</h3>
          <p>Total Signups</p>
        </div>
        <div className="metric-card">
          <h3>{stats?.paid_conversions}</h3>
          <p>Paid Customers</p>
          <small>{stats?.conversion_rate}% conversion</small>
        </div>
        <div className="metric-card">
          <h3>£{stats?.pending_commission}</h3>
          <p>Pending Commission</p>
        </div>
      </div>

      {/* Transparent user journey table */}
      <div className="user-journey">
        <h2>Recent Activity (Last 90 Days)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Anonymous ID</th>
              <th>Status</th>
              <th>Commission Status</th>
            </tr>
          </thead>
          <tbody>
            {journey.map((user, idx) => (
              <tr key={idx}>
                <td>{user.signup_date}</td>
                <td>{user.anonymous_user_id}</td>
                <td>{user.current_status}</td>
                <td>{user.commission_status || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="privacy-note">
          🔒 User IDs are anonymised to protect privacy while maintaining transparency
        </p>
      </div>
    </div>
  );
};
```

### **Trust-Building Features**

#### **What Makes Our Program Different:**

1. **Complete Tracking Transparency**
   - See EVERY user who uses your code (anonymised)
   - Track their journey: trial → paid → cancelled
   - No hidden users or metrics

2. **Real-Time Updates**
   - Dashboard updates instantly
   - Watch conversions happen live
   - No waiting for reports

3. **Honest Commission Tracking**
   - See exactly when you'll be paid
   - Track pending vs paid commissions
   - Clear milestone indicators

4. **Open Communication**
   - Monthly video calls to discuss performance
   - WhatsApp group for all partners
   - Direct access to founder

5. **Payment Transparency**
   - Screenshot proof of every payment
   - Choice of payment method
   - Payment schedule in dashboard

### **Weekly Influencer Email Updates**

```sql
-- Function to send weekly influencer updates
CREATE OR REPLACE FUNCTION send_influencer_weekly_update()
RETURNS void AS $$
DECLARE
    influencer RECORD;
    email_body TEXT;
BEGIN
    FOR influencer IN 
        SELECT DISTINCT 
            pc.influencer_email,
            pc.influencer_name,
            pc.code,
            COUNT(DISTINCT pcu.user_id) as week_signups,
            COUNT(DISTINCT CASE 
                WHEN p.subscription_status = 'active' 
                THEN pcu.user_id 
            END) as week_conversions
        FROM promo_codes pc
        JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
        LEFT JOIN profiles p ON pcu.user_id = p.id
        WHERE pcu.applied_at > NOW() - INTERVAL '7 days'
        AND pc.influencer_email IS NOT NULL
        GROUP BY pc.influencer_email, pc.influencer_name, pc.code
    LOOP
        email_body := format(
            'Hi %s,

Your Baby Steps stats for this week:
- New signups: %s
- New paid customers: %s
- View full dashboard: babysteps.app/influencer/%s

Every signup and conversion is tracked transparently.

Best,
Baby Steps Team',
            influencer.influencer_name,
            influencer.week_signups,
            influencer.week_conversions,
            influencer.code
        );
        
        INSERT INTO email_queue (to_email, subject, body)
        VALUES (
            influencer.influencer_email,
            'Your Weekly Baby Steps Performance Report',
            email_body
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule weekly emails
SELECT cron.schedule('weekly-influencer-updates', '0 9 * * 1', 'SELECT send_influencer_weekly_update();');
```

## 🗄️ Database Schema

### **Enhanced Subscription Tables**

```sql
-- Core subscription fields for profiles
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'free', 'active', 'expired', 'lifetime_admin'));
ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free'
  CHECK (subscription_plan IN ('free', 'premium_monthly', 'premium_annual'));
ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE 
  DEFAULT NOW() + INTERVAL '14 days';
ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN locked_in_price DECIMAL(10,2); -- For launch pricing
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;

-- Admin backdoor fields
ALTER TABLE profiles ADD COLUMN admin_granted_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN admin_notes TEXT;

-- Promo codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    influencer_name TEXT NOT NULL,
    influencer_email TEXT,
    influencer_handle TEXT,
    tier TEXT CHECK (tier IN ('micro', 'mid', 'major')),
    free_months INTEGER NOT NULL DEFAULT 1,
    usage_limit INTEGER DEFAULT NULL,
    times_used INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Track promo code usage
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
    milestone TEXT CHECK (milestone IN ('first_month', '3_months', '6_months', 'annual_upgrade')),
    commission_type TEXT CHECK (commission_type IN ('revenue_share', 'milestone_bonus', 'annual_bonus')),
    percentage_share DECIMAL(5,2), -- For revenue share (60%, 70%, 80%)
    amount DECIMAL(10,2),
    paid BOOLEAN DEFAULT false,
    eligible_date DATE,
    paid_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    UNIQUE(user_id, milestone)
);

-- Feature usage tracking (for conversion optimisation)
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    feature_name TEXT,
    hit_limit_count INTEGER DEFAULT 0,
    last_limit_hit TIMESTAMP WITH TIME ZONE,
    upgraded_after_limit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Core Implementation Functions

### **Data Vault Implementation**

```sql
-- Function to check feature access with vault logic
CREATE OR REPLACE FUNCTION check_feature_access(
    p_user_id UUID,
    p_feature TEXT,
    p_current_count INTEGER DEFAULT 0
)
RETURNS jsonb AS $$
DECLARE
    v_subscription RECORD;
    v_limit INTEGER;
    v_vault_count INTEGER;
BEGIN
    -- Get user subscription
    SELECT * INTO v_subscription
    FROM profiles
    WHERE id = p_user_id;
    
    -- Premium users have unlimited access
    IF v_subscription.subscription_status IN ('trial', 'active', 'lifetime_admin') THEN
        RETURN jsonb_build_object(
            'hasAccess', true,
            'limit', -1,
            'vaultCount', 0
        );
    END IF;
    
    -- Define free tier limits
    CASE p_feature
        WHEN 'shopping_items' THEN v_limit := 10;
        WHEN 'budget_categories' THEN v_limit := 3;
        WHEN 'baby_names' THEN v_limit := 5;
        WHEN 'family_sharing' THEN v_limit := 0;
        WHEN 'wishlist' THEN v_limit := 0;
        WHEN 'export_pdf' THEN v_limit := 0;
        ELSE v_limit := -1;
    END CASE;
    
    -- Calculate vault items (items beyond limit)
    v_vault_count := GREATEST(0, p_current_count - v_limit);
    
    -- Track when limits are hit (for analytics)
    IF p_current_count >= v_limit AND v_limit > 0 THEN
        INSERT INTO feature_usage (user_id, feature_name, hit_limit_count, last_limit_hit)
        VALUES (p_user_id, p_feature, 1, NOW())
        ON CONFLICT (user_id, feature_name) 
        DO UPDATE SET 
            hit_limit_count = feature_usage.hit_limit_count + 1,
            last_limit_hit = NOW();
    END IF;
    
    RETURN jsonb_build_object(
        'hasAccess', p_current_count < v_limit OR v_limit = -1,
        'canView', true,
        'canEdit', p_current_count <= v_limit,
        'canAdd', p_current_count < v_limit,
        'limit', v_limit,
        'current', p_current_count,
        'vaultCount', v_vault_count,
        'message', CASE 
            WHEN v_vault_count > 0 THEN 
                format('📦 %s items in vault - Upgrade to access all', v_vault_count)
            WHEN p_current_count = v_limit THEN
                'You''ve reached your free limit - Upgrade for unlimited access'
            ELSE NULL
        END
    );
END;
$$ LANGUAGE plpgsql;
```

### **Smart Trial Management**

```sql
-- Function to handle trial end gracefully
CREATE OR REPLACE FUNCTION handle_trial_end(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
    v_user RECORD;
    v_item_counts jsonb;
BEGIN
    -- Get user details
    SELECT * INTO v_user FROM profiles WHERE id = p_user_id;
    
    -- If not in trial, skip
    IF v_user.subscription_status != 'trial' THEN
        RETURN jsonb_build_object('success', false, 'message', 'User not in trial');
    END IF;
    
    -- If trial hasn't ended, skip
    IF v_user.trial_ends_at > NOW() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Trial still active');
    END IF;
    
    -- Count user's data
    SELECT jsonb_build_object(
        'shopping_items', (SELECT COUNT(*) FROM baby_items WHERE family_id = v_user.family_id),
        'budget_categories', (SELECT COUNT(*) FROM budget_categories WHERE family_id = v_user.family_id),
        'baby_names', (SELECT COUNT(*) FROM baby_names WHERE family_id = v_user.family_id)
    ) INTO v_item_counts;
    
    -- Downgrade to free
    UPDATE profiles 
    SET 
        subscription_status = 'free',
        subscription_plan = 'free',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return vault information
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Trial ended - data preserved in vault',
        'vaultSummary', jsonb_build_object(
            'shopping_vault', GREATEST(0, (v_item_counts->>'shopping_items')::int - 10),
            'budget_vault', GREATEST(0, (v_item_counts->>'budget_categories')::int - 3),
            'names_vault', GREATEST(0, (v_item_counts->>'baby_names')::int - 5)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule daily check for ended trials
SELECT cron.schedule('check-trial-ends', '0 0 * * *', $$
    SELECT handle_trial_end(id) FROM profiles 
    WHERE subscription_status = 'trial' 
    AND trial_ends_at < NOW()
$$);
```

### **Launch Pricing Lock-In**

```sql
-- Function to apply standard pricing
CREATE OR REPLACE FUNCTION apply_standard_pricing(
    p_user_id UUID,
    p_plan TEXT
)
RETURNS jsonb AS $
DECLARE
    v_price DECIMAL(10,2) := 6.99; -- Standard monthly price
BEGIN
    -- Set the standard price
    UPDATE profiles 
    SET 
        locked_in_price = v_price,
        subscription_plan = p_plan,
        subscription_status = 'active',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'price', v_price,
        'message', format('Subscription activated at £%.2f/month', v_price)
    );
END;
$ LANGUAGE plpgsql;
```

### **Admin Backdoor Function**

```sql
CREATE OR REPLACE FUNCTION grant_lifetime_premium(
    target_email TEXT,
    granter_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id FROM profiles WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Grant lifetime access
    UPDATE profiles SET
        subscription_status = 'lifetime_admin',
        subscription_plan = 'premium_monthly', -- For feature checks
        admin_granted_by = granter_id,
        admin_notes = notes,
        locked_in_price = 0, -- Free forever
        updated_at = NOW()
    WHERE id = target_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_email', target_email,
        'status', 'Lifetime premium granted'
    );
END;
$$;
```

## 📱 Frontend Implementation

### **useSubscription Hook with Data Vault**

```javascript
// src/hooks/useSubscription.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vaultData, setVaultData] = useState({});

  const checkFeatureAccess = async (feature, currentCount = 0) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasAccess: false };

    const { data, error } = await supabase
      .rpc('check_feature_access', {
        p_user_id: user.id,
        p_feature: feature,
        p_current_count: currentCount
      });

    if (data) {
      setVaultData(prev => ({ ...prev, [feature]: data }));
    }

    return data || { hasAccess: false };
  };

  const isPremium = () => {
    return ['trial', 'active', 'lifetime_admin'].includes(subscription?.subscription_status);
  };

  const getDaysLeftInTrial = () => {
    if (subscription?.subscription_status !== 'trial') return 0;
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const getUpgradeUrl = () => {
    const baseUrl = 'https://buy.stripe.com/';
    
    return {
      monthly: `${baseUrl}monthly_699`,
      annual: `${baseUrl}annual_6999`
    };
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setSubscription(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    isPremium,
    checkFeatureAccess,
    getDaysLeftInTrial,
    getUpgradeUrl,
    vaultData
  };
};
```

### **Data Vault UI Component**

```javascript
// src/components/DataVault.js
const DataVault = ({ items, limit, type, vaultCount }) => {
  const visibleItems = items.slice(0, limit);
  const vaultItems = items.slice(limit);
  
  return (
    <div className="data-vault-container">
      {/* Visible Items */}
      <div className="visible-items">
        {visibleItems.map((item, idx) => (
          <div key={item.id} className="item">
            {/* Item content */}
          </div>
        ))}
      </div>

      {/* Vault Banner */}
      {vaultCount > 0 && (
        <div className="vault-banner">
          <div className="vault-content">
            <Lock size={20} />
            <span>{vaultCount} {type} saved in your vault</span>
            <button onClick={showUpgradeModal}>
              Unlock All Items
            </button>
          </div>
          
          {/* Preview of vault items (read-only) */}
          <div className="vault-preview">
            {vaultItems.slice(0, 3).map((item) => (
              <div key={item.id} className="vault-item-preview">
                <span className="item-name">{item.name}</span>
                <Lock size={12} />
              </div>
            ))}
            {vaultCount > 3 && (
              <span className="more-items">
                +{vaultCount - 3} more...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### **Soft Paywall Modal**

```javascript
// src/components/PaywallModal.js
const PaywallModal = ({ show, trigger, onClose }) => {
  const { getDaysLeftInTrial, getUpgradeUrl } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  
  if (!show) return null;
  
  return (
    <div className="paywall-modal-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={e => e.stopPropagation()}>
        {/* Trial Banner if applicable */}
        {getDaysLeftInTrial() > 0 && (
          <div className="trial-banner">
            🎉 You have {getDaysLeftInTrial()} days left in your free trial
          </div>
        )}

        <h2>Unlock Premium Features</h2>
        
        {/* Trigger-specific message */}
        <div className="trigger-message">
          {trigger === 'limit' && (
            <p>You've reached your free plan limit. Upgrade for unlimited access!</p>
          )}
          {trigger === 'family' && (
            <p>Share with your partner and family members with Premium!</p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div 
            className={`pricing-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <h3>Monthly</h3>
            <div className="price">
              £6.99
              <span>/month</span>
            </div>
            <p className="simple-pricing">Simple, transparent pricing</p>
          </div>

          <div 
            className={`pricing-card ${selectedPlan === 'annual' ? 'selected' : ''} popular`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="badge">Most Popular</div>
            <h3>Annual</h3>
            <div className="price">
              £69.99
              <span>/year</span>
            </div>
            <p className="savings">Save £14 - 2 months free!</p>
          </div>
        </div>

        {/* Features List */}
        <div className="features-list">
          <h4>Everything in Premium:</h4>
          <ul>
            <li>✅ Unlimited shopping items, budget categories & baby names</li>
            <li>✅ Share with partner & family members</li>
            <li>✅ Create wishlists for gifts</li>
            <li>✅ Export to PDF & Excel</li>
            <li>✅ Weekly pregnancy insights</li>
            <li>✅ Priority support</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="modal-actions">
          <button 
            className="upgrade-btn primary"
            onClick={() => window.location.href = getUpgradeUrl()[selectedPlan]}
          >
            Start 14-Day Free Trial
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>

        {/* Trust Signals */}
        <div className="trust-signals">
          <p>🔒 Cancel anytime • 📧 No spam • 💳 Secure payment</p>
        </div>
      </div>
    </div>
  );
};
```

## 📈 Analytics & Conversion Tracking

### **Key Metrics to Track**

```sql
-- Create conversion funnel view
CREATE VIEW conversion_funnel AS
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as signups,
    COUNT(*) FILTER (WHERE trial_ends_at < NOW()) as trials_ended,
    COUNT(*) FILTER (WHERE subscription_status = 'active') as converted_to_paid,
    COUNT(*) FILTER (WHERE subscription_plan = 'premium_annual') as annual_subscribers,
    AVG(EXTRACT(DAY FROM (NOW() - created_at))) as avg_days_to_convert,
    COUNT(*) FILTER (WHERE locked_in_price = 6.99) as standard_price_users,
    ROUND(COUNT(*) FILTER (WHERE subscription_status = 'active')::numeric / 
          NULLIF(COUNT(*) FILTER (WHERE trial_ends_at < NOW()), 0) * 100, 2) as conversion_rate
FROM profiles
GROUP BY week
ORDER BY week DESC;

-- Feature limit tracking
CREATE VIEW feature_limit_impact AS
SELECT 
    feature_name,
    COUNT(DISTINCT user_id) as users_hit_limit,
    AVG(hit_limit_count) as avg_hits_before_upgrade,
    COUNT(*) FILTER (WHERE upgraded_after_limit) as upgraded_after,
    ROUND(COUNT(*) FILTER (WHERE upgraded_after_limit)::numeric / 
          COUNT(DISTINCT user_id) * 100, 2) as upgrade_rate
FROM feature_usage
GROUP BY feature_name
ORDER BY upgrade_rate DESC;
```

## 🚀 Implementation Timeline

### **Week 1: Core Paywall (Before Influencers)**
- [ ] Day 1-2: Database schema updates
- [ ] Day 3-4: Data vault implementation
- [ ] Day 5: Trial system (14 days)
- [ ] Day 6: Soft paywall UI
- [ ] Day 7: Testing & refinement

### **Week 2: Payment & Polish**
- [ ] Day 1-2: Stripe integration (£6.99/£7.99 pricing)
- [ ] Day 3: Upgrade/downgrade flows
- [ ] Day 4: Admin backdoor tools
- [ ] Day 5-7: Full testing cycle

### **Week 3: Launch & Influencers**
- [ ] Day 1: Enable for new users
- [ ] Day 2: Email existing users (30-day grace)
- [ ] Day 3-5: Create influencer materials
- [ ] Day 6-7: Approach first influencers

## 📋 Launch Communications

### **Email to Existing Users**

```
Subject: Important Update: Premium Features Coming to Baby Steps

Hi [Name],

We're evolving Baby Steps to ensure we can continue supporting parents like you!

What's Changing:
- New Premium plan with unlimited features
- Basic free plan will remain available
- Family sharing and exports becoming Premium features

For Our Early Supporters:
✨ 30-day grace period - full access continues
✨ Simple pricing: £6.99/month or save with annual
✨ All your data is safe and always accessible

Your Options:
1. Upgrade to Premium for £6.99/month (or save with annual)
2. Continue with Free plan (10 items/3 budgets/5 names)
3. Export your data anytime

Questions? Reply to this email.

Thank you for being part of our journey!

[Your name]
```

### **Influencer Onboarding Email**

```
Subject: Partner with Baby Steps - Industry-Leading Commission Rates 🎉

Hi [Name],

Your followers trust your pregnancy & parenting recommendations. We'd love to partner with the UK's most generous pregnancy app influencer program!

The Offer:
📱 Your followers get: 1-2 months FREE Premium access (worth £14-16)
💰 You earn: £15-34 per converting user (vs £1 from competitors)
🎁 Plus: 6-12 months free Premium for you
📊 Full transparency: Track every signup and payment in real-time

Our Revenue-Based Structure:
🥉 Tier 1 (1K-10K): 60% of first month + milestone bonuses = £15.19 per user
🥈 Tier 2 (10K-50K): 70% of first month + milestone bonuses = £24.89 per user  
🥇 Tier 3 (50K+): 80% of first month + milestone bonuses = £33.59 per user

Your unique code: [NAME-TIER]
Share link: babysteps.app/signup?code=[CODE]
Track performance: babysteps.app/influencer/[CODE]

What Makes Us Different:
✅ 3-5x higher commissions than any pregnancy app
✅ Revenue-based (no fake signup risk)
✅ Real-time transparent tracking
✅ Monthly strategy calls
✅ Matches top SaaS industry standards

Why Baby Steps?
- Complete pregnancy planner (shopping, budget, names, hospital bag)
- Partner collaboration features
- Beautiful PDF exports
- Growing fast: 1,000+ UK parents already using

Ready to earn industry-leading commissions? Reply for marketing materials and onboarding.

[Your name]
```

## 🎯 Success Metrics & KPIs

### **Target Metrics**
- **Trial → Paid Conversion:** 25-35% (industry avg: 15-20%)
- **Monthly Churn:** <5% (industry avg: 5-7%)
- **Feature Limit → Upgrade:** 20%+ conversion
- **Influencer Conversion:** 15-25% to paid
- **Average Commission per User:** £15-34 (vs £1 competitors)
- **ROI Break-even:** Month 3-4
- **Simple Pricing Adoption:** Target 70% monthly, 30% annual

### **Weekly Review Checklist**
- [ ] Trial conversion rate
- [ ] Feature limit hit frequency
- [ ] Vault retrieval rate (upgrades to access old data)
- [ ] Influencer performance by tier
- [ ] Commission payout accuracy
- [ ] Revenue share calculations
- [ ] Churn by acquisition source
- [ ] Support ticket themes
- [ ] Competitive commission benchmarking

## 💡 Advanced Optimisations (Post-Launch)

1. **Engagement-Based Trials:** Extend trial for highly active users
2. **Smart Limits:** Adjust limits based on user behaviour patterns
3. **Win-Back Campaigns:** 50% off for 2 months for churned users
4. **Referral Program:** Users get month free for successful referrals
5. **Pregnancy Stage Pricing:** Different prices for different trimesters

## 🔒 Data Security & Trust

- **Data Retention:** Minimum 12 months after account closure
- **Export Options:** Always available, even for free users (text format)
- **GDPR Compliant:** Clear data handling policies
- **Payment Security:** Stripe handles all payment data
- **No Hidden Fees:** Clear pricing, easy cancellation

---

## 📝 Document Version History

### **Version 2.3 - Simplified Single Pricing (January 2025)**
**Changes:**
- **Simplified Pricing Model:** Single £6.99/month price for all users
- **Removed Launch Pricing Complexity:** No time-limited pricing or lock-ins
- **Updated Commission Calculations:** Based solely on £6.99 revenue
- **Revised LTV Estimates:** £28-35 per user (4-5 month retention)
- **Database Function Updates:** Replaced launch pricing logic with standard pricing
- **Frontend Simplification:** Removed launch period conditionals from UI
- **Marketing Material Updates:** Focus on simple, transparent pricing

### **Version 2.2 - Updated Commission Structure (January 2025)**
**Changes:**
- **New Revenue-Based Commission Model:** 60-80% of first month revenue + milestone bonuses
- **Competitive Analysis Integration:** Based on market research of Ovia, BabyCenter, and SaaS industry
- **Increased Total Payouts:** £15-34 per user (vs previous £10-30 max)
- **Risk Elimination:** Revenue-based structure prevents fake signup fraud
- **Enhanced Database Schema:** Added commission types and percentage tracking
- **Updated Marketing Materials:** Reflect competitive positioning as "industry-leading"

### **Version 2.1 - Full Influencer Transparency (January 2025)**
- Added complete influencer portal with real-time tracking
- Database views for anonymised user journey transparency
- Weekly automated email updates for influencers
- Trust-building features and payment proof systems

### **Version 2.0 - Original Strategy (January 2025)**
- Initial paywall strategy with data vault approach
- Basic milestone-based commission structure
- Core database schema and implementation functions

---

*Last Updated: January 2025*
*Version: 2.3 - Simplified Single Pricing*
*Status: Ready for Implementation with Simple £6.99/month Pricing*