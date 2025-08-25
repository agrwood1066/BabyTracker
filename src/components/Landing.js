import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Baby, 
  ShoppingCart, 
  Heart, 
  Gift, 
  DollarSign, 
  Briefcase,
  Check,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Mail,
  Instagram,
  Menu,
  X,
  Calendar,
  MessageSquare
} from 'lucide-react';
import './Landing.css';

function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      id: 'shopping-list',
      title: 'Shopping List',
      icon: ShoppingCart,
      shortDesc: 'Organised shopping with budget integration',
      longDesc: 'Create comprehensive shopping lists with budget tracking, priority levels, and mobile shopping mode. Link items directly to your budget categories and never overspend again.',
      benefits: [
        'Budget integration with real-time tracking',
        'Priority system (High/Medium/Low)',
        'Mobile shopping mode for in-store use',
        'Multiple purchase links and price comparison',
        'Timeline planning with "needed by" dates'
      ]
    },
    {
      id: 'baby-names',
      title: 'Baby Names',
      icon: Heart,
      shortDesc: 'Collaborate on the perfect name choice',
      longDesc: 'Suggest, edit, and vote on baby names with your partner and family. Keep track of your favourite options and see what everyone thinks.',
      benefits: [
        'Family collaboration and voting',
        'Gender-specific categorisation',
        'Personal notes and meanings',
        'Edit suggestions from original proposer',
        'Keep track of favourites and popularity'
      ]
    },
    {
      id: 'wishlist',
      title: 'Gift Wishlist',
      icon: Gift,
      shortDesc: 'Shareable wishlist with automatic images',
      longDesc: 'Create beautiful, shareable wishlists that automatically extract product images from URLs. Perfect for baby showers and gift coordination.',
      benefits: [
        'Automatic product image extraction',
        'Shareable links for family and friends',
        'Professional product card layout',
        'Integration with shopping list',
        'Track what\'s been purchased by whom'
      ]
    },
    {
      id: 'budget-tracker',
      title: 'Budget Tracker',
      icon: DollarSign,
      shortDesc: 'Complete financial planning for your arrival',
      longDesc: 'Set category budgets, track spending, and export data for analysis. Visual progress indicators keep you on track financially.',
      benefits: [
        'Category-based budget planning',
        'Visual progress indicators',
        'Running totals and overspend alerts',
        'CSV export for external analysis',
        'Integration with shopping list purchases'
      ]
    },
    {
      id: 'hospital-bag',
      title: 'Hospital Bag',
      icon: Briefcase,
      shortDesc: 'Comprehensive checklist for the big day',
      longDesc: 'Never forget anything important with comprehensive checklists for mum, baby, and partner. Edit and customise to your specific needs.',
      benefits: [
        'Separate lists for mum, baby, and partner',
        'Customisable quantities and categories',
        'Progress tracking and completion status',
        'Edit any item to match your needs',
        'Essential items pre-populated to get started'
      ]
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: Calendar,
      shortDesc: 'Track all your pregnancy appointments',
      longDesc: 'Keep track of all your pregnancy appointments with pre-populated NHS milestones. Schedule scans, midwife visits, and health checks with automatic reminders.',
      benefits: [
        '12 pre-populated NHS appointments based on due date',
        'Schedule and reschedule appointments easily',
        'Automatic email reminders before appointments',
        'Track health metrics after each visit',
        'List view for easy mobile access'
      ]
    },
    {
      id: 'parenting-vows',
      title: 'Parenting Vows',
      icon: MessageSquare,
      shortDesc: 'Important conversations before baby arrives',
      longDesc: 'Have meaningful discussions about parenting approaches with your partner. Cover essential topics from mental health to family boundaries, with upvoting to find consensus.',
      benefits: [
        '6 key parenting categories to explore',
        'Partner responses and collaboration',
        'Upvoting system to find agreement',
        'Custom questions for your specific needs',
        'Time-based tracking of discussions'
      ]
    }
  ];

  const handleAuth = async (e, isSignUpForm) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUpForm) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          setMessage('Account created successfully! Please check your email for verification.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;
        if (data.user) {
          setMessage('Welcome back!');
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToFeature = (featureId) => {
    const element = document.getElementById(featureId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollCarouselLeft = () => {
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollCarouselRight = () => {
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <Baby className="logo-icon" size={32} />
            <span className="logo-text">Baby Steps Planner</span>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="mobile-menu-close"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMobileMenuOpen(false);
          }}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
        <div className="mobile-menu-content">
          <button 
            className="mobile-menu-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLogin(true);
              setMobileMenuOpen(false);
            }}
          >
            Log In
          </button>
          <Link 
            to="/blog" 
            className="mobile-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          >
            Blog
          </Link>
          <a 
            href="https://www.instagram.com/babystepsplanner/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mobile-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          >
            Instagram
          </a>
          <div className="mobile-menu-section">
            <div className="mobile-menu-section-title">Legal</div>
            <Link 
              to="/privacy-policy" 
              className="mobile-menu-item mobile-menu-subitem"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(false);
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="mobile-menu-item mobile-menu-subitem"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(false);
              }}
            >
              Terms of Service
            </Link>
          </div>
          <a 
            href="mailto:hello@babystepsplanner.com" 
            className="mobile-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          >
            Support
          </a>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Hero Section with Brand Title */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="brand-title">Baby Steps Planner</h1>
            <h2 className="hero-title">
              Take control of your pregnancy with one organised app
            </h2>
            <p className="hero-subtitle">
              From budgeting to baby names, manage everything in one beautiful, shareable space that grows with your family
            </p>
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={() => setShowSignUp(true)}
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              <p className="trial-text">Get exclusive early access before the full launch</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <Sparkles size={20} />
                <span>Your pregnancy organised</span>
              </div>
              <div className="progress-items">
                <div className="progress-item">
                  <ShoppingCart size={16} />
                  <span>Shopping List</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <Gift size={16} />
                  <span>Wishlist</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '60%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <Briefcase size={16} />
                  <span>Hospital Bag</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '40%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <Heart size={16} />
                  <span>Baby Names</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <DollarSign size={16} />
                  <span>Budget Tracker</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '50%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <Calendar size={16} />
                  <span>Appointments</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '30%'}}></div>
                  </div>
                </div>
                <div className="progress-item">
                  <MessageSquare size={16} />
                  <span>Parenting Vows</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organisation Section */}
      <section className="organisation-section">
        <div className="section-content">
          <h2>Boost your pregnancy organisation</h2>
          <p className="section-subtitle">One app to organise everything you need when expecting</p>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="features-carousel">
        <div className="carousel-wrapper">
          <button className="carousel-nav carousel-nav-left" onClick={scrollCarouselLeft}>
            <ChevronLeft size={24} />
          </button>
          <div className="carousel-container">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.id}
                  className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFeature(index);
                    scrollToFeature(feature.id);
                  }}
                >
                  <div className="feature-icon">
                    <IconComponent size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.shortDesc}</p>
                </div>
              );
            })}
          </div>
          <button className="carousel-nav carousel-nav-right" onClick={scrollCarouselRight}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Detailed Feature Sections */}
      <section className="detailed-features">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const isEven = index % 2 === 0;
          return (
            <div key={feature.id} id={feature.id} className={`feature-detail ${isEven ? 'feature-detail-even' : 'feature-detail-odd'}`}>
              <div className="feature-detail-content feature-detail-no-visual">
                <div className="feature-detail-text">
                  <div className="feature-detail-header">
                    <IconComponent size={32} />
                    <h2>{feature.title}</h2>
                  </div>
                  <p className="feature-detail-desc">{feature.longDesc}</p>
                  <ul className="feature-benefits">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <Check size={16} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <h2>Ready to organise your pregnancy journey?</h2>
          <p>Join other new parents-to-be who trust Baby Steps Planner</p>
          <button 
            className="cta-primary"
            onClick={() => setShowSignUp(true)}
          >
            Get Started Today
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer with Legal Links */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <Baby className="footer-logo" size={24} />
              <span>Baby Steps Planner</span>
            </div>
            <p className="footer-description">
              The complete pregnancy planning solution for modern families
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Legal</h3>
            <div className="footer-links">
              <Link to="/privacy-policy" className="footer-link">
                <Shield size={16} />
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="footer-link">
                <FileText size={16} />
                Terms of Service
              </Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <div className="footer-links">
              <a href="mailto:hello@babystepsplanner.com" className="footer-link">
                <Mail size={16} />
                Customer Support
              </a>
            </div>
            <p className="support-text">
              Questions or need help? We're here for you.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="footer-links">
              <a 
                href="https://www.instagram.com/babystepsplanner/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-link social-link"
              >
                <Instagram size={16} />
                @babystepsplanner
              </a>
            </div>
            <p className="support-text">
              Join our community of expecting parents!
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Baby Steps Planner. All rights reserved.</p>
          <p className="footer-notice">
            By using this service, you agree to our <Link to="/terms-of-service">Terms of Service</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Welcome Back</h2>
            <form onSubmit={(e) => handleAuth(e, false)}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <p>
              Don't have an account?{' '}
              <button 
                className="link-btn"
                onClick={() => {
                  setShowLogin(false);
                  setShowSignUp(true);
                }}
              >
                Sign Up
              </button>
            </p>
            {message && <div className="message">{message}</div>}
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="modal-overlay" onClick={() => setShowSignUp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Your Account</h2>
            <p className="signup-terms">
              By creating an account, you agree to our{' '}
              <Link to="/terms-of-service" target="_blank">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>.
            </p>
            <form onSubmit={(e) => handleAuth(e, true)}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </button>
            </form>
            <p>
              Already have an account?{' '}
              <button 
                className="link-btn"
                onClick={() => {
                  setShowSignUp(false);
                  setShowLogin(true);
                }}
              >
                Sign In
              </button>
            </p>
            {message && <div className="message">{message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;