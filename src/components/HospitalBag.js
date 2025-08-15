import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Briefcase, Plus, Check, Trash2, Baby, UserCheck, Users, Edit2 } from 'lucide-react';
import './HospitalBag.css';

function HospitalBag() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterFor, setFilterFor] = useState('all');
  const [newItem, setNewItem] = useState({
    item_name: '',
    for_whom: 'mum',
    category: '',
    quantity: 1,
    notes: ''
  });

  const categories = {
    mum: [
      'Clothing',
      'Toiletries',
      'Comfort Items',
      'Documents',
      'Snacks & Drinks',
      'Entertainment',
      'Post-birth Items',
      'Other'
    ],
    baby: [
      'Clothing',
      'Nappies & Changing',
      'Feeding',
      'Blankets & Swaddles',
      'Health & Safety',
      'Going Home Outfit',
      'Other'
    ],
    partner: [
      'Clothing',
      'Toiletries',
      'Snacks & Drinks',
      'Entertainment',
      'Comfort Items',
      'Other'
    ]
  };

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
        .from('hospital_bag_items')
        .select(`
          *,
          profiles!added_by (
            full_name,
            email
          )
        `)
        .eq('family_id', profile.family_id)
        .order('for_whom')
        .order('category')
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
        .from('hospital_bag_items')
        .insert({
          ...newItem,
          family_id: profile.family_id,
          added_by: user.id
        });

      if (error) throw error;

      setNewItem({
        item_name: '',
        for_whom: 'mum',
        category: '',
        quantity: 1,
        notes: ''
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
      for_whom: item.for_whom,
      category: item.category,
      quantity: item.quantity,
      notes: item.notes || ''
    });
    setShowEditItem(true);
  }

  async function updateItem() {
    if (!newItem.item_name || !newItem.category || !editingItem) return;

    try {
      const { error } = await supabase
        .from('hospital_bag_items')
        .update({
          item_name: newItem.item_name,
          for_whom: newItem.for_whom,
          category: newItem.category,
          quantity: newItem.quantity,
          notes: newItem.notes
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setNewItem({
        item_name: '',
        for_whom: 'mum',
        category: '',
        quantity: 1,
        notes: ''
      });
      setShowEditItem(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  }

  async function togglePacked(item) {
    try {
      const { error } = await supabase
        .from('hospital_bag_items')
        .update({ packed: !item.packed })
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
        .from('hospital_bag_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  const filteredItems = filterFor === 'all' 
    ? items 
    : items.filter(item => item.for_whom === filterFor);

  const getProgress = (forWhom) => {
    const relevantItems = forWhom === 'all' ? items : items.filter(item => item.for_whom === forWhom);
    const packed = relevantItems.filter(item => item.packed).length;
    const total = relevantItems.length;
    return total > 0 ? Math.round((packed / total) * 100) : 0;
  };

  const getIcon = (forWhom) => {
    switch (forWhom) {
      case 'mum': return <UserCheck size={20} />;
      case 'baby': return <Baby size={20} />;
      case 'partner': return <Users size={20} />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading hospital bag...</div>;
  }

  return (
    <div className="hospital-bag-container">
      <div className="bag-header">
        <h1>Hospital Bag Checklist</h1>
      </div>

      <div className="progress-cards">
        <div className="progress-card">
          <div className="progress-header">
            <Briefcase size={24} color="#9fd3c7" />
            <h3>Overall Progress</h3>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgress('all')}%` }} />
          </div>
          <p className="progress-text">{getProgress('all')}% Packed</p>
        </div>
        <div className="progress-card">
          <div className="progress-header">
            <UserCheck size={24} color="#f5c2c7" />
            <h3>Mum's Items</h3>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgress('mum')}%` }} />
          </div>
          <p className="progress-text">{getProgress('mum')}% Packed</p>
        </div>
        <div className="progress-card">
          <div className="progress-header">
            <Baby size={24} color="#b5d6f5" />
            <h3>Baby's Items</h3>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgress('baby')}%` }} />
          </div>
          <p className="progress-text">{getProgress('baby')}% Packed</p>
        </div>
        <div className="progress-card">
          <div className="progress-header">
            <Users size={24} color="#ffd6a5" />
            <h3>Partner's Items</h3>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgress('partner')}%` }} />
          </div>
          <p className="progress-text">{getProgress('partner')}% Packed</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filterFor === 'all' ? 'active' : ''}`}
          onClick={() => setFilterFor('all')}
        >
          All Items
        </button>
        <button 
          className={`filter-tab ${filterFor === 'mum' ? 'active' : ''}`}
          onClick={() => setFilterFor('mum')}
        >
          <UserCheck size={16} /> Mum
        </button>
        <button 
          className={`filter-tab ${filterFor === 'baby' ? 'active' : ''}`}
          onClick={() => setFilterFor('baby')}
        >
          <Baby size={16} /> Baby
        </button>
        <button 
          className={`filter-tab ${filterFor === 'partner' ? 'active' : ''}`}
          onClick={() => setFilterFor('partner')}
        >
          <Users size={16} /> Partner
        </button>
      </div>

      <div className="items-list">
        {filteredItems.length > 0 ? (
          <>
            {Object.entries(
              filteredItems.reduce((acc, item) => {
                const cat = item.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
              }, {})
            ).map(([category, categoryItems]) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
                <div className="category-items">
                  {categoryItems.map(item => (
                    <div key={item.id} className={`bag-item ${item.packed ? 'packed' : ''}`}>
                      <div className="item-check">
                        <button 
                          className="check-button"
                          onClick={() => togglePacked(item)}
                        >
                          <Check size={20} />
                        </button>
                      </div>
                      <div className="item-details">
                        <h4>
                          {item.item_name}
                          {getIcon(item.for_whom)}
                        </h4>
                        <div className="item-meta">
                          <span className="quantity">Qty: {item.quantity}</span>
                          {item.notes && <span className="notes">{item.notes}</span>}
                        </div>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="edit-button"
                          onClick={() => editItem(item)}
                          title="Edit item"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => deleteItem(item.id)}
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="no-items">
            <Briefcase size={48} color="#ccc" />
            <p>No items in your hospital bag yet!</p>
            <p>Start adding items to pack for your hospital stay.</p>
          </div>
        )}
      </div>

      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Hospital Bag Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                placeholder="e.g., Comfortable pyjamas"
              />
            </div>
            <div className="form-group">
              <label>For Whom *</label>
              <select
                value={newItem.for_whom}
                onChange={(e) => setNewItem({ ...newItem, for_whom: e.target.value, category: '' })}
              >
                <option value="mum">Mum</option>
                <option value="baby">Baby</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories[newItem.for_whom].map(cat => (
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

      {showEditItem && (
        <div className="modal-overlay" onClick={() => setShowEditItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Hospital Bag Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                placeholder="e.g., Comfortable pyjamas"
              />
            </div>
            <div className="form-group">
              <label>For Whom *</label>
              <select
                value={newItem.for_whom}
                onChange={(e) => setNewItem({ ...newItem, for_whom: e.target.value, category: '' })}
              >
                <option value="mum">Mum</option>
                <option value="baby">Baby</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories[newItem.for_whom].map(cat => (
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
              <label>Notes</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => {
                setShowEditItem(false);
                setEditingItem(null);
              }}>
                Cancel
              </button>
              <button className="save-button" onClick={updateItem}>
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        className="fab-add" 
        onClick={() => setShowAddItem(true)}
        title="Add Item"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default HospitalBag;
