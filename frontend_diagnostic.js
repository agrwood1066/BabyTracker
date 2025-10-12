// 🔍 FRONTEND CONNECTION DIAGNOSTIC
// Run this in your browser's developer console while on your Baby Tracker app

console.log('🔍 Starting Frontend Diagnostic...');

// Check if Supabase client is available
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client found:', window.supabase);
} else {
  console.log('❌ Supabase client not found on window object');
}

// Check authentication status
async function checkAuth() {
  try {
    // Try different ways to access supabase client
    const supabase = window.supabase || window._supabase || (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current?.memoizedProps?.supabase);
    
    if (!supabase) {
      console.log('❌ Cannot find Supabase client');
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('🔐 Authentication Status:');
    console.log('User:', user);
    console.log('Error:', error);
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    
    if (user) {
      console.log('✅ Frontend is authenticated');
      
      // Test direct database query
      console.log('🧪 Testing direct database queries...');
      
      // Test baby_items
      const { data: babyItems, error: babyItemsError } = await supabase
        .from('baby_items')
        .select('*');
      
      console.log('Baby Items Query Result:');
      console.log('Data:', babyItems);
      console.log('Error:', babyItemsError);
      console.log('Count:', babyItems?.length || 0);
      
      // Test budget_categories
      const { data: budgetCategories, error: budgetError } = await supabase
        .from('budget_categories')
        .select('*');
      
      console.log('Budget Categories Query Result:');
      console.log('Data:', budgetCategories);
      console.log('Error:', budgetError);
      console.log('Count:', budgetCategories?.length || 0);
      
      // Test profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('User Profile Query Result:');
      console.log('Profile:', profile);
      console.log('Error:', profileError);
      console.log('Family ID:', profile?.family_id);
      
    } else {
      console.log('❌ Frontend is NOT authenticated');
    }
    
  } catch (err) {
    console.log('❌ Error during diagnostic:', err);
  }
}

// Check environment variables
console.log('🔌 Environment Check:');
console.log('Current URL:', window.location.href);
console.log('Local Storage Keys:', Object.keys(localStorage));

// Look for Supabase config
const supabaseKeys = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || key.includes('sb-')
);
console.log('Supabase Storage Keys:', supabaseKeys);

// Run the authentication check
checkAuth().then(() => {
  console.log('🎯 Diagnostic Complete!');
  console.log('📋 Summary:');
  console.log('- Check the authentication status above');
  console.log('- Check if queries return data or errors');  
  console.log('- Compare User ID with SQL diagnostic results');
});

// Instructions
console.log(`
📋 INSTRUCTIONS:
1. Look at the authentication status above
2. Compare the User ID with your SQL diagnostic results  
3. Check if the database queries return data or errors
4. If User ID is different between frontend and SQL - that's the problem!
5. If queries return errors - that shows the connection issue
`);

console.log('📱 To run this diagnostic:');
console.log('1. Open your Baby Tracker app');
console.log('2. Press F12 to open Developer Tools');
console.log('3. Go to Console tab');
console.log('4. Paste this entire script and press Enter');