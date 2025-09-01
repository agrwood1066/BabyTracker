import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Package, Gift, Briefcase, Heart, Baby, Users, Sparkles, FileText, Lock, Clock, ChevronRight } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import AppointmentWidget from './AppointmentWidget';
import './Dashboard.css';

// Promo Status Banner Component
const PromoStatusBanner = ({ setShowPaywall, setPaywallTrigger }) => {
  const [promoStatus, setPromoStatus] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setSubscription(profile);

    // Check promo status
    const { data: promo } = await supabase
      .rpc('get_user_promo_status', {
        p_user_id: user.id
      });
    
    setPromoStatus(promo);
  };

  // Show promo banner for free users with pending promo
  if (subscription?.subscription_status === 'free' && promoStatus?.has_promo && promoStatus?.status === 'pending') {
    return (
      <div className="status-banner promo-available">
        <div className="banner-content">
          <Gift size={20} />
          <span>
            🎉 You have {promoStatus.total_free_days} days free waiting! 
            Activate your special offer to unlock all Premium features.
          </span>
          <button 
            className="activate-btn"
            onClick={() => navigate('/subscribe')}
          >
            Activate Offer
          </button>
        </div>
      </div>
    );
  }

  // Show trial status for trial users
  if (subscription?.subscription_status === 'trial') {
    const daysLeft = Math.ceil(
      (new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    return (
      <div className="status-banner trial-active">
        <div className="banner-content">
          <Clock size={20} />
          <span>
            Premium Trial Active • {daysLeft} days remaining
            {promoStatus?.free_months > 0 && ` (includes ${promoStatus.free_months} month${promoStatus.free_months > 1 ? 's' : ''} free)`}
          </span>
        </div>
      </div>
    );
  }

  // Show free tier limits
  if (subscription?.subscription_status === 'free') {
    return (
      <div className="status-banner free-tier">
        <div className="banner-content">
          <span>Free Plan • 10 items • 3 budgets • 5 names</span>
          <button 
            className="upgrade-btn"
            onClick={() => {
              setPaywallTrigger('limit');
              setShowPaywall(true);
            }}
          >
            Start 14-Day Trial
          </button>
        </div>
      </div>
    );
  }

  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    budget: { total: 0, spent: 0 },
    babyItems: { total: 0, purchased: 0 },
    wishlist: { total: 0, purchased: 0 },
    hospitalBag: { total: 0, packed: 0 },
    babyNames: { total: 0 },
    parentingVows: { total: 0 }
  });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysUntilDue, setDaysUntilDue] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('limit');
  
  // Subscription hook
  const { 
    isPremium,
    getDaysLeftInTrial,
    getSubscriptionInfo,
    hasFeature,
    promoStatus,
    checkPromoStatus
  } = useSubscription();

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
          const familyId = crypto.randomUUID();
          
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
        
        // Fetch stats
        await fetchAllStats(currentProfile);
        
        // Fetch family members
        await fetchFamilyMembers(currentProfile);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  async function fetchAllStats(currentProfile) {
    try {
      const familyId = currentProfile.family_id;
      
      // Budget stats
      const { data: budgetCategories } = await supabase
        .from('budget_categories')
        .select('expected_budget')
        .eq('family_id', familyId);
        
      const { data: budgetItems } = await supabase
        .from('baby_items')
        .select('price, purchased')
        .eq('family_id', familyId)
        .not('price', 'is', null);
      
      const totalBudget = budgetCategories?.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0) || 0;
      const totalSpent = budgetItems?.filter(item => item.purchased)
        .reduce((sum, item) => sum + (item.price || 0), 0) || 0;
      
      // Baby items stats
      const { data: babyItems } = await supabase
        .from('baby_items')
        .select('purchased')
        .eq('family_id', familyId);
      
      const totalItems = babyItems?.length || 0;
      const purchasedItems = babyItems?.filter(item => item.purchased).length || 0;
      
      // Wishlist stats
      const { data: wishlistItems } = await supabase
        .from('wishlist_items')
        .select('purchased')
        .eq('family_id', familyId);
      
      const totalWishlist = wishlistItems?.length || 0;
      const purchasedWishlist = wishlistItems?.filter(item => item.purchased).length || 0;
      
      // Hospital bag stats
      const { data: hospitalBagItems } = await supabase
        .from('hospital_bag_items')
        .select('packed')
        .eq('family_id', familyId);
      
      const totalHospitalBag = hospitalBagItems?.length || 0;
      const packedHospitalBag = hospitalBagItems?.filter(item => item.packed).length || 0;
      
      // Baby names stats
      const { data: babyNames } = await supabase
        .from('baby_names')
        .select('id')
        .eq('family_id', familyId);
      
      const totalNames = babyNames?.length || 0;
      
      // Parenting vows stats
      const { data: vows } = await supabase
        .from('parenting_vows')
        .select('id')
        .eq('family_id', familyId);
      
      const totalVows = vows?.length || 0;
      
      setStats({
        budget: { total: totalBudget, spent: totalSpent },
        babyItems: { total: totalItems, purchased: purchasedItems },
        wishlist: { total: totalWishlist, purchased: purchasedWishlist },
        hospitalBag: { total: totalHospitalBag, packed: packedHospitalBag },
        babyNames: { total: totalNames },
        parentingVows: { total: totalVows }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchFamilyMembers(currentProfile) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('family_id', currentProfile.family_id);
      
      if (!error) {
        setFamilyMembers(data || []);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  }

  const getPregnancyTrimester = () => {
    if (!currentWeek) return null;
    if (currentWeek <= 12) return 'First Trimester';
    if (currentWeek <= 27) return 'Second Trimester';
    return 'Third Trimester';
  };

  const getWeeklyTip = () => {
    if (!currentWeek) return null;
    const tips = {
      8: "Time to schedule your first prenatal appointment!",
      12: "Consider sharing your exciting news with family and friends",
      16: "You might feel your baby's first movements soon",
      20: "Anatomy scan time - you can find out the gender!",
      24: "Start thinking about your birth plan preferences",
      28: "Third trimester begins - home stretch!",
      32: "Pack your hospital bag and prepare for baby's arrival",
      36: "Baby is considered full-term at 37 weeks",
      38: "Any day now! Make sure you're ready for the hospital"
    };
    
    const weekKey = Object.keys(tips)
      .map(Number)
      .sort((a, b) => b - a)
      .find(week => currentWeek >= week);
    
    return tips[weekKey] || "Your pregnancy journey is unique and beautiful!";
  };

  const calculatePercentage = (current, total) => {
    if (!total || total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  const getProgressMessage = (percentage, type) => {
    if (percentage === 0) {
      switch(type) {
        case 'budget': return 'Ready to track';
        case 'shopping': return 'Let\'s start shopping';
        case 'wishlist': return 'Create your wishlist';
        case 'hospital': return 'Time to prepare';
        case 'names': return 'Start suggesting';
        case 'vows': return 'Begin the conversation';
        default: return 'Get started';
      }
    } else if (percentage < 25) {
      return 'Just getting started';
    } else if (percentage < 50) {
      return 'Making progress';
    } else if (percentage < 75) {
      return 'Going strong';
    } else if (percentage < 100) {
      return 'Almost there';
    } else {
      return 'Complete!';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionInfo();
  const daysLeftInTrial = getDaysLeftInTrial();

  return (
    <div className="dashboard">
      {/* Add Promo Status Banner */}
      <PromoStatusBanner setShowPaywall={setShowPaywall} setPaywallTrigger={setPaywallTrigger} />
      
      {/* Enhanced Trial Banner with Promo Code Info */}
      {subscriptionInfo.status.includes('Trial') && !promoStatus?.has_promo && (
        <div className="trial-banner">
          <div className="trial-content">
            <span className="trial-badge">🎁</span>
            <span className="trial-text">
              <strong>{daysLeftInTrial} days left</strong> in your free trial
            </span>
            
            <button 
              className="trial-upgrade-btn"
              onClick={() => {
                setPaywallTrigger('trial');
                setShowPaywall(true);
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Modern Header Section */}
      <div className="dashboard-header-modern">
        <div className="header-gradient">
          <div className="header-top-row">
            <div className="welcome-content">
              <h1 className="welcome-title">
                Welcome back, {profile?.full_name || 'Parent-to-be'}! ✨
              </h1>
              <p className="welcome-subtitle">Your pregnancy journey is looking amazing</p>
            </div>
            {familyMembers.length > 0 && (
              <div className="family-badge">
                <Users size={16} />
                Sharing with {familyMembers.length} family member{familyMembers.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {profile?.due_date && (
            <div className="pregnancy-cards">
              <div className="pregnancy-card">
                <Calendar className="card-icon" />
                <div className="card-content">
                  <span className="card-label">Days until due date</span>
                  <span className="card-value">{daysUntilDue} days</span>
                </div>
              </div>
              <div className="pregnancy-card">
                <Clock className="card-icon" />
                <div className="card-content">
                  <span className="card-label">Current week</span>
                  <span className="card-value">Week {currentWeek}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="stats-grid-modern">
        <Link to="/budget" className="stat-card-modern budget">
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <DollarSign size={24} />
            </div>
            <span className="stat-title">Budget</span>
            <ChevronRight className="stat-arrow" size={20} />
          </div>
          <div className="stat-main-value">
            £{stats.budget.spent.toFixed(0)}
          </div>
          <div className="stat-subtitle">
            of £{stats.budget.total.toFixed(0)} spent
          </div>
          <div className="stat-percentage">
            <span>{calculatePercentage(stats.budget.spent, stats.budget.total)}% used</span>
          </div>
        </Link>

        <Link to="/shopping-list" className="stat-card-modern shopping">
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <Package size={24} />
            </div>
            <span className="stat-title">Shopping List</span>
            <ChevronRight className="stat-arrow" size={20} />
          </div>
          <div className="stat-main-value">
            {stats.babyItems.purchased}
          </div>
          <div className="stat-subtitle">
            of {stats.babyItems.total} collected
          </div>
          <div className="stat-percentage">
            <span>{calculatePercentage(stats.babyItems.purchased, stats.babyItems.total)}% complete</span>
          </div>
        </Link>

        {/* Wishlist - with premium check */}
        <Link 
          to={hasFeature('wishlist') ? "/wishlist" : "#"}
          onClick={(e) => {
            if (!hasFeature('wishlist')) {
              e.preventDefault();
              setPaywallTrigger('wishlist');
              setShowPaywall(true);
            }
          }}
          className={`stat-card-modern wishlist ${!hasFeature('wishlist') ? 'locked' : ''}`}
        >
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <Gift size={24} />
            </div>
            <span className="stat-title">Wishlist</span>
            {hasFeature('wishlist') ? (
              <ChevronRight className="stat-arrow" size={20} />
            ) : (
              <Lock className="stat-lock" size={16} />
            )}
          </div>
          {hasFeature('wishlist') ? (
            <>
              <div className="stat-main-value">
                {stats.wishlist.purchased}
              </div>
              <div className="stat-subtitle">
                of {stats.wishlist.total} received
              </div>
              <div className="stat-percentage">
                <span>{calculatePercentage(stats.wishlist.purchased, stats.wishlist.total)}% gifted</span>
              </div>
            </>
          ) : (
            <div className="stat-locked-content">
              <span className="locked-text">Premium Feature</span>
              <span className="locked-subtitle">Upgrade to unlock</span>
            </div>
          )}
        </Link>

        {/* Hospital Bag - with premium check */}
        <Link 
          to={hasFeature('hospital_bag') ? "/hospital-bag" : "#"}
          onClick={(e) => {
            if (!hasFeature('hospital_bag')) {
              e.preventDefault();
              setPaywallTrigger('hospital_bag');
              setShowPaywall(true);
            }
          }}
          className={`stat-card-modern hospital ${!hasFeature('hospital_bag') ? 'locked' : ''}`}
        >
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <Briefcase size={24} />
            </div>
            <span className="stat-title">Hospital Bag</span>
            {hasFeature('hospital_bag') ? (
              <ChevronRight className="stat-arrow" size={20} />
            ) : (
              <Lock className="stat-lock" size={16} />
            )}
          </div>
          {hasFeature('hospital_bag') ? (
            <>
              <div className="stat-main-value">
                {stats.hospitalBag.packed}
              </div>
              <div className="stat-subtitle">
                of {stats.hospitalBag.total} packed
              </div>
              <div className="stat-percentage">
                <span>{calculatePercentage(stats.hospitalBag.packed, stats.hospitalBag.total)}% ready</span>
              </div>
            </>
          ) : (
            <div className="stat-locked-content">
              <span className="locked-text">Premium Feature</span>
              <span className="locked-subtitle">Upgrade to unlock</span>
            </div>
          )}
        </Link>

        <Link to="/names" className="stat-card-modern names">
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <Baby size={24} />
            </div>
            <span className="stat-title">Baby Names</span>
            <ChevronRight className="stat-arrow" size={20} />
          </div>
          <div className="stat-main-value">
            {stats.babyNames.total}
          </div>
          <div className="stat-subtitle">
            names suggested
          </div>
          <div className="stat-percentage">
            <span>Ideas flowing!</span>
          </div>
        </Link>

        {/* Parenting Vows - Premium feature that allows navigation */}
        <Link 
          to="/parenting-vows" 
          className={`stat-card-modern vows ${!hasFeature('parenting_vows') ? 'locked' : ''}`}
        >
          <div className="stat-card-header">
            <div className="stat-icon-circle">
              <Heart size={24} />
            </div>
            <span className="stat-title">Parenting Vows</span>
            {hasFeature('parenting_vows') ? (
              <ChevronRight className="stat-arrow" size={20} />
            ) : (
              <Lock className="stat-lock" size={16} />
            )}
          </div>
          {hasFeature('parenting_vows') ? (
            <>
              <div className="stat-main-value">
                {stats.parentingVows.total}
              </div>
              <div className="stat-subtitle">
                vows created
              </div>
              <div className="stat-percentage">
                <span>{stats.parentingVows.total > 0 ? 'Building values!' : 'Start your vows'}</span>
              </div>
            </>
          ) : (
            <div className="stat-locked-content">
              <span className="locked-text">Premium Feature</span>
              <span className="locked-subtitle">Upgrade to unlock</span>
            </div>
          )}
        </Link>
      </div>

      {/* Appointments Widget - Constrained width */}
      <div className="appointment-widget-container">
        <AppointmentWidget />
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        show={showPaywall}
        trigger={paywallTrigger}
        onClose={() => setShowPaywall(false)}
        customMessage={
          currentWeek ? `You're in week ${currentWeek} of your pregnancy` : undefined
        }
      />
    </div>
  );
}

export default Dashboard;
