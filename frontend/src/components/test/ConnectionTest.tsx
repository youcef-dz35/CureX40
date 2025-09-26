import React, { useState, useEffect } from 'react';
import { healthCheck } from '../../services/api/config';
import { authService } from '../../services/api/auth';
import { medicationService } from '../../services/api/medications';
import { useAuth } from '../../context/AuthContext';

interface ConnectionStatus {
  api: boolean;
  auth: boolean;
  database: boolean;
  error?: string;
}

interface TestResults {
  healthCheck: boolean;
  userEndpoint: boolean;
  medicationsEndpoint: boolean;
  error?: string;
}

export const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: false,
    auth: false,
    database: false,
  });
  const [testResults, setTestResults] = useState<TestResults>({
    healthCheck: false,
    userEndpoint: false,
    medicationsEndpoint: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('Starting connection tests...');

    try {
      // Test 1: Health Check
      addLog('Testing API health check...');
      const healthStatus = await healthCheck();
      setTestResults(prev => ({ ...prev, healthCheck: healthStatus }));

      if (healthStatus) {
        addLog('✅ Health check passed');
        setStatus(prev => ({ ...prev, api: true }));
      } else {
        addLog('❌ Health check failed');
      }

      // Test 2: API Status
      try {
        addLog('Testing API status endpoint...');
        const response = await fetch('http://localhost:8000/api/v1/status');
        const apiStatus = await response.json();
        addLog(`✅ API Status: ${apiStatus.status} - Version: ${apiStatus.version}`);
        setStatus(prev => ({ ...prev, database: true }));
      } catch (error) {
        addLog('❌ API status endpoint failed');
        console.error('API status error:', error);
      }

      // Test 3: Public endpoints (medications)
      try {
        addLog('Testing public medications endpoint...');
        const medications = await medicationService.getMedications({ per_page: 5 });
        addLog(`✅ Medications endpoint works - Found ${medications.data.length} medications`);
        setTestResults(prev => ({ ...prev, medicationsEndpoint: true }));
      } catch (error) {
        addLog('❌ Medications endpoint failed');
        console.error('Medications error:', error);
      }

      // Test 4: Authentication endpoint (if authenticated)
      if (isAuthenticated) {
        try {
          addLog('Testing authenticated user endpoint...');
          const userData = await authService.getCurrentUser();
          addLog(`✅ User endpoint works - User: ${userData.first_name} ${userData.last_name}`);
          setTestResults(prev => ({ ...prev, userEndpoint: true }));
          setStatus(prev => ({ ...prev, auth: true }));
        } catch (error) {
          addLog('❌ User endpoint failed');
          console.error('User endpoint error:', error);
        }
      } else {
        addLog('ℹ️ User not authenticated - skipping auth endpoint test');
      }

      addLog('Connection tests completed!');
    } catch (error: any) {
      addLog(`❌ Connection test failed: ${error.message}`);
      setStatus(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run tests on component mount
    testConnection();
  }, []);

  const getStatusColor = (isWorking: boolean) => {
    return isWorking ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? '✅' : '❌';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          CureX40 Connection Test
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This component tests the connection between the React frontend and Laravel backend.
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? 'Testing...' : 'Run Connection Tests'}
        </button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">API Server</h3>
          <div className={`text-lg font-mono ${getStatusColor(status.api)}`}>
            {getStatusIcon(status.api)} {status.api ? 'Connected' : 'Disconnected'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Backend API accessibility
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Database</h3>
          <div className={`text-lg font-mono ${getStatusColor(status.database)}`}>
            {getStatusIcon(status.database)} {status.database ? 'Connected' : 'Disconnected'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Database connectivity
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
          <div className={`text-lg font-mono ${getStatusColor(status.auth)}`}>
            {getStatusIcon(status.auth)} {isAuthenticated ? (status.auth ? 'Working' : 'Failed') : 'Not Tested'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {isAuthenticated ? 'Auth endpoint status' : 'Login to test auth'}
          </p>
        </div>
      </div>

      {/* Detailed Test Results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Health Check</span>
            <span className={getStatusColor(testResults.healthCheck)}>
              {getStatusIcon(testResults.healthCheck)} {testResults.healthCheck ? 'Pass' : 'Fail'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">Medications Endpoint</span>
            <span className={getStatusColor(testResults.medicationsEndpoint)}>
              {getStatusIcon(testResults.medicationsEndpoint)} {testResults.medicationsEndpoint ? 'Pass' : 'Fail'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-900 dark:text-white">User Endpoint (Auth Required)</span>
            <span className={getStatusColor(testResults.userEndpoint)}>
              {getStatusIcon(testResults.userEndpoint)} {isAuthenticated ? (testResults.userEndpoint ? 'Pass' : 'Fail') : 'Skipped'}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-900 dark:text-white">API URL:</strong>
              <div className="font-mono text-blue-600 dark:text-blue-400">
                {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
              </div>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Environment:</strong>
              <div className="font-mono text-blue-600 dark:text-blue-400">
                {import.meta.env.VITE_APP_ENVIRONMENT || 'development'}
              </div>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Current User:</strong>
              <div className="font-mono text-blue-600 dark:text-blue-400">
                {user ? `${user.first_name} ${user.last_name}` : 'Not authenticated'}
              </div>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Debug Mode:</strong>
              <div className="font-mono text-blue-600 dark:text-blue-400">
                {import.meta.env.VITE_APP_DEBUG || 'false'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {status.error && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <pre className="text-red-800 dark:text-red-200 text-sm whitespace-pre-wrap">
              {status.error}
            </pre>
          </div>
        </div>
      )}

      {/* Test Logs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No logs yet. Click "Run Connection Tests" to start.</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/medications`, '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Test API in Browser
          </button>
          <button
            onClick={() => setLogs([])}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Clear Logs
          </button>
          <button
            onClick={() => {
              const config = {
                apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
                environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
                debugMode: import.meta.env.VITE_APP_DEBUG || 'false',
                user: user ? `${user.first_name} ${user.last_name}` : 'Not authenticated',
                isAuthenticated,
                testResults,
                status,
                logs
              };
              navigator.clipboard.writeText(JSON.stringify(config, null, 2));
              addLog('✅ Configuration copied to clipboard');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Copy Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
