// PAYWALL INTEGRATION INSTRUCTIONS
// =================================
// This document shows how to integrate the paywall into your existing components

// EXAMPLE 1: ShoppingList.js Integration
// --------------------------------------
// Add these imports at the top of ShoppingList.js:
/*
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
*/

// Add this inside your ShoppingList component:
/*
const ShoppingList = () => {
  // Existing state...
  
  // Add subscription hook
  const { checkFeatureAccess, isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('limit');
  
  // Check limits when adding items
  const handleAddItem = async () => {
    // Check if user can add more items
    const access = await checkFeatureAccess('shopping_items', items.length);
    
    if (!access.canAdd && !isPremium()) {
      setPaywallTrigger('limit');
      setShowPaywall(true);
      return;
    }
    
    // Continue with normal add logic...
  };
  
  // In your render:
  return (
    <>
      {// Your existing JSX}
      
      {// Add paywall modal at the end}
      <PaywallModal
        show={showPaywall}
        trigger={paywallTrigger}
        onClose={() => setShowPaywall(false)}
        customMessage={`You've reached the free limit of 10 items. Upgrade to add unlimited items!`}
      />
    </>
  );
};
*/

// EXAMPLE 2: BudgetPlanner.js Integration
// ----------------------------------------
/*
const BudgetPlanner = () => {
  const { checkFeatureAccess, isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const handleAddCategory = async () => {
    const access = await checkFeatureAccess('budget_categories', categories.length);
    
    if (!access.canAdd) {
      setShowPaywall(true);
      return;
    }
    
    // Normal add logic...
  };
};
*/

// EXAMPLE 3: Wishlist.js Integration (Premium-only feature)
// ---------------------------------------------------------
/*
const Wishlist = () => {
  const { hasFeature, isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Check on mount
  useEffect(() => {
    if (!hasFeature('wishlist')) {
      setShowPaywall(true);
    }
  }, []);
  
  if (!isPremium()) {
    return (
      <div className="premium-feature-block">
        <h2>Wishlist is a Premium Feature</h2>
        <p>Create beautiful wishlists with automatic product images</p>
        <button onClick={() => setShowPaywall(true)}>
          Unlock Premium Features
        </button>
        <PaywallModal
          show={showPaywall}
          trigger="wishlist"
          onClose={() => navigate('/')} // Redirect after closing
        />
      </div>
    );
  }
  
  // Normal wishlist component...
};
*/

// EXAMPLE 4: Dashboard Integration (Show subscription status)
// -----------------------------------------------------------
/*
const Dashboard = () => {
  const { getSubscriptionInfo, getDaysLeftInTrial } = useSubscription();
  const subInfo = getSubscriptionInfo();
  
  return (
    <div className="dashboard">
      {// Show trial banner if in trial}
      {subInfo.status.includes('Trial') && (
        <div className="trial-banner">
          <span>{subInfo.badge}</span>
          <span>Your free trial ends in {getDaysLeftInTrial()} days</span>
          <button onClick={() => setShowUpgrade(true)}>Upgrade Now</button>
        </div>
      )}
      
      {// Show subscription badge}
      <div className="subscription-badge" style={{color: subInfo.color}}>
        {subInfo.badge} {subInfo.status}
      </div>
    </div>
  );
};
*/

// EXAMPLE 5: Data Vault Display
// ------------------------------
/*
const ShoppingList = () => {
  const { checkFeatureAccess, vaultData } = useSubscription();
  
  // After checking access, display vault info
  const renderItems = () => {
    const access = vaultData.shopping_items;
    
    if (access?.vaultCount > 0) {
      return (
        <>
          {// Show accessible items (first 10)}
          {items.slice(0, 10).map(item => (
            <div key={item.id} className="item">
              {item.name}
            </div>
          ))}
          
          {// Show vault banner}
          <div className="vault-banner">
            <Lock />
            <span>{access.vaultCount} items saved in your vault</span>
            <button onClick={() => setShowPaywall(true)}>
              Unlock All Items
            </button>
          </div>
          
          {// Show preview of vault items (read-only)}
          {items.slice(10, 13).map(item => (
            <div key={item.id} className="item vault-item">
              <span>{item.name}</span>
              <Lock size={12} />
            </div>
          ))}
        </>
      );
    }
    
    return items.map(item => <div key={item.id}>{item.name}</div>);
  };
};
*/

// FEATURE LIMITS REFERENCE
// ========================
/*
FREE TIER LIMITS:
- shopping_items: 10 items
- budget_categories: 3 categories  
- baby_names: 5 names
- hospital_bag: 0 (Premium only)
- family_sharing: 0 (Premium only)
- wishlist: 0 (Premium only)
- export_pdf: false

PREMIUM (Trial/Active/Lifetime):
- All features unlimited
*/

// SUBSCRIPTION STATES
// ===================
/*
- 'trial' - User is in 14-day free trial
- 'free' - User's trial ended or they're on free tier
- 'active' - User has active subscription (monthly/annual)
- 'lifetime_admin' - User has lifetime access (your VIPs)
- 'expired' - Subscription expired (payment failed)
*/

// NEXT STEPS FOR IMPLEMENTATION
// ==============================
/*
1. Run the database migration:
   - Go to Supabase Dashboard > SQL Editor
   - Paste and run: subscription_paywall_schema.sql
   
2. Install Stripe package:
   npm install @stripe/stripe-js
   
3. Create Stripe Products:
   - Log into Stripe Dashboard
   - Create 3 products with Payment Links:
     * Launch Monthly (£6.99) with 14-day trial
     * Regular Monthly (£7.99) with 14-day trial  
     * Annual (£69.99) with 14-day trial
   - Add Payment Link URLs to .env file
   
4. Update components:
   - Add paywall checks to ShoppingList, BudgetPlanner, BabyNames
   - Block Wishlist and HospitalBag for free users
   - Add subscription status to Dashboard
   
5. Test the flow:
   - Create new account (gets 14-day trial)
   - Add items until hitting limits
   - Try upgrade flow
   - Test with your VIP accounts (should have lifetime access)
*/
