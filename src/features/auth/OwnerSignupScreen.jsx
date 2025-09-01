import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import SignupSuccess from './SignupSuccess.jsx';
import { formatErrorDisplay, getLoadingMessage } from '../../utils/errorMessages.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';

const OwnerSignupScreen = ({ onSignupSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'restaurant',
    address: {
      country: 'AU',
      state: '',
      zipCode: '',
      city: ''
    },
    timezone: 'Australia/Sydney',
    currency: 'AUD'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [successResult, setSuccessResult] = useState(null);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone } = formData;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all personal information fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { address } = formData;
    if (!address.city.trim() || !address.state.trim() || !address.zipCode.trim()) {
      setError('Please fill in all required address fields (city, state, postcode)');
      return false;
    }
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setError('');

    console.log('Starting signup with data:', formData); // Debug log

    try {
      const result = await authService.ownerSignup(formData);
      
      console.log('Signup result:', result); // Debug log
      
      if (result.success) {
        // Show success screen with credentials; defer continuation until user clicks
        setSuccessResult(result);
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(formatErrorDisplay(err, 'signup'));
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Australia/Sydney', label: 'Sydney, Australia' },
    { value: 'Europe/London', label: 'London, UK' },
    { value: 'Europe/Paris', label: 'Paris, France' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' }
  ];

  if (successResult) {
    return (
      <SignupSuccess
        result={successResult}
        onContinue={() => onSignupSuccess(successResult)}
        onBackToLogin={onBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to SmartBite
          </h2>
          <p className="mt-2 text-sm text-green-200">
            Set up your restaurant in just 2 simple steps
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>


          <form onSubmit={step === 2 ? handleSignup : handleNextStep} className="space-y-6">
            {step === 1 && (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tell us about yourself</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john.smith@example.com"
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+61 2 1234 5678"
                  />
                </div>

                {/* PIN removed - API generates credentials and PIN */}
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your business details</h3>
                
                <div>
                  <label className="form-label">Business Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Smith's Restaurant (if not provided, will be generated from your name)"
                  />
                </div>

                <div>
                  <label className="form-label">Business Type</label>
                  <select
                    className="form-input"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar</option>
                    <option value="fastfood">Fast Food</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Country</label>
                  <select
                    className="form-input"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                  >
                    <option value="AU">Australia</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">State/Territory</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      placeholder="NSW"
                    />
                  </div>
                  <div>
                    <label className="form-label">Postcode</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">City/Suburb</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Sydney"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-input"
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select
                      className="form-input"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      {currencies.map(curr => (
                        <option key={curr.value} value={curr.value}>{curr.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step === 1 && (
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Already have an account?
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                }`}
              >
                {isLoading && step === 2 && <LoadingSpinner size="small" text="" />}
                <span className={isLoading && step === 2 ? 'ml-2' : ''}>
                  {isLoading && step === 2 ? getLoadingMessage('signup') : step === 1 ? 'Continue' : 'Start Free Trial'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerSignupScreen;