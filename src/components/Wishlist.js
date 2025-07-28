import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Gift, Plus, ExternalLink, Share2, Check, Trash2, Edit2 } from 'lucide-react';
import './Wishlist.css';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [imageCache, setImageCache] = useState(new Map()); // Cache for link previews
  const [selectedItems, setSelectedItems] = useState(new Set()); // For bulk operations
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    item_name: '',
    quantity: 1,
    notes: '',
    priority: 'medium',
    budget_category_id: '',
    price: '',
    price_source: '',
    starred: false,
    needed_by: '',
    links: [{ url: '', price: '', source: '' }]
  });

  // Needed By options
  const neededByOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchItems();
    checkShareLink();
    fetchBudgetCategories();
  }, []);

  // Extract images when items change (only when new items are added)
  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        extractImagesFromURLs();
      }, 100); // Small delay to avoid excessive API calls
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]); // Only depend on length to avoid infinite loops

  async function fetchItems() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          profiles!added_by (
            full_name,
            email
          ),
          purchased_by:profiles!purchased_by (
            full_name,
            email
          )
        `)
        .eq('family_id', profile.family_id)
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

  async function extractImagesFromURLs() {
    const newImageCache = new Map(imageCache);
    
    for (const item of items) {
      if (item.link && !newImageCache.has(item.link)) {
        try {
          // Use LinkPreview.net API with environment variable
          const apiKey = process.env.REACT_APP_LINKPREVIEW_API_KEY || 'demo';
          const response = await fetch(
            `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(item.link)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.image) {
              newImageCache.set(item.link, data.image);
            }
          }
        } catch (error) {
          console.log('Could not extract image for:', item.link);
          // Set null to avoid retrying
          newImageCache.set(item.link, null);
        }
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setImageCache(newImageCache);
  }

  // Get image for an item (from cache or fallback)
  const getItemImage = (item) => {
    if (item.link && imageCache.has(item.link)) {
      return imageCache.get(item.link);
    }
    return null;
  };

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

  async function checkShareLink() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data } = await supabase
        .from('wishlist_shares')
        .select('share_token')
        .eq('family_id', profile.family_id)
        .single();

      if (data) {
        setShareLink(`${window.location.origin}/wishlist/${data.share_token}`);
      }
    } catch (error) {
      console.error('Error checking share link:', error);
    }
  }

  async function addItem() {
    if (!newItem.item_name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      // First, create the item in baby_items (Shopping List)
      const { error: babyItemError } = await supabase
        .from('baby_items')
        .insert({
          item_name: newItem.item_name,
          quantity: newItem.quantity,
          notes: newItem.notes || '',
          priority: newItem.priority,
          budget_category_id: newItem.budget_category_id || null,
          price: parseFloat(newItem.price) || null,
          price_source: newItem.price_source || null,
          starred: newItem.starred,
          needed_by: newItem.needed_by || null,
          links: JSON.stringify(newItem.links.filter(link => link.url)),
          family_id: profile.family_id,
          added_by: user.id
        });

      if (babyItemError) throw babyItemError;

      // Then, create the item in wishlist_items (Wishlist)
      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .insert({
          item_name: newItem.item_name,
          description: newItem.notes || '',
          link: (() => {
            try {
              const links = newItem.links.filter(link => link.url);
              return links.length > 0 ? links[0].url : '';
            } catch {
              return '';
            }
          })(),
          price: parseFloat(newItem.price) || null,
          family_id: profile.family_id,
          added_by: user.id,
          is_public: true
        });

      if (wishlistError) throw wishlistError;

      setNewItem({
        item_name: '',
        quantity: 1,
        notes: '',
        priority: 'medium',
        budget_category_id: '',
        price: '',
        price_source: '',
        starred: false,
        needed_by: '',
        links: [{ url: '', price: '', source: '' }]
      });
      setShowAddItem(false);
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item');
    }
  }

  async function togglePurchased(item) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates = {
        purchased: !item.purchased
      };
      
      if (!item.purchased) {
        updates.purchased_by = user.id;
      } else {
        updates.purchased_by = null;
      }

      const { error } = await supabase
        .from('wishlist_items')
        .update(updates)
        .eq('id', item.id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm('Are you sure you want to remove this item from your wishlist?')) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async function generateShareLink() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('wishlist_shares')
        .insert({
          family_id: profile.family_id,
          created_by: user.id
        })
        .select('share_token')
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/wishlist/${data.share_token}`;
      setShareLink(link);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Error generating share link');
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  async function moveToShoppingList(item) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      let shoppingListData;
      
      if (item.moved_from_shopping_list && item.shopping_list_data) {
        // Item came from shopping list, restore original data
        shoppingListData = {
          item_name: item.item_name,
          ...item.shopping_list_data,
          price: item.price, // Use current price from wishlist
          notes: item.description || item.shopping_list_data.notes, // Use current description
          family_id: profile.family_id,
          added_by: user.id
        };
        
        // Check if original budget category still exists
        if (shoppingListData.budget_category_id) {
          const { data: categoryExists } = await supabase
            .from('budget_categories')
            .select('id')
            .eq('id', shoppingListData.budget_category_id)
            .single();
            
          if (!categoryExists) {
            // Category was deleted, set to null and notify later
            shoppingListData.budget_category_id = null;
          }
        }
      } else {
        // Item was added directly to wishlist, create with defaults
        shoppingListData = {
          item_name: item.item_name,
          quantity: 1,
          priority: 'medium',
          notes: item.description || '',
          price: item.price,
          budget_category_id: null, // Uncategorised
          price_source: null,
          starred: false,
          needed_by: null,
          links: item.link ? JSON.stringify([{ url: item.link, price: '', source: '' }]) : JSON.stringify([]),
          family_id: profile.family_id,
          added_by: user.id
        };
      }

      // Insert into shopping list
      const { error: shoppingError } = await supabase
        .from('baby_items')
        .insert(shoppingListData);

      if (shoppingError) throw shoppingError;

      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      // Refresh wishlist
      await fetchItems();
      
      // Show success message with category warning if needed
      if (item.moved_from_shopping_list && item.shopping_list_data?.budget_category_id && !shoppingListData.budget_category_id) {
        alert(`"${item.item_name}" moved to shopping list! Note: Original budget category no longer exists - item is now uncategorised.`);
      } else {
        alert(`"${item.item_name}" moved to shopping list!`);
      }
    } catch (error) {
      console.error('Error moving to shopping list:', error);
      alert('Error moving item to shopping list');
    }
  }

  async function bulkMoveToShoppingList() {
    if (selectedItems.size === 0) return;

    const confirmMessage = `Move ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} to shopping list?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const itemIds = Array.from(selectedItems);
      const itemsToMove = items.filter(item => itemIds.includes(item.id));

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      // Prepare shopping list items data
      const shoppingListItems = [];
      let categoryWarnings = 0;
      
      for (const item of itemsToMove) {
        let shoppingListData;
        
        if (item.moved_from_shopping_list && item.shopping_list_data) {
          // Item came from shopping list, restore original data
          shoppingListData = {
            item_name: item.item_name,
            ...item.shopping_list_data,
            price: item.price, // Use current price
            notes: item.description || item.shopping_list_data.notes,
            family_id: profile.family_id,
            added_by: user.id
          };
          
          // Check if original budget category still exists
          if (shoppingListData.budget_category_id) {
            const { data: categoryExists } = await supabase
              .from('budget_categories')
              .select('id')
              .eq('id', shoppingListData.budget_category_id)
              .single();
              
            if (!categoryExists) {
              shoppingListData.budget_category_id = null;
              categoryWarnings++;
            }
          }
        } else {
          // Item was added directly to wishlist
          shoppingListData = {
            item_name: item.item_name,
            quantity: 1,
            priority: 'medium',
            notes: item.description || '',
            price: item.price,
            budget_category_id: null,
            price_source: null,
            starred: false,
            needed_by: null,
            links: item.link ? JSON.stringify([{ url: item.link, price: '', source: '' }]) : JSON.stringify([]),
            family_id: profile.family_id,
            added_by: user.id
          };
        }
        
        shoppingListItems.push(shoppingListData);
      }

      // Insert into shopping list
      const { error: shoppingError } = await supabase
        .from('baby_items')
        .insert(shoppingListItems);

      if (shoppingError) throw shoppingError;

      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .in('id', itemIds);

      if (deleteError) throw deleteError;

      // Clear selection and refresh
      setSelectedItems(new Set());
      await fetchItems();
      
      // Show success message with warnings
      let message = `${itemsToMove.length} item${itemsToMove.length > 1 ? 's' : ''} moved to shopping list!`;
      if (categoryWarnings > 0) {
        message += ` Note: ${categoryWarnings} item${categoryWarnings > 1 ? 's' : ''} had deleted budget categories and were moved to uncategorised.`;
      }
      alert(message);
    } catch (error) {
      console.error('Error bulk moving to shopping list:', error);
      alert('Error moving items to shopping list');
    }
  }

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  async function editItem(item) {
    setEditingItem(item);
    
    // Populate form with current item data, merging wishlist and shopping list data
    const shoppingData = item.shopping_list_data || {};
    
    setNewItem({
      item_name: item.item_name,
      quantity: shoppingData.quantity || 1,
      notes: item.description || shoppingData.notes || '',
      priority: shoppingData.priority || 'medium',
      budget_category_id: shoppingData.budget_category_id || '',
      price: item.price?.toString() || '',
      price_source: shoppingData.price_source || '',
      starred: shoppingData.starred || false,
      needed_by: shoppingData.needed_by || '',
      links: (() => {
        // Try to get links from shopping_list_data first, then from direct link
        if (shoppingData.links) {
          try {
            return JSON.parse(shoppingData.links);
          } catch {
            // Fall through to direct link
          }
        }
        
        // If there's a direct link, convert it to links format
        if (item.link) {
          return [{ url: item.link, price: '', source: '' }];
        }
        
        // Default empty link
        return [{ url: '', price: '', source: '' }];
      })()
    });
    
    setShowEditItem(true);
  }

  async function updateItem() {
    if (!newItem.item_name || !editingItem) return;

    try {
      // Prepare updated shopping list data
      const updatedShoppingListData = {
        quantity: newItem.quantity,
        priority: newItem.priority,
        budget_category_id: newItem.budget_category_id || null,
        price_source: newItem.price_source || null,
        starred: newItem.starred,
        needed_by: newItem.needed_by || null,
        links: JSON.stringify(newItem.links.filter(link => link.url)),
        notes: newItem.notes
      };

      // Prepare wishlist item updates
      const wishlistUpdates = {
        item_name: newItem.item_name,
        description: newItem.notes,
        link: (() => {
          const links = newItem.links.filter(link => link.url);
          return links.length > 0 ? links[0].url : '';
        })(),
        price: parseFloat(newItem.price) || null,
        shopping_list_data: updatedShoppingListData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wishlist_items')
        .update(wishlistUpdates)
        .eq('id', editingItem.id);

      if (error) throw error;

      // Reset form and close modal
      setNewItem({
        item_name: '',
        quantity: 1,
        notes: '',
        priority: 'medium',
        budget_category_id: '',
        price: '',
        price_source: '',
        starred: false,
        needed_by: '',
        links: [{ url: '', price: '', source: '' }]
      });
      setShowEditItem(false);
      setEditingItem(null);
      
      // Refresh items and clear image cache for updated item
      if (editingItem.link !== wishlistUpdates.link) {
        const newImageCache = new Map(imageCache);
        newImageCache.delete(editingItem.link);
        setImageCache(newImageCache);
      }
      
      await fetchItems();
      
      alert(`"${newItem.item_name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  }

  // Helper functions for managing links
  const addLink = () => {
    setNewItem({
      ...newItem,
      links: [...newItem.links, { url: '', price: '', source: '' }]
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

  const unpurchasedCount = items.filter(item => !item.purchased).length;
  const purchasedCount = items.filter(item => item.purchased).length;

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>Gift Wishlist</h1>
        <div className="header-actions">
          <button className="add-button" onClick={() => setShowAddItem(true)}>
            <Plus size={16} /> Add Item
          </button>
          <button className="share-button" onClick={shareLink ? () => setShowShareModal(true) : generateShareLink}>
            <Share2 size={16} /> Share List
          </button>
        </div>
      </div>

      <div className="wishlist-summary">
        <div className="summary-card">
          <Gift size={24} color="#f5c2c7" />
          <div>
            <h3>{unpurchasedCount}</h3>
            <p>Items Wanted</p>
          </div>
        </div>
        <div className="summary-card">
          <Check size={24} color="#4CAF50" />
          <div>
            <h3>{purchasedCount}</h3>
            <p>Items Purchased</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedItems.size} items selected</span>
          <button 
            className="bulk-shopping-list-button"
            onClick={bulkMoveToShoppingList}
          >
            ← Move to Shopping List
          </button>
          <button 
            className="clear-selection-button"
            onClick={() => setSelectedItems(new Set())}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="wishlist-grid">
        {items.length > 0 ? (
          items.map(item => {
            const itemImage = getItemImage(item);
            return (
              <div key={item.id} className={`wishlist-item ${item.purchased ? 'purchased' : ''} ${selectedItems.has(item.id) ? 'selected' : ''}`}>
                {/* Selection Checkbox */}
                <div className="item-selection">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="item-checkbox"
                  />
                </div>
                
                {/* Product Image */}
                <div className="item-image-container">
                  {itemImage ? (
                    <img 
                      src={itemImage} 
                      alt={item.item_name}
                      className="item-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="item-image-placeholder" 
                    style={{ display: itemImage ? 'none' : 'flex' }}
                  >
                    <Gift size={32} color="#ddd" />
                  </div>
                </div>
                
                <div className="item-content">
                  <div className="item-header">
                    <h3>{item.item_name}</h3>
                    {item.price && <span className="price">£{item.price.toFixed(2)}</span>}
                  </div>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">
                      <ExternalLink size={16} /> View Item
                    </a>
                  )}
                  <div className="item-footer">
                    <span className="added-by">
                      Added by {item.profiles?.full_name || item.profiles?.email}
                    </span>
                    {item.purchased && item.purchased_by && (
                      <span className="purchased-by">
                        Purchased by {item.purchased_by.full_name || item.purchased_by.email}
                      </span>
                    )}
                  </div>
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => editItem(item)}
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      className="shopping-list-button"
                      onClick={() => moveToShoppingList(item)}
                      title="Move to Shopping List"
                    >
                      ← Shopping List
                    </button>
                    <button 
                      className={`purchase-button ${item.purchased ? 'unpurchase' : ''}`}
                      onClick={() => togglePurchased(item)}
                    >
                      <Check size={16} />
                      {item.purchased ? 'Mark as Available' : 'Mark as Purchased'}
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-items">
            <Gift size={48} color="#ccc" />
            <p>No items in your wishlist yet!</p>
            <p>Add items you'd love to receive for your baby shower.</p>
          </div>
        )}
      </div>

      {showAddItem && (
        <WishlistItemModal
          newItem={newItem}
          setNewItem={setNewItem}
          budgetCategories={budgetCategories}
          neededByOptions={neededByOptions}
          onSave={addItem}
          onCancel={() => setShowAddItem(false)}
          addLink={addLink}
          updateLink={updateLink}
          removeLink={removeLink}
          isEditing={false}
        />
      )}

      {/* Edit Item Modal */}
      {showEditItem && (
        <WishlistItemModal
          newItem={newItem}
          setNewItem={setNewItem}
          budgetCategories={budgetCategories}
          neededByOptions={neededByOptions}
          onSave={updateItem}
          onCancel={() => {
            setShowEditItem(false);
            setEditingItem(null);
          }}
          addLink={addLink}
          updateLink={updateLink}
          removeLink={removeLink}
          isEditing={true}
        />
      )}

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Share Your Wishlist</h2>
            <p>Share this link with friends and family so they can see your wishlist:</p>
            <div className="share-link-container">
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="share-link-input"
              />
              <button className="copy-button" onClick={copyToClipboard}>
                Copy Link
              </button>
            </div>
            <p className="share-note">
              Note: People with this link will need to create an account to mark items as purchased, 
              but they won't be able to edit your list.
            </p>
            <div className="modal-actions">
              <button className="close-button" onClick={() => setShowShareModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wishlist Item Modal Component with Shopping List fields
function WishlistItemModal({ 
  newItem, 
  setNewItem, 
  budgetCategories, 
  neededByOptions,
  onSave, 
  onCancel,
  addLink,
  updateLink,
  removeLink,
  isEditing
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit Wishlist Item' : 'Add Wishlist Item'}</h2>
        <p className="field-visibility-note">
          👁️ Fields marked with an eye icon are visible in the wishlist view
        </p>
        
        <div className="form-group">
          <label className="field-visible">
            👁️ Item Name *
          </label>
          <input
            type="text"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
            placeholder="e.g., Baby Monitor"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget Category</label>
            <select
              value={newItem.budget_category_id}
              onChange={(e) => setNewItem({ ...newItem, budget_category_id: e.target.value })}
            >
              <option value="">Select budget category</option>
              {budgetCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <small className="field-note">Used when moved to Shopping List</small>
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
            <small className="field-note">Used when moved to Shopping List</small>
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
            <small className="field-note">Used when moved to Shopping List</small>
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
            <small className="field-note">Used when moved to Shopping List</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="field-visible">
              👁️ Price
            </label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Price Source</label>
            <input
              type="text"
              value={newItem.price_source}
              onChange={(e) => setNewItem({ ...newItem, price_source: e.target.value })}
              placeholder="e.g., John Lewis"
            />
            <small className="field-note">Used when moved to Shopping List</small>
          </div>
        </div>

        <div className="form-group">
          <label className="field-visible">
            👁️ Notes/Description
          </label>
          <textarea
            value={newItem.notes}
            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            placeholder="Add any details about colour, size, brand preferences..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="field-visible">
            👁️ Links & Alternative Prices
          </label>
          <small className="field-note">First link will be shown in wishlist view</small>
          {newItem.links.map((link, index) => (
            <div key={index} className="link-input-group">
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="https://..."
              />
              <input
                type="text"
                value={link.source}
                onChange={(e) => updateLink(index, 'source', e.target.value)}
                placeholder="Source name"
              />
              <input
                type="number"
                value={link.price}
                onChange={(e) => updateLink(index, 'price', e.target.value)}
                placeholder="Price"
                step="0.01"
              />
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

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={newItem.starred}
              onChange={(e) => setNewItem({ ...newItem, starred: e.target.checked })}
            />
            Star this item
            <small className="field-note">Used when moved to Shopping List</small>
          </label>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-button" onClick={onSave}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
