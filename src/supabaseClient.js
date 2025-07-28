import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl)
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Add debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)
})

// Expose to window for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.supabase = supabase;
}
