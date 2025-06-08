import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Gift, Plus, ExternalLink, Share2, Check, Trash2 } from 'lucide-react';
import './Wishlist.css';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    link: '',
    price: ''
  });

  useEffect(() => {
    fetchItems();
    checkShareLink();
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
      const { data: babyItem, error: babyItemError } = await supabase
        .from('baby_items')
        .insert({
          item_name: newItem.item_name,
          quantity: 1,
          notes: newItem.description || '',
          priority: 'medium',
          price: parseFloat(newItem.price) || null,
          price_source: newItem.link ? 'Wishlist Link' : null,
          starred: false, // Don't auto-star, let wishlist detection handle visual indicators
          links: newItem.link ? JSON.stringify([{
            url: newItem.link,
            source: 'Wishlist Link',
            price: newItem.price || ''
          }]) : null,
          family_id: profile.family_id,
          added_by: user.id
        })
        .select()
        .single();

      if (babyItemError) throw babyItemError;

      // Then, create the item in wishlist_items (Wishlist)
      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .insert({
          ...newItem,
          price: parseFloat(newItem.price) || null,
          family_id: profile.family_id,
          added_by: user.id,
          is_public: true
        });

      if (wishlistError) throw wishlistError;

      setNewItem({
        item_name: '',
        description: '',
        link: '',
        price: ''
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

      <div className="wishlist-grid">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className={`wishlist-item ${item.purchased ? 'purchased' : ''}`}>
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
          ))
        ) : (
          <div className="no-items">
            <Gift size={48} color="#ccc" />
            <p>No items in your wishlist yet!</p>
            <p>Add items you'd love to receive for your baby shower.</p>
          </div>
        )}
      </div>

      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Wishlist Item</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                placeholder="e.g., Baby Monitor"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Add any details about colour, size, brand preferences..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Link to Item</label>
              <input
                type="url"
                value={newItem.link}
                onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>Price (approximate)</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
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

export default Wishlist;
