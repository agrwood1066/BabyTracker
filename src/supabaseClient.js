import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl)
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

// Clear any potentially corrupted auth data
try {
  const authKey = 'baby-steps-auth';
  const storedData = window.localStorage.getItem(authKey);
  if (storedData) {
    try {
      // Try to parse it to check if it's valid JSON
      JSON.parse(storedData);
    } catch (e) {
      console.warn('Clearing corrupted auth data from localStorage');
      window.localStorage.removeItem(authKey);
      // Also clear the default Supabase auth key
      window.localStorage.removeItem('supabase.auth.token');
      window.localStorage.removeItem('sb-lzppcmkjdgunhldgcgka-auth-token');
    }
  }
} catch (error) {
  console.error('Error checking localStorage:', error);
}

// Create Supabase client with error handling
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'baby-steps-auth',
      storage: window.localStorage,
    },
    global: {
      headers: {
        'x-application-name': 'baby-steps-planner'
      }
    }
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a fallback client that will at least not crash the app
  supabase = {
    auth: {
      signUp: async () => ({ error: new Error('Supabase client initialization failed') }),
      signInWithPassword: async () => ({ error: new Error('Supabase client initialization failed') }),
      signOut: async () => ({ error: new Error('Supabase client initialization failed') }),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: new Error('Supabase client initialization failed') }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ error: new Error('Supabase client initialization failed') })
        })
      })
    }),
    rpc: async () => ({ error: new Error('Supabase client initialization failed') })
  };
}

export { supabase };

// Add debug logging only if supabase client is properly initialized
if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === 'function') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });
}

// Expose to window for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.supabase = supabase;
}
