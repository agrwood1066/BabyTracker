import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  User, 
  Users, 
  Mail, 
  Save, 
  Copy, 
  Check, 
  Shield, 
  FileText, 
  Trash2, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    due_date: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchFamilyMembers();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        due_date: data.due_date || ''
      });
      
      // Generate family code
      if (data.family_id) {
        setFamilyCode(data.family_id.replace(/-/g, '').substring(0, 8).toUpperCase());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFamilyMembers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (profile?.family_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('family_id', profile.family_id)
          .neq('id', user.id);

        if (!error) {
          setFamilyMembers(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  }

  async function updateProfile() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          due_date: formData.due_date
        })
        .eq('id', user.id);

      if (error) throw error;
      
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinFamily() {
    if (!joinCode || joinCode.length !== 8) {
      alert('Please enter a valid 8-character family code');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Find all profiles and their family codes
      const { data: allProfiles, error: searchError } = await supabase
        .from('profiles')
        .select('family_id, email')
        .not('family_id', 'is', null);
        
      if (searchError) {
        console.error('Search error:', searchError);
        alert('Error searching for family. Please try again.');
        return;
      }
      
      // Find matching family
      const matchingProfile = allProfiles?.find(profile => {
        if (!profile.family_id) return false;
        const profileCode = profile.family_id.replace(/-/g, '').substring(0, 8).toUpperCase();
        return profileCode === joinCode.toUpperCase();
      });
      
      if (!matchingProfile) {
        alert('Invalid family code. Please check the code and try again.');
        return;
      }

      // Check if user is already in this family
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (currentProfile?.family_id === matchingProfile.family_id) {
        alert('You are already a member of this family!');
        return;
      }

      // Update current user's family_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ family_id: matchingProfile.family_id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      alert('🎉 Successfully joined the family!\n\nYou can now see and share data with your family members.');
      setJoinCode('');
      
      // Refresh to show updated family data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error joining family:', error);
      alert('Error joining family: ' + error.message);
    }
  }

  function copyFamilyCode() {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      // Delete user-specific data in the correct order (foreign key constraints)
      console.log('Starting deletion process for user:', userId);

      // 1. Delete baby name votes
      const { error: votesError } = await supabase
        .from('baby_name_votes')
        .delete()
        .eq('user_id', userId);
      if (votesError) console.error('Error deleting votes:', votesError);

      // 2. Delete baby names suggested by this user
      const { error: namesError } = await supabase
        .from('baby_names')
        .delete()
        .eq('suggested_by', userId);
      if (namesError) console.error('Error deleting baby names:', namesError);

      // 3. Delete hospital bag items added by this user
      const { error: hospitalError } = await supabase
        .from('hospital_bag_items')
        .delete()
        .eq('added_by', userId);
      if (hospitalError) console.error('Error deleting hospital bag items:', hospitalError);

      // 4. Delete wishlist items added by this user
      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('added_by', userId);
      if (wishlistError) console.error('Error deleting wishlist items:', wishlistError);

      // 5. Delete baby items (shopping list) added by this user
      const { error: itemsError } = await supabase
        .from('baby_items')
        .delete()
        .eq('added_by', userId);
      if (itemsError) console.error('Error deleting baby items:', itemsError);

      // 6. Delete wishlist shares created by this user
      const { error: sharesError } = await supabase
        .from('wishlist_shares')
        .delete()
        .eq('created_by', userId);
      if (sharesError) console.error('Error deleting wishlist shares:', sharesError);

      // 7. Delete family member relationship
      const { error: familyError } = await supabase
        .from('family_members')
        .delete()
        .eq('user_id', userId);
      if (familyError) console.error('Error deleting family membership:', familyError);

      // 8. Delete budget categories (only if this user created them)
      // Note: We don't have a created_by field, so we'll skip this for safety
      // Budget categories are family-wide, so they should remain for other family members

      // 9. Finally, delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      // 10. Delete the auth user (this will cascade)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Auth deletion error (may require manual cleanup):', authError);
        // Don't throw here as the profile is already deleted
      }

      alert('✅ Your account and all associated data have been permanently deleted.\n\nYou will now be logged out.');
      
      // Sign out the user
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('❌ Error deleting account: ' + error.message + '\n\nPlease contact support if this persists.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      
      <div className="profile-section">
        <h2><User size={20} /> Personal Information</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="disabled-input"
          />
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
        
        <button 
          className="save-button"
          onClick={updateProfile}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div className="profile-section">
        <h2><Users size={20} /> Family Account</h2>
        
        <div className="family-code-section">
          <h3>Your Family Code</h3>
          <p>Share this code with your partner or family members so they can join your pregnancy journey and share all your planning data!</p>
          <div className="code-display">
            <span className="family-code">{familyCode || 'Loading...'}</span>
            <button onClick={copyFamilyCode} className="copy-button">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="sharing-info">
            <p><strong>What gets shared:</strong></p>
            <ul>
              <li>✅ Budget items and categories</li>
              <li>✅ Baby items checklist</li>
              <li>✅ Wishlist items</li>
              <li>✅ Hospital bag items</li>
              <li>✅ Baby name suggestions</li>
            </ul>
            <p><em>Each item shows who added it, so you can keep track of contributions!</em></p>
          </div>
        </div>

        <div className="join-family-section">
          <h3>Join a Family</h3>
          <p>Have a family code? Enter it here to join an existing family account.</p>
          <div className="join-form">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              maxLength={8}
            />
            <button onClick={handleJoinFamily} disabled={!joinCode || joinCode.length !== 8}>
              Join Family
            </button>
          </div>
        </div>
        
        <div className="family-members">
          <h3>Family Members ({familyMembers.length + 1})</h3>
          <div className="member-list">
            <div className="member-item current-user">
              <Mail size={16} />
              <span>{profile?.full_name || profile?.email} (You)</span>
              <span className="role-badge primary">Primary Account</span>
            </div>
            {familyMembers.map(member => (
              <div key={member.id} className="member-item">
                <Mail size={16} />
                <span>{member.full_name || member.email}</span>
                <span className="role-badge">Family Member</span>
              </div>
            ))}
            {familyMembers.length === 0 && (
              <p className="no-additional-members">No additional family members yet. Share your family code to invite them!</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Legal & Support Section */}
      <div className="profile-section">
        <h2><Shield size={20} /> Legal & Support</h2>
        
        <div className="legal-links">
          <h3>Legal Documents</h3>
          <div className="link-grid">
            <Link to="/privacy-policy" className="legal-link">
              <Shield size={16} />
              <div>
                <span className="link-title">Privacy Policy</span>
                <span className="link-desc">How we handle and protect your data</span>
              </div>
            </Link>
            <Link to="/terms-of-service" className="legal-link">
              <FileText size={16} />
              <div>
                <span className="link-title">Terms of Service</span>
                <span className="link-desc">Your rights and responsibilities</span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="support-section">
          <h3>Customer Support</h3>
          <div className="support-info">
            <Mail size={20} />
            <div>
              <p><strong>Need help or have questions?</strong></p>
              <p>Email us at: <a href="mailto:hello@babystepsplanner.com">hello@babystepsplanner.com</a></p>
              <p className="support-note">We aim to respond within 48 hours</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Management Section */}
      <div className="profile-section danger-section">
        <h2><Trash2 size={20} /> Data Management</h2>
        
        <div className="data-export">
          <h3>Export Your Data</h3>
          <p>You can export your budget data anytime using the CSV export feature in the Budget Planner section.</p>
        </div>
        
        <div className="account-deletion">
          <h3>Delete Account</h3>
          <div className="deletion-warning">
            <AlertTriangle size={20} />
            <div>
              <p><strong>Permanent Account Deletion</strong></p>
              <p>This will permanently delete your account and all data you've added to the app. This action cannot be undone.</p>
              
              <div className="deletion-details">
                <h4>What will be deleted:</h4>
                <ul>
                  <li>Your profile and account</li>
                  <li>Baby items you've added to shopping lists</li>
                  <li>Wishlist items you've created</li>
                  <li>Hospital bag items you've added</li>
                  <li>Baby names you've suggested</li>
                  <li>Your votes on baby names</li>
                  <li>Wishlist shares you've created</li>
                </ul>
                
                <h4>What will NOT be affected:</h4>
                <ul>
                  <li>Budget categories (shared with family)</li>
                  <li>Other family members' accounts or data</li>
                  <li>Items added by other family members</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button 
            className="delete-account-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            Delete My Account
          </button>
        </div>
      </div>
      
      <div className="profile-section">
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <AlertTriangle size={24} />
              <h2>Confirm Account Deletion</h2>
            </div>
            
            <div className="modal-body">
              <p><strong>⚠️ This action is permanent and cannot be undone.</strong></p>
              
              <p>Are you absolutely sure you want to delete your account? This will:</p>
              <ul>
                <li>Permanently delete your profile and all data you've contributed</li>
                <li>Remove you from your family group</li>
                <li>Delete all items you've added across all features</li>
                <li>Sign you out immediately</li>
              </ul>
              
              <p><strong>Family members will still have access to:</strong></p>
              <ul>
                <li>Budget categories (family-wide)</li>
                <li>Items they've added themselves</li>
                <li>Their own accounts and data</li>
              </ul>
              
              <div className="final-warning">
                <HelpCircle size={16} />
                <span>If you're having issues, consider contacting <a href="mailto:hello@babystepsplanner.com">support</a> first.</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;