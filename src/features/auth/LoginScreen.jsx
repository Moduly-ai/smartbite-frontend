import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import OwnerSignupScreen from './OwnerSignupScreen.jsx';
import { formatErrorDisplay, getLoadingMessage } from '../../utils/errorMessages.js';
import { safeError } from '../../utils/logger.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';

const LoginScreen = ({ onLogin, initialView = 'login', onBackToLanding }) => {
  const [currentView, setCurrentView] = useState(initialView); // 'login' or 'signup'
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
      safeError('Login error:', err);
      setError(formatErrorDisplay(err, 'auth'));
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            SmartBite v1.0
          </h2>
          <p className="mt-2 text-sm text-white opacity-80">
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
              <div className="bg-red-50 text-red-800 p-4 rounded-2xl text-sm whitespace-pre-line border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {isLoading && <LoadingSpinner size="small" text="" />}
              <span className={isLoading ? 'ml-2' : ''}>
                {isLoading ? getLoadingMessage('auth') : 'Sign In'}
              </span>
            </button>
          </form>


          {/* Navigation Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-sm text-gray-600">
              New to SmartBite?
            </p>
            <button
              type="button"
              onClick={handleShowSignup}
              className="btn-secondary w-full"
            >
              Get Started - Free Trial
            </button>
            
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="w-full py-2 px-4 rounded-full font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-100 border border-lightgray transition-colors"
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;