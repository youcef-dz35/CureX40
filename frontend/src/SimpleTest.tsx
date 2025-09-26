import React, { useState } from 'react';

export default function SimpleTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Test 1: Basic API health check
      const response = await fetch('http://localhost:8000/api/v1/health');
      const data = await response.json();

      if (data.success) {
        setResult(`✅ API Connected! Message: ${data.message}`);

        // Test 2: Get medications
        setTimeout(async () => {
          try {
            const medResponse = await fetch('http://localhost:8000/api/v1/medications');
            const medData = await medResponse.json();

            if (medData.success) {
              setResult(prev => prev + `\n✅ Medications API: Found ${medData.data.length} medications`);

              // Test 3: Try registration
              setTimeout(async () => {
                try {
                  const regResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                      first_name: 'Test',
                      last_name: 'User',
                      email: `test_${Date.now()}@example.com`,
                      password: 'password123',
                      password_confirmation: 'password123'
                    })
                  });

                  const regData = await regResponse.json();

                  if (regData.success) {
                    setResult(prev => prev + `\n✅ Registration: User created successfully`);
                    setResult(prev => prev + `\n🎉 ALL TESTS PASSED! Backend and Frontend are connected!`);
                  } else {
                    setResult(prev => prev + `\n⚠️ Registration: ${regData.message || 'Failed'}`);
                  }
                } catch (err) {
                  setResult(prev => prev + `\n❌ Registration test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
                setLoading(false);
              }, 1000);

            } else {
              setResult(prev => prev + `\n❌ Medications API failed: ${medData.message}`);
              setLoading(false);
            }
          } catch (err) {
            setResult(prev => prev + `\n❌ Medications test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setLoading(false);
          }
        }, 1000);

      } else {
        setResult(`❌ API Error: ${data.message || 'Unknown error'}`);
        setLoading(false);
      }
    } catch (error) {
      setResult(`❌ Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#2563eb', textAlign: 'center' }}>
        🏥 CureX40 Connection Test
      </h1>

      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Environment Info:</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Frontend:</strong> {window.location.origin}</li>
          <li><strong>Backend:</strong> http://localhost:8000</li>
          <li><strong>Mode:</strong> {import.meta.env.MODE}</li>
          <li><strong>Vite API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={testAPI}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '🔄 Running Tests...' : '🚀 Test API Connection'}
        </button>
      </div>

      {result && (
        <div style={{
          backgroundColor: '#1f2937',
          color: '#10b981',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-line',
          lineHeight: '1.5'
        }}>
          {result}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        border: '1px solid #3b82f6'
      }}>
        <h3 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>Quick Manual Tests:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="http://localhost:8000/api/v1/health"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            🔗 Health Check
          </a>
          <a
            href="http://localhost:8000/api/v1/medications"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            💊 Medications API
          </a>
          <a
            href="http://localhost:8000/api/v1/status"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            📊 API Status
          </a>
        </div>
      </div>
    </div>
  );
}
