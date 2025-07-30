import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

// Components
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import BudgetPlanner from './components/BudgetPlanner';
import ShoppingList from './components/ShoppingList';
import Wishlist from './components/Wishlist';
import HospitalBag from './components/HospitalBag';
import BabyNames from './components/BabyNames';
import Profile from './components/Profile';

// Legal Components (available to all users)
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!session ? (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <>
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/hospital-bag" element={<HospitalBag />} />
                <Route path="/names" element={<BabyNames />} />
                <Route path="/profile" element={<Profile />} />
                {/* Legal pages available to logged-in users too */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;