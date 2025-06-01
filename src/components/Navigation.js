import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Baby,
  Home,
  DollarSign,
  ShoppingCart,
  Gift,
  Briefcase,
  Heart,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/budget', icon: DollarSign, label: 'Budget' },
    { path: '/items', icon: ShoppingCart, label: 'Baby Items' },
    { path: '/wishlist', icon: Gift, label: 'Wishlist' },
    { path: '/hospital-bag', icon: Briefcase, label: 'Hospital Bag' },
    { path: '/names', icon: Heart, label: 'Baby Names' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

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
            <span>Simply Pregnancy</span>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`nav-menu ${mobileMenuOpen ? 'nav-menu-open' : ''}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <button
              className="nav-item nav-item-signout"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
