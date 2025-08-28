import React, { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';
import { formatErrorDisplay, getLoadingMessage } from '../../utils/errorMessages.js';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';

const ConfigurationSettings = ({ user, onClose }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Normalize configuration to ensure arrays match counts
  const normalizeConfig = (config) => {
    if (!config) return config;
    
    const normalized = { ...config };
    
    // Fix registers configuration
    if (normalized.registers) {
      const registerCount = normalized.registers.count || 0;
      
      // Ensure names array matches count
      if (!normalized.registers.names || normalized.registers.names.length !== registerCount) {
        normalized.registers.names = Array.from({ length: registerCount }, (_, i) => 
          normalized.registers.names?.[i] || `Register ${i + 1}`
        );
      }
      
      // Ensure enabled array matches count
      if (!normalized.registers.enabled || normalized.registers.enabled.length !== registerCount) {
        normalized.registers.enabled = Array.from({ length: registerCount }, (_, i) => 
          normalized.registers.enabled?.[i] !== undefined ? normalized.registers.enabled[i] : true
        );
      }
    }
    
    // Fix POS terminals configuration
    if (normalized.posTerminals) {
      const terminalCount = normalized.posTerminals.count || 0;
      
      // Ensure names array matches count
      if (!normalized.posTerminals.names || normalized.posTerminals.names.length !== terminalCount) {
        normalized.posTerminals.names = Array.from({ length: terminalCount }, (_, i) => 
          normalized.posTerminals.names?.[i] || `Terminal ${i + 1}`
        );
      }
      
      // Ensure enabled array matches count
      if (!normalized.posTerminals.enabled || normalized.posTerminals.enabled.length !== terminalCount) {
        normalized.posTerminals.enabled = Array.from({ length: terminalCount }, (_, i) => 
          normalized.posTerminals.enabled?.[i] !== undefined ? normalized.posTerminals.enabled[i] : true
        );
      }
    }
    
    return normalized;
  };

  // Transform API field names to frontend field names for editing
  const transformApiToFrontend = (apiConfig) => {
    if (!apiConfig) return apiConfig;
    
    const transformed = { ...apiConfig };
    
    // Handle reconciliation field mappings (API → Frontend)
    if (transformed.reconciliation) {
      const rec = { ...transformed.reconciliation };
      
      // requireManagerApproval → requireApproval
      if ('requireManagerApproval' in rec) {
        rec.requireApproval = rec.requireManagerApproval;
        delete rec.requireManagerApproval;
      }
      
      // varianceTolerance → tolerance  
      if ('varianceTolerance' in rec) {
        rec.tolerance = rec.varianceTolerance;
        delete rec.varianceTolerance;
      }
      
      // autoSubmitThreshold → autoApprove (threshold > 0 = true)
      if ('autoSubmitThreshold' in rec) {
        rec.autoApprove = rec.autoSubmitThreshold > 0;
        delete rec.autoSubmitThreshold;
      }
      
      transformed.reconciliation = rec;
    }
    
    return transformed;
  };

  // Transform frontend field names to API field names for submission
  const transformFrontendToApi = (frontendConfig) => {
    if (!frontendConfig) return frontendConfig;
    
    // Filter out metadata fields that API doesn't accept
    const {
      id,
      tenantId, 
      configType,
      createdAt,
      updatedAt,
      _rid,
      _etag, 
      _self,
      _attachments,
      _ts,
      ...cleanConfig
    } = frontendConfig;
    
    const apiConfig = { ...cleanConfig };
    
    // Transform reconciliation field mappings (Frontend → API)
    // New API accepts all sections: registers, posTerminals, reconciliation, business
    if (apiConfig.reconciliation) {
      const rec = { ...apiConfig.reconciliation };
      
      // requireApproval → requireManagerApproval (if exists)
      if ('requireApproval' in rec) {
        rec.requireManagerApproval = rec.requireApproval;
        delete rec.requireApproval;
      }
      
      // tolerance → varianceTolerance (if exists) 
      if ('tolerance' in rec) {
        rec.varianceTolerance = rec.tolerance;
        delete rec.tolerance;
      }
      
      // autoApprove → autoSubmitThreshold (if exists)
      if ('autoApprove' in rec) {
        if (!rec.autoApprove) {
          rec.autoSubmitThreshold = 0;
        }
        // When true, omit the field entirely
        delete rec.autoApprove;
      }
      
      apiConfig.reconciliation = rec;
    }
    
    return apiConfig;
  };

  // Load current configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const result = await configService.getConfig();
        
        if (result.success) {
          // New API structure: config is directly under result.config (no more nested settings)
          const apiConfig = result.config;
          
          // Transform API field names to frontend field names for editing
          const transformedConfig = transformApiToFrontend(apiConfig);
          const normalizedConfig = normalizeConfig(transformedConfig);
          setConfig(normalizedConfig);
        } else {
          setErrors({ general: 'Failed to load configuration' });
        }
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setErrors({ general: 'Failed to load configuration' });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear any existing errors for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (section, field, index, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addRegister = () => {
    if (config.registers.count < 10) {
      setConfig(prev => {
        const newCount = prev.registers.count + 1;
        const newNames = [...prev.registers.names];
        
        // Ensure names array matches the new count
        while (newNames.length < newCount) {
          newNames.push(`Register ${newNames.length + 1}`);
        }
        
        return {
          ...prev,
          registers: {
            ...prev.registers,
            count: newCount,
            names: newNames,
            enabled: [...(prev.registers.enabled || []), true]
          }
        };
      });
    }
  };

  const removeRegister = () => {
    if (config.registers.count > 1) {
      setConfig(prev => ({
        ...prev,
        registers: {
          ...prev.registers,
          count: prev.registers.count - 1,
          names: prev.registers.names.slice(0, prev.registers.count - 1),
          enabled: (prev.registers.enabled || []).slice(0, prev.registers.count - 1)
        }
      }));
    }
  };

  const addPosTerminal = () => {
    if (config.posTerminals.count < 20) {
      setConfig(prev => {
        const newCount = prev.posTerminals.count + 1;
        const newNames = [...prev.posTerminals.names];
        const newEnabled = [...(prev.posTerminals.enabled || [])];
        
        // Ensure arrays match the new count
        while (newNames.length < newCount) {
          newNames.push(`Terminal ${newNames.length + 1}`);
        }
        while (newEnabled.length < newCount) {
          newEnabled.push(true);
        }
        
        return {
          ...prev,
          posTerminals: {
            ...prev.posTerminals,
            count: newCount,
            names: newNames,
            enabled: newEnabled
          }
        };
      });
    }
  };

  const removePosTerminal = () => {
    if (config.posTerminals.count > 1) {
      setConfig(prev => ({
        ...prev,
        posTerminals: {
          ...prev.posTerminals,
          count: prev.posTerminals.count - 1,
          names: prev.posTerminals.names.slice(0, prev.posTerminals.count - 1),
          enabled: (prev.posTerminals.enabled || []).slice(0, prev.posTerminals.count - 1)
        }
      }));
    }
  };

  const togglePosTerminal = (index) => {
    setConfig(prev => ({
      ...prev,
      posTerminals: {
        ...prev.posTerminals,
        enabled: prev.posTerminals.enabled.map((enabled, i) => 
          i === index ? !enabled : enabled
        )
      }
    }));
  };

  const validateConfiguration = () => {
    const validation = configService.validateConfig(config);
    setErrors(validation.errors.reduce((acc, error) => {
      acc.validation = error;
      return acc;
    }, {}));
    return validation.isValid;
  };

  const saveConfiguration = async () => {
    if (!validateConfiguration()) {
      return;
    }

    try {
      setSaving(true);
      setSaveStatus(null);
      
      // Transform frontend fields to API format and send  
      const apiConfig = transformFrontendToApi(config);
      const result = await configService.updateSystemConfig(apiConfig);
      
      if (result.success) {
        setSaveStatus({ type: 'success', message: result.message });
        
        // Auto-close after successful save
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSaveStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveStatus({ type: 'error', message: formatErrorDisplay(error, 'config') });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h3>
            <p className="text-red-700 mb-4">Failed to load system configuration.</p>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">System Configuration</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            
            {/* Registers Configuration */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Cash Registers</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Number of Registers</label>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={removeRegister}
                      disabled={config.registers.count <= 1}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{config.registers.count}</span>
                    <button 
                      onClick={addRegister}
                      disabled={config.registers.count >= 10}
                      className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Reserve Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={config.registers.reserveAmount}
                    onChange={(e) => handleInputChange('registers', 'reserveAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label">Register Names</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.registers.names.map((name, index) => (
                    <input
                      key={index}
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => handleArrayChange('registers', 'names', index, e.target.value)}
                      placeholder={`Register ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* POS Terminals Configuration */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">POS Terminals</h3>
              
              <div className="mb-4">
                <label className="form-label">Number of POS Terminals</label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={removePosTerminal}
                    disabled={config.posTerminals.count <= 1}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{config.posTerminals.count}</span>
                  <button 
                    onClick={addPosTerminal}
                    disabled={config.posTerminals.count >= 20}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Terminal Configuration</label>
                <div className="space-y-3">
                  {config.posTerminals.names.map((name, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.posTerminals.enabled[index]}
                          onChange={() => togglePosTerminal(index)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enabled</label>
                      </div>
                      <input
                        type="text"
                        className="form-input flex-1"
                        value={name}
                        onChange={(e) => handleArrayChange('posTerminals', 'names', index, e.target.value)}
                        placeholder={`Terminal ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reconciliation Settings */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">Reconciliation Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Daily Deadline</label>
                  <input
                    type="time"
                    className="form-input"
                    value={config.reconciliation.dailyDeadline}
                    onChange={(e) => handleInputChange('reconciliation', 'dailyDeadline', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="form-label">Variance Tolerance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={config.reconciliation.varianceTolerance}
                    onChange={(e) => handleInputChange('reconciliation', 'varianceTolerance', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.reconciliation.requireManagerApproval}
                    onChange={(e) => handleInputChange('reconciliation', 'requireManagerApproval', e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Require Manager Approval for Variances</label>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="text-red-800 font-semibold mb-2">Configuration Errors:</h4>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save Status */}
            {saveStatus && (
              <div className={`p-4 rounded-lg whitespace-pre-line ${
                saveStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {saveStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={saveConfiguration}
              disabled={isSaving || Object.keys(errors).length > 0}
              className={`btn-primary flex items-center justify-center ${(isSaving || Object.keys(errors).length > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving && <LoadingSpinner size="small" text="" />}
              <span className={isSaving ? 'ml-2' : ''}>
                {isSaving ? getLoadingMessage('config_update') : 'Save Configuration'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSettings;