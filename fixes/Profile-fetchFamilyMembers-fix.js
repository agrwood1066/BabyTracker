// Fix for Profile.js - Updated fetchFamilyMembers function
// Replace the existing fetchFamilyMembers function in Profile.js with this version

async function fetchFamilyMembers() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First get the current user's profile and family_id
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('family_id, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return;
    }

    if (currentUserProfile?.family_id) {
      // Fetch all profiles with the same family_id, excluding current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, due_date, subscription_status')
        .eq('family_id', currentUserProfile.family_id)
        .neq('id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        // Log more details for debugging
        console.log('Current user ID:', user.id);
        console.log('Family ID:', currentUserProfile.family_id);
        console.log('Current user email:', currentUserProfile.email);
      } else {
        console.log('Found family members:', data);
        setFamilyMembers(data || []);
      }
    } else {
      console.log('No family_id found for current user');
      setFamilyMembers([]);
    }
  } catch (error) {
    console.error('Error in fetchFamilyMembers:', error);
    setFamilyMembers([]);
  }
}

// Also update the JSX where family members are displayed (around line 290-310)
// to show more information about each family member:

{familyMembers.length > 0 && (
  <div className="family-members-list">
    <h3><Users size={20} /> Family Members</h3>
    {familyMembers.map((member) => (
      <div key={member.id} className="family-member-item">
        <div className="member-info">
          <p className="member-name">
            {member.full_name || member.email}
            {member.subscription_status === 'lifetime_admin' && (
              <Crown size={14} className="premium-icon" title="Lifetime Premium" />
            )}
          </p>
          <p className="member-email">{member.email}</p>
          {member.due_date && (
            <p className="member-due-date">
              Due: {new Date(member.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <p className="member-role">
          {member.role === 'partner' ? 'Partner' : 'Family Member'}
        </p>
      </div>
    ))}
  </div>
)}