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
      
      // Generate a shareable family code (first 8 chars of family_id without hyphens)
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

  function copyFamilyCode() {
    navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // PHASE 3: Working family join functionality
  const handleJoinFamily = async () => {
    if (!joinCode || joinCode.length !== 8) {
      alert('Please enter a valid 8-character family code');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Looking for family with code:', joinCode);
      
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
      
      // Find matching family using same logic as test
      const matchingProfile = allProfiles?.find(profile => {
        if (!profile.family_id) return false;
        const profileCode = profile.family_id.replace(/-/g, '').substring(0, 8).toUpperCase();
        return profileCode === joinCode.toUpperCase();
      });
      
      if (!matchingProfile) {
        console.log('No family found with code:', joinCode);
        console.log('Available codes:', allProfiles.map(p => p.family_id.replace(/-/g, '').substring(0, 8).toUpperCase()));
        alert('Invalid family code. Please check the code and try again.');
        return;
      }
      
      console.log('Found family_id:', matchingProfile.family_id);

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

      alert('🎉 Successfully joined the family!\n\nYou can now see and share data with your family members.\n\nRefresh the page to see shared data.');
      setJoinCode('');
      
      // Refresh the page to load shared family data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error joining family:', error);
      alert('Error joining family: ' + error.message);
    }
  };

  // PHASE 1: Test family code logic (temporary function)
  const testFamilyCodeLogic = async () => {
    try {
      console.clear();
      console.log('=== PHASE 1: TESTING FAMILY CODE LOGIC ===');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('1. Current user ID:', user.id);
      console.log('   User email:', user.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('family_id, full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        alert('❌ Cannot fetch your profile. Check console.');
        return;
      }
      
      console.log('2. Your profile:', profile);
      
      if (profile?.family_id) {
        // Generate family code using the same logic as the main app
        const myCode = profile.family_id.replace(/-/g, '').substring(0, 8).toUpperCase();
        console.log('3. Your family_id:', profile.family_id);
        console.log('   Your family code:', myCode);
        
        // Test the matching logic
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('family_id, email')
          .not('family_id', 'is', null);
        
        if (allProfilesError) {
          console.error('Error fetching all profiles:', allProfilesError);
        } else {
          console.log('4. All profiles with family_id:', allProfiles);
          console.log('   Total profiles:', allProfiles.length);
          
          // Test if we can find our own family using the code
          const foundProfile = allProfiles?.find(p => 
            p.family_id.replace(/-/g, '').substring(0, 8).toUpperCase() === myCode
          );
          
          console.log('5. Code matching test:');
          console.log('   Looking for code:', myCode);
          console.log('   Found profile:', foundProfile);
          console.log('   Match success:', foundProfile ? '✅ SUCCESS' : '❌ FAILED');
          console.log('   Matches your family_id:', foundProfile?.family_id === profile.family_id);
          
          // Show codes for all profiles for debugging
          console.log('6. All family codes:');
          allProfiles.forEach(p => {
            const code = p.family_id.replace(/-/g, '').substring(0, 8).toUpperCase();
            console.log(`   ${p.email}: ${code}`);
          });
        }
      } else {
        console.log('❌ No family_id found in your profile!');
      }
      
      console.log('=== PHASE 1 TEST COMPLETE ===');
      alert('✅ Phase 1 test complete! Check the browser console (F12) for detailed results.');
    } catch (error) {
      console.error('Phase 1 test error:', error);
      alert('❌ Phase 1 test failed: ' + error.message);
    }
  };

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
        <h2>🧪 Phase 3: Family Sharing (ACTIVE)</h2>
        <p><strong>✅ Full family data sharing is now enabled!</strong></p>
        <div className="code-display" style={{marginBottom: '1rem'}}>
          <span className="family-code">{profile?.family_id ? profile.family_id.replace(/-/g, '').substring(0, 8).toUpperCase() : 'Loading...'}</span>
          <span style={{marginLeft: '1rem', color: '#666'}}>← Share this code with your partner!</span>
        </div>
        
        <div style={{marginBottom: '1rem'}}>
          <h4>🔗 Join a Family:</h4>
          <div className="join-form">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character family code"
              maxLength={8}
              style={{marginRight: '0.5rem'}}
            />
            <button onClick={handleJoinFamily} disabled={!joinCode || joinCode.length !== 8}>
              Join Family
            </button>
          </div>
        </div>
        
        <button className="debug-button" onClick={testFamilyCodeLogic}>
          📝 Test Family Code Logic
        </button>
        
        <div style={{marginTop: '1.5rem'}}>
          <h4>👥 Family Members ({familyMembers.length + 1}):</h4>
          <div className="member-list">
            <div className="member-item current-user">
              <span>{profile?.full_name || profile?.email} (You)</span>
              <span className="role-badge primary">Primary</span>
            </div>
            {familyMembers.map(member => (
              <div key={member.id} className="member-item">
                <span>{member.full_name || member.email}</span>
                <span className="role-badge">Family</span>
              </div>
            ))}
            {familyMembers.length === 0 && (
              <p style={{color: '#666', fontStyle: 'italic'}}>No family members yet. Share your code above!</p>
            )}
          </div>
        </div>
      </div>
      
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
            <button onClick={handleJoinFamily}>
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
