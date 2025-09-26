import React, { useState, useEffect } from 'react';
import { medicationService } from '../../services/api/medications';
import { authService } from '../../services/api/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  error?: string;
}

export const ApiTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test =>
      test.name === name ? { ...test, ...updates } : test
    ));
  };

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: API Health Check
    setCurrentTest('Health Check');
    addTest({ name: 'Health Check', status: 'pending', message: 'Testing API health...' });

    try {
      const response = await fetch('http://localhost:8000/api/v1/health');
      const data = await response.json();

      if (response.ok && data.success) {
        updateTest('Health Check', {
          status: 'success',
          message: 'API health check passed',
          data: data.data
        });
      } else {
        updateTest('Health Check', {
          status: 'error',
          message: 'API health check failed',
          error: data.message || 'Unknown error'
        });
      }
    } catch (error) {
      updateTest('Health Check', {
        status: 'error',
        message: 'Failed to connect to API',
        error: error instanceof Error ? error.message : 'Network error'
      });
    }

    // Test 2: Medications Endpoint
    setCurrentTest('Medications API');
    addTest({ name: 'Medications API', status: 'pending', message: 'Testing medications endpoint...' });

    try {
      const medications = await medicationService.getMedications({ per_page: 5 });

      updateTest('Medications API', {
        status: 'success',
        message: `Retrieved ${medications.data.length} medications`,
        data: medications.data
      });
    } catch (error: any) {
      updateTest('Medications API', {
        status: 'error',
        message: 'Failed to fetch medications',
        error: error.message || 'Unknown error'
      });
    }

    // Test 3: Test Registration
    setCurrentTest('User Registration');
    addTest({ name: 'User Registration', status: 'pending', message: 'Testing user registration...' });

    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const registerData = {
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        password: 'password123',
        password_confirmation: 'password123'
      };

      const authResponse = await authService.register(registerData);

      updateTest('User Registration', {
        status: 'success',
        message: 'User registration successful',
        data: { user: authResponse.user.email, token: '***' }
      });

      // Test 4: Get Current User (authenticated endpoint)
      setCurrentTest('Get Current User');
      addTest({ name: 'Get Current User', status: 'pending', message: 'Testing authenticated endpoint...' });

      try {
        const user = await authService.getCurrentUser();

        updateTest('Get Current User', {
          status: 'success',
          message: 'Authenticated endpoint working',
          data: { user: user.email }
        });
      } catch (error: any) {
        updateTest('Get Current User', {
          status: 'error',
          message: 'Failed to get current user',
          error: error.message || 'Unknown error'
        });
      }

      // Test 5: Logout
      setCurrentTest('User Logout');
      addTest({ name: 'User Logout', status: 'pending', message: 'Testing logout...' });

      try {
        await authService.logout();

        updateTest('User Logout', {
          status: 'success',
          message: 'Logout successful',
          data: null
        });
      } catch (error: any) {
        updateTest('User Logout', {
          status: 'error',
          message: 'Failed to logout',
          error: error.message || 'Unknown error'
        });
      }

    } catch (error: any) {
      updateTest('User Registration', {
        status: 'error',
        message: 'Registration failed',
        error: error.message || 'Unknown error'
      });

      // Skip subsequent auth tests if registration fails
      addTest({ name: 'Get Current User', status: 'error', message: 'Skipped due to registration failure', error: 'Registration failed' });
      addTest({ name: 'User Logout', status: 'error', message: 'Skipped due to registration failure', error: 'Registration failed' });
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          API Connection Test
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Test the connection between React frontend and Laravel backend.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          {isRunning ? 'Running Tests...' : 'Run API Tests'}
        </button>

        {isRunning && currentTest && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Currently testing: {currentTest}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getStatusIcon(test.status)} {test.name}
              </h3>
              <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                {test.status.toUpperCase()}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {test.message}
            </p>

            {test.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-2">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {test.error}
                </p>
              </div>
            )}

            {test.data && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-green-800 dark:text-green-200 text-sm mb-1">
                  <strong>Response Data:</strong>
                </p>
                <pre className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 p-2 rounded overflow-x-auto">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {tests.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Click "Run API Tests" to start testing the connection.
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuration Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-900 dark:text-white">Frontend URL:</strong>
            <div className="font-mono text-blue-600 dark:text-blue-400">
              {window.location.origin}
            </div>
          </div>
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
            <strong className="text-gray-900 dark:text-white">Mode:</strong>
            <div className="font-mono text-blue-600 dark:text-blue-400">
              {import.meta.env.MODE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
