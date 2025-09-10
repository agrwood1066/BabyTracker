import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function DebugAuth() {
  const [localStorageData, setLocalStorageData] = useState({});
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testing123');
  const [testResult, setTestResult] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadLocalStorageData();
    checkCurrentSession();
  }, []);

  const loadLocalStorageData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = localStorage.getItem(key);
        data[key] = value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null';
      } catch (e) {
        data[key] = 'Error reading value';
      }
    }
    setLocalStorageData(data);
  };

  const checkCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        setSession({ error: error.message });
      } else {
        setSession(session);
      }
    } catch (e) {
      console.error('Session check failed:', e);
      setSession({ error: e.message });
    }
  };

  const clearAllAuthData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    loadLocalStorageData();
    setTestResult('Cleared all auth-related localStorage data');
  };

  const testLogin = async () => {
    setTestResult('Testing login...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setTestResult(`Login failed: ${error.message}`);
      } else if (data.user) {
        setTestResult(`Login successful! User: ${data.user.email}`);
        checkCurrentSession();
      } else {
        setTestResult('Login completed but no user returned');
      }
    } catch (e) {
      setTestResult(`Login error: ${e.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setTestResult(`Sign out failed: ${error.message}`);
      } else {
        setTestResult('Signed out successfully');
        checkCurrentSession();
      }
    } catch (e) {
      setTestResult(`Sign out error: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Auth Issues</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2>Current Session</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#fff0f0' }}>
        <h2>Environment</h2>
        <p>URL: {window.location.href}</p>
        <p>Supabase URL: {process.env.REACT_APP_SUPABASE_URL}</p>
        <p>Base URL: {process.env.REACT_APP_BASE_URL || 'Not set'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0fff0' }}>
        <h2>Test Login</h2>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Email"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          placeholder="Password"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={testLogin} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Test Login
        </button>
        <button onClick={testSignOut} style={{ padding: '5px 10px' }}>
          Sign Out
        </button>
        {testResult && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#ffffcc' }}>
            {testResult}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0ff' }}>
        <h2>LocalStorage Data (Auth Related)</h2>
        <button onClick={clearAllAuthData} style={{ marginBottom: '10px', padding: '5px 10px', background: '#ff6666', color: 'white' }}>
          Clear All Auth Data
        </button>
        <button onClick={loadLocalStorageData} style={{ marginLeft: '10px', marginBottom: '10px', padding: '5px 10px' }}>
          Refresh
        </button>
        <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>

      <div style={{ padding: '10px', background: '#ffff99' }}>
        <h2>How to Fix Login Issues</h2>
        <ol>
          <li>Click "Clear All Auth Data" button above</li>
          <li>Refresh the page (Ctrl/Cmd + R)</li>
          <li>Try logging in again from the main login page</li>
          <li>If still having issues, check browser console for errors</li>
        </ol>
      </div>
    </div>
  );
}

export default DebugAuth;
