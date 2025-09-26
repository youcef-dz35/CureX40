import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { medicationService } from '../services/api';
import { Medication } from '../types';

interface TestHomePageProps {}

const TestHomePage: React.FC<TestHomePageProps> = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setLoading(true);
    try {
      addTestResult('🔄 Loading medications...');
      const response = await medicationService.getMedications({ per_page: 6 });
      setMedications(response.data);
      addTestResult(`✅ Loaded ${response.data.length} medications successfully`);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load medications';
      setError(errorMsg);
      addTestResult(`❌ Error loading medications: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      addTestResult('🔄 Testing login...');
      const testEmail = `test_${Date.now()}@example.com`;

      // First register a test user
      const registerResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
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

      if (registerResponse.ok) {
        addTestResult('✅ Test user registered successfully');
        // Now try to login with the auth context
        await login({ email: testEmail, password: 'password123' });
        addTestResult('✅ Login through AuthContext successful');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login test failed';
      addTestResult(`❌ Login test error: ${errorMsg}`);
    }
  };

  const testLogout = async () => {
    try {
      addTestResult('🔄 Testing logout...');
      await logout();
      addTestResult('✅ Logout successful');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout test failed';
      addTestResult(`❌ Logout test error: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏥 CureX40 Test Homepage
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Smart Pharmacy Platform - Connection Test & Demo
          </p>
        </div>

        {/* User Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Authentication Status
          </h2>
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400">
                ✅ Logged in as: <strong>{user.first_name} {user.last_name}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Email: {user.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Role: {user.role || 'patient'}
              </p>
              <button
                onClick={testLogout}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Test Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-yellow-600 dark:text-yellow-400">
                ⚠️ Not authenticated
              </p>
              <div className="flex gap-4">
                <button
                  onClick={testLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Registration & Login
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Login Page
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Medications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Available Medications
            </h2>
            <button
              onClick={loadMedications}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication) => (
                <div
                  key={medication.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                    {medication.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Generic:</span> {medication.genericName || 'N/A'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Form:</span> {medication.form || 'N/A'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Category:</span> {medication.category || 'N/A'}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${medication.price}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        medication.requiresPrescription
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {medication.requiresPrescription ? 'Prescription Required' : 'OTC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Stock: {medication.stock}
                      </span>
                      <span className={`${
                        medication.isActive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {medication.isActive ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {medications.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No medications found</p>
            </div>
          )}
        </div>

        {/* Test Results Log */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Results Log
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testResults.length > 0 ? (
              <div className="space-y-1 font-mono text-sm text-green-400">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No test results yet</p>
            )}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-4 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Clear Log
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Navigation Test
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/medications"
              className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            >
              <div className="text-blue-600 dark:text-blue-400 font-medium">
                💊 Medications
              </div>
            </Link>
            <Link
              to="/login"
              className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-center hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
            >
              <div className="text-green-600 dark:text-green-400 font-medium">
                🔐 Login
              </div>
            </Link>
            <Link
              to="/register"
              className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
            >
              <div className="text-purple-600 dark:text-purple-400 font-medium">
                📝 Register
              </div>
            </Link>
            <Link
              to="/test-api"
              className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-center hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
            >
              <div className="text-orange-600 dark:text-orange-400 font-medium">
                🔧 API Test
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>🏥 CureX40 Smart Pharmacy Platform</p>
          <p className="text-sm mt-2">
            Frontend: React + TypeScript | Backend: Laravel + PostgreSQL
          </p>
          <p className="text-xs mt-1">
            Status: Connected ✅ | Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestHomePage;
