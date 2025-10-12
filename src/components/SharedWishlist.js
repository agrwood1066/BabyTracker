import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Gift, Check, ExternalLink, ArrowLeft, Calendar } from 'lucide-react';
import './SharedWishlist.css';

function SharedWishlist() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaserName, setPurchaserName] = useState('');
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [recentlyToggled, setRecentlyToggled] = useState(null);

  useEffect(() => {
    if (token) {
      loadSharedWishlist();
      loadShareInfo();
    }
  }, [token]);

  async function loadSharedWishlist() {
    try {
      const { data, error } = await supabase
        .rpc('get_shared_wishlist', { share_token: token });

      if (error) {
        if (error.message.includes('Invalid or expired')) {
          setError('This wishlist link is invalid or has expired.');
        } else {
          setError('Unable to load wishlist. Please check the link and try again.');
        }
        console.error('Error loading shared wishlist:', error);
        return;
      }

      setItems(data || []);
    } catch (error) {
      setError('Unable to load wishlist. Please check your internet connection.');
      console.error('Error loading shared wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadShareInfo() {
    try {
      const { data, error } = await supabase
        .rpc('get_share_info', { share_token: token });

      if (error) {
        console.error('Error loading share info:', error);
        return;
      }

      if (data && data.length > 0) {
        setShareInfo(data[0]);
      }
    } catch (error) {
      console.error('Error loading share info:', error);
    }
  }

  async function togglePurchased(item) {
    if (updatingItems.has(item.id)) return; // Prevent double-clicks

    // Add to updating set
    setUpdatingItems(prev => new Set([...prev, item.id]));

    try {
      const { data, error } = await supabase
        .rpc('update_shared_wishlist_item', {
          share_token: token,
          item_id: item.id,
          is_purchased: !item.purchased,
          purchaser_name: purchaserName || 'Anonymous'
        });

      if (error) {
        throw error;
      }

      if (data) {
        // Show confirmation message
        const wasPurchased = item.purchased;
        setRecentlyToggled({
          itemId: item.id,
          action: wasPurchased ? 'unmarked' : 'marked'
        });
        
        // Clear confirmation after 3 seconds
        setTimeout(() => {
          setRecentlyToggled(null);
        }, 3000);
        
        // Reload the wishlist to show updated status
        await loadSharedWishlist();
      } else {
        alert('Unable to update item. Please try again.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    } finally {
      // Remove from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  }

  const unpurchasedCount = items.filter(item => !item.purchased).length;
  const purchasedCount = items.filter(item => item.purchased).length;
  const familyName = shareInfo?.family_name || 'This Family';

  if (loading) {
    return (
      <div className="shared-wishlist-container">
        <div className="loading">
          <Gift size={48} />
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-wishlist-container">
        <div className="error-state">
          <Gift size={48} />
          <h2>Oops!</h2>
          <p>{error}</p>
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
            Go to Baby Steps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-wishlist-container">
      <div className="shared-wishlist-header">
        <div className="banner-content">
          <div className="icon-row">
            <div className="icon-circle">
              <Gift size={28} />
            </div>
          </div>
          <h1>{familyName}'s Baby Wishlist</h1>
          <p className="wishlist-subtitle">
            Help them celebrate their new arrival! Click items you've purchased to let them know.
          </p>
          
          <div className="banner-bottom-row">
            {/* Counter Widget */}
            <div className="counter-widget">
              <Gift size={32} className="counter-icon" />
              <div className="counter-value">{unpurchasedCount}</div>
              <div className="counter-label">Still Needed</div>
            </div>
            
            {/* Name Input Widget */}
            <div className="name-input-widget">
              <label htmlFor="purchaser-name">Your Name (optional)</label>
              <input
                id="purchaser-name"
                type="text"
                value={purchaserName}
                onChange={(e) => setPurchaserName(e.target.value)}
                placeholder="e.g., Sarah"
                className="purchaser-name-input"
              />
              <small>Helps them know who bought what!</small>
            </div>
          </div>
        </div>
      </div>

      <div className="shared-wishlist-grid">
        {items.length > 0 ? (
          items.map(item => (
            <div 
              key={item.id} 
              className={`shared-wishlist-card ${item.purchased ? 'purchased' : ''}`}
            >
              {/* Purchased Badge */}
              {item.purchased && (
                <div className="purchased-badge">
                  <Check size={12} />
                  Purchased
                  {item.purchased_by_name && (
                    <span className="purchased-by">by {item.purchased_by_name}</span>
                  )}
                </div>
              )}

              {/* Card Content */}
              <div className="card-content">
                <h3 className="card-title">{item.item_name}</h3>
                
                {item.price && (
                  <div className="card-price">£{parseFloat(item.price).toFixed(2)}</div>
                )}
                
                {item.description && (
                  <p className="card-description">{item.description}</p>
                )}
                
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-item-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    View Item
                  </a>
                )}

                <div className="card-meta">
                  <span className="added-by">
                    Added by {item.added_by_name || 'Family'}
                  </span>
                  <span className="added-date">
                    <Calendar size={12} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Purchase Button */}
                <div className="purchase-button-container">
                  {recentlyToggled?.itemId === item.id && (
                    <div className={`toggle-confirmation ${recentlyToggled.action}`}>
                      {recentlyToggled.action === 'marked' ? (
                        <>✓ Marked as purchased!</>
                      ) : (
                        <>↺ Unmarked - available again</>
                      )}
                    </div>
                  )}
                  <button 
                    className={`purchase-toggle-btn ${item.purchased ? 'purchased' : 'available'}`}
                    onClick={() => togglePurchased(item)}
                    disabled={updatingItems.has(item.id)}
                  >
                    {updatingItems.has(item.id) ? (
                      <span>Updating...</span>
                    ) : item.purchased ? (
                      <>
                        <Check size={16} />
                        Mark as Available
                      </>
                    ) : (
                      <>
                        <Gift size={16} />
                        I'll Get This!
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Gift size={64} />
            <h3>No items in this wishlist yet</h3>
            <p>The family hasn't added any items to their wishlist.</p>
          </div>
        )}
      </div>

      {/* Footer Information */}
      <div className="shared-wishlist-footer">
        <div className="footer-content">
          <div className="about-baby-steps">
            <h4>About Baby Steps</h4>
            <p>
              This wishlist was created using Baby Steps, a comprehensive pregnancy 
              and parenting planning app. Help expecting families stay organised with 
              shopping lists, budgets, and more.
            </p>
            <button 
              className="cta-button"
              onClick={() => navigate('/signup')}
            >
              Create Your Own Baby Planner
            </button>
          </div>
          
          <div className="share-info">
            <h4>How This Works</h4>
            <ul>
              <li>✅ Click "I'll Get This!" to mark items you'll purchase</li>
              <li>👥 Others can see what's already been claimed</li>
              <li>💝 No duplicate gifts - everyone wins!</li>
              <li>🔒 Your actions are anonymous unless you add your name above</li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <p>
            <small>
              This is a shared wishlist. These are only intended to be suggestions of items that we love, but please feel free to go "off list" xxx
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SharedWishlist;