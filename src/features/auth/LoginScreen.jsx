import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
  const [loginType, setLoginType] = useState('employee');
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock data - in real implementation, this would come from API
  const mockEmployees = [
    { name: 'John Smith', pin: '1234', mobile: '0412345678', hasReconciliationAccess: true },
    { name: 'Jane Doe', pin: '5678', mobile: '0423456789', hasReconciliationAccess: false },
    { name: 'Mike Johnson', pin: '9999', mobile: '0434567890', hasReconciliationAccess: true }
  ];

  const mockOwner = { name: 'Owner Admin', pin: '0000', mobile: '0401234567' };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (loginType === 'owner') {
        // Owner login validation
        if (formData.name === mockOwner.name && formData.pin === mockOwner.pin) {
          onLogin({
            userType: 'owner',
            name: mockOwner.name,
            mobile: mockOwner.mobile,
            loginTime: new Date().toISOString()
          });
        } else {
          setError('Invalid owner credentials');
        }
      } else {
        // Employee login validation
        const employee = mockEmployees.find(emp => 
          emp.name === formData.name && emp.pin === formData.pin
        );
        
        if (employee) {
          onLogin({
            userType: 'employee',
            name: employee.name,
            mobile: employee.mobile,
            hasReconciliationAccess: employee.hasReconciliationAccess,
            loginTime: new Date().toISOString()
          });
        } else {
          setError('Invalid employee credentials');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            SmartBite
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Cash Reconciliation System
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Login Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('employee');
                setFormData({ name: '', pin: '', mobile: '' });
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'employee' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('owner');
                setFormData({ name: '', pin: '', mobile: '' });
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'owner' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Owner
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="form-label">
                {loginType === 'owner' ? 'Owner Name' : 'Employee Name'}
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={loginType === 'owner' ? 'Enter owner name' : 'Enter your name'}
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
                maxLength="4"
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
              {isLoading ? 'Signing In...' : `Sign In as ${loginType === 'owner' ? 'Owner' : 'Employee'}`}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-700">Owner</p>
                <p className="text-gray-600">Owner Admin / 0000</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-700">Employee</p>
                <p className="text-gray-600">John Smith / 1234</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;