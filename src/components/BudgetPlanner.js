import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Star, Check, Edit2, Trash2, Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import './BudgetPlanner.css';

function BudgetPlanner() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingBudget, setEditingBudget] = useState(null);
  const [newItem, setNewItem] = useState({
    item_name: '',
    category_id: '',
    price: '',
    price_source: '',
    starred: false
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    expected_budget: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  async function fetchCategories() {
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
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        .from('budget_items')
        .select(`
          *,
          budget_categories (
            name
          ),
          profiles!added_by (
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

  async function addCategory() {
    if (!newCategory.name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('budget_categories')
        .insert({
          name: newCategory.name,
          expected_budget: parseFloat(newCategory.expected_budget) || 0,
          family_id: profile.family_id
        });

      if (error) throw error;

      setNewCategory({ name: '', expected_budget: '' });
      setShowAddCategory(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
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

      const { error } = await supabase
        .from('budget_items')
        .insert({
          ...newItem,
          price: parseFloat(newItem.price) || 0,
          family_id: profile.family_id,
          added_by: user.id
        });

      if (error) throw error;

      setNewItem({
        item_name: '',
        category_id: '',
        price: '',
        price_source: '',
        starred: false
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
        .from('budget_items')
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
        .from('budget_items')
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
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async function updateCategoryBudget(categoryId, newBudget) {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .update({ expected_budget: parseFloat(newBudget) || 0 })
        .eq('id', categoryId);

      if (error) throw error;
      setEditingBudget(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  }

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category_id === filterCategory);

  const totalSpent = filteredItems
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const totalBudget = filterCategory === 'all'
    ? categories.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0)
    : categories.find(cat => cat.id === filterCategory)?.expected_budget || 0;

  const csvData = filteredItems.map(item => ({
    'Item Name': item.item_name,
    'Category': item.budget_categories?.name || 'Uncategorised',
    'Price': item.price || 0,
    'Price Source': item.price_source || '',
    'Starred': item.starred ? 'Yes' : 'No',
    'Purchased': item.purchased ? 'Yes' : 'No',
    'Added By': item.profiles?.full_name || item.profiles?.email || '',
    'Created': new Date(item.created_at).toLocaleDateString()
  }));

  if (loading) {
    return <div className="loading">Loading budget...</div>;
  }

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h1>Budget Planner</h1>
        <div className="budget-actions">
          <button className="add-button" onClick={() => setShowAddItem(true)}>
            <Plus size={16} /> Add Item
          </button>
          <button className="add-button secondary" onClick={() => setShowAddCategory(true)}>
            <Plus size={16} /> Add Category
          </button>
          <CSVLink 
            data={csvData} 
            filename="baby-budget.csv"
            className="export-button"
          >
            <Download size={16} /> Export CSV
          </CSVLink>
        </div>
      </div>

      <div className="budget-summary">
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="amount spent">£{totalSpent.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="amount budget">£{totalBudget.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <p className={`amount ${totalBudget - totalSpent >= 0 ? 'positive' : 'negative'}`}>
            £{(totalBudget - totalSpent).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="filter-section">
        <label>Filter by Category:</label>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div className="categories-section">
          <h2>Category Budgets</h2>
          <div className="categories-grid">
            {categories.map(cat => {
              const categoryItems = items.filter(item => item.category_id === cat.id);
              const categorySpent = categoryItems
                .filter(item => item.purchased)
                .reduce((sum, item) => sum + (item.price || 0), 0);
              
              return (
                <div key={cat.id} className="category-card">
                  <h4>{cat.name}</h4>
                  <div className="category-budget">
                    {editingBudget === cat.id ? (
                      <input
                        type="number"
                        defaultValue={cat.expected_budget}
                        onBlur={(e) => updateCategoryBudget(cat.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateCategoryBudget(cat.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span>Budget: £{cat.expected_budget?.toFixed(2) || '0.00'}</span>
                        <button 
                          className="edit-button"
                          onClick={() => setEditingBudget(cat.id)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="category-spent">
                    Spent: £{categorySpent.toFixed(2)}
                  </div>
                  <div className="category-progress">
                    <div 
                      className="progress-bar"
                      style={{
                        width: `${Math.min((categorySpent / (cat.expected_budget || 1)) * 100, 100)}%`,
                        backgroundColor: categorySpent > cat.expected_budget ? '#ff6b6b' : '#9fd3c7'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="items-section">
        <h2>Budget Items</h2>
        {filteredItems.length > 0 ? (
          <div className="items-list">
            {filteredItems.map(item => (
              <div key={item.id} className={`item-card ${item.purchased ? 'purchased' : ''}`}>
                <div className="item-header">
                  <h3>{item.item_name}</h3>
                  <div className="item-actions">
                    <button 
                      className="icon-button star"
                      onClick={() => toggleStarred(item)}
                    >
                      <Star size={16} fill={item.starred ? '#ffd700' : 'none'} />
                    </button>
                    <button 
                      className="icon-button check"
                      onClick={() => togglePurchased(item)}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="icon-button delete"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <span className="category-tag">
                    {item.budget_categories?.name || 'Uncategorised'}
                  </span>
                  <span className="price">£{item.price?.toFixed(2) || '0.00'}</span>
                  {item.price_source && (
                    <span className="price-source">from {item.price_source}</span>
                  )}
                </div>
                <div className="item-footer">
                  <span className="added-by">
                    Added by {item.profiles?.full_name || item.profiles?.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">No items yet. Start by adding your first budget item!</p>
        )}
      </div>

      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Budget Item</h2>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                placeholder="e.g., Pram"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newItem.category_id}
                onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
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

      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Category</h2>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Nursery Furniture"
              />
            </div>
            <div className="form-group">
              <label>Expected Budget</label>
              <input
                type="number"
                value={newCategory.expected_budget}
                onChange={(e) => setNewCategory({ ...newCategory, expected_budget: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowAddCategory(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={addCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPlanner;
