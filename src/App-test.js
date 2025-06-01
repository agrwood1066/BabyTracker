import React from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Test Supabase connection
    async function testConnection() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('Supabase connected successfully!', data);
        setLoading(false);
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    testConnection();
  }, []);

  if (loading) return <div>Testing Supabase connection...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simply Pregnancy - Test Page</h1>
      <p>✅ React is working!</p>
      <p>✅ Supabase is connected!</p>
      <p>If you see this, the basic setup is working. The full app should load soon.</p>
    </div>
  );
}

export default App;
