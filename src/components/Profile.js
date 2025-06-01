import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Calendar, Users, Mail, Save } from 'lucide-react';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
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

  async function inviteFamilyMember() {
    if (!inviteEmail) return;
    
    try {
      // Here you would implement the invite logic
      // For now, we'll just show a placeholder
      alert(`Invite functionality will be implemented. Would invite: ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting family member:', error);
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
        
        <div className="family-members">
          <h3>Family Members</h3>
          {familyMembers.length > 0 ? (
            <ul className="member-list">
              {familyMembers.map(member => (
                <li key={member.id}>
                  <Mail size={16} />
                  {member.full_name || member.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-members">No family members yet</p>
          )}
        </div>
        
        <div className="invite-section">
          <h3>Invite Family Member</h3>
          <div className="invite-form">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
            />
            <button onClick={inviteFamilyMember}>
              Send Invite
            </button>
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
