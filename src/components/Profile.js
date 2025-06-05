import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Users, Mail, Save, Copy, Check } from 'lucide-react';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
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
      
      <div className="profile-section">
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;
