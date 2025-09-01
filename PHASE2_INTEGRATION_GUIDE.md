# 🎯 Phase 2 Component Integration Guide

## Overview
This guide shows how to integrate the paywall into all Baby Steps components with proper limits and premium features.

## ✅ Completed Components

### 1. **Dashboard.js** - DONE ✅
- Shows subscription status banner (trial countdown, premium badge)
- Displays feature limits for free users
- Locks Wishlist and Hospital Bag behind paywall
- Shows "At limit" warnings on cards
- Family sharing is premium-only

### 2. **Wishlist.js** - DONE ✅  
- Entire feature is premium-only
- Shows attractive lock screen for free users
- Automatic redirect to paywall modal

## 📋 Components Needing Integration

### 3. **ShoppingList.js**
**Free Limit:** 10 items

Add to your existing ShoppingList.js:

```javascript
// Import at top
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import { Lock } from 'lucide-react';

// Inside component, after existing state
const { checkFeatureAccess, isPremium, vaultData } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);

// In handleAddItem - add check before saving
const access = await checkFeatureAccess('shopping_items', items.length);
if (!access.canAdd && !isPremium()) {
  setShowPaywall(true);
  return;
}

// Replace add button with conditional version
{!isPremium() && items.length >= 10 ? (
  <button onClick={() => setShowPaywall(true)} className="add-btn limited">
    <Lock /> Upgrade to Add More
  </button>
) : (
  <button onClick={() => setShowAddItem(true)} className="add-btn">
    <Plus /> Add Item
  </button>
)}

// Add data vault display for items beyond limit
{!isPremium() && items.length > 10 && (
  <div className="vault-banner">
    <Lock /> {items.length - 10} items in vault
    <button onClick={() => setShowPaywall(true)}>Unlock All</button>
  </div>
)}

// Add modal at end
<PaywallModal
  show={showPaywall}
  trigger="limit"
  onClose={() => setShowPaywall(false)}
  customMessage="You've reached the free limit of 10 items"
/>
```

### 4. **BudgetPlanner.js**
**Free Limit:** 3 categories

```javascript
// Import at top
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';

// Inside component
const { checkFeatureAccess, isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);

// In handleAddCategory
const access = await checkFeatureAccess('budget_categories', categories.length);
if (!access.canAdd && !isPremium()) {
  setShowPaywall(true);
  return;
}

// Conditionally show add button
{!isPremium() && categories.length >= 3 ? (
  <button onClick={() => setShowPaywall(true)} className="limited">
    Upgrade for More Categories
  </button>
) : (
  <button onClick={() => setShowAddCategory(true)}>
    Add Category
  </button>
)}

// Show vault for categories beyond 3
{categories.slice(3).map(category => (
  <div className="category-locked" key={category.id}>
    <Lock /> {category.name} (Premium)
  </div>
))}
```

### 5. **BabyNames.js**
**Free Limit:** 5 names

```javascript
// Import at top
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';

// Inside component
const { checkFeatureAccess, isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);

// In handleAddName
const access = await checkFeatureAccess('baby_names', names.length);
if (!access.canAdd && !isPremium()) {
  setShowPaywall(true);
  return;
}

// Show limit warning
{!isPremium() && names.length >= 5 && (
  <div className="limit-warning">
    <p>Free accounts limited to 5 names</p>
    <button onClick={() => setShowPaywall(true)}>
      Unlock Unlimited Names
    </button>
  </div>
)}

// Disable voting on names beyond limit
const canVote = isPremium() || index < 5;
```

### 6. **HospitalBag.js**
**Premium Feature:** Customisation is premium-only

```javascript
// Import at top
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';

// Inside component
const { isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);

// Free users see template only
if (!isPremium()) {
  return (
    <div className="hospital-bag">
      <h1>Hospital Bag Checklist</h1>
      <div className="premium-notice">
        <Lock />
        <p>Premium members can customize this checklist</p>
        <button onClick={() => setShowPaywall(true)}>
          Unlock Customisation
        </button>
      </div>
      {/* Show read-only template items */}
      <div className="template-items">
        {defaultItems.map(item => (
          <div className="item-readonly" key={item.id}>
            <Check /> {item.name}
          </div>
        ))}
      </div>
      <PaywallModal
        show={showPaywall}
        trigger="hospital_bag"
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}

// Premium users get full functionality
// ... existing hospital bag code
```

### 7. **Profile.js** - Family Sharing
**Premium Feature:** Family invites are premium-only

```javascript
// In family invite section
{isPremium() ? (
  <button onClick={handleInviteFamily}>
    Invite Family Member
  </button>
) : (
  <button onClick={() => setShowPaywall(true)} className="locked">
    <Lock /> Family Sharing (Premium)
  </button>
)}
```

## 🎨 CSS Styles to Add

Add to each component's CSS file:

```css
/* Paywall Integration Styles */
.add-btn.limited,
.limited {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px dashed #d1d5db;
}

.vault-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px dashed #9ca3af;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vault-banner button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.limit-warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
}

.category-locked,
.item-readonly {
  opacity: 0.6;
  position: relative;
}

.premium-notice {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.premium-notice button {
  margin-top: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
```

## 🧪 Testing Checklist

### Free User Testing
- [ ] Can only add 10 shopping items
- [ ] Can only create 3 budget categories
- [ ] Can only add 5 baby names
- [ ] Cannot access Wishlist (shows upgrade screen)
- [ ] Cannot customise Hospital Bag (template only)
- [ ] Cannot invite family members
- [ ] Sees trial banner if in trial period
- [ ] Sees vault items beyond limits

### Premium User Testing
- [ ] Unlimited items in all lists
- [ ] Full access to Wishlist
- [ ] Can customise Hospital Bag
- [ ] Can invite family members
- [ ] No limit warnings shown
- [ ] Sees premium badge on dashboard

### VIP User Testing (lifetime_admin)
- [ ] Shows crown badge
- [ ] All premium features work
- [ ] No payment prompts

## 📊 Quick Reference

| Feature | Free Limit | Premium |
|---------|------------|---------|
| Shopping Items | 10 | Unlimited |
| Budget Categories | 3 | Unlimited |
| Baby Names | 5 | Unlimited |
| Wishlist | ❌ | ✅ Full Access |
| Hospital Bag | Template Only | ✅ Customisable |
| Family Sharing | ❌ | ✅ Unlimited |
| Export PDF/CSV | ❌ | ✅ Available |

## 🚀 Implementation Order

1. ✅ Dashboard - DONE
2. ✅ Wishlist - DONE  
3. ⏳ ShoppingList - Add vault UI
4. ⏳ BudgetPlanner - Add category limits
5. ⏳ BabyNames - Add name limits
6. ⏳ HospitalBag - Make customisation premium
7. ⏳ Profile - Lock family sharing

## 💡 Tips

- Always check `isPremium()` before showing premium features
- Use `checkFeatureAccess()` for items with limits
- Show clear messaging about what's locked and why
- Make upgrade path obvious with clear CTAs
- Preserve user data in "vault" - never delete!

## 🐛 Common Issues

**Issue:** Paywall not showing
**Fix:** Ensure PaywallModal is imported and show state is true

**Issue:** Items not saving after limit
**Fix:** Check feature access BEFORE database insert

**Issue:** Vault items editable
**Fix:** Only first N items should be editable for free users

**Issue:** Premium features accessible
**Fix:** Always check isPremium() in conditional rendering
