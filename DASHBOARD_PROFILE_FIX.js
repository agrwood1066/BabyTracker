// Enhanced Dashboard profile handling fix
// Add this function at the top of Dashboard.js after the imports

async function ensureProfileExists(user) {
  try {
    // First, try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // If profile exists, return it
    if (existingProfile && !fetchError) {
      return { profile: existingProfile, created: false };
    }
    
    // If profile doesn't exist, create it
    console.log('Profile not found, creating new profile for user:', user.id);
    
    const familyId = crypto.randomUUID();
    const newProfileData = {
      id: user.id,
      email: user.email,
      family_id: familyId,
      subscription_status: 'free',
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Try to insert the new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfileData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      
      // If insert failed due to conflict, try to fetch again
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (retryProfile) {
          return { profile: retryProfile, created: false };
        }
      }
      
      throw insertError;
    }
    
    console.log('New profile created successfully:', newProfile);
    return { profile: newProfile, created: true };
    
  } catch (error) {
    console.error('Failed to ensure profile exists:', error);
    
    // As a last resort, return a minimal profile object
    return {
      profile: {
        id: user.id,
        email: user.email,
        family_id: crypto.randomUUID(),
        subscription_status: 'free',
        subscription_plan: 'free'
      },
      created: false,
      error: true
    };
  }
}

// Replace the existing loadDashboardData function with this improved version:
/*
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }
        
        // Use the enhanced profile ensuring function
        const { profile: currentProfile, created, error } = await ensureProfileExists(user);
        
        if (error) {
          console.warn('Profile connection issue detected. Some features may be limited.');
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
        
        // Only fetch stats if we have a valid family_id
        if (currentProfile?.family_id) {
          await fetchAllStats(currentProfile);
          await fetchFamilyMembers(currentProfile);
        } else {
          console.warn('No family_id available, skipping stats fetch');
        }
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Don't crash the dashboard on error
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [navigate]);
*/