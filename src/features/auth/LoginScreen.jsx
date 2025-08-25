import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import OwnerSignupScreen from './OwnerSignupScreen.jsx';

const LoginScreen = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    pin: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.email, formData.pin);
      
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSuccess = (result) => {
    onLogin(result.user);
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
  };

  const handleShowSignup = () => {
    setCurrentView('signup');
    setError('');
  };

  if (currentView === 'signup') {
    return (
      <OwnerSignupScreen 
        onSignupSuccess={handleSignupSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            SmartBite v1.0
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Cash Reconciliation System
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="form-label">PIN</label>
              <input
                type="password"
                required
                className="form-input"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value)}
                placeholder="Enter your PIN"
                maxLength="15"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>


          {/* Owner Signup Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={handleShowSignup}
              className="w-full py-2 px-4 rounded-lg font-medium text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
            >
              Create Owner Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;