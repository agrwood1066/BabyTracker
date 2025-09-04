import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useInfluencer } from '../hooks/useInfluencer';
import {
  Baby,
  Home,
  DollarSign,
  ShoppingCart,
  Gift,
  Briefcase,
  Heart,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  BarChart3
} from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const { isInfluencer, getInfluencerDashboardUrl } = useInfluencer();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard', priority: 1 },
    { path: '/budget', icon: DollarSign, label: 'Budget', priority: 2 },
    { path: '/shopping-list', icon: ShoppingCart, label: 'Shopping', priority: 3 },
    { path: '/wishlist', icon: Gift, label: 'Wishlist', priority: 5 },
    { path: '/hospital-bag', icon: Briefcase, label: 'Hospital Bag', priority: 6 },
    { path: '/names', icon: Heart, label: 'Baby Names', priority: 4 },
    { path: '/appointments', icon: Calendar, label: 'Appointments', priority: 7 },
    { path: '/parenting-vows', icon: MessageSquare, label: 'Parenting Vows', priority: 8 },
    { path: '/profile', icon: User, label: 'Profile', priority: 9 }
  ];

  // Priority items to show in main nav (top 5 by priority)
  const priorityItems = navItems
    .filter(item => item.priority <= 5)
    .sort((a, b) => a.priority - b.priority);

  // Check if we need compact mode based on viewport width
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      setIsCompactMode(width < 1280 && width >= 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Baby size={32} />
            <span className="nav-logo-text">Baby Steps</span>
          </Link>

          {/* Desktop Priority Navigation - Hidden on mobile */}
          <div className="desktop-nav-items">
            {priorityItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''} ${isCompactMode ? 'nav-item-compact' : ''}`}
                  title={isCompactMode ? item.label : ''}
                >
                  <Icon size={20} />
                  {!isCompactMode && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Hamburger Menu - Always visible */}
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Slide-out Menu */}
          <div className={`slide-menu ${mobileMenuOpen ? 'slide-menu-open' : ''}`}>
            <div className="slide-menu-header">
              <h3>Navigation</h3>
            </div>
            
            <div className="slide-menu-items">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`slide-menu-item ${isActive(item.path) ? 'slide-menu-item-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Influencer Dashboard Link - only show for influencers */}
              {isInfluencer && getInfluencerDashboardUrl() && (
                <Link
                  to={getInfluencerDashboardUrl()}
                  className={`slide-menu-item ${location.pathname.includes('/influencer/') ? 'slide-menu-item-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 size={20} />
                  <span>Metrics</span>
                </Link>
              )}
              
              <button
                className="slide-menu-item slide-menu-item-signout"
                onClick={handleSignOut}
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;