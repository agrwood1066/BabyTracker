import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, Plus, Check, Trash2, Star, Edit2, Search, Tag, Gift, Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import './ShoppingList.css';

// Currency configuration
const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' }
];

// Helper function to get currency symbol
const getCurrencySymbol = (code) => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency ? currency.symbol : '£';
};

function ShoppingList() {
  // Subscription integration
  const { checkFeatureAccess, isPremium, vaultData } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('limit');
  
  const [items, setItems] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [newItem, setNewItem] = useState({
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
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shoppingGroupBy, setShoppingGroupBy] = useState('category');
  const [wishlistItems, setWishlistItems] = useState(new Map());

  // Needed By options
  const neededByOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchBudgetCategories();
    fetchItems();
    fetchWishlistStatus();
  }, []);

  async function fetchBudgetCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('name');

      if (!error) {
        setBudgetCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching budget categories:', error);
    }
  }

  async function fetchWishlistStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id, item_name, purchased')
        .eq('family_id', profile.family_id);

      if (!error && data) {
        const wishlistMap = new Map();
        data.forEach(item => {
          wishlistMap.set(item.item_name.toLowerCase(), {
            id: item.id,
            purchased: item.purchased
          });
        });
        setWishlistItems(wishlistMap);
      }
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
    }
  }

  async function moveToWishlist(item) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const shoppingListData = {
        quantity: item.quantity,
        priority: item.priority,
        budget_category_id: item.budget_category_id,
        price_source: item.price_source,
        price_currency: item.price_currency,
        starred: item.starred,
        needed_by: item.needed_by,
        links: item.links,
        notes: item.notes
      };

      const wishlistData = {
        family_id: profile.family_id,
        added_by: user.id,
        item_name: item.item_name,
        description: item.notes || '',
        link: (() => {
          try {
            const links = item.links ? JSON.parse(item.links) : [];
            return links.length > 0 ? links[0].url : '';
          } catch {
            return '';
          }
        })(),
        price: item.price || null,
        purchased: false,
        is_public: true,
        shopping_list_data: shoppingListData,
        moved_from_shopping_list: true,
        original_baby_item_id: item.id
      };

      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .insert(wishlistData);

      if (wishlistError) throw wishlistError;

      const { error: deleteError } = await supabase
        .from('baby_items')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      const newWishlistItems = new Map(wishlistItems);
      newWishlistItems.set(item.item_name.toLowerCase(), {
        id: null,
        purchased: false
      });
      setWishlistItems(newWishlistItems);
      
      await Promise.all([fetchItems(), fetchWishlistStatus()]);
      alert(`"${item.item_name}" moved to wishlist!`);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      alert('Error moving item to wishlist');
    }
  }

  async function removeFromWishlist(item) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('family_id', profile.family_id)
        .eq('item_name', item.item_name);

      if (error) throw error;

      const newWishlistItems = new Map(wishlistItems);
      newWishlistItems.delete(item.item_name.toLowerCase());
      setWishlistItems(newWishlistItems);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Error removing item from wishlist');
    }
  }

  async function fetchItems() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('baby_items')
        .select(`
          *,
          budget_categories!budget_category_id (
            name,
            expected_budget
          ),
          profiles!added_by (
            full_name,
            email
          )
        `)
        .eq('family_id', profile.family_id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error) {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

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

  async function editItem(item) {
    setEditingItem(item);
    let parsedLinks = [{ url: '', price: '', currency: 'GBP', source: '' }];
    if (item.links) {
      try {
        parsedLinks = JSON.parse(item.links).map(link => ({
          ...link,
          currency: link.currency || 'GBP'
        }));
      } catch (e) {
        console.error('Error parsing links:', e);
      }
    }
    
    setNewItem({
      item_name: item.item_name,
      quantity: item.quantity,
      notes: item.notes || '',
      priority: item.priority,
      budget_category_id: item.budget_category_id || '',
      price: item.price || '',
      price_currency: item.price_currency || 'GBP',
      price_source: item.price_source || '',
      starred: item.starred,
      needed_by: item.needed_by || '',
      links: parsedLinks
    });
    setShowEditItem(true);
  }

  async function updateItem() {
    if (!newItem.item_name || !editingItem) return;

    try {
      const itemData = {
        item_name: newItem.item_name,
        quantity: newItem.quantity,
        notes: newItem.notes || '',
        priority: newItem.priority,
        budget_category_id: newItem.budget_category_id || null,
        price: parseFloat(newItem.price) || null,
        price_currency: newItem.price_currency || 'GBP',
        price_source: newItem.price_source || '',
        starred: newItem.starred,
        needed_by: newItem.needed_by || '',
        links: JSON.stringify(newItem.links.filter(link => link.url))
      };

      const { error } = await supabase
        .from('baby_items')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) throw error;

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
      setShowEditItem(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Error updating item: ${error.message}`);
    }
  }

  async function togglePurchased(item) {
    try {
      const { error } = await supabase
        .from('baby_items')
        .update({ purchased: !item.purchased })
        .eq('id', item.id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('baby_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  const filteredItems = items.filter(item => {
    if (searchTerm && !item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !(item.price_source && item.price_source.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const budgetSummary = budgetCategories.map(budgetCat => {
    const categoryItems = items.filter(item => item.budget_category_id === budgetCat.id);
    const spent = categoryItems
      .filter(item => item.purchased)
      .reduce((sum, item) => sum + (item.price || 0), 0);
    const pending = categoryItems
      .filter(item => !item.purchased)
      .reduce((sum, item) => sum + (item.price || 0), 0);
    
    return {
      ...budgetCat,
      spent,
      pending,
      remaining: (budgetCat.expected_budget || 0) - spent,
      totalEstimated: spent + pending
    };
  });

  const uniquePriceSources = [...new Set(items.filter(item => item.price_source).map(item => item.price_source))].sort();

  const addLink = () => {
    setNewItem({
      ...newItem,
      links: [...newItem.links, { url: '', price: '', currency: 'GBP', source: '' }]
    });
  };

  const updateLink = (index, field, value) => {
    const updatedLinks = newItem.links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setNewItem({ ...newItem, links: updatedLinks });
  };

  const removeLink = (index) => {
    const updatedLinks = newItem.links.filter((_, i) => i !== index);
    setNewItem({ ...newItem, links: updatedLinks });
  };

  if (loading) {
    return <div className="loading">Loading shopping list...</div>;
  }

  return (
    <div className="shopping-list-container">
      <div className="shopping-header">
        <h1>
          <ShoppingCart size={28} />
          Shopping List
        </h1>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search items by name, notes, or price source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <ShoppingModeView 
        items={filteredItems}
        budgetCategories={budgetCategories}
        togglePurchased={togglePurchased}
        budgetSummary={budgetSummary}
        groupBy={shoppingGroupBy}
        setGroupBy={setShoppingGroupBy}
        uniquePriceSources={uniquePriceSources}
        wishlistItems={wishlistItems}
        moveToWishlist={moveToWishlist}
        removeFromWishlist={removeFromWishlist}
        onEdit={editItem}
      />

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

      {/* Conditional Add Button */}
      {!isPremium() && items.length >= 10 ? (
        <button 
          className="fab-add limited" 
          onClick={() => {
            setPaywallTrigger('limit');
            setShowPaywall(true);
          }}
          title="Upgrade to Add More"
        >
          <Lock size={24} />
        </button>
      ) : (
        <button 
          className="fab-add" 
          onClick={() => setShowAddItem(true)}
          title="Add Item"
        >
          <Plus size={24} />
        </button>
      )}

      {showAddItem && (
        <AddItemModal
          newItem={newItem}
          setNewItem={setNewItem}
          budgetCategories={budgetCategories}
          neededByOptions={neededByOptions}
          currencies={CURRENCIES}
          onSave={addItem}
          onCancel={() => setShowAddItem(false)}
          addLink={addLink}
          updateLink={updateLink}
          removeLink={removeLink}
          isEditing={false}
          onAddCategory={async (name, budget) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              const { data: profile } = await supabase
                .from('profiles')
                .select('family_id')
                .eq('id', user.id)
                .single();

              const { data, error } = await supabase
                .from('budget_categories')
                .insert({
                  name: name,
                  expected_budget: parseFloat(budget) || 0,
                  family_id: profile.family_id
                })
                .select()
                .single();

              if (error) throw error;
              
              // Ensure category is created before updating state
              await fetchBudgetCategories();
              
              // Use functional update to ensure we have the latest state
              setNewItem(prevItem => ({ ...prevItem, budget_category_id: data.id }));
              return true;
            } catch (error) {
              console.error('Error adding category:', error);
              alert('Error adding category');
              return false;
            }
          }}
        />
      )}

      {showEditItem && (
        <AddItemModal
          newItem={newItem}
          setNewItem={setNewItem}
          budgetCategories={budgetCategories}
          neededByOptions={neededByOptions}
          currencies={CURRENCIES}
          onSave={updateItem}
          onCancel={() => {
            setShowEditItem(false);
            setEditingItem(null);
          }}
          onDelete={() => {
            deleteItem(editingItem.id);
            setShowEditItem(false);
            setEditingItem(null);
          }}
          addLink={addLink}
          updateLink={updateLink}
          removeLink={removeLink}
          isEditing={true}
          onAddCategory={async (name, budget) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              const { data: profile } = await supabase
                .from('profiles')
                .select('family_id')
                .eq('id', user.id)
                .single();

              const { data, error } = await supabase
                .from('budget_categories')
                .insert({
                  name: name,
                  expected_budget: parseFloat(budget) || 0,
                  family_id: profile.family_id
                })
                .select()
                .single();

              if (error) throw error;
              
              // Ensure category is created before updating state
              await fetchBudgetCategories();
              
              // Use functional update to ensure we have the latest state
              setNewItem(prevItem => ({ ...prevItem, budget_category_id: data.id }));
              return true;
            } catch (error) {
              console.error('Error adding category:', error);
              alert('Error adding category');
              return false;
            }
          }}
        />
      )}

      {/* Paywall Modal */}
      <PaywallModal
        show={showPaywall}
        trigger={paywallTrigger}
        onClose={() => setShowPaywall(false)}
        customMessage={`You've reached the free limit of 10 shopping items. Upgrade to add unlimited items!`}
      />
    </div>
  );
}

// Shopping Mode Component
function ShoppingModeView({ items, budgetCategories, togglePurchased, budgetSummary, groupBy, setGroupBy, uniquePriceSources, wishlistItems, moveToWishlist, removeFromWishlist, onEdit }) {
  let groupedItems = {};

  if (groupBy === 'source') {
    uniquePriceSources.forEach(source => {
      const sourceItems = items.filter(item => item.price_source === source);
      if (sourceItems.length > 0) {
        groupedItems[source] = sourceItems;
      }
    });
    
    const noSourceItems = items.filter(item => !item.price_source);
    if (noSourceItems.length > 0) {
      groupedItems['No Price Source'] = noSourceItems;
    }
  } else {
    groupedItems = budgetCategories.reduce((acc, budgetCat) => {
      const categoryItems = items.filter(item => 
        item.budget_category_id === budgetCat.id
      );
      if (categoryItems.length > 0) {
        acc[budgetCat.name] = categoryItems;
      }
      return acc;
    }, {});

    const uncategorisedItems = items.filter(item => 
      !item.budget_category_id
    );
    if (uncategorisedItems.length > 0) {
      groupedItems['Uncategorised'] = uncategorisedItems;
    }
  }

  return (
    <div className="shopping-mode">
      <div className="shopping-mode-header">
        <div className="shopping-mode-title">
          <h2>Shopping Mode</h2>
          <p>Tap items to mark as purchased/unpurchased</p>
        </div>
        <button 
          className="group-toggle-button"
          onClick={() => setGroupBy(groupBy === 'category' ? 'source' : 'category')}
          title={`Group by ${groupBy === 'category' ? 'Price Source' : 'Category'}`}
        >
          <Tag size={20} />
          {groupBy === 'category' ? 'By Store' : 'By Category'}
        </button>
      </div>

      {Object.entries(groupedItems).map(([groupName, groupItems]) => {
        const budgetInfo = groupBy === 'category' ? budgetSummary.find(cat => cat.name === groupName) : null;
        
        return (
          <div key={groupName} className="shopping-category">
            <div className="shopping-category-header">
              <h3>{groupName}</h3>
              {budgetInfo && (
                <div className="category-budget-info">
                  <span>Remaining: {getCurrencySymbol('GBP')}{budgetInfo.remaining.toFixed(2)}</span>
                </div>
              )}
              {groupBy === 'source' && (
                <div className="category-budget-info">
                  <span>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            <div className="shopping-items-list">
              {groupItems.map(item => {
                const wishlistStatus = wishlistItems.get(item.item_name.toLowerCase());
                const isInWishlist = Boolean(wishlistStatus);
                const isWishlistPurchased = wishlistStatus?.purchased || false;
                const currencySymbol = getCurrencySymbol(item.price_currency || 'GBP');
                
                return (
                  <div 
                    key={item.id} 
                    className={`shopping-item ${
                      item.purchased ? 'purchased' : ''
                    } ${
                      isInWishlist ? (isWishlistPurchased ? 'wishlist-purchased' : 'wishlist-added') : ''
                    }`}
                  >
                    <div 
                      className="shopping-item-main"
                      onClick={() => togglePurchased(item)}
                    >
                      <div className="shopping-item-content">
                        <h4>{item.item_name}</h4>
                        <div className="shopping-item-details">
                          <span className="quantity">Qty: {item.quantity}</span>
                          {item.price && (
                            <span className="price">{currencySymbol}{item.price.toFixed(2)}</span>
                          )}
                          {item.price_source && (
                            <span className="source">from {item.price_source}</span>
                          )}
                          {item.purchased && (
                            <span className="purchased-label">✓ Purchased</span>
                          )}
                          {isInWishlist && (
                            <span className={`wishlist-status ${isWishlistPurchased ? 'purchased' : 'added'}`}>
                              {isWishlistPurchased ? '🎁 Gifted' : '🎁 In Wishlist'}
                            </span>
                          )}
                        </div>
                        
                        {item.links && (() => {
                          try {
                            const links = JSON.parse(item.links);
                            return links.length > 0;
                          } catch {
                            return false;
                          }
                        })() && (
                          <div className="shopping-item-links">
                            {(() => {
                              try {
                                return JSON.parse(item.links);
                              } catch {
                                return [];
                              }
                            })().map((link, index) => {
                              const linkCurrencySymbol = getCurrencySymbol(link.currency || 'GBP');
                              return (
                                <a 
                                  key={index}
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="shopping-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="link-source">{link.source || 'Link'}</span>
                                  {link.price && (
                                    <span className="link-price">{linkCurrencySymbol}{parseFloat(link.price).toFixed(2)}</span>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="shopping-item-actions">
                      <button 
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        title="Edit item"
                      >
                        <Edit2 size={18} />
                      </button>
                      {isInWishlist ? (
                        <button 
                          className="wishlist-button added"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(item);
                          }}
                          title="Remove from Wishlist"
                        >
                          <Gift size={18} fill="currentColor" />
                        </button>
                      ) : (
                        <button 
                          className="wishlist-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveToWishlist(item);
                          }}
                          title="Move to Wishlist"
                        >
                          <Gift size={18} />
                        </button>
                      )}
                      <div className={`checkbox ${item.purchased ? 'checked' : ''}`}>
                        {item.purchased && <Check size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(groupedItems).length === 0 && (
        <div className="no-shopping-items">
          <ShoppingCart size={48} color="#ccc" />
          <p>No items in your shopping list yet!</p>
        </div>
      )}
    </div>
  );
}

// Add Item Modal Component
function AddItemModal({ 
  newItem, 
  setNewItem, 
  budgetCategories, 
  neededByOptions,
  currencies,
  onSave, 
  onCancel,
  onDelete,
  addLink,
  updateLink,
  removeLink,
  isEditing,
  onAddCategory
}) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    
    const success = await onAddCategory(newCategoryName, newCategoryBudget);
    if (success) {
      setNewCategoryName('');
      setNewCategoryBudget('');
      setShowCategoryForm(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Shopping List Item' : 'Add Shopping List Item'}</h2>
          <div className="modal-header-actions">
            <label className="star-toggle">
              <input
                type="checkbox"
                checked={newItem.starred}
                onChange={(e) => setNewItem({ ...newItem, starred: e.target.checked })}
              />
              <Star size={22} fill={newItem.starred ? '#ffd700' : 'none'} color={newItem.starred ? '#ffd700' : '#ccc'} />
            </label>
            <button className="modal-close-button" onClick={onCancel} title="Cancel">
              ×
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Item Name *</label>
          <input
            type="text"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
            placeholder="e.g., Newborn onesies"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget Category</label>
            {!showCategoryForm ? (
              <select
                value={newItem.budget_category_id}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowCategoryForm(true);
                  } else {
                    setNewItem({ ...newItem, budget_category_id: e.target.value });
                  }
                }}
              >
                <option value="">Select budget category</option>
                {budgetCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="__add_new__">+ Add New Category...</option>
              </select>
            ) : (
              <div className="inline-category-form">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Budget (£)"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  step="0.01"
                />
                <div className="inline-category-actions">
                  <button
                    type="button"
                    className="save-category-btn"
                    onClick={handleAddCategory}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="cancel-category-btn"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setNewCategoryName('');
                      setNewCategoryBudget('');
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Needed By</label>
            <select
              value={newItem.needed_by}
              onChange={(e) => setNewItem({ ...newItem, needed_by: e.target.value })}
            >
              <option value="">Select timeframe</option>
              {neededByOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          
          <div className="form-group">
            <label>Priority</label>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-row currency-row">
          <div className="form-group">
            <label>Price</label>
            <div className="currency-input">
              <select
                className="currency-select"
                value={newItem.price_currency}
                onChange={(e) => setNewItem({ ...newItem, price_currency: e.target.value })}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="price-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Price Source</label>
            <input
              type="text"
              value={newItem.price_source}
              onChange={(e) => setNewItem({ ...newItem, price_source: e.target.value })}
              placeholder="e.g., John Lewis"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={newItem.notes}
            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            placeholder="Any additional notes..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Links & Alternative Prices</label>
          {newItem.links.map((link, index) => (
            <div key={index} className="link-input-group">
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="link-url-input"
              />
              <input
                type="text"
                value={link.source}
                onChange={(e) => updateLink(index, 'source', e.target.value)}
                placeholder="Store name"
                className="link-source-input"
              />
              <div className="link-price-group">
                <select
                  className="link-currency-select"
                  value={link.currency || 'GBP'}
                  onChange={(e) => updateLink(index, 'currency', e.target.value)}
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={link.price}
                  onChange={(e) => updateLink(index, 'price', e.target.value)}
                  placeholder="Price"
                  step="0.01"
                  className="link-price-input"
                />
              </div>
              {newItem.links.length > 1 && (
                <button 
                  type="button"
                  className="remove-link-button"
                  onClick={() => removeLink(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button 
            type="button"
            className="add-link-button"
            onClick={addLink}
          >
            + Add Another Link
          </button>
        </div>

        <div className="modal-actions">
          <button className="save-button primary-hero" onClick={onSave}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
        
        {isEditing && onDelete && (
          <div className="delete-action-section">
            <button 
              className="delete-item-button" 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${newItem.item_name}"? This action cannot be undone.`)) {
                  onDelete();
                }
              }}
            >
              <Trash2 size={16} />
              Delete Item
            </button>
            <p className="delete-warning">
              This will permanently delete the item from your shopping list
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingList;