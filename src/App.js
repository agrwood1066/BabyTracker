import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './supabaseClient';
import { SubscriptionProvider } from './hooks/useSubscription';
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
import ParentingVows from './components/ParentingVows';
import AppointmentCalendar from './components/AppointmentCalendar';
import SubscriptionTest from './components/SubscriptionTest';
import SubscriptionSuccess from './components/SubscriptionSuccess';
import SubscriptionActivation from './components/SubscriptionActivation';
import InfluencerDashboard from './components/InfluencerDashboard';
import ResetPassword from './components/ResetPassword';
import PromoLanding from './components/PromoLanding';
import InfluencerSignup from './components/InfluencerSignup';
import DebugAuth from './components/DebugAuth';

// Legal Components (available to all users)
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';

// Blog Components (available to all users)
import Blog from './components/blog/Blog';
import BlogPost from './components/blog/BlogPost';
import BlogAdmin from './components/blog/BlogAdmin';

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
    <HelmetProvider>
      <SubscriptionProvider>
        <Router>
          <div className="App">
        {!session ? (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/activate" element={<SubscriptionActivation />} />
            <Route path="/debug-auth" element={<DebugAuth />} />
            <Route path="/influencer/:code" element={<InfluencerDashboard />} />
            {/* <Route path="/with/:code" element={<PromoLanding />} /> */}
            <Route path="/influencer-signup" element={<InfluencerSignup />} />
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
                <Route path="/appointments" element={<AppointmentCalendar />} />
                <Route path="/parenting-vows" element={<ParentingVows />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/subscription-test" element={<SubscriptionTest />} />
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                <Route path="/subscription/activate" element={<SubscriptionActivation />} />
                <Route path="/influencer/:code" element={<InfluencerDashboard />} />
                {/* Blog pages available to logged-in users too */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin/blog" element={<BlogAdmin />} />
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
      </SubscriptionProvider>
    </HelmetProvider>
  );
}

export default App;