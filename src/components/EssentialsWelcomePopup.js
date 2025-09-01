import React, { useState, useEffect } from 'react';
import { Package, Sparkles, Check, ShoppingCart, Baby } from 'lucide-react';

// Welcome popup for new users
const EssentialsWelcomePopup = ({ isOpen, onClose, onAddEssentials, isNewUser = false }) => {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;

  const handleAddEssentials = async () => {
    setLoading(true);
    await onAddEssentials();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-decoration">
          <Baby size={40} className="baby-icon" />
        </div>
        
        <div className="modal-header">
          <h2>
            <Sparkles className="sparkle-icon" />
            Welcome to Your Shopping List!
            <Sparkles className="sparkle-icon" />
          </h2>
          <p className="subtitle">Let's help you get started with the essentials</p>
        </div>

        <div className="modal-body">
          <div className="essentials-preview">
            <div className="preview-header">
              <Package size={24} />
              <h3>Baby Essentials Starter Pack</h3>
            </div>
            
            <p className="preview-description">
              We've curated <strong>48 must-have items</strong> based on advice from thousands of parents. 
              {isNewUser ? (
                <strong className="new-user-bonus">🎁 As a new user, you'll get ALL 48 items as a welcome gift - even on the free plan!</strong>
              ) : (
                'Perfect for first-time parents who want a comprehensive starting point!'
              )}
            </p>

            <div className="categories-grid">
              <div className="category-pill">
                <span className="pill-icon">🛁</span>
                <span>Bathing (2)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">🍼</span>
                <span>Feeding (10)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">👶</span>
                <span>Changing (8)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">👕</span>
                <span>Clothing (8)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">🛏️</span>
                <span>Sleeping (5)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">🏠</span>
                <span>Furniture (5)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">🏥</span>
                <span>Healthcare (6)</span>
              </div>
              <div className="category-pill">
                <span className="pill-icon">🧸</span>
                <span>Toys (3)</span>
              </div>
            </div>

            <div className="benefits-list">
              <div className="benefit">
                <Check size={16} className="check-icon" />
                <span>Save hours of research</span>
              </div>
              <div className="benefit">
                <Check size={16} className="check-icon" />
                <span>Curated by experienced parents</span>
              </div>
              <div className="benefit">
                <Check size={16} className="check-icon" />
                <span>Fully customisable - edit or remove any item</span>
              </div>
              <div className="benefit">
                <Check size={16} className="check-icon" />
                <span>Organised by budget categories</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Maybe Later
          </button>
          <button 
            className="btn-primary"
            onClick={handleAddEssentials}
            disabled={loading}
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                <ShoppingCart size={18} />
                Add Essential Items
              </>
            )}
          </button>
        </div>

        <p className="disclaimer">
          You can always add more items or remove ones you don't need
        </p>
      </div>
    </div>
  );
};

// Top-right button component
export const AddEssentialsButton = ({ onClick, hasImported }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Check if user has previously dismissed the button
  useEffect(() => {
    const dismissed = localStorage.getItem('essentials_button_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);
  
  const handleDismiss = (e) => {
    e.stopPropagation(); // Prevent triggering the main button click
    setIsDismissed(true);
    localStorage.setItem('essentials_button_dismissed', 'true');
  };
  
  // Hide if already imported, or if user dismissed it
  if (hasImported || isDismissed) return null;

  return (
    <button 
      className="add-essentials-btn"
      onClick={onClick}
      title="Add essential baby items to your list"
    >
      <Sparkles size={18} />
      <span>Add Essential Items</span>
      <button 
        className="dismiss-essentials-btn"
        onClick={handleDismiss}
        title="Hide this suggestion"
        aria-label="Dismiss"
      >
        ×
      </button>
    </button>
  );
};

export default EssentialsWelcomePopup;
