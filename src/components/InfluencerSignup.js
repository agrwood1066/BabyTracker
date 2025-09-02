import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { UserPlus, CheckCircle, AlertCircle, Loader, LogIn, Users, TrendingUp } from 'lucide-react';
import './InfluencerSignup.css';

const InfluencerSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'auto', 'manual', null
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram_handle: '',
    follower_count: '',
    content_type: '',
    promo_code: '',
    notes: ''
  });

  // Generate suggested promo code based on name
  const generatePromoCode = (name) => {
    if (!name) return '';
    const firstName = name.split(' ')[0].toUpperCase();
    const random = Math.floor(Math.random() * 99) + 1;
    return `${firstName}${random}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate promo code when name changes
    if (name === 'name' && !formData.promo_code) {
      setFormData(prev => ({
        ...prev,
        promo_code: generatePromoCode(value)
      }));
    }
  };

  const validatePromoCode = async (code) => {
    if (!code) return 'Promo code is required';
    if (code.length < 3) return 'Promo code must be at least 3 characters';
    if (!/^[A-Z0-9-]+$/.test(code.toUpperCase())) return 'Promo code can only contain letters, numbers, and hyphens';
    
    // Check if code already exists
    const { data, error } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();
    
    if (data) return 'This promo code is already taken. Please choose another.';
    return null;
  };

  // Determine if user will be auto-approved
  const getApprovalType = (followerCount) => {
    const count = parseInt(followerCount);
    return count >= 1000 ? 'auto' : 'manual';
  };

  // Get tier info - All tiers get 1 month free
  const getTierInfo = (followerCount) => {
    const count = parseInt(followerCount);
    if (count >= 50000) return { tier: 'Major', months: 1, color: '#gold' };
    if (count >= 10000) return { tier: 'Mid', months: 1, color: '#silver' };
    return { tier: 'Micro', months: 1, color: '#bronze' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate promo code
      const codeError = await validatePromoCode(formData.promo_code);
      if (codeError) {
        setError(codeError);
        setLoading(false);
        return;
      }

      // Create the promo code (auto-approval handled by database trigger)
      const { data, error: insertError } = await supabase
        .from('promo_codes')
        .insert({
          code: formData.promo_code.toUpperCase(),
          influencer_name: formData.name,
          influencer_email: formData.email,
          influencer_handle: formData.instagram_handle,
          follower_count: parseInt(formData.follower_count),
          content_type: formData.content_type,
          notes: formData.notes || 'Self-registered via influencer signup form'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Determine approval status
      const approval = getApprovalType(formData.follower_count);
      setApprovalStatus(approval);
      
      setSuccess(true);
      setStep(3);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="influencer-signup">
      <div className="signup-container">
        <div className="signup-header">
          <UserPlus size={48} className="header-icon" />
          <h1>Become a Baby Steps Partner</h1>
          <p>Join our influencer program and earn industry-leading commissions</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Your Info</label>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Choose Code</label>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Complete</label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form className="signup-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="form-section">
              <h2>Tell us about yourself</h2>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Sarah Johnson"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="sarah@example.com"
                />
                <small>💡 Use the same email for your Baby Steps account to access your dashboard</small>
              </div>

              <div className="form-group">
                <label>Instagram Handle *</label>
                <input
                  type="text"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleInputChange}
                  required
                  placeholder="@sarahbaby"
                />
              </div>

              <div className="form-group">
                <label>Follower Count *</label>
                <select
                  name="follower_count"
                  value={formData.follower_count}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select range</option>
                  <option value="1000">1K - 5K</option>
                  <option value="5000">5K - 10K</option>
                  <option value="10000">10K - 25K</option>
                  <option value="25000">25K - 50K</option>
                  <option value="50000">50K - 100K</option>
                  <option value="100000">100K+</option>
                </select>
              </div>

              <div className="form-group">
                <label>Content Type *</label>
                <select
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="pregnancy">Pregnancy Journey</option>
                  <option value="parenting">Parenting</option>
                  <option value="lifestyle">Family Lifestyle</option>
                  <option value="health">Health & Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Choose Promo Code */}
        {step === 2 && !success && (
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Choose your promo code</h2>
              <p className="section-subtitle">This is what your followers will use to get their free trial</p>
              
              <div className="form-group">
                <label>Your Unique Promo Code *</label>
                <input
                  type="text"
                  name="promo_code"
                  value={formData.promo_code}
                  onChange={handleInputChange}
                  required
                  placeholder="SARAH1"
                  style={{ textTransform: 'uppercase' }}
                />
                <small>Letters, numbers, and hyphens only. Will be converted to uppercase.</small>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Tell us about your audience, content plans, etc."
                />
              </div>

              {/* Dynamic approval status */}
              {formData.follower_count && (
                <div className={`approval-status ${getApprovalType(formData.follower_count) === 'auto' ? 'auto-approved' : 'manual-approval'}`}>
                  {getApprovalType(formData.follower_count) === 'auto' ? (
                    <>
                      <CheckCircle size={20} />
                      <div>
                        <strong>✨ Instant Approval!</strong>
                        <p>Your code will be active immediately after signup</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      <div>
                        <strong>Manual Review Required</strong>
                        <p>We'll review your application within 24-48 hours</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Commission Structure Preview */}
              {formData.follower_count && (
                <div className="commission-preview">
                  <h3>Your Commission Structure</h3>
                  <div className={`tier-badge ${getTierInfo(formData.follower_count).tier.toLowerCase()}`}>
                    {getTierInfo(formData.follower_count).tier} Tier
                  </div>
                  <div className="benefits-grid">
                    <div className="benefit">
                      <Users size={24} />
                      <span>Your followers get</span>
                      <strong>{getTierInfo(formData.follower_count).months} month{getTierInfo(formData.follower_count).months > 1 ? 's' : ''} FREE</strong>
                    </div>
                    <div className="benefit">
                      <TrendingUp size={24} />
                      <span>You earn per conversion</span>
                      <strong>£15-34</strong>
                    </div>
                  </div>
                  <ul className="commission-details">
                    <li>First month: <strong>100% commission</strong> (£6.99)</li>
                    <li>3-month milestone: <strong>£5 bonus</strong></li>
                    <li>6-month milestone: <strong>£5 bonus</strong></li>
                    <li>Annual upgrade: <strong>£10 bonus</strong></li>
                  </ul>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="spinner" size={20} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Success with Login Encouragement */}
        {step === 3 && success && (
          <div className="success-section">
            <CheckCircle size={64} className="success-icon" />
            <h2>Application Submitted!</h2>
            
            {/* Auto-approved */}
            {approvalStatus === 'auto' && (
              <div className="auto-approval-success">
                <div className="celebration">🎉</div>
                <h3>Your promo code is LIVE!</h3>
                <p><strong>{formData.promo_code.toUpperCase()}</strong> is now active and ready to use.</p>
                
                <div className="share-info">
                  <h4>Share this link with your followers:</h4>
                  <div className="share-link">
                    https://babystepsplanner.com/?code={formData.promo_code.toUpperCase()}
                  </div>
                </div>

                <div className="login-encouragement">
                  <LogIn size={32} />
                  <h4>Ready to track your earnings?</h4>
                  <p>Create your Baby Steps account to access your influencer dashboard where you can:</p>
                  <ul>
                    <li>✅ Track signups and conversions in real-time</li>
                    <li>✅ See your pending and paid commissions</li>
                    <li>✅ Access marketing materials and resources</li>
                    <li>✅ Monitor your performance analytics</li>
                  </ul>
                  
                  <button 
                    onClick={() => navigate(`/?email=${encodeURIComponent(formData.email)}&signup=true`)}
                    className="btn-primary login-btn"
                  >
                    <LogIn size={20} />
                    Create Account with {formData.email}
                  </button>
                  <p className="login-hint">💡 Use the same email ({formData.email}) to access your dashboard</p>
                </div>
              </div>
            )}

            {/* Manual approval */}
            {approvalStatus === 'manual' && (
              <div className="manual-approval-success">
                <h3>Under Review</h3>
                <p>Thank you for applying! We're reviewing your application.</p>
                
                <div className="next-steps">
                  <h4>What happens next?</h4>
                  <ol>
                    <li>We'll review your application within 24-48 hours</li>
                    <li>Once approved, we'll activate your promo code</li>
                    <li>You'll receive an email confirmation</li>
                    <li>Start sharing and earning commissions!</li>
                  </ol>
                </div>

                <div className="requested-code">
                  <p>Your requested promo code:</p>
                  <div className="code-display">{formData.promo_code.toUpperCase()}</div>
                  <small>Will be activated upon approval</small>
                </div>

                <div className="login-encouragement">
                  <LogIn size={32} />
                  <h4>Get ready for approval</h4>
                  <p>While you wait, create your Baby Steps account to be ready for your dashboard:</p>
                  
                  <button 
                    onClick={() => navigate(`/?email=${encodeURIComponent(formData.email)}&signup=true`)}
                    className="btn-secondary login-btn"
                  >
                    <LogIn size={20} />
                    Create Account with {formData.email}
                  </button>
                  <p className="login-hint">💡 Use the same email to automatically access your dashboard when approved</p>
                </div>
              </div>
            )}

            <div className="bottom-actions">
              <button onClick={() => navigate('/')} className="btn-outline">
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerSignup;