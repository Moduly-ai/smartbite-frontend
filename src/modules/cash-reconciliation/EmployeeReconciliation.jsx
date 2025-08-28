import React, { useState, useEffect } from 'react';
import { reconciliationService } from '../../services/reconciliationService.js';
import { configService } from '../../services/configService.js';
import RegisterComponent from '../../components/shared/RegisterComponent.jsx';
import PosTerminalComponent from '../../components/shared/PosTerminalComponent.jsx';

const EmployeeReconciliation = ({ user }) => {
  // ALL STATE AND HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
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
      loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '' },
      coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' }
    },
    register2: {
      hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
      loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '' },
      coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' }
    },
    bagNumber: '',
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

  // Check if employee has reconciliation access
  const hasAccess = user?.hasReconciliationAccess || user?.permissions?.includes('reconciliation') || user?.userType === 'employee' || user?.userType === 'manager' || user?.userType === 'owner';

  // CALCULATION FUNCTIONS - MUST BE DEFINED BEFORE USEEFFECT
  const calculateRegisterTotal = (register) => {
    const notes = (parseInt(register.hundreds) || 0) * 100 +
                 (parseInt(register.fifties) || 0) * 50 +
                 (parseInt(register.twenties) || 0) * 20 +
                 (parseInt(register.tens) || 0) * 10 +
                 (parseInt(register.fives) || 0) * 5;

    const coinBags = (parseInt(register.coinBags.dollars) || 0) * 20 +    // $1 Roll = $20 (20 x $1 coins)
                    (parseInt(register.coinBags.twos) || 0) * 50 +      // $2 Roll = $50 (25 x $2 coins)
                    (parseInt(register.coinBags.fifties) || 0) * 10 +   // 50¢ Roll = $10 (20 x 50¢ coins)
                    (parseInt(register.coinBags.twenties) || 0) * 4 +   // 20¢ Roll = $4 (20 x 20¢ coins)
                    (parseInt(register.coinBags.tens) || 0) * 4 +       // 10¢ Roll = $4 (40 x 10¢ coins)
                    (parseInt(register.coinBags.fives) || 0) * 2;       // 5¢ Roll = $2 (40 x 5¢ coins)

  const loose = (parseFloat(register.loose.twos) || 0) * 2 +
       (parseFloat(register.loose.dollars) || 0) * 1 +
       (parseFloat(register.loose.fifties) || 0) * 0.5 +
       (parseFloat(register.loose.twenties) || 0) * 0.2 +
       (parseFloat(register.loose.tens) || 0) * 0.1 +
       (parseFloat(register.loose.fives) || 0) * 0.05;

    return {
      notes,
      coinBags,
      loose,
      total: notes + coinBags + loose
    };
  };

  const calculateBankingAmount = (total) => {
    const reserveAmount = config?.registers?.reserveAmount || 400;
    return Math.max(0, total - reserveAmount);
  };

  const calculateTotals = () => {
    if (!config) return;
    
    const totalSales = parseFloat(formData.totalSales) || 0;
    
    // Calculate EFTPOS total from enabled terminals
    let eftposTotal = 0;
    config.posTerminals.names.forEach((_, index) => {
      if (config.posTerminals.enabled[index]) {
        eftposTotal += parseFloat(formData.eftpos[`terminal${index + 1}`]) || 0;
      }
    });
    
    const payouts = parseFloat(formData.payouts) || 0;
    
    // Calculate totals for all configured registers
    const registerCalcs = {};
    const registerTotals = {};
    const registerBanking = {};
    let totalCash = 0;
    let actualBanking = 0;

    for (let i = 1; i <= config.registers.count; i++) {
      const registerData = formData[`register${i}`];
      if (registerData) {
        registerCalcs[i] = calculateRegisterTotal(registerData);
        registerTotals[i] = registerCalcs[i].total;
        registerBanking[i] = calculateBankingAmount(registerCalcs[i].total);
        totalCash += registerCalcs[i].total;
        actualBanking += registerBanking[i];
      }
    }

    const expectedBanking = totalSales - eftposTotal - payouts;
    const variance = actualBanking - expectedBanking;

    setCalculations({
      expectedBanking,
      actualBanking,
      variance,
      totalCash,
      registerTotals,
      registerBanking,
      registerCalcs,
      eftposTotal
    });
  };

  // Load configuration on component mount - THIS USEEFFECT MUST RUN
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Try to get from API first, fall back to cached/default if needed
        const result = await configService.getConfig();
        const configToUse = result.success ? result.config : null;
        setConfig(configToUse);
        setIsLoadingConfig(false);
      } catch (error) {
        console.error('Failed to load config:', error);
        setConfig(null);
        setIsLoadingConfig(false);
      }
    };

    loadConfig();
  }, []); // Empty dependency array - run once on mount

  // Auto-save to localStorage
  useEffect(() => {
    if (!isLoadingConfig && formData.date) {
      const savedData = localStorage.getItem('smartbite-reconciliation');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse saved data:', e);
        }
      }
    }
  }, [isLoadingConfig]);

  useEffect(() => {
    localStorage.setItem('smartbite-reconciliation', JSON.stringify(formData));
    calculateTotals();
  }, [formData]);

  // CONDITIONAL RETURNS COME AFTER ALL HOOKS
  if (!hasAccess) {
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

  if (isLoadingConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading configuration...</span>
        </div>
      </div>
    );
  }

  if (!config || !config.registers || !config.registers.count) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h3>
          <p className="text-red-700">
            Failed to load system configuration. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

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
    const maxSteps = config.registers.count + 2;
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    const maxSteps = config.registers.count + 2;
    if (step >= 1 && step <= maxSteps) {
      setCurrentStep(step);
    }
  };

  const getStepTitle = (step) => {
    if (!config) return 'Step';
    
    // Register steps (1 to config.registers.count)
    if (step <= config.registers.count) {
      return config.registers.names[step - 1] || `Register ${step}`;
    }
    
    // Sales & EFTPOS step
    if (step === config.registers.count + 1) {
      return 'Sales & POS';
    }
    
    // Banking & Review step (final step)
    if (step === config.registers.count + 2) {
      return 'Banking';
    }
    
    return 'Step';
  };

  const submitReconciliation = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Format data to match API schema
      const submitData = {
        date: formData.date,
        registers: [],
        posTerminals: [],
        summary: {
          totalSales: parseFloat(formData.totalSales) || 0,
          totalEftpos: calculations.eftposTotal || 0,
          payouts: parseFloat(formData.payouts) || 0,
          expectedBanking: calculations.expectedBanking || 0,
          actualBanking: calculations.actualBanking || 0,
          variance: calculations.variance || 0
        },
        calculations: {
          expectedBanking: calculations.expectedBanking || 0,
          actualBanking: calculations.actualBanking || 0,
          variance: calculations.variance || 0,
          isBalanced: Math.abs(calculations.variance || 0) < 0.01,
          ...calculations
        },
        bagNumber: formData.bagNumber || '',
        comments: formData.comments || ''
      };

      // Add register data
      for (let i = 1; i <= config.registers.count; i++) {
        const registerData = formData[`register${i}`];
        if (registerData) {
          submitData.registers.push({
            id: i,
            name: config.registers.names[i - 1] || `Register ${i}`,
            cash: registerData,
            total: calculations.registerTotals[i] || 0,
            reserve: config.registers.reserveAmount || 400,
            banking: calculations.registerBanking[i] || 0
          });
        }
      }

      // Add POS terminal data
      config.posTerminals.names.forEach((name, index) => {
        if (config.posTerminals.enabled[index]) {
          submitData.posTerminals.push({
            id: index + 1,
            name: name || `Terminal ${index + 1}`,
            total: parseFloat(formData.eftpos[`terminal${index + 1}`]) || 0
          });
        }
      });

      const displayName = user?.name || user?.fullName || user?.email || user?.employeeId || 'Unknown Employee';
      const result = await reconciliationService.submitReconciliation(
        submitData, 
        displayName
      );
      
      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message });
        localStorage.removeItem('smartbite-reconciliation');
        
        // Reset form after successful submission
        setTimeout(() => {
          const resetFormData = {
            date: new Date().toISOString().split('T')[0],
            totalSales: '',
            eftpos: {},
            payouts: '',
            bagNumber: '',
            comments: ''
          };

          // Reset EFTPOS terminals based on config
          config.posTerminals.names.forEach((_, index) => {
            resetFormData.eftpos[`terminal${index + 1}`] = '';
          });
          resetFormData.eftpos.total = '';

          // Reset registers based on config
          for (let i = 1; i <= config.registers.count; i++) {
            resetFormData[`register${i}`] = {
              hundreds: '', fifties: '', twenties: '', tens: '', fives: '',
              loose: { dollars: '', fifties: '', twenties: '', tens: '', fives: '' },
              coinBags: { dollars: '', twos: '', fifties: '', twenties: '', tens: '', fives: '' }
            };
          }

          setFormData(resetFormData);
          setCurrentStep(1);
          setSubmitStatus(null);
        }, 3000);
      } else {
        throw new Error(result.message || result.error || 'Submission failed');
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

  const renderRegisterStep = (stepNumber) => {
    const registerNumber = stepNumber;
    const registerName = config.registers.names[registerNumber - 1] || `Register ${registerNumber}`;
    const registerData = formData[`register${registerNumber}`] || {};
    const breakdown = calculations.registerCalcs?.[registerNumber];
    
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Step {stepNumber}: {registerName}</h2>
        <RegisterComponent
          registerNumber={registerNumber}
          registerName={registerName}
          registerData={registerData}
          onInputChange={handleInputChange}
          breakdown={breakdown}
          reserveAmount={config.registers.reserveAmount}
        />
      </div>
    );
  };

  const renderSalesStep = () => {
    const stepNumber = config.registers.count + 1;
    
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Step {stepNumber}: Sales & POS</h2>
        
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

          {/* POS Terminals */}
          <PosTerminalComponent
            terminals={config.posTerminals.names.map((name, index) => ({
              name,
              enabled: config.posTerminals.enabled[index]
            }))}
            terminalData={formData.eftpos}
            onInputChange={handleInputChange}
            totalEftpos={calculations.eftposTotal}
          />

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
            <strong>Expected Banking:</strong> ${(calculations.expectedBanking || 0).toFixed(2)}
          </p>
        </div>
      </div>
    );
  };


  const renderBankingStep = () => {
    const stepNumber = config.registers.count + 2;
    
    return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Step {stepNumber}: Banking & Review</h2>
      
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
            {/* Register Cash */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Cash</h4>
              <div className="space-y-3">
                {Array.from({ length: config.registers.count }, (_, i) => {
                  const registerNum = i + 1;
                  const registerName = config.registers.names[i] || `Register ${registerNum}`;
                  const bankingAmount = calculations.registerBanking?.[registerNum] || 0;
                  
                  return (
                    <div key={registerNum} className="flex justify-between items-center">
                      <span className="text-sm text-green-700">{registerName} Banking</span>
                      <span className="text-lg font-bold text-green-900">${bankingAmount.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-green-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-green-800">Total Banking</span>
                    <span className="text-xl font-bold text-green-900">${(calculations.actualBanking || 0).toFixed(2)}</span>
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
          <label className="form-label">Bag Number</label>
          <input
            type="text"
            className="form-input"
            value={formData.bagNumber}
            onChange={(e) => handleInputChange('bagNumber', e.target.value)}
            placeholder="Enter bag number for cash deposit..."
          />
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
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: config.registers.count + 2 }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => goToStep(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${step <= currentStep 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                } ${step === currentStep ? 'ring-2 ring-blue-300' : ''}`}
                title={`Go to ${getStepTitle(step)}`}
              >
                {step}
              </button>
              {step < config.registers.count + 2 && (
                <div className={`w-20 h-1 mx-2 transition-colors duration-200 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {Array.from({ length: config.registers.count + 2 }, (_, i) => {
            const step = i + 1;
            const title = getStepTitle(step);
            return (
              <button 
                key={step}
                onClick={() => goToStep(step)}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                title={`Go to ${title}`}
              >
                {title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep <= config.registers.count && renderRegisterStep(currentStep)}
        {currentStep === config.registers.count + 1 && renderSalesStep()}
        {currentStep === config.registers.count + 2 && renderBankingStep()}
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

        {currentStep < config.registers.count + 2 ? (
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