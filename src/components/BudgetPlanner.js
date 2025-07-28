import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { CSVLink } from 'react-csv';
import './BudgetPlanner.css';

function BudgetPlanner() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingBudget, setEditingBudget] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

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
        .from('baby_items')
        .select(`
          *,
          budget_categories!budget_category_id (
            name
          ),
          profiles!added_by (
            full_name,
            email
          )
        `)
        .eq('family_id', profile.family_id)
        .not('budget_category_id', 'is', null)
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
    : items.filter(item => item.budget_category_id === filterCategory);

  const totalSpent = filteredItems
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const totalPending = filteredItems
    .filter(item => !item.purchased)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const totalBudget = filterCategory === 'all'
    ? categories.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0)
    : categories.find(cat => cat.id === filterCategory)?.expected_budget || 0;

  const csvData = filteredItems.map(item => ({
    'Item Name': item.item_name,
    'Category': item.budget_categories?.name || 'Uncategorised',
    'Price': item.price || 0,
    'Price Source': item.price_source || '',
    'Notes': item.notes || '',
    'Links': (() => {
      try {
        return item.links ? JSON.parse(item.links).map(link => `${link.source}: ${link.url} (£${link.price})`).join('; ') : '';
      } catch {
        return '';
      }
    })(),
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
          <button className="add-button secondary" onClick={() => setShowAddCategory(true)}>
            <Plus size={16} /> Add Budget Category
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

      {/* Budget Overview Bar Chart */}
      <div className="budget-bar-chart">
        <div className="budget-header">
          <h3>Budget Overview</h3>
          <div className="budget-amounts">
            <span>£{totalSpent.toFixed(0)} spent of £{totalBudget.toFixed(0)} total</span>
          </div>
        </div>
        <div className="budget-bar-container">
          <div className="budget-bar-track">
            <div 
              className="budget-bar-segment spent"
              style={{ width: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%` }}
              title={`Spent: £${totalSpent.toFixed(2)}`}
            />
            <div 
              className="budget-bar-segment pending"
              style={{ 
                width: `${totalBudget > 0 ? (totalPending / totalBudget) * 100 : 0}%`,
                left: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%`
              }}
              title={`Pending: £${totalPending.toFixed(2)}`}
            />
          </div>
        </div>
        <div className="budget-legend">
          <div className="legend-item">
            <div className="legend-color spent"></div>
            <span>Spent: £{totalSpent.toFixed(0)}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>Pending: £{totalPending.toFixed(0)}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color remaining"></div>
            <span>Remaining: £{(totalBudget - totalSpent - totalPending).toFixed(0)}</span>
          </div>
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
          <h2>Budget Categories</h2>
          <div className="categories-grid">
            {categories.map(cat => {
              const categoryItems = items.filter(item => item.budget_category_id === cat.id);
              const categorySpent = categoryItems
                .filter(item => item.purchased)
                .reduce((sum, item) => sum + (item.price || 0), 0);
              const purchasedItems = categoryItems.filter(item => item.purchased);
              const remainingItems = categoryItems.filter(item => !item.purchased);
              const allCategoryItems = [...purchasedItems, ...remainingItems]; // Show purchased first, then remaining
              const percentage = cat.expected_budget > 0 ? (categorySpent / cat.expected_budget) * 100 : 0;
              const isOverBudget = categorySpent > cat.expected_budget;
              
              return (
                <div key={cat.id} className="category-ring-card">
                  <div className="category-ring-container">
                    {/* Circular Progress Ring */}
                    <div className="progress-ring">
                      <svg className="progress-ring-svg" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke="#f0f0f0"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          stroke={isOverBudget ? '#ff6b6b' : '#9fd3c7'}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.min(percentage, 100) * 3.14} 314`}
                          strokeDashoffset="0"
                          transform="rotate(-90 60 60)"
                          className="progress-circle"
                        />
                      </svg>
                      
                      {/* Center content */}
                      <div className="progress-center">
                        <div className="percentage">{Math.round(percentage)}%</div>
                        <div className="spent-amount">£{categorySpent.toFixed(0)}</div>
                      </div>
                      
                      {/* Edit button */}
                      <button 
                        className="edit-ring-button"
                        onClick={() => setEditingBudget(cat.id)}
                        title="Edit budget"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                    
                    {/* Category info */}
                    <div className="category-info">
                      <h4>{cat.name}</h4>
                      <div className="category-budget-info">
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
                            className="budget-edit-input"
                          />
                        ) : (
                          <>
                            <span className="budget-text">Budget: £{cat.expected_budget?.toFixed(0) || '0'}</span>
                            <span className="spent-text">Spent: £{categorySpent.toFixed(0)}</span>
                            <span className={`remaining-text ${isOverBudget ? 'over-budget' : ''}`}>
                              {isOverBudget ? 'Over by: ' : 'Remaining: '}
                              £{Math.abs(cat.expected_budget - categorySpent).toFixed(0)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Items dropdown - shows both purchased and remaining */}
                      {allCategoryItems.length > 0 && (
                        <div className="purchased-dropdown">
                          <button 
                            className="dropdown-toggle"
                            onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                          >
                            <span>
                              {purchasedItems.length} purchased, {remainingItems.length} remaining 
                              ({allCategoryItems.length} total)
                            </span>
                            {expandedCategory === cat.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          
                          {expandedCategory === cat.id && (
                            <div className="purchased-items-list">
                              {allCategoryItems.map(item => (
                                <div key={item.id} className={`category-item ${item.purchased ? 'purchased' : 'remaining'}`}>
                                  <div className="item-info">
                                    <span className="item-name">{item.item_name}</span>
                                    <div className="item-details">
                                      <span className="item-price">£{item.price?.toFixed(2) || '0.00'}</span>
                                      {item.price_source && (
                                        <span className="item-source">from {item.price_source}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className={`item-status ${item.purchased ? 'purchased' : 'remaining'}`}>
                                    {item.purchased ? '✓ Purchased' : 'Needed'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Budget Category</h2>
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
                Add Budget Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPlanner;
