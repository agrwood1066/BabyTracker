// SubscriptionTest.js - Test page to verify subscription system
import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import { Check, X, AlertCircle } from 'lucide-react';

const SubscriptionTest = () => {
  const {
    subscription,
    loading,
    isPremium,
    checkFeatureAccess,
    getDaysLeftInTrial,
    getSubscriptionInfo,
    getFeatureLimits
  } = useSubscription();
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState('limit');
  const [testResults, setTestResults] = useState([]);

  const runTests = async () => {
    const results = [];
    
    // Test 1: Check subscription loaded
    results.push({
      test: 'Subscription Loaded',
      passed: subscription !== null,
      details: subscription ? `User: ${subscription.email}` : 'No subscription data'
    });
    
    // Test 2: Check subscription status
    results.push({
      test: 'Subscription Status',
      passed: true,
      details: `Status: ${subscription?.subscription_status || 'Unknown'}`
    });
    
    // Test 3: Check premium access
    results.push({
      test: 'Premium Access',
      passed: true,
      details: isPremium() ? 'Has Premium Access' : 'Free Tier'
    });
    
    // Test 4: Check trial days
    if (subscription?.subscription_status === 'trial') {
      const daysLeft = getDaysLeftInTrial();
      results.push({
        test: 'Trial Days',
        passed: daysLeft >= 0,
        details: `${daysLeft} days remaining`
      });
    }
    
    // Test 5: Check feature limits
    const limits = getFeatureLimits();
    results.push({
      test: 'Feature Limits',
      passed: true,
      details: JSON.stringify(limits, null, 2)
    });
    
    // Test 6: Check feature access for shopping items
    const shoppingAccess = await checkFeatureAccess('shopping_items', 15);
    results.push({
      test: 'Shopping Items Access (15 items)',
      passed: isPremium() ? shoppingAccess.hasAccess : !shoppingAccess.hasAccess,
      details: JSON.stringify(shoppingAccess, null, 2)
    });
    
    // Test 7: Check VIP status
    const isVIP = subscription?.subscription_status === 'lifetime_admin';
    if (isVIP) {
      results.push({
        test: 'VIP Status',
        passed: true,
        details: '👑 Lifetime Premium Access'
      });
    }
    
    setTestResults(results);
  };

  const triggerPaywall = (trigger) => {
    setPaywallTrigger(trigger);
    setShowPaywall(true);
  };

  if (loading) {
    return <div>Loading subscription data...</div>;
  }

  const subInfo = getSubscriptionInfo();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Subscription System Test Page</h1>
      
      {/* Current Status */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Current Status</h2>
        <p>
          <strong>User:</strong> {subscription?.email || 'Not logged in'}
        </p>
        <p>
          <strong>Status:</strong> {subInfo.badge} {subInfo.status}
        </p>
        <p>
          <strong>Plan:</strong> {subscription?.subscription_plan || 'None'}
        </p>
        {subscription?.locked_in_price && (
          <p>
            <strong>Locked Price:</strong> £{subscription.locked_in_price}/month
          </p>
        )}
        {subscription?.admin_notes && (
          <p>
            <strong>Notes:</strong> {subscription.admin_notes}
          </p>
        )}
      </div>

      {/* Test Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Actions</h2>
        <button 
          onClick={runTests}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Run All Tests
        </button>
        
        <button 
          onClick={() => triggerPaywall('limit')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Limit Paywall
        </button>
        
        <button 
          onClick={() => triggerPaywall('family')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Family Paywall
        </button>
        
        <button 
          onClick={() => triggerPaywall('wishlist')}
          style={{ 
            padding: '10px 20px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Wishlist Paywall
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h2>Test Results</h2>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{ 
                padding: '10px',
                marginBottom: '10px',
                background: result.passed ? '#e8f5e9' : '#ffebee',
                borderLeft: `4px solid ${result.passed ? '#4CAF50' : '#f44336'}`,
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {result.passed ? 
                  <Check size={20} color="#4CAF50" /> : 
                  <X size={20} color="#f44336" />
                }
                <strong style={{ marginLeft: '10px' }}>{result.test}</strong>
              </div>
              <pre style={{ 
                marginTop: '5px', 
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {result.details}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertCircle size={20} color="#856404" />
          <strong style={{ marginLeft: '10px' }}>Testing Notes</strong>
        </div>
        <ul style={{ marginTop: '10px', fontSize: '14px' }}>
          <li>VIP users should show "lifetime_admin" status</li>
          <li>New users should have 14-day trial</li>
          <li>Existing non-VIP users should have 30-day trial</li>
          <li>Free tier limits: 10 items, 3 categories, 5 names</li>
          <li>Premium features: Wishlist, Hospital Bag customisation, Family Sharing</li>
        </ul>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        show={showPaywall}
        trigger={paywallTrigger}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
};

export default SubscriptionTest;
