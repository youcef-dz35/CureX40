import React from 'react';

export default function InlineTest() {
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      textAlign: 'center' as const,
      color: '#1f2937',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      maxWidth: '800px',
      margin: '0 auto 1.5rem auto',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginRight: '1rem',
      marginBottom: '0.5rem',
    },
    buttonSecondary: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginRight: '1rem',
      marginBottom: '0.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    gridItem: {
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '0.375rem',
      border: '1px solid #e5e7eb',
    },
    successBox: {
      backgroundColor: '#ecfdf5',
      border: '1px solid #a7f3d0',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#065f46',
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#991b1b',
    },
    infoBox: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '0.5rem',
      padding: '1rem',
      color: '#1e40af',
    },
    code: {
      backgroundColor: '#f3f4f6',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontFamily: 'Monaco, Menlo, monospace',
      fontSize: '0.875rem',
    },
    logContainer: {
      backgroundColor: '#1f2937',
      color: '#10b981',
      padding: '1rem',
      borderRadius: '0.5rem',
      fontFamily: 'Monaco, Menlo, monospace',
      fontSize: '0.875rem',
      maxHeight: '300px',
      overflowY: 'auto' as const,
    },
  };

  const [apiStatus, setApiStatus] = React.useState('Not tested');
  const [medicationData, setMedicationData] = React.useState<any[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [logs, setLogs] = React.useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testAPI = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🔄 Starting API connection test...');

    try {
      // Test 1: Health Check
      addLog('Testing API health endpoint...');
      const healthResponse = await fetch('http://localhost:8000/api/v1/health');
      const healthData = await healthResponse.json();

      if (healthData.success) {
        setApiStatus('✅ Connected');
        addLog('✅ API Health: Connected successfully');
      } else {
        setApiStatus('❌ Failed');
        addLog('❌ API Health: Failed');
      }

      // Test 2: Medications
      addLog('Testing medications endpoint...');
      const medResponse = await fetch('http://localhost:8000/api/v1/medications');
      const medData = await medResponse.json();

      if (medData.success) {
        setMedicationData(medData.data);
        addLog(`✅ Medications: Found ${medData.data.length} items`);
      } else {
        addLog('❌ Medications: Failed to load');
      }

      // Test 3: Registration
      addLog('Testing user registration...');
      const testEmail = `test_${Date.now()}@example.com`;
      const regResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: testEmail,
          password: 'password123',
          password_confirmation: 'password123'
        })
      });

      const regData = await regResponse.json();
      if (regData.success) {
        addLog('✅ Registration: User created successfully');
      } else {
        addLog(`❌ Registration: ${regData.message}`);
      }

      addLog('🎉 All tests completed!');

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setApiStatus('❌ Connection Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        🏥 CureX40 - CSS & Connection Test
      </h1>

      <div style={styles.card}>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Inline Styling Test
        </h2>
        <div style={styles.infoBox}>
          <p style={{ margin: 0 }}>
            <strong>📋 Status:</strong> If you can see this page with proper colors, layout, and styling,
            then React is loading correctly even if Tailwind CSS has issues.
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          API Connection Test
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Status:</strong> <span style={{ color: '#059669' }}>{apiStatus}</span></p>
        </div>
        <button
          style={styles.button}
          onClick={testAPI}
          disabled={isLoading}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
        >
          {isLoading ? '🔄 Testing...' : '🚀 Test API Connection'}
        </button>
      </div>

      {medicationData && (
        <div style={styles.card}>
          <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Medication Data ({Array.isArray(medicationData) ? medicationData.length : 0} items)
          </h2>
          <div style={styles.grid}>
            {Array.isArray(medicationData) && medicationData.slice(0, 4).map((med: any) => (
              <div key={med.id} style={styles.gridItem}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{med.name}</h3>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Generic: {med.generic_name || 'N/A'}
                </p>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Price: <span style={{ color: '#059669', fontWeight: 'bold' }}>${med.price}</span>
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  backgroundColor: med.requires_prescription ? '#fef3c7' : '#d1fae5',
                  color: med.requires_prescription ? '#92400e' : '#065f46'
                }}>
                  {med.requires_prescription ? 'Prescription Required' : 'OTC'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Test Results Log
        </h2>
        <div style={styles.logContainer}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: '#6b7280' }}>
              Click "Test API Connection" to see results...
            </div>
          )}
        </div>
        <button
          style={{ ...styles.buttonSecondary, marginTop: '1rem' }}
          onClick={() => setLogs([])}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
        >
          Clear Log
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Environment Information
        </h2>
        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Frontend</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              <strong>URL:</strong> {window.location.origin}
            </p>
          </div>
          <div style={styles.gridItem}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Backend</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              <strong>URL:</strong> http://localhost:8000
            </p>
          </div>
          <div style={styles.gridItem}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>React Status</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#059669' }}>
              ✅ Working (this page rendered)
            </p>
          </div>
          <div style={styles.gridItem}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>CSS Status</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626' }}>
              ❌ Tailwind CSS not loading
            </p>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            style={styles.button}
            onClick={() => window.open('http://localhost:8000/api/v1/health', '_blank')}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
          >
            🔗 Open API Health
          </button>
          <button
            style={styles.button}
            onClick={() => window.open('http://localhost:8000/api/v1/medications', '_blank')}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
          >
            💊 Open Medications
          </button>
          <button
            style={styles.buttonSecondary}
            onClick={() => {
              // Switch back to main app
              window.location.reload();
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
          >
            🏠 Back to Main App
          </button>
        </div>
      </div>

      <div style={{
        ...styles.card,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca'
      }}>
        <h2 style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '1.5rem' }}>
          CSS Issue Diagnosis
        </h2>
        <div style={{ color: '#7f1d1d' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Problem:</strong> Tailwind CSS classes are not being applied to elements.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Possible Causes:</strong>
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Vite dev server not processing CSS correctly</li>
            <li>PostCSS configuration issue</li>
            <li>Tailwind configuration path mismatch</li>
            <li>CSS import not loading in main.tsx</li>
            <li>Build process not including Tailwind</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Next Steps:</strong>
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>Restart Vite dev server: <code style={styles.code}>npm run dev</code></li>
            <li>Clear node_modules and reinstall: <code style={styles.code}>rm -rf node_modules && npm install</code></li>
            <li>Check browser console for CSS loading errors</li>
            <li>Verify Tailwind is processing: <code style={styles.code}>npx tailwindcss --help</code></li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
        <p>🏥 CureX40 Smart Pharmacy Platform</p>
        <p style={{ fontSize: '0.875rem' }}>
          React: ✅ Working | Tailwind: ❌ Issue | API: {apiStatus}
        </p>
        <p style={{ fontSize: '0.75rem' }}>
          Last Updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
