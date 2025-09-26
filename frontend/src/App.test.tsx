import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CureX40 Frontend Test</h1>
      <p>This is a minimal App component to test the connection.</p>

      <div style={{ marginTop: '20px' }}>
        <h2>Environment Info</h2>
        <ul>
          <li>Mode: {import.meta.env.MODE}</li>
          <li>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</li>
          <li>Environment: {import.meta.env.VITE_APP_ENVIRONMENT || 'development'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Quick API Test</h2>
        <button
          onClick={async () => {
            try {
              const response = await fetch('http://localhost:8000/api/v1/health');
              const data = await response.json();
              alert(`API Status: ${data.success ? 'Working' : 'Failed'}\nMessage: ${data.message}`);
            } catch (error) {
              alert(`API Error: ${error instanceof Error ? error.message : 'Connection failed'}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Navigation</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/test-api" style={{ color: '#3b82f6' }}>API Test Page</a>
          <a href="/test-connection" style={{ color: '#3b82f6' }}>Connection Test</a>
        </div>
      </div>
    </div>
  );
}

export default App;
