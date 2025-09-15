// Enhanced Dashboard component with robust profile handling
// Replace the existing Dashboard function with this improved version

// Add this helper function at the top of Dashboard.js (after imports)
async function ensureProfileExists(user) {
  try {
    console.log('Ensuring profile exists for user:', user.id);
    
    // First, try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // If profile exists and has all required fields, return it
    if (existingProfile && !fetchError) {
      console.log('Found existing profile:', existingProfile);
      
      // Ensure family_id exists
      if (!existingProfile.family_id) {
        console.log('Profile missing family_id, updating...');
        const familyId = crypto.randomUUID();
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ family_id: familyId })
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Failed to update family_id:', updateError);
          existingProfile.family_id = familyId; // Use locally even if update failed
        } else {
          return { profile: updatedProfile, created: false };
        }
      }
      
      return { profile: existingProfile, created: false };
    }
    
    // If we get here, profile doesn't exist - create it
    console.log('No profile found, creating new profile for user:', user.id);
    
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
        console.log('Profile may have been created by trigger, fetching again...');
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (retryProfile && !retryError) {
          console.log('Found profile on retry:', retryProfile);
          return { profile: retryProfile, created: false };
        }
      }
      
      // If we still can't get the profile, return a minimal one
      console.warn('Could not create or fetch profile, using minimal profile');
      return {
        profile: newProfileData,
        created: false,
        error: true
      };
    }
    
    console.log('New profile created successfully:', newProfile);
    return { profile: newProfile, created: true };
    
  } catch (error) {
    console.error('Failed to ensure profile exists:', error);
    
    // Return a minimal profile object as last resort
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

// Replace the existing useEffect in Dashboard with this improved version:
/*
useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No authenticated user found:', userError);
        navigate('/');
        return;
      }
      
      console.log('Authenticated user:', user.email);
      
      // Ensure profile exists with robust error handling
      const { profile: currentProfile, created, error } = await ensureProfileExists(user);
      
      if (error) {
        console.warn('Profile connection issue detected. Some features may be limited.');
        // Show a warning banner to the user
        // You could set a state variable here to show a warning
      }
      
      if (created) {
        console.log('New profile was created for user');
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
        console.log('Fetching stats for family:', currentProfile.family_id);
        await fetchAllStats(currentProfile);
        await fetchFamilyMembers(currentProfile);
      } else {
        console.warn('No family_id available, skipping stats fetch');
        // Set empty stats so the UI doesn't break
        setStats({
          budget: { total: 0, spent: 0 },
          babyItems: { total: 0, purchased: 0 },
          wishlist: { total: 0, purchased: 0 },
          hospitalBag: { total: 0, packed: 0 },
          babyNames: { total: 0 },
          parentingVows: { total: 0 }
        });
      }
      
    } catch (error) {
      console.error('Critical error loading dashboard:', error);
      // Don't crash the entire dashboard
      // Show an error message to the user
    } finally {
      setLoading(false);
    }
  }
  
  loadDashboardData();
}, [navigate]);
*/

// Also update the fetchAllStats function to be more robust:
/*
async function fetchAllStats(currentProfile) {
  try {
    const familyId = currentProfile?.family_id;
    
    if (!familyId) {
      console.warn('No family_id available for stats');
      return;
    }
    
    console.log('Fetching stats for family_id:', familyId);
    
    // Budget stats with error handling
    const { data: budgetCategories, error: budgetError } = await supabase
      .from('budget_categories')
      .select('expected_budget')
      .eq('family_id', familyId);
    
    if (budgetError) {
      console.error('Error fetching budget categories:', budgetError);
    }
    
    const { data: budgetItems, error: itemsError } = await supabase
      .from('baby_items')
      .select('price, purchased')
      .eq('family_id', familyId)
      .not('price', 'is', null);
    
    if (itemsError) {
      console.error('Error fetching budget items:', itemsError);
    }
    
    const totalBudget = budgetCategories?.reduce((sum, cat) => sum + (cat.expected_budget || 0), 0) || 0;
    const totalSpent = budgetItems?.filter(item => item.purchased)
      .reduce((sum, item) => sum + (item.price || 0), 0) || 0;
    
    // Continue with other stats...
    // Add similar error handling for each query
    
    setStats({
      budget: { total: totalBudget, spent: totalSpent },
      babyItems: { total: totalItems || 0, purchased: purchasedItems || 0 },
      wishlist: { total: totalWishlist || 0, purchased: purchasedWishlist || 0 },
      hospitalBag: { total: totalHospitalBag || 0, packed: packedHospitalBag || 0 },
      babyNames: { total: totalNames || 0 },
      parentingVows: { total: totalVows || 0 }
    });
    
  } catch (error) {
    console.error('Unexpected error fetching stats:', error);
    // Set default stats on error
    setStats({
      budget: { total: 0, spent: 0 },
      babyItems: { total: 0, purchased: 0 },
      wishlist: { total: 0, purchased: 0 },
      hospitalBag: { total: 0, packed: 0 },
      babyNames: { total: 0 },
      parentingVows: { total: 0 }
    });
  }
}
*/