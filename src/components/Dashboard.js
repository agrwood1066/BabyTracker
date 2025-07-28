import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Package, Gift, Briefcase, Heart, Baby, Clock, Users, Sparkles } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    budget: { total: 0, spent: 0 },
    babyItems: { total: 0, purchased: 0 },
    wishlist: { total: 0, purchased: 0 },
    hospitalBag: { total: 0, packed: 0 },
    babyNames: { total: 0 }
  });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysUntilDue, setDaysUntilDue] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        let currentProfile = profileData;
        
        // If profile doesn't exist, create it
        if (profileError || !profileData) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Profile not found, checking for existing family data...');
          }
          
          // Check if user has existing data under their user ID
          const { data: existingItems } = await supabase
            .from('baby_items')
            .select('family_id')
            .eq('added_by', user.id)
            .limit(1);
          
          let familyId;
          if (existingItems && existingItems.length > 0) {
            // User has existing data, use that family_id
            familyId = existingItems[0].family_id;
            if (process.env.NODE_ENV === 'development') {
              console.log('Found existing data, using family_id:', familyId);
            }
          } else {
            // New user, create new family_id
            familyId = self.crypto.randomUUID();
            if (process.env.NODE_ENV === 'development') {
              console.log('New user, created family_id:', familyId);
            }
          }
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              family_id: familyId
            })
            .select()
            .single();
          
          if (createError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error creating profile:', createError);
            }
            throw createError;
          }
          
          currentProfile = newProfile;
        }
        
        setProfile(currentProfile);
        
        // Calculate pregnancy week and days until due
        if (currentProfile?.due_date) {
          const dueDate = new Date(currentProfile.due_date);
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysUntilDue(diffDays);
          
          // Calculate current week (assuming 40 weeks total)
          const totalDays = 280; // 40 weeks * 7 days
          const daysPregnant = totalDays - diffDays;
          const weeksPregnant = Math.floor(daysPregnant / 7);
          setCurrentWeek(weeksPregnant > 0 ? weeksPregnant : 0);
        }
        
        // Fetch family members
        if (currentProfile?.family_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('family_id', currentProfile.family_id)
            .neq('id', user.id);
          setFamilyMembers(members || []);
        }
        
        // Fetch stats
        await fetchStats(currentProfile?.family_id);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching data:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  async function fetchStats(familyId) {
    // Don't fetch stats if no family ID
    if (!familyId) {
      setStats({
        budget: { total: 0, spent: 0 },
        babyItems: { total: 0, purchased: 0 },
        wishlist: { total: 0, purchased: 0 },
        hospitalBag: { total: 0, packed: 0 },
        babyNames: { total: 0 }
      });
      return;
    }
    
    try {
      // Budget stats - get total budget from categories and spending from baby items
      const { data: budgetCategories } = await supabase
        .from('budget_categories')
        .select('expected_budget')
        .eq('family_id', familyId);
      
      const { data: budgetItems } = await supabase
        .from('baby_items')
        .select('price, purchased')
        .eq('family_id', familyId)
        .not('budget_category_id', 'is', null);
      
      const budgetTotal = budgetCategories?.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0) || 0;
      const budgetSpent = budgetItems?.filter(item => item.purchased)
        .reduce((sum, item) => sum + (item.price || 0), 0) || 0;
      
      // Baby items stats
      const { data: babyItems } = await supabase
        .from('baby_items')
        .select('purchased')
        .eq('family_id', familyId);
      
      const babyItemsTotal = babyItems?.length || 0;
      const babyItemsPurchased = babyItems?.filter(item => item.purchased).length || 0;
      
      // Wishlist stats
      const { data: wishlistItems } = await supabase
        .from('wishlist_items')
        .select('purchased')
        .eq('family_id', familyId);
      
      const wishlistTotal = wishlistItems?.length || 0;
      const wishlistPurchased = wishlistItems?.filter(item => item.purchased).length || 0;
      
      // Hospital bag stats
      const { data: hospitalBagItems } = await supabase
        .from('hospital_bag_items')
        .select('packed')
        .eq('family_id', familyId);
      
      const hospitalBagTotal = hospitalBagItems?.length || 0;
      const hospitalBagPacked = hospitalBagItems?.filter(item => item.packed).length || 0;
      
      // Baby names stats
      const { count: babyNamesCount } = await supabase
        .from('baby_names')
        .select('id', { count: 'exact' })
        .eq('family_id', familyId);
      
      setStats({
        budget: { total: budgetTotal, spent: budgetSpent },
        babyItems: { total: babyItemsTotal, purchased: babyItemsPurchased },
        wishlist: { total: wishlistTotal, purchased: wishlistPurchased },
        hospitalBag: { total: hospitalBagTotal, packed: hospitalBagPacked },
        babyNames: { total: babyNamesCount || 0 }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching stats:', error);
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {profile?.full_name || 'Parent-to-be'}! ✨</h1>
            <p className="tagline">Your pregnancy journey is looking amazing</p>
          </div>
          
          {familyMembers.length > 0 && (
            <div className="family-indicator">
              <Users size={16} />
              <span>Sharing with {familyMembers.length} family member{familyMembers.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {daysUntilDue !== null && (
          <div className="pregnancy-info">
            <div className="info-card highlight">
              <div className="info-icon">
                <Calendar size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Days until due date</p>
                <p className="info-value">{daysUntilDue} days</p>
              </div>
            </div>
            <div className="info-card highlight">
              <div className="info-icon">
                <Baby size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Current week</p>
                <p className="info-value">Week {currentWeek}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="quick-stats">
        <Link to="/budget" className="stat-card budget">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <h3>Budget</h3>
            <p className="stat-value">£{stats.budget.spent.toFixed(0)}</p>
            <p className="stat-label">of £{stats.budget.total.toFixed(0)} spent</p>
            <div className="stat-percentage">
              {stats.budget.total > 0 ? Math.round((stats.budget.spent / stats.budget.total) * 100) : 0}% used
            </div>
          </div>
          <div className="card-sparkle">
            <Sparkles size={16} />
          </div>
        </Link>

        <Link to="/shopping-list" className="stat-card items">
          <div className="stat-icon">
            <Package size={28} />
          </div>
          <div className="stat-content">
            <h3>Baby Items</h3>
            <p className="stat-value">{stats.babyItems.purchased}</p>
            <p className="stat-label">of {stats.babyItems.total} collected</p>
            <div className="stat-percentage">
              {stats.babyItems.total > 0 ? Math.round((stats.babyItems.purchased / stats.babyItems.total) * 100) : 0}% complete
            </div>
          </div>
          <div className="card-sparkle">
            <Sparkles size={16} />
          </div>
        </Link>

        <Link to="/wishlist" className="stat-card wishlist">
          <div className="stat-icon">
            <Gift size={28} />
          </div>
          <div className="stat-content">
            <h3>Wishlist</h3>
            <p className="stat-value">{stats.wishlist.purchased}</p>
            <p className="stat-label">of {stats.wishlist.total} received</p>
            <div className="stat-percentage">
              {stats.wishlist.total > 0 ? Math.round((stats.wishlist.purchased / stats.wishlist.total) * 100) : 0}% gifted
            </div>
          </div>
          <div className="card-sparkle">
            <Sparkles size={16} />
          </div>
        </Link>

        <Link to="/hospital-bag" className="stat-card hospital">
          <div className="stat-icon">
            <Briefcase size={28} />
          </div>
          <div className="stat-content">
            <h3>Hospital Bag</h3>
            <p className="stat-value">{stats.hospitalBag.packed}</p>
            <p className="stat-label">of {stats.hospitalBag.total} packed</p>
            <div className="stat-percentage">
              {stats.hospitalBag.total > 0 ? Math.round((stats.hospitalBag.packed / stats.hospitalBag.total) * 100) : 0}% ready
            </div>
          </div>
          <div className="card-sparkle">
            <Sparkles size={16} />
          </div>
        </Link>

        <Link to="/names" className="stat-card names">
          <div className="stat-icon">
            <Heart size={28} />
          </div>
          <div className="stat-content">
            <h3>Baby Names</h3>
            <p className="stat-value">{stats.babyNames.total}</p>
            <p className="stat-label">names suggested</p>
            <div className="stat-percentage">
              {stats.babyNames.total > 0 ? 'Ideas flowing!' : 'Get started'}
            </div>
          </div>
          <div className="card-sparkle">
            <Sparkles size={16} />
          </div>
        </Link>
      </div>

      <div className="dashboard-tips">
        <h2><Clock size={20} /> Quick Tips & Progress</h2>
        <div className="tips-grid">
          {currentWeek && currentWeek < 20 && (
            <div className="tip-card early">
              <Clock size={20} />
              <div>
                <h4>Early Preparation</h4>
                <p>Perfect time to start planning your baby registry. Give friends and family time to shop!</p>
              </div>
            </div>
          )}
          {currentWeek && currentWeek >= 28 && (
            <div className="tip-card urgent">
              <Briefcase size={20} />
              <div>
                <h4>Hospital Bag Time</h4>
                <p>Start packing your hospital bag! Aim to have it ready by week 36.</p>
              </div>
            </div>
          )}
          {stats.budget.spent > stats.budget.total * 0.8 && (
            <div className="tip-card warning">
              <DollarSign size={20} />
              <div>
                <h4>Budget Check</h4>
                <p>You're approaching your budget limit. Consider reviewing your spending priorities.</p>
              </div>
            </div>
          )}
          {stats.babyNames.total === 0 && (
            <div className="tip-card suggestion">
              <Heart size={20} />
              <div>
                <h4>Name Ideas</h4>
                <p>Start collecting baby name ideas! It's fun to see what family members suggest.</p>
              </div>
            </div>
          )}
          {familyMembers.length > 0 && (
            <div className="tip-card family">
              <Users size={20} />
              <div>
                <h4>Family Collaboration</h4>
                <p>Great! You're sharing this journey with {familyMembers.length} family member{familyMembers.length > 1 ? 's' : ''}. Everyone can contribute!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
