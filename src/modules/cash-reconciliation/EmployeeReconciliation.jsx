import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://func-smartbite-reconciliation.azurewebsites.net/api';

const EmployeeReconciliation = ({ user }) => {
  // Check if employee has reconciliation access
  if (!user?.hasReconciliationAccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
          <p className="text-yellow-700">
            You do not have access to the cash reconciliation system. 
            Please contact your manager for assistance.
          </p>
        </div>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalSales: '',
    eftpos: {
      terminal1: '',
      terminal2: '',
      terminal3: '',
      terminal4: '',
      total: ''
    },
    payouts: '',
    register1: {
      hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
      loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '', cents: '' },
      coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' }
    },
    register2: {
      hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
      loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '', cents: '' },
      coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' }
    },
    comments: ''
  });

  const [calculations, setCalculations] = useState({
    expectedBanking: 0,
    actualBanking: 0,
    variance: 0,
    register1Total: 0,
    register2Total: 0,
    register1Banking: 0,
    register2Banking: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('smartbite-reconciliation');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartbite-reconciliation', JSON.stringify(formData));
    calculateTotals();
  }, [formData]);

  const calculateRegisterTotal = (register) => {
    const notes = (parseInt(register.hundreds) || 0) * 100 +
                 (parseInt(register.fifties) || 0) * 50 +
                 (parseInt(register.twenties) || 0) * 20 +
                 (parseInt(register.tens) || 0) * 10 +
                 (parseInt(register.fives) || 0) * 5;

    const coinBags = (parseInt(register.coinBags.dollars) || 0) * 20 +
                    (parseInt(register.coinBags.fifties) || 0) * 50 +
                    (parseInt(register.coinBags.twenties) || 0) * 10 +
                    (parseInt(register.coinBags.tens) || 0) * 4 +
                    (parseInt(register.coinBags.fives) || 0) * 4 +
                    (parseInt(register.coinBags.twos) || 0) * 2;

    const loose = (parseFloat(register.loose.dollars) || 0) +
                 (parseFloat(register.loose.fifties) || 0) +
                 (parseFloat(register.loose.twenties) || 0) +
                 (parseFloat(register.loose.tens) || 0) +
                 (parseFloat(register.loose.fives) || 0) +
                 (parseFloat(register.loose.cents) || 0);

    // Return object with breakdown
    return {
      notes,
      coinBags,
      loose,
      total: notes + coinBags + loose
    };
  };

  // Simple function to calculate banking amount (total - $400 reserve)
  const calculateBankingAmount = (total) => {
    const REGISTER_RESERVE = 400;
    return Math.max(0, total - REGISTER_RESERVE);
  };

  const calculateTotals = () => {
    const totalSales = parseFloat(formData.totalSales) || 0;
    
    // Calculate EFTPOS total from terminals
    const eftposTotal = (parseFloat(formData.eftpos.terminal1) || 0) +
                       (parseFloat(formData.eftpos.terminal2) || 0) +
                       (parseFloat(formData.eftpos.terminal3) || 0) +
                       (parseFloat(formData.eftpos.terminal4) || 0);
    
    // Update EFTPOS total in form data
    setFormData(prev => ({
      ...prev,
      eftpos: { ...prev.eftpos, total: eftposTotal.toFixed(2) }
    }));
    
    const payouts = parseFloat(formData.payouts) || 0;
    
    const register1Calc = calculateRegisterTotal(formData.register1);
    const register2Calc = calculateRegisterTotal(formData.register2);
    
    // Calculate actual banking automatically from register banking amounts
    const register1Banking = calculateBankingAmount(register1Calc.total);
    const register2Banking = calculateBankingAmount(register2Calc.total);
    const actualBanking = register1Banking + register2Banking;

    const expectedBanking = totalSales - eftposTotal - payouts;
    const variance = actualBanking - expectedBanking;

    setCalculations({
      expectedBanking,
      actualBanking,
      variance,
      register1Total: register1Calc.total,
      register2Total: register2Calc.total,
      register1Banking,
      register2Banking,
      register1Breakdown: register1Calc,
      register2Breakdown: register2Calc,
      eftposTotal
    });
  };

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    const newData = { ...formData };
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitReconciliation = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const submitData = {
        ...formData,
        calculations,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      const response = await fetch(`${API_BASE_URL}/reconciliations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-name': user?.name || 'Unknown Employee',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus({ type: 'success', message: 'Reconciliation submitted successfully!' });
        localStorage.removeItem('smartbite-reconciliation');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            date: new Date().toISOString().split('T')[0],
            totalSales: '',
            eftpos: { terminal1: '', terminal2: '', terminal3: '', terminal4: '', total: '' },
            payouts: '',
            register1: { hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
              loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '', cents: '' },
              coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' } },
            register2: { hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
              loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '', cents: '' },
              coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' } },
            comments: ''
          });
          setCurrentStep(1);
          setSubmitStatus(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to submit. Data saved locally. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Step 1: Register 1</h2>
      {renderRegisterContent(1)}
    </div>
  );

  const renderStep2 = () => (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Step 2: Register 2</h2>
      {renderRegisterContent(2)}
    </div>
  );

  const renderStep3 = () => (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Step 3: Sales & EFTPOS</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="form-label">Total Sales ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={formData.totalSales}
              onChange={(e) => handleInputChange('totalSales', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* EFTPOS Terminals */}
        <div>
          <h3 className="text-lg font-medium mb-4">EFTPOS Terminals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((terminalNum) => (
              <div key={terminalNum}>
                <label className="form-label">Terminal {terminalNum} ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.eftpos[`terminal${terminalNum}`]}
                  onChange={(e) => handleInputChange(`eftpos.terminal${terminalNum}`, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total EFTPOS:</strong> ${(calculations.eftposTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <label className="form-label">Payouts ($)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData.payouts}
            onChange={(e) => handleInputChange('payouts', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div className="mt-6 bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Expected Banking:</strong> ${calculations.expectedBanking.toFixed(2)}
        </p>
      </div>
    </div>
  );

  const renderRegisterContent = (registerNum) => {
    const register = formData[`register${registerNum}`];
    const breakdown = registerNum === 1 ? calculations.register1Breakdown : calculations.register2Breakdown;
    const total = registerNum === 1 ? calculations.register1Total : calculations.register2Total;
    const bankingAmount = calculateBankingAmount(total || 0);
    
    return (
      <div className="space-y-6">
        {/* Notes */}
        <div>
          <h3 className="text-lg font-medium mb-4">Notes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: '$100', key: 'hundreds' },
              { label: '$50', key: 'fifties' },
              { label: '$20', key: 'twenties' },
              { label: '$10', key: 'tens' },
              { label: '$5', key: 'fives' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  className="form-input"
                  value={register[key]}
                  onChange={(e) => handleInputChange(`register${registerNum}.${key}`, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            <strong>Notes Total: ${(breakdown?.notes || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* Loose Coins First */}
        <div>
          <h3 className="text-lg font-medium mb-4">Loose Coins</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: '$1', key: 'dollars' },
              { label: '50¢', key: 'fifties' },
              { label: '20¢', key: 'twenties' },
              { label: '10¢', key: 'tens' },
              { label: '5¢', key: 'fives' },
              { label: 'Cents', key: 'cents' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  step={key === 'cents' ? "0.01" : "1"}
                  className="form-input"
                  value={register.loose[key]}
                  onChange={(e) => handleInputChange(`register${registerNum}.loose.${key}`, e.target.value)}
                  placeholder={key === 'cents' ? "0.00" : "0"}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
            <strong>Loose Coins Total: ${(breakdown?.loose || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* Coin Bags/Rolls Second */}
        <div>
          <h3 className="text-lg font-medium mb-4">Coin Bags/Rolls</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: '$1 Roll ($20)', key: 'dollars' },
              { label: '$2 Roll ($50)', key: 'twos' },
              { label: '50¢ Roll ($10)', key: 'fifties' },
              { label: '20¢ Roll ($4)', key: 'twenties' },
              { label: '10¢ Roll ($4)', key: 'tens' },
              { label: '5¢ Roll ($2)', key: 'fives' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  className="form-input"
                  value={register.coinBags[key]}
                  onChange={(e) => handleInputChange(`register${registerNum}.coinBags.${key}`, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
            <strong>Coin Rolls Total: ${(breakdown?.coinBags || 0).toFixed(2)}</strong>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-800">
                <strong>Register {registerNum} Total Cash:</strong>
              </p>
              <p className="text-2xl font-bold text-green-900">
                ${(total || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-green-700">
                <strong>Available for Banking:</strong>
              </p>
              <p className="text-2xl font-bold text-green-800">
                ${bankingAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Step 4: Banking & Review</h2>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Daily Reconciliation Summary</h3>
          
          {/* Sales Information */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Sales & Payments</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-blue-700">Total Sales</p>
                <p className="text-xl font-bold text-blue-900">${parseFloat(formData.totalSales || 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Total EFTPOS</p>
                <p className="text-xl font-bold text-blue-900">${(calculations.eftposTotal || 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Payouts</p>
                <p className="text-xl font-bold text-blue-900">${parseFloat(formData.payouts || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Register Banking */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Cash Banking</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Register 1 Banking</span>
                  <span className="text-lg font-bold text-green-900">${(calculations.register1Banking || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Register 2 Banking</span>
                  <span className="text-lg font-bold text-green-900">${(calculations.register2Banking || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-green-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-green-800">Total Actual Banking</span>
                    <span className="text-xl font-bold text-green-900">${calculations.actualBanking.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected vs Actual */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">Banking Comparison</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Expected Banking</span>
                  <span className="text-lg font-bold text-purple-900">${calculations.expectedBanking.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Actual Banking</span>
                  <span className="text-lg font-bold text-purple-900">${calculations.actualBanking.toFixed(2)}</span>
                </div>
                <div className="border-t border-purple-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-purple-800">Variance</span>
                    <span className={`text-xl font-bold ${
                      calculations.variance === 0 ? 'text-green-600' : 
                      calculations.variance > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      ${calculations.variance >= 0 ? '+' : ''}${calculations.variance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`p-4 rounded-lg text-center ${
            calculations.variance === 0 
              ? 'bg-green-100 border border-green-300' 
              : Math.abs(calculations.variance) <= 5 
                ? 'bg-yellow-100 border border-yellow-300' 
                : 'bg-red-100 border border-red-300'
          }`}>
            <p className={`text-lg font-semibold ${
              calculations.variance === 0 
                ? 'text-green-800' 
                : Math.abs(calculations.variance) <= 5 
                  ? 'text-yellow-800' 
                  : 'text-red-800'
            }`}>
              {calculations.variance === 0 
                ? '✅ Perfect Balance - No Variance' 
                : Math.abs(calculations.variance) <= 5 
                  ? '⚠️ Minor Variance - Within Tolerance' 
                  : '❌ Significant Variance - Add Comments'}
            </p>
          </div>
        </div>

        <div>
          <label className="form-label">Comments</label>
          <textarea
            className="form-input"
            rows="3"
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>

        {submitStatus && (
          <div className={`p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {submitStatus.message}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-20 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Register 1</span>
          <span>Register 2</span>
          <span>Sales & EFTPOS</span>
          <span>Banking</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>

        {currentStep < 4 ? (
          <button onClick={nextStep} className="btn-primary">
            Next
          </button>
        ) : (
          <button
            onClick={submitReconciliation}
            disabled={isSubmitting}
            className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Reconciliation'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeReconciliation;