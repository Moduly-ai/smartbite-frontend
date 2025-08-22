/**
 * Configuration service
 * Handles system configuration API calls with proper authentication
 */

import apiClient from './apiClient.js';

export const configService = {
  /**
   * Ensure user is authenticated before making config requests
   * @returns {boolean} True if authenticated
   */
  ensureAuthenticated() {
    const session = this.getStoredSession();
    if (session?.token) {
      apiClient.setAuthToken(session.token);
      return true;
    }
    console.warn('ConfigService: No valid authentication token found');
    return false;
  },

  /**
   * Get stored session from localStorage
   * @returns {Object|null} Session data
   */
  getStoredSession() {
    try {
      const sessionData = localStorage.getItem('smartbite-session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is still valid
        if (session.expiresAt && Date.now() < session.expiresAt) {
          return session;
        } else {
          console.warn('ConfigService: Session expired');
          localStorage.removeItem('smartbite-session');
        }
      }
    } catch (error) {
      console.error('ConfigService: Error reading session:', error);
    }
    return null;
  },

  /**
   * Get system configuration
   * @returns {Promise<Object>} Configuration data
   */
  async getSystemConfig() {
    if (!this.ensureAuthenticated()) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to get configuration'
      };
    }
    try {
      const response = await apiClient.get('/config/system');
      if (response.success && response.config) {
        return {
          success: true,
          config: response.config,
          message: 'Configuration retrieved successfully',
          timestamp: response.timestamp
        };
      } else {
        throw new Error(response.error || 'Failed to get configuration');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get configuration from API'
      };
    }
  },

  /**
   * Clean configuration object for API submission
   * Removes server-side fields that shouldn't be sent in PUT requests
   * @param {Object} config - Configuration object to clean
   * @returns {Object} Cleaned configuration object
   */
  cleanConfigForSubmission(config) {
    const {
      // Remove server-side fields
      id,
      tenantId,
      lastUpdated,
      version,
      updatedBy,
      timestamp,
      _lastUpdated,
      // Keep only the core configuration fields
      ...cleanConfig
    } = config;

    return cleanConfig;
  },

  /**
   * Update system configuration (Owner only)
   * @param {Object} config - Updated configuration
   * @returns {Promise<Object>} Update result
   */
  async updateSystemConfig(config) {
    console.log('ConfigService: updateSystemConfig called with config:', config);
    
    // Ensure we have authentication
    if (!this.ensureAuthenticated()) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to update configuration'
      };
    }

    // Validate that user has owner permissions
    const session = this.getStoredSession();
    if (session?.user?.userType !== 'owner') {
      return {
        success: false,
        error: 'Permission denied',
        message: 'Only owners can update system configuration'
      };
    }

    // Clean the configuration object before sending
    const cleanConfig = this.cleanConfigForSubmission(config);
    
    try {
      console.log('ConfigService: Making authenticated PUT request to /config/system');
      console.log('ConfigService: Request body:', JSON.stringify(cleanConfig, null, 2));
      
      const response = await apiClient.put('/config/system', cleanConfig);
      console.log('ConfigService: PUT response received:', response);
      
      if (response.success && response.config) {
        console.log('ConfigService: API update successful, received updated config');
        
        return {
          success: true,
          config: response.config,
          message: response.message || 'Configuration updated successfully',
          timestamp: response.timestamp,
          updatedBy: response.updatedBy
        };
      } else {
        console.warn('ConfigService: API returned success=false or missing config:', response);
        throw new Error(response.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('ConfigService: API update error:', {
        message: error.message,
        stack: error.stack
      });
      
      // Handle authentication errors specifically
      if (error.message.includes('Authentication required') || 
          error.message.includes('401') ||
          error.message.includes('Unauthorized')) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'Please log in again to update configuration'
        };
      }
      
      // Handle permission errors
      if (error.message.includes('Owner access required') || 
          error.message.includes('403') ||
          error.message.includes('Forbidden')) {
        return {
          success: false,
          error: 'Permission denied',
          message: 'Only owners can update system configuration'
        };
      }

      // Handle validation errors
      if (error.message.includes('Validation failed') || error.message.includes('400')) {
        return {
          success: false,
          error: 'Validation failed',
          message: 'Configuration data is invalid. Please check your inputs and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update configuration. Please try again.'
      };
    }
  },


  /**
   * Get system configuration (alias for getSystemConfig)
   * @returns {Promise<Object>} Configuration data
   */
  async getConfig() {
    return this.getSystemConfig();
  },

  /**
   * Get fresh configuration directly from API
   * @returns {Promise<Object>} Configuration data
   */
  async getFreshConfig() {
    console.log('ConfigService: getFreshConfig called - getting latest from API');
    return this.getSystemConfig();
  },


  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const errors = [];

    // Validate registers
    if (!config.registers) {
      errors.push('Registers configuration is required');
    } else {
      if (!config.registers.count || config.registers.count < 1 || config.registers.count > 10) {
        errors.push('Register count must be between 1 and 10');
      }
      if (config.registers.reserveAmount == null || config.registers.reserveAmount < 0) {
        errors.push('Reserve amount must be a positive number');
      }
      if (!config.registers.names || config.registers.names.length !== config.registers.count) {
        errors.push('Number of register names must match register count');
      }
    }

    // Validate business info
    if (config.business) {
      if (config.business.name && (config.business.name.length < 1 || config.business.name.length > 100)) {
        errors.push('Business name must be between 1 and 100 characters');
      }
      if (config.business.taxRate != null && (config.business.taxRate < 0 || config.business.taxRate > 100)) {
        errors.push('Tax rate must be between 0 and 100');
      }
    }

    // Validate POS terminals
    if (!config.posTerminals) {
      errors.push('POS terminals configuration is required');
    } else {
      if (!config.posTerminals.count || config.posTerminals.count < 1 || config.posTerminals.count > 20) {
        errors.push('POS terminal count must be between 1 and 20');
      }
      if (!config.posTerminals.names || config.posTerminals.names.length !== config.posTerminals.count) {
        errors.push('Number of POS terminal names must match terminal count');
      }
    }

    // Validate reconciliation settings
    if (config.reconciliation) {
      if (config.reconciliation.varianceTolerance != null && config.reconciliation.varianceTolerance < 0) {
        errors.push('Variance tolerance must be a positive number');
      }
      if (config.reconciliation.dailyDeadline && !/^\d{2}:\d{2}$/.test(config.reconciliation.dailyDeadline)) {
        errors.push('Daily deadline must be in HH:MM format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get register configuration
   * @returns {Promise<Object>} Register configuration
   */
  async getRegisterConfig() {
    const result = await this.getConfig();
    return {
      success: result.success,
      registers: result.config?.registers,
      message: result.message
    };
  },

  /**
   * Get POS terminal configuration
   * @returns {Promise<Object>} POS terminal configuration
   */
  async getPosConfig() {
    const result = await this.getConfig();
    return {
      success: result.success,
      posTerminals: result.config?.posTerminals,
      message: result.message
    };
  }
};

export default configService;