# Influencer Self-Service System

## 🎯 Overview

You now have TWO systems for influencer management:

### 1. **Manual System** (Original)
Admin creates codes → Assigns to influencers

### 2. **Self-Service System** (New)
Influencers register → Request codes → Admin approves

## 🚀 Self-Service Flow

### For Influencers:
1. Visit: `babystepsplanner.com/influencer-signup`
2. Fill out application form
3. Choose their own promo code
4. Submit and wait for approval

### For You (Admin):
1. Check pending applications daily
2. Create approved codes in Stripe
3. Activate the codes in database

## 📊 Admin SQL Queries

### View Pending Applications
```sql
-- See all pending influencer applications
SELECT 
  code,
  influencer_name,
  influencer_email,
  influencer_handle,
  tier,
  free_months,
  notes,
  created_at
FROM promo_codes
WHERE 
  active = false 
  AND stripe_promotion_code_id IS NULL
ORDER BY created_at DESC;
```

### View Active Codes Needing Stripe Setup
```sql
-- Codes that are active but missing Stripe integration
SELECT 
  code,
  influencer_name,
  influencer_email,
  created_at
FROM promo_codes
WHERE 
  active = true 
  AND stripe_promotion_code_id IS NULL;
```

### Approve an Application
After creating the code in Stripe:

```sql
-- Step 1: Update with Stripe ID and activate
UPDATE promo_codes
SET 
  stripe_promotion_code_id = 'promo_xxxxx', -- From Stripe
  active = true,
  influencer_user_id = NULL -- They'll claim when they sign up
WHERE code = 'REQUESTED_CODE';

-- Step 2: Make them an influencer when they log in
-- (This happens automatically when they use their code)
```

### Reject an Application
```sql
-- Simply delete the request
DELETE FROM promo_codes
WHERE code = 'UNWANTED_CODE' AND active = false;
```

### View Statistics
```sql
-- See self-registered vs manually created
SELECT 
  CASE 
    WHEN notes LIKE '%Self-registered%' THEN 'Self-Service'
    ELSE 'Manual'
  END as registration_type,
  COUNT(*) as count,
  COUNT(CASE WHEN active = true THEN 1 END) as active,
  COUNT(CASE WHEN active = false THEN 1 END) as pending
FROM promo_codes
GROUP BY registration_type;
```

## 🔄 Daily Workflow

### Morning Check (2 minutes)
```sql
-- Run this every morning
SELECT 
  code,
  influencer_name,
  influencer_email,
  influencer_handle,
  EXTRACT(hour FROM NOW() - created_at) as hours_waiting,
  notes
FROM promo_codes
WHERE active = false
ORDER BY created_at;
```

### Process Applications:
1. **Review** the application (check Instagram, follower count)
2. **Create in Stripe** if approved
3. **Update database** with Stripe ID
4. **Email influencer** (manual for now)

### Email Template for Approval:
```
Subject: Welcome to Baby Steps Partner Program! 🎉

Hi [Name],

Great news! Your influencer application has been approved.

Your promo code: [CODE]
Your share link: babystepsplanner.com/with/[CODE]

What's next:
1. Sign up at babystepsplanner.com using this email
2. You'll get lifetime premium access
3. Start sharing your link!

Commission structure:
- First month: £6.99 per customer
- 3-month bonus: £5
- 6-month bonus: £5

Questions? Just reply to this email.

Best,
[Your name]
```

## 🎨 Customization Options

### Change Tier Thresholds
In `InfluencerSignup.js`, find lines 74-82:

```javascript
// Current thresholds
if (followerCount >= 50000) {
  tier = 'major';
  freeMonths = 3;
} else if (followerCount >= 10000) {
  tier = 'mid';
  freeMonths = 2;
}
```

### Change Auto-Approve Rules
You could auto-approve certain applications:

```sql
-- Auto-approve verified accounts with 10k+ followers
UPDATE promo_codes
SET active = true
WHERE 
  active = false
  AND influencer_handle IN (
    -- Your pre-approved list
    '@trustedinfluencer1',
    '@trustedinfluencer2'
  );
```

## 🔒 Security Features

- Codes start as **inactive** until you approve
- Duplicate code names are prevented
- Email verification token created (for future use)
- All applications logged with timestamp
- Follower count and content type captured

## 📈 Growth Strategy

### Phase 1 (Now)
- Manual review all applications
- Quality over quantity
- Build relationships

### Phase 2 (20+ influencers)
- Auto-approve trusted accounts
- Batch process applications
- Weekly review cycles

### Phase 3 (50+ influencers)
- Fully automated with Stripe API
- Instant approval for verified accounts
- Dashboard for influencers to track stats

## 🧪 Testing

Test the self-service flow:
1. Visit: `http://localhost:3000/influencer-signup`
2. Fill out form with test data
3. Check database for new entry
4. Verify it's marked as inactive

## 🎯 Benefits of This Approach

✅ **Scalable** - Influencers do the data entry
✅ **Controlled** - You approve each code
✅ **Trackable** - See who applied and when
✅ **Fair** - Tier based on actual followers
✅ **Professional** - Proper application process

---

Remember: Start with the codes you already have (LAUNCH50, EMMA-2, etc.) for testing, then open up self-registration when ready!