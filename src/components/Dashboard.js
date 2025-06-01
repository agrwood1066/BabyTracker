import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Package, Gift, Briefcase, Heart, Baby, Clock } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [daysUntilDue, setDaysUntilDue] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      
      // Calculate pregnancy week and days until due
      if (profileData?.due_date) {
        const dueDate = new Date(profileData.due_date);
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
      
      // Fetch stats
      await fetchStats(profileData.family_id);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats(familyId) {
    try {
      // Budget stats
      const { data: budgetItems } = await supabase
        .from('budget_items')
        .select('price, purchased')
        .eq('family_id', familyId);
      
      const budgetTotal = budgetItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
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
      console.error('Error fetching stats:', error);
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {profile?.full_name || 'Parent-to-be'}!</h1>
        {daysUntilDue !== null && (
          <div className="pregnancy-info">
            <div className="info-card">
              <Calendar size={24} color="#d4a5d4" />
              <div>
                <p className="info-label">Days until due date</p>
                <p className="info-value">{daysUntilDue} days</p>
              </div>
            </div>
            <div className="info-card">
              <Baby size={24} color="#f5c2c7" />
              <div>
                <p className="info-label">Current week</p>
                <p className="info-value">Week {currentWeek}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="quick-stats">
        <Link to="/budget" className="stat-card">
          <div className="stat-icon">
            <DollarSign size={32} color="#9fd3c7" />
          </div>
          <div className="stat-content">
            <h3>Budget</h3>
            <p className="stat-value">£{stats.budget.spent.toFixed(2)}</p>
            <p className="stat-label">of £{stats.budget.total.toFixed(2)} spent</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${stats.budget.total > 0 ? (stats.budget.spent / stats.budget.total) * 100 : 0}%`,
                  backgroundColor: '#9fd3c7'
                }}
              />
            </div>
          </div>
        </Link>

        <Link to="/items" className="stat-card">
          <div className="stat-icon">
            <Package size={32} color="#b5d6f5" />
          </div>
          <div className="stat-content">
            <h3>Baby Items</h3>
            <p className="stat-value">{stats.babyItems.purchased}</p>
            <p className="stat-label">of {stats.babyItems.total} purchased</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${stats.babyItems.total > 0 ? (stats.babyItems.purchased / stats.babyItems.total) * 100 : 0}%`,
                  backgroundColor: '#b5d6f5'
                }}
              />
            </div>
          </div>
        </Link>

        <Link to="/wishlist" className="stat-card">
          <div className="stat-icon">
            <Gift size={32} color="#f5c2c7" />
          </div>
          <div className="stat-content">
            <h3>Wishlist</h3>
            <p className="stat-value">{stats.wishlist.purchased}</p>
            <p className="stat-label">of {stats.wishlist.total} received</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${stats.wishlist.total > 0 ? (stats.wishlist.purchased / stats.wishlist.total) * 100 : 0}%`,
                  backgroundColor: '#f5c2c7'
                }}
              />
            </div>
          </div>
        </Link>

        <Link to="/hospital-bag" className="stat-card">
          <div className="stat-icon">
            <Briefcase size={32} color="#ffd6a5" />
          </div>
          <div className="stat-content">
            <h3>Hospital Bag</h3>
            <p className="stat-value">{stats.hospitalBag.packed}</p>
            <p className="stat-label">of {stats.hospitalBag.total} packed</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${stats.hospitalBag.total > 0 ? (stats.hospitalBag.packed / stats.hospitalBag.total) * 100 : 0}%`,
                  backgroundColor: '#ffd6a5'
                }}
              />
            </div>
          </div>
        </Link>

        <Link to="/names" className="stat-card">
          <div className="stat-icon">
            <Heart size={32} color="#d4a5d4" />
          </div>
          <div className="stat-content">
            <h3>Baby Names</h3>
            <p className="stat-value">{stats.babyNames.total}</p>
            <p className="stat-label">names suggested</p>
          </div>
        </Link>
      </div>

      <div className="dashboard-tips">
        <h2>Quick Tips</h2>
        <div className="tips-grid">
          {currentWeek && currentWeek < 20 && (
            <div className="tip-card">
              <Clock size={20} color="#9fd3c7" />
              <p>Start planning your baby registry early to give friends and family time to shop!</p>
            </div>
          )}
          {currentWeek && currentWeek >= 28 && (
            <div className="tip-card">
              <Briefcase size={20} color="#ffd6a5" />
              <p>Time to start packing your hospital bag! Aim to have it ready by week 36.</p>
            </div>
          )}
          {stats.budget.spent > stats.budget.total * 0.8 && (
            <div className="tip-card">
              <DollarSign size={20} color="#ff6b6b" />
              <p>You're approaching your budget limit. Consider reviewing your spending priorities.</p>
            </div>
          )}
          {stats.babyNames.total === 0 && (
            <div className="tip-card">
              <Heart size={20} color="#d4a5d4" />
              <p>Start collecting baby name ideas! It's fun to see what names family members suggest.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
