import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, Plus, Check, Trash2, AlertCircle, Star, Eye, DollarSign, Target, Edit2 } from 'lucide-react';
import './ShoppingList.css';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterBudgetCategory, setFilterBudgetCategory] = useState('all');
  const [filterNeededBy, setFilterNeededBy] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
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
    fetchBudgetCategories();
    fetchItems();
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
        links: JSON.stringify(newItem.links.filter(link => link.url)),
        family_id: profile.family_id,
        added_by: user.id
      };

      // Remove empty budget_category_id
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

  async function editItem(item) {
    setEditingItem(item);
    setNewItem({
      item_name: item.item_name,
      quantity: item.quantity,
      notes: item.notes || '',
      priority: item.priority,
      budget_category_id: item.budget_category_id || '',
      price: item.price || '',
      price_source: item.price_source || '',
      starred: item.starred,
      needed_by: item.needed_by || '',
      links: item.links ? JSON.parse(item.links) : [{ url: '', price: '', source: '' }]
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
        price_source: newItem.price_source || '',
        starred: newItem.starred,
        needed_by: newItem.needed_by || '',
        links: JSON.stringify(newItem.links.filter(link => link.url))
      };

      const { error } = await supabase
        .from('baby_items')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

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

  async function toggleStarred(item) {
    try {
      const { error } = await supabase
        .from('baby_items')
        .update({ starred: !item.starred })
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

  async function bulkAssignCategory() {
    if (!bulkCategory || selectedItems.size === 0) return;

    try {
      const itemIds = Array.from(selectedItems);
      const { error } = await supabase
        .from('baby_items')
        .update({ budget_category_id: bulkCategory })
        .in('id', itemIds);

      if (error) throw error;

      setSelectedItems(new Set());
      setShowBulkAssign(false);
      setBulkCategory('');
      fetchItems();
    } catch (error) {
      console.error('Error bulk assigning categories:', error);
      alert('Error assigning categories');
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

  const filteredItems = items.filter(item => {
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    if (filterBudgetCategory !== 'all' && item.budget_category_id !== filterBudgetCategory) return false;
    if (filterNeededBy !== 'all' && item.needed_by !== filterNeededBy) return false;
    return true;
  });

  const itemsNeeded = filteredItems.filter(item => !item.purchased).length;
  const itemsPurchased = filteredItems.filter(item => item.purchased).length;

  // Calculate budget summary for category progress bars
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

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0);
  const totalSpent = budgetSummary.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPending = budgetSummary.reduce((sum, cat) => sum + cat.pending, 0);

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

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertCircle size={16} color="#ff6b6b" />;
    return null;
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
        <div className="header-actions">
          <button 
            className={`mode-toggle ${shoppingMode ? 'active' : ''}`}
            onClick={() => setShoppingMode(!shoppingMode)}
          >
            {shoppingMode ? <Eye size={16} /> : <ShoppingCart size={16} />}
            {shoppingMode ? 'Normal View' : 'Shopping Mode'}
          </button>
          <button className="add-button" onClick={() => setShowAddItem(true)}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="budget-overview">
        <div className="budget-stat">
          <Target size={24} color="#9fd3c7" />
          <div>
            <h3>£{totalBudget.toFixed(2)}</h3>
            <p>Total Budget</p>
          </div>
        </div>
        <div className="budget-stat">
          <Check size={24} color="#4CAF50" />
          <div>
            <h3>£{totalSpent.toFixed(2)}</h3>
            <p>Spent</p>
          </div>
        </div>
        <div className="budget-stat">
          <DollarSign size={24} color="#ff9800" />
          <div>
            <h3>£{totalPending.toFixed(2)}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="budget-stat">
          <div>
            <h3 className={totalBudget - totalSpent - totalPending >= 0 ? 'positive' : 'negative'}>
              £{(totalBudget - totalSpent - totalPending).toFixed(2)}
            </h3>
            <p>Remaining</p>
          </div>
        </div>
      </div>

      {/* Category Progress Bars */}
      {budgetSummary.length > 0 && (
        <div className="category-progress-section">
          <h3>Budget Progress by Category</h3>
          <div className="progress-grid">
            {budgetSummary.map(cat => (
              <div key={cat.id} className="progress-card">
                <div className="progress-header">
                  <h4>{cat.name}</h4>
                  <span className="progress-amounts">
                    £{cat.spent.toFixed(2)} / £{cat.expected_budget?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar spent"
                    style={{
                      width: `${Math.min((cat.spent / (cat.expected_budget || 1)) * 100, 100)}%`
                    }}
                  />
                  <div 
                    className="progress-bar pending"
                    style={{
                      width: `${Math.min((cat.pending / (cat.expected_budget || 1)) * 100, 100)}%`,
                      left: `${Math.min((cat.spent / (cat.expected_budget || 1)) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="progress-legend">
                  <span className="legend-item spent">Spent: £{cat.spent.toFixed(2)}</span>
                  <span className="legend-item pending">Pending: £{cat.pending.toFixed(2)}</span>
                  <span className="legend-item remaining">
                    Remaining: £{cat.remaining.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!shoppingMode && (
        <>
          <div className="shopping-summary">
            <div className="summary-stat">
              <ShoppingCart size={24} color="#9fd3c7" />
              <div>
                <h3>{itemsNeeded}</h3>
                <p>Items Needed</p>
              </div>
            </div>
            <div className="summary-stat">
              <Check size={24} color="#4CAF50" />
              <div>
                <h3>{itemsPurchased}</h3>
                <p>Items Purchased</p>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filters">
              <div className="filter-group">
                <label>Priority:</label>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Budget Category:</label>
                <select 
                  value={filterBudgetCategory} 
                  onChange={(e) => setFilterBudgetCategory(e.target.value)}
                >
                  <option value="all">All Budget Categories</option>
                  {budgetCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Needed By:</label>
                <select 
                  value={filterNeededBy} 
                  onChange={(e) => setFilterNeededBy(e.target.value)}
                >
                  <option value="all">All Timeframes</option>
                  {neededByOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedItems.size > 0 && (
              <div className="bulk-actions">
                <span>{selectedItems.size} items selected</span>
                <button 
                  className="bulk-assign-button"
                  onClick={() => setShowBulkAssign(true)}
                >
                  Assign Budget Category
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Items Display */}
      {shoppingMode ? (
        <ShoppingModeView 
          items={filteredItems}
          budgetCategories={budgetCategories}
          togglePurchased={togglePurchased}
          budgetSummary={budgetSummary}
        />
      ) : (
        <div className="items-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                selectedItems={selectedItems}
                onToggleSelection={toggleItemSelection}
                onTogglePurchased={togglePurchased}
                onToggleStarred={toggleStarred}
                onEdit={editItem}
                onDelete={deleteItem}
                getPriorityIcon={getPriorityIcon}
              />
            ))
          ) : (
            <div className="no-items">
              <ShoppingCart size={48} color="#ccc" />
              <p>No items yet. Start adding items you'll need for your baby!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
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
        <AddItemModal
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

      {/* Bulk Assign Modal */}
      {showBulkAssign && (
        <BulkAssignModal
          budgetCategories={budgetCategories}
          bulkCategory={bulkCategory}
          setBulkCategory={setBulkCategory}
          onSave={bulkAssignCategory}
          onCancel={() => setShowBulkAssign(false)}
          selectedCount={selectedItems.size}
        />
      )}
    </div>
  );
}

// Shopping Mode Component
function ShoppingModeView({ items, budgetCategories, togglePurchased, budgetSummary }) {
  const groupedItems = budgetCategories.reduce((acc, budgetCat) => {
    const categoryItems = items.filter(item => 
      item.budget_category_id === budgetCat.id
    );
    if (categoryItems.length > 0) {
      acc[budgetCat.name] = categoryItems;
    }
    return acc;
  }, {});

  // Add uncategorised items
  const uncategorisedItems = items.filter(item => 
    !item.budget_category_id
  );
  if (uncategorisedItems.length > 0) {
    groupedItems['Uncategorised'] = uncategorisedItems;
  }

  return (
    <div className="shopping-mode">
      <div className="shopping-mode-header">
        <h2>Shopping Mode</h2>
        <p>Tap items to mark as purchased/unpurchased</p>
      </div>

      {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
        const budgetInfo = budgetSummary.find(cat => cat.name === categoryName);
        
        return (
          <div key={categoryName} className="shopping-category">
            <div className="shopping-category-header">
              <h3>{categoryName}</h3>
              {budgetInfo && (
                <div className="category-budget-info">
                  <span>Remaining: £{budgetInfo.remaining.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="shopping-items-list">
              {categoryItems.map(item => (
                <div 
                  key={item.id} 
                  className={`shopping-item ${item.purchased ? 'purchased' : ''}`}
                  onClick={() => togglePurchased(item)}
                >
                  <div className="shopping-item-content">
                    <h4>{item.item_name}</h4>
                    <div className="shopping-item-details">
                      <span className="quantity">Qty: {item.quantity}</span>
                      {item.price && (
                        <span className="price">£{item.price.toFixed(2)}</span>
                      )}
                      {item.price_source && (
                        <span className="source">from {item.price_source}</span>
                      )}
                      {item.purchased && (
                        <span className="purchased-label">✓ Purchased</span>
                      )}
                    </div>
                  </div>
                  <div className="shopping-item-action">
                    <div className={`checkbox ${item.purchased ? 'checked' : ''}`}>
                      {item.purchased && <Check size={16} />}
                    </div>
                  </div>
                </div>
              ))}
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

// Item Card Component
function ItemCard({ 
  item, 
  selectedItems, 
  onToggleSelection, 
  onTogglePurchased, 
  onToggleStarred, 
  onEdit, 
  onDelete, 
  getPriorityIcon 
}) {
  return (
    <div className={`item-card ${item.purchased ? 'purchased' : ''}`}>
      <div className="item-header">
        <div className="item-title-row">
          <input
            type="checkbox"
            checked={selectedItems.has(item.id)}
            onChange={() => onToggleSelection(item.id)}
            className="item-checkbox"
          />
          <h3>
            {item.item_name}
            {getPriorityIcon(item.priority)}
            {item.starred && <Star size={16} fill="#ffd700" />}
          </h3>
        </div>
        <div className="item-actions">
          <button 
            className="icon-button star"
            onClick={() => onToggleStarred(item)}
            title={item.starred ? 'Remove star' : 'Add star'}
          >
            <Star size={20} fill={item.starred ? '#ffd700' : 'none'} />
          </button>
          <button 
            className="icon-button edit"
            onClick={() => onEdit(item)}
            title="Edit item"
          >
            <Edit2 size={20} />
          </button>
          <button 
            className={`icon-button check ${item.purchased ? 'purchased' : ''}`}
            onClick={() => onTogglePurchased(item)}
            title={item.purchased ? 'Mark as needed' : 'Mark as purchased'}
          >
            <Check size={20} />
          </button>
          <button 
            className="icon-button delete"
            onClick={() => onDelete(item.id)}
            title="Delete item"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      <div className="item-details">
        <span className="quantity">Qty: {item.quantity}</span>
        <span className={`priority-tag ${item.priority}`}>
          {item.priority} priority
        </span>
        {item.budget_categories && (
          <span className="budget-category-tag">
            {item.budget_categories.name}
          </span>
        )}
        {item.needed_by && (
          <span className="needed-by-tag">
            Needed by: {item.needed_by}
          </span>
        )}
      </div>

      {item.price && (
        <div className="item-price">
          <span className="price">£{item.price.toFixed(2)}</span>
          {item.price_source && (
            <span className="price-source">from {item.price_source}</span>
          )}
        </div>
      )}

      {item.notes && (
        <p className="item-notes">{item.notes}</p>
      )}

      {item.links && (() => {
        try {
          return JSON.parse(item.links).length > 0;
        } catch {
          return false;
        }
      })() && (
        <div className="item-links">
          <strong>Links:</strong>
          <div className="links-list">
            {(() => {
              try {
                return JSON.parse(item.links);
              } catch {
                return [];
              }
            })().map((link, index) => (
              <div key={index} className="link-item">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.source || 'Link'}
                </a>
                {link.price && <span className="link-price">£{parseFloat(link.price).toFixed(2)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="item-footer">
        <span>Added by {item.profiles?.full_name || item.profiles?.email}</span>
      </div>
    </div>
  );
}

// Add Item Modal Component
function AddItemModal({ 
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
        <h2>{isEditing ? 'Edit Shopping List Item' : 'Add Shopping List Item'}</h2>
        
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
            <select
              value={newItem.budget_category_id}
              onChange={(e) => setNewItem({ ...newItem, budget_category_id: e.target.value })}
            >
              <option value="">Select budget category</option>
              {budgetCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>
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

// Bulk Assign Modal Component
function BulkAssignModal({ 
  budgetCategories, 
  bulkCategory, 
  setBulkCategory, 
  onSave, 
  onCancel, 
  selectedCount 
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <h2>Assign Budget Category</h2>
        <p>Assign budget category to {selectedCount} selected item{selectedCount > 1 ? 's' : ''}</p>
        
        <div className="form-group">
          <label>Budget Category</label>
          <select
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
          >
            <option value="">Select budget category</option>
            {budgetCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-button" onClick={onSave} disabled={!bulkCategory}>
            Assign Category
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingList;