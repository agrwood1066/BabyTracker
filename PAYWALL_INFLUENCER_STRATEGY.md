# Baby Steps Paywall & Influencer Partnership Strategy

## 🎯 Executive Summary

This document outlines a comprehensive paywall and influencer partnership strategy for Baby Steps that protects cash flow, maximises conversion, and ensures sustainable growth. The strategy includes a 14-day free trial, data vault approach, streamlined influencer onboarding with manual approval, and premium-only family sharing.

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

## 💰 Streamlined Influencer Partnership System

### **🔄 New Automated Workflow (2025 Update)**

Our influencer system now features **automated signup detection with manual approval control**:

#### **Step 1: Influencer Application**
- Influencer applies through signup form with `is_influencer = true` flag
- **Automatic email notification** sent to hello@babystepsplanner.com
- **Backup contact methods:** 
  - Instagram DM: @babystepsplanner
  - Email: hello@babystepsplanner.com

#### **Step 2: Manual Review & Approval**
- Review influencer's profile and social media presence
- Determine appropriate tier based on followers and engagement
- **If approved:** Create Stripe promo code manually
- **If declined:** Politely decline via email/DM

#### **Step 3: Streamlined Upgrade Process**
- Run saved Supabase query with influencer details:
```sql
-- Link Stripe promo code and upgrade to influencer premium
UPDATE promo_codes 
SET stripe_promotion_code_id = 'YOUR_STRIPE_PROMO_ID_HERE' 
WHERE code = 'INFLUENCER_CODE' AND influencer_email = 'influencer@email.com';

UPDATE profiles 
SET 
    subscription_status = 'influencer_premium',
    subscription_plan = 'premium_monthly',
    locked_in_price = 0,
    stripe_promotion_code_id = 'YOUR_STRIPE_PROMO_ID_HERE'
WHERE email = 'influencer@email.com';
```

#### **Step 4: Instant Premium Access**
- Influencer immediately gets **"Influencer Premium ✨"** badge
- Full access to all premium features (unlimited usage)
- Can start promoting their promo code right away

### **📋 Notification Email Template**

When new influencer applies, automatic email includes:

```
📧 New Influencer Signup: [Name]

👤 Name: [Full Name]
📧 Email: [Email]
📱 Instagram: @[Handle]
👥 Followers: [Count]
📝 Bio: [Bio text]
🎯 Target Audience: [Audience]

Next Steps:
1. Review their application ✅
2. Create Stripe promo code in dashboard 💳
3. Run saved query in Supabase 🔧
4. Influencer gets instant premium access 🚀

💬 Manual Contact Options:
• Instagram DM: @babystepsplanner
• Email: hello@babystepsplanner.com
```

### **🎖️ Commission Structure (Revenue-Based)**

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

## 🗄️ Enhanced Database Schema

### **New Influencer Premium Status**

```sql
-- Updated subscription status constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('trial', 'free', 'active', 'expired', 'lifetime_admin', 'influencer_premium'));

-- Promo codes table (already exists)
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    influencer_name TEXT NOT NULL,
    influencer_email TEXT,
    stripe_promotion_code_id TEXT UNIQUE, -- Links to Stripe
    -- ... other fields
);

-- Notification queue for automated emails
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    data jsonb,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Automated Functions**

```sql
-- Function to link Stripe promo code and upgrade influencer
CREATE OR REPLACE FUNCTION link_stripe_promo_and_upgrade_influencer(
    p_promo_code TEXT,
    p_influencer_email TEXT,
    p_stripe_promotion_code_id TEXT
)
RETURNS jsonb AS $$
-- Links Stripe promo code and upgrades user to influencer_premium status
-- Returns success/error status with details
$$;

-- Trigger for automatic email notifications
CREATE TRIGGER trigger_influencer_notification
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION queue_influencer_notification();
```

## 📱 Frontend Integration

### **Updated useSubscription Hook**

```javascript
// Includes influencer_premium in premium status check
const isPremium = () => {
  return ['trial', 'active', 'lifetime_admin', 'influencer_premium']
    .includes(subscription?.subscription_status);
};

// New subscription info display
const getSubscriptionInfo = () => {
  // ... other cases
  case 'influencer_premium':
    return { 
      status: 'Influencer Premium', 
      badge: '✨',
      color: 'purple',
      details: 'Complimentary influencer access'
    };
};
```

### **Profile Page Integration**

- **Purple badge:** "Influencer Premium ✨" displays in profile
- **All premium features unlocked:** Unlimited access to all features
- **No billing information:** Free access for approved influencers
- **Special messaging:** Clear indication of influencer status

## 🎯 Success Metrics & KPIs

### **Influencer Program Targets**
- **Application → Approval Rate:** 60-70% (maintain quality)
- **Approval → Active Promotion:** 80%+ (engaged influencers)
- **Influencer → User Conversion:** 15-25% trial to paid
- **Average Commission per User:** £15-34 per converting follower
- **Manual Processing Time:** <24 hours from application to approval

### **Paywall Performance Targets**
- **Trial → Paid Conversion:** 25-35% (industry avg: 15-20%)
- **Monthly Churn:** <5% (industry avg: 5-7%)
- **Feature Limit → Upgrade:** 20%+ conversion
- **Data Vault Retrieval:** 15%+ of downgraded users return for vault data

## 📋 Implementation Checklist

### **✅ Completed (January 2025)**
- [x] Database schema updated with `influencer_premium` status
- [x] Frontend components updated to support new status
- [x] Automated email notification system
- [x] Manual approval workflow with saved Supabase queries
- [x] Profile page showing purple "Influencer Premium ✨" badge
- [x] Data vault system preserving user data on downgrade

### **🔄 Operational Workflow**
1. **Daily Check:** Review notification_queue for new influencer applications
2. **Manual Review:** Assess each influencer's profile and social presence
3. **Stripe Setup:** Create promo codes for approved influencers
4. **Database Update:** Run saved query to upgrade influencer account
5. **Follow-up:** Confirm influencer has access and provide marketing materials

## 💡 Advanced Optimisations (Future)

### **Automated Elements to Consider**
- **Auto-approval criteria:** Verified accounts with 5K+ followers
- **Performance tracking:** Real-time dashboard for commission calculations
- **Bulk processing:** Handle multiple approvals efficiently
- **Integration APIs:** Direct Stripe to Supabase webhook connections

### **Enhanced Features**
- **Influencer portal:** Self-service dashboard for performance tracking
- **Automated payments:** Monthly commission payouts via Stripe Connect
- **Tiered benefits:** Different perks based on performance
- **Advanced analytics:** ROI and LTV tracking per influencer

## 🔒 Data Security & Compliance

- **GDPR Compliant:** All influencer data handled according to UK/EU regulations
- **Data Retention:** Influencer profiles maintained for commission tracking
- **Privacy Protection:** User data anonymised in influencer dashboards
- **Secure Processing:** All payments handled through Stripe's secure platform

## 🎉 Why This System Works

### **For Baby Steps:**
✅ **Full Control:** Manual approval prevents brand misalignment  
✅ **Cost Efficient:** Only pay commissions on actual revenue  
✅ **Scalable:** Automated detection with manageable manual approval  
✅ **Quality Focused:** Attract serious influencers with proper compensation  

### **For Influencers:**
✅ **Instant Access:** Immediate premium features upon approval  
✅ **Fair Compensation:** Industry-leading commission rates  
✅ **Simple Process:** Clear application and approval workflow  
✅ **Reliable Support:** Multiple contact methods for quick assistance  

### **For Users:**
✅ **Generous Trials:** Extended free periods through influencer codes  
✅ **Data Safety:** Never lose data with vault system  
✅ **Fair Pricing:** Simple, transparent £6.99/month structure  
✅ **Quality Assurance:** Vetted influencer partnerships ensure relevant content  

---

## 📝 Document Version History

### **Version 3.0 - Streamlined Manual Approval System (January 2025)**
**Major Changes:**
- **Automated Detection + Manual Approval:** Best of both worlds approach
- **Streamlined Workflow:** From application to premium access in <24 hours
- **Enhanced Database Integration:** New `influencer_premium` subscription status
- **Frontend Integration:** Purple badge and full premium access
- **Simplified Queries:** Saved Supabase queries for quick processing
- **Improved Notification System:** Automated emails with manual contact backup
- **Quality Control:** Manual review ensures brand alignment

### **Key Improvements:**
- **Reduced Processing Time:** From days to hours
- **Better Control:** Manual approval prevents unsuitable partnerships
- **Enhanced UX:** Influencers get immediate access upon approval
- **Operational Efficiency:** Automated detection with manageable approval queue
- **Brand Protection:** Quality control through manual review process

---

*Last Updated: January 2025*  
*Version: 3.0 - Streamlined Manual Approval System*  
*Status: ✅ Implemented and Operational*