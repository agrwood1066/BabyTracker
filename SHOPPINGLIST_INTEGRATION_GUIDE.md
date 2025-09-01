// ShoppingList.js - Updated with Paywall Integration
// This is a partial update showing the key changes needed
// Add these imports at the top of your ShoppingList.js:

import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import { Lock } from 'lucide-react';

// Inside your ShoppingList component, add these after existing state:

  // Subscription integration
  const { checkFeatureAccess, isPremium, vaultData } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('limit');

  // Modified handleAddItem function with paywall check:
  async function handleAddItem(e) {
    e.preventDefault();
    
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
      
      const itemToAdd = {
        family_id: profile.family_id,
        added_by: user.id,
        ...newItem,
        links: newItem.links.filter(link => link.url || link.price)
      };
      
      const { data, error } = await supabase
        .from('baby_items')
        .insert([itemToAdd])
        .select();
      
      if (error) throw error;
      
      setItems([...items, data[0]]);
      setShowAddItem(false);
      resetNewItem();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  // Add Data Vault UI for items beyond limit
  const renderItemsWithVault = () => {
    const access = vaultData?.shopping_items;
    const freeLimit = 10;
    
    if (!isPremium() && items.length > freeLimit) {
      const visibleItems = items.slice(0, freeLimit);
      const vaultItems = items.slice(freeLimit);
      
      return (
        <>
          {/* Render visible items */}
          {visibleItems.map(item => renderItemCard(item))}
          
          {/* Vault Banner */}
          <div className="vault-banner">
            <div className="vault-content">
              <Lock size={20} />
              <span>{vaultItems.length} items saved in your vault</span>
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
              {vaultItems.slice(0, 3).map((item) => (
                <div key={item.id} className="vault-item-preview">
                  <span className="item-name">{item.item_name}</span>
                  <Lock size={12} />
                </div>
              ))}
              {vaultItems.length > 3 && (
                <span className="more-items">
                  +{vaultItems.length - 3} more...
                </span>
              )}
            </div>
          </div>
        </>
      );
    }
    
    // Premium users see all items
    return items.map(item => renderItemCard(item));
  };

  // Add limit warning when approaching limit
  const renderAddButton = () => {
    const freeLimit = 10;
    const isAtLimit = !isPremium() && items.length >= freeLimit;
    
    return (
      <button 
        className={`add-item-btn ${isAtLimit ? 'limited' : ''}`}
        onClick={() => {
          if (isAtLimit) {
            setPaywallTrigger('limit');
            setShowPaywall(true);
          } else {
            setShowAddItem(true);
          }
        }}
      >
        {isAtLimit ? (
          <>
            <Lock size={20} />
            <span>Upgrade to Add More</span>
          </>
        ) : (
          <>
            <Plus size={20} />
            <span>Add Item</span>
          </>
        )}
      </button>
    );
  };

  // In your render method, add:
  // 1. Replace the items mapping with renderItemsWithVault()
  // 2. Replace the add button with renderAddButton()
  // 3. Add the PaywallModal at the end of your component:

  return (
    <>
      {/* Your existing JSX */}
      
      {/* Add this at the bottom before closing fragment */}
      <PaywallModal
        show={showPaywall}
        trigger={paywallTrigger}
        onClose={() => setShowPaywall(false)}
        customMessage={`You've reached the free limit of 10 shopping items. Upgrade to add unlimited items!`}
      />
    </>
  );

// CSS additions for ShoppingList.css:
/*
.vault-banner {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px dashed #9ca3af;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.vault-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vault-content span {
  flex: 1;
  color: #4b5563;
  font-weight: 600;
}

.unlock-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.unlock-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.vault-preview {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #d1d5db;
}

.vault-item-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  opacity: 0.7;
}

.vault-item-preview .item-name {
  color: #6b7280;
  font-size: 0.9rem;
  text-decoration: line-through;
}

.more-items {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
  display: block;
  margin-top: 0.5rem;
}

.add-item-btn.limited {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px dashed #d1d5db;
  cursor: pointer;
}

.add-item-btn.limited:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}
*/
