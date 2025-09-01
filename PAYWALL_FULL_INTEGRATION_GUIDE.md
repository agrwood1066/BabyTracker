# 🚨 PAYWALL INTEGRATION IMPLEMENTATION GUIDE
## Implementation Status & Instructions

## ✅ What's Already Complete:
1. **useSubscription Hook** - Fully implemented ✅
2. **PaywallModal Component** - Fully implemented ✅
3. **Dashboard** - Already integrated ✅
4. **Wishlist** - Already integrated ✅

## 📝 Current Implementation Tasks:

### 1️⃣ ShoppingList.js Integration

**Add these imports at the top:**
```javascript
import { Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
```

**After existing state declarations (around line 58), add:**
```javascript
// Subscription integration
const { checkFeatureAccess, isPremium, vaultData } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);
const [paywallTrigger, setPaywallTrigger] = useState('limit');
```

**Replace the existing `addItem` function (around line 238) with:**
```javascript
async function addItem() {
  if (!newItem.item_name) return;

  // Check if user can add more items
  const access = await checkFeatureAccess('shopping_items', items.length);
  
  if (!access.canAdd && !isPremium()) {
    setPaywallTrigger('limit');
    setShowPaywall(true);
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .single();

    const itemData = {
      ...newItem,
      price: parseFloat(newItem.price) || null,
      price_currency: newItem.price_currency || 'GBP',
      links: JSON.stringify(newItem.links.filter(link => link.url)),
      family_id: profile.family_id,
      added_by: user.id
    };

    if (!itemData.budget_category_id) {
      delete itemData.budget_category_id;
    }

    const { error } = await supabase
      .from('baby_items')
      .insert(itemData);

    if (error) throw error;

    // Reset form and fetch updated items
    setNewItem({
      item_name: '',
      quantity: 1,
      notes: '',
      priority: 'medium',
      budget_category_id: '',
      price: '',
      price_currency: 'GBP',
      price_source: '',
      starred: false,
      needed_by: '',
      links: [{ url: '', price: '', currency: 'GBP', source: '' }]
    });
    setShowAddItem(false);
    fetchItems();
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Error adding item');
  }
}
```

**Find where the "Add Item" button is rendered (search for "Add Item" button) and replace with:**
```javascript
{/* Conditional Add Button */}
{!isPremium() && items.length >= 10 ? (
  <button 
    className="add-item-btn limited"
    onClick={() => {
      setPaywallTrigger('limit');
      setShowPaywall(true);
    }}
  >
    <Lock size={20} />
    <span>Upgrade to Add More</span>
  </button>
) : (
  <button 
    className="add-item-btn"
    onClick={() => setShowAddItem(true)}
  >
    <Plus size={20} />
    <span>Add Item</span>
  </button>
)}
```

**After the grouped items display (search for "shopping-groups"), add vault banner:**
```javascript
{/* Vault Banner for items beyond limit */}
{!isPremium() && items.length > 10 && (
  <div className="vault-banner">
    <div className="vault-content">
      <Lock size={20} />
      <span>{items.length - 10} items saved in your vault</span>
      <button 
        onClick={() => {
          setPaywallTrigger('limit');
          setShowPaywall(true);
        }}
        className="unlock-button"
      >
        Unlock All Items
      </button>
    </div>
    
    {/* Preview of vault items (read-only) */}
    <div className="vault-preview">
      {items.slice(10, 13).map((item) => (
        <div key={item.id} className="vault-item-preview">
          <span className="item-name">{item.item_name}</span>
          <Lock size={12} />
        </div>
      ))}
      {items.length > 13 && (
        <span className="more-items">
          +{items.length - 13} more...
        </span>
      )}
    </div>
  </div>
)}
```

**Before the closing `</div>` of the component, add:**
```javascript
{/* Paywall Modal */}
<PaywallModal
  show={showPaywall}
  trigger={paywallTrigger}
  onClose={() => setShowPaywall(false)}
  customMessage={`You've reached the free limit of 10 shopping items. Upgrade to add unlimited items!`}
/>
```

### 2️⃣ BudgetPlanner.js Integration

**Add imports:**
```javascript
import { Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
```

**Add subscription state after existing state:**
```javascript
const { checkFeatureAccess, isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);
const [paywallTrigger, setPaywallTrigger] = useState('limit');
```

**In `handleAddCategory` function, add check:**
```javascript
async function handleAddCategory() {
  // Check feature access
  const access = await checkFeatureAccess('budget_categories', categories.length);
  if (!access.canAdd && !isPremium()) {
    setPaywallTrigger('limit');
    setShowPaywall(true);
    return;
  }
  
  // Rest of existing code...
}
```

**Replace the "Add Budget Category" button:**
```javascript
{!isPremium() && categories.length >= 3 ? (
  <button 
    onClick={() => setShowPaywall(true)} 
    className="add-category-btn limited"
  >
    <Lock size={20} />
    Upgrade for More Categories
  </button>
) : (
  <button 
    onClick={() => setShowAddCategory(true)}
    className="add-category-btn"
  >
    <Plus size={20} />
    Add Budget Category
  </button>
)}
```

**Add vault display for categories beyond 3:**
```javascript
{!isPremium() && categories.length > 3 && (
  <div className="vault-banner">
    <div className="vault-content">
      <Lock size={20} />
      <span>{categories.length - 3} categories in vault</span>
      <button 
        onClick={() => setShowPaywall(true)}
        className="unlock-button"
      >
        Unlock All Categories
      </button>
    </div>
    {categories.slice(3).map(category => (
      <div className="category-locked" key={category.id}>
        <Lock size={16} /> {category.name} (Premium)
      </div>
    ))}
  </div>
)}
```

**Add PaywallModal before closing tag:**
```javascript
<PaywallModal
  show={showPaywall}
  trigger={paywallTrigger}
  onClose={() => setShowPaywall(false)}
  customMessage="You've reached the free limit of 3 budget categories"
/>
```

### 3️⃣ BabyNames.js Integration

**Add imports:**
```javascript
import { Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
```

**Add subscription state:**
```javascript
const { checkFeatureAccess, isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);
```

**In `handleAddName` function:**
```javascript
async function handleAddName(e) {
  e.preventDefault();
  
  // Check feature access
  const access = await checkFeatureAccess('baby_names', names.length);
  if (!access.canAdd && !isPremium()) {
    setShowPaywall(true);
    return;
  }
  
  // Rest of existing code...
}
```

**Show limit warning after filter section:**
```javascript
{!isPremium() && names.length >= 5 && (
  <div className="limit-warning">
    <p>Free accounts limited to 5 names</p>
    <button onClick={() => setShowPaywall(true)}>
      Unlock Unlimited Names
    </button>
  </div>
)}
```

**Disable voting on names beyond limit (in voting buttons):**
```javascript
const canVote = isPremium() || index < 5;

<button 
  onClick={() => handleVote(name.id, rating)}
  disabled={!canVote}
  className={!canVote ? 'disabled' : ''}
>
  {/* star icon */}
</button>
```

**Replace "Add Name" button:**
```javascript
{!isPremium() && names.length >= 5 ? (
  <button 
    onClick={() => setShowPaywall(true)}
    className="add-name-btn limited"
  >
    <Lock size={20} />
    Upgrade to Add More Names
  </button>
) : (
  <button 
    onClick={() => setShowAddName(true)}
    className="add-name-btn"
  >
    <Plus size={20} />
    Add Name
  </button>
)}
```

**Add PaywallModal:**
```javascript
<PaywallModal
  show={showPaywall}
  trigger="limit"
  onClose={() => setShowPaywall(false)}
  customMessage="You've reached the free limit of 5 baby names"
/>
```

### 4️⃣ HospitalBag.js Integration

**Add imports:**
```javascript
import { Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
```

**Add subscription check:**
```javascript
const { isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);
```

**Wrap entire component logic in premium check:**
```javascript
// Free users see template only
if (!isPremium()) {
  return (
    <div className="hospital-bag">
      <h1>
        <Briefcase size={28} />
        Hospital Bag Checklist
      </h1>
      
      <div className="premium-notice">
        <Lock size={48} />
        <h3>Premium Feature</h3>
        <p>Customise your hospital bag checklist with Premium</p>
        <button 
          onClick={() => setShowPaywall(true)}
          className="unlock-button"
        >
          Unlock Customisation
        </button>
      </div>
      
      {/* Show read-only template items */}
      <div className="template-items">
        <h3>Template Checklist:</h3>
        {/* Show some default items as examples */}
        <div className="template-category">
          <h4>For Mum</h4>
          <ul>
            <li>✓ Hospital notes</li>
            <li>✓ Birth plan</li>
            <li>✓ Comfortable clothes</li>
            <li>✓ Toiletries</li>
          </ul>
        </div>
        <div className="template-category">
          <h4>For Baby</h4>
          <ul>
            <li>✓ Sleepsuits (3-4)</li>
            <li>✓ Vests</li>
            <li>✓ Nappies</li>
            <li>✓ Blanket</li>
          </ul>
        </div>
        <div className="template-category">
          <h4>For Partner</h4>
          <ul>
            <li>✓ Change of clothes</li>
            <li>✓ Snacks</li>
            <li>✓ Camera</li>
            <li>✓ Phone charger</li>
          </ul>
        </div>
      </div>
      
      <PaywallModal
        show={showPaywall}
        trigger="hospital_bag"
        onClose={() => setShowPaywall(false)}
        customMessage="Create and customise your perfect hospital bag checklist with Premium"
      />
    </div>
  );
}

// Premium users get full functionality
// ... rest of existing hospital bag code
```

### 5️⃣ Profile.js Integration

**Add imports:**
```javascript
import { Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
```

**Add subscription check:**
```javascript
const { isPremium } = useSubscription();
const [showPaywall, setShowPaywall] = useState(false);
```

**In family sharing section, replace invite button:**
```javascript
{isPremium() ? (
  <button 
    onClick={handleInviteFamily}
    className="invite-family-btn"
  >
    <Users size={20} />
    Invite Family Member
  </button>
) : (
  <button 
    onClick={() => setShowPaywall(true)}
    className="invite-family-btn locked"
  >
    <Lock size={20} />
    Family Sharing (Premium)
  </button>
)}
```

**Add PaywallModal:**
```javascript
<PaywallModal
  show={showPaywall}
  trigger="family"
  onClose={() => setShowPaywall(false)}
  customMessage="Share lists and collaborate with your partner and family members"
/>
```

## 🎨 CSS Updates Needed

Add to each component's CSS file:

```css
/* Paywall Styles */
.limited, .locked {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 1px dashed #d1d5db !important;
}

.vault-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px dashed #9ca3af;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
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

.premium-notice {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}
```

## 📝 Testing Checklist

After implementing, test these scenarios:

### As Free User:
- [ ] Can only add 10 shopping items
- [ ] Can only create 3 budget categories  
- [ ] Can only add 5 baby names
- [ ] Cannot access wishlist (shows upgrade)
- [ ] Cannot customize hospital bag
- [ ] Cannot invite family members
- [ ] Sees vault banners when over limits

### As Premium User:
- [ ] Unlimited items in all lists
- [ ] Full wishlist access
- [ ] Can customize hospital bag
- [ ] Can invite family members
- [ ] No limit warnings shown
- [ ] Premium badge shows on dashboard

## 🚀 Implementation Order

1. ShoppingList.js - Most complex, start here
2. BudgetPlanner.js - Similar pattern
3. BabyNames.js - Simpler implementation
4. HospitalBag.js - Template vs full access
5. Profile.js - Just family sharing lock

## ⚠️ Important Notes

- Always check `isPremium()` before showing features
- Use `checkFeatureAccess()` for countable limits
- Show clear upgrade messaging
- Preserve all user data in vault (never delete!)
- Test thoroughly in both free and premium states

## Need Help?

If you encounter issues:
1. Check console for errors
2. Verify useSubscription hook is imported
3. Ensure PaywallModal is imported
4. Check that CSS classes are added
5. Verify subscription status in database