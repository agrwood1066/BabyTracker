import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Users, Mail, Save, Copy, Check } from 'lucide-react';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  // const [inviteEmail, setInviteEmail] = useState(''); // Removed unused variables
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
      
      // Generate a shareable family code (first 8 chars of family_id)
      if (data.family_id) {
        setFamilyCode(data.family_id.substring(0, 8).toUpperCase());
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
          .eq('family_id', profile.family_id);

        if (!error) {
          setFamilyMembers(data.filter(member => member.id !== user.id));
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

  async function joinFamily() {
    if (!joinCode || joinCode.length !== 8) {
      alert('Please enter a valid 8-character family code');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Find the family with this code
      const { data: familyData, error: searchError } = await supabase
        .from('profiles')
        .select('family_id')
        .ilike('family_id', `${joinCode.toLowerCase()}%`)
        .limit(1)
        .single();

      if (searchError || !familyData) {
        alert('Invalid family code. Please check and try again.');
        return;
      }

      // Update current user's family_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ family_id: familyData.family_id })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('Successfully joined the family!');
      setJoinCode('');
      fetchProfile();
      fetchFamilyMembers();
    } catch (error) {
      console.error('Error joining family:', error);
      alert('Error joining family');
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
          <p>Share this code with your partner or family members so they can join your pregnancy journey!</p>
          <div className="code-display">
            <span className="family-code">{familyCode}</span>
            <button onClick={copyFamilyCode} className="copy-button">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
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
            <button onClick={joinFamily}>
              Join Family
            </button>
          </div>
        </div>
        
        <div className="family-members">
          <h3>Family Members</h3>
          {familyMembers.length > 0 ? (
            <ul className="member-list">
              {familyMembers.map(member => (
                <li key={member.id}>
                  <Mail size={16} />
                  {member.full_name || member.email}
                  {member.role && <span className="role-badge">{member.role}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-members">No family members yet. Share your family code to invite them!</p>
          )}
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
