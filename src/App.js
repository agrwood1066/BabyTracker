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
import SharedWishlist from './components/SharedWishlist';

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
  const [profileChecked, setProfileChecked] = useState(false);

  // CRITICAL: Ensure profile exists whenever we have a session
  const ensureProfileExists = async (user) => {
    try {
      console.log('🔍 App.js: Checking profile for user:', user.email);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, family_id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile && !checkError) {
        console.log('✓ App.js: Profile exists');
        return true;
      }

      // Profile doesn't exist, create it
      console.log('⚠️ App.js: Profile missing, creating...');
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            subscription_status: 'trial',
            subscription_plan: 'free',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ])
        .select()
        .single();

      if (newProfile && !insertError) {
        console.log('✓ App.js: Profile created successfully');
        return true;
      }

      // If we got a conflict error (23505), profile was created by trigger
      if (insertError?.code === '23505') {
        console.log('✓ App.js: Profile already exists (created by trigger)');
        return true;
      }

      console.error('❌ App.js: Failed to create profile:', insertError);
      return false;
      
    } catch (error) {
      console.error('❌ App.js: Error in ensureProfileExists:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      // If we have a session, ensure profile exists
      if (session?.user) {
        await ensureProfileExists(session.user);
        setProfileChecked(true);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      
      setSession(session);
      
      // If user just signed in or signed up, ensure profile exists
      if (session?.user && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
        console.log('🔄 Auth event triggered, ensuring profile exists...');
        await ensureProfileExists(session.user);
        setProfileChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || (session && !profileChecked)) {
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
            <Route path="/signup" element={<PromoLanding />} />
            <Route path="/with/:code" element={<PromoLanding />} />
            <Route path="/influencer-signup" element={<InfluencerSignup />} />
            <Route path="/wishlist/:token" element={<SharedWishlist />} />
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
