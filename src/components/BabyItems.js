import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Plus, Check, Trash2, AlertCircle } from 'lucide-react';
import './BabyItems.css';

function BabyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: '',
    quantity: 1,
    notes: '',
    priority: 'medium'
  });

  const categories = [
    'Clothing',
    'Feeding',
    'Sleeping',
    'Bathing',
    'Nappies & Changing',
    'Travel',
    'Toys & Entertainment',
    'Health & Safety',
    'Nursery',
    'Other'
  ];

  useEffect(() => {
    fetchItems();
  }, []);

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
    if (!newItem.item_name || !newItem.category) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('baby_items')
        .insert({
          ...newItem,
          family_id: profile.family_id,
          added_by: user.id
        });

      if (error) throw error;

      setNewItem({
        item_name: '',
        category: '',
        quantity: 1,
        notes: '',
        priority: 'medium'
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
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const itemsNeeded = filteredItems.filter(item => !item.purchased).length;
  const itemsPurchased = filteredItems.filter(item => item.purchased).length;

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertCircle size={16} color="#ff6b6b" />;
    return null;
  };

  if (loading) {
    return <div className="loading">Loading items...</div>;
  }

  return (
    <div className="baby-items-container">
      <div className="items-header">
        <h1>Baby Items List</h1>
        <button className="add-button" onClick={() => setShowAddItem(true)}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="items-summary">
        <div className="summary-stat">
          <Package size={24} color="#9fd3c7" />
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

      <div className="filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
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
      </div>

      <div className="items-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className={`item-card ${item.purchased ? 'purchased' : ''}`}>
              <div className="item-header">
                <h3>
                  {item.item_name}
                  {getPriorityIcon(item.priority)}
                </h3>
                <div className="item-actions">
                  <button 
                    className="icon-button check"
                    onClick={() => togglePurchased(item)}
                    title={item.purchased ? 'Mark as needed' : 'Mark as purchased'}
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    className="icon-button delete"
                    onClick={() => deleteItem(item.id)}
                    title="Delete item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="item-details">
                <span className="category-tag">{item.category}</span>
                <span className="quantity">Qty: {item.quantity}</span>
                <span className={`priority-tag ${item.priority}`}>
                  {item.priority} priority
                </span>
              </div>
              {item.notes && (
                <p className="item-notes">{item.notes}</p>
              )}
              <div className="item-footer">
                <span>Added by {item.profiles?.full_name || item.profiles?.email}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-items">
            <Package size={48} color="#ccc" />
            <p>No items yet. Start adding items you'll need for your baby!</p>
          </div>
        )}
      </div>

      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Baby Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                placeholder="e.g., Newborn onesies"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowAddItem(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={addItem}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BabyItems;
