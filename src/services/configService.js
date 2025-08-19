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
    console.log('ConfigService: getSystemConfig called');
    
    // Ensure we have authentication
    if (!this.ensureAuthenticated()) {
      console.warn('ConfigService: Not authenticated, using default config');
      return {
        success: true,
        config: this.getDefaultConfig(),
        message: 'Using default configuration (not authenticated)'
      };
    }
    
    try {
      console.log('ConfigService: Making authenticated GET request to /config/system');
      const response = await apiClient.get('/config/system');
      console.log('ConfigService: GET response received:', response);
      
      if (response.success && response.config) {
        console.log('ConfigService: API returned valid config data');
        return {
          success: true,
          config: response.config,
          message: 'Configuration retrieved successfully',
          timestamp: response.timestamp
        };
      } else {
        console.warn('ConfigService: API response missing config data:', response);
        throw new Error(response.error || 'Failed to get configuration');
      }
    } catch (error) {
      console.error('ConfigService: API get error:', {
        message: error.message,
        stack: error.stack
      });
      
      console.warn('ConfigService: API error, using default config');
      
      // Return default configuration if API is not available
      return {
        success: true,
        config: this.getDefaultConfig(),
        message: 'Using default configuration'
      };
    }
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
    
    try {
      console.log('ConfigService: Making authenticated PUT request to /config/system');
      console.log('ConfigService: Request body:', JSON.stringify(config, null, 2));
      
      const response = await apiClient.put('/config/system', config);
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
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update configuration. Please try again.'
      };
    }
  },

  /**
   * Get cached configuration from localStorage (deprecated - kept for fallback only)
   * @returns {Object|null} Cached configuration
   */
  getCachedConfig() {
    console.warn('ConfigService: getCachedConfig is deprecated - API should be primary source');
    try {
      const cachedConfig = localStorage.getItem('smartbite-config');
      return cachedConfig ? JSON.parse(cachedConfig) : null;
    } catch (error) {
      console.error('Failed to parse cached config:', error);
      return null;
    }
  },

  /**
   * Clear cached configuration from localStorage (deprecated - kept for cleanup only)
   */
  clearCachedConfig() {
    console.warn('ConfigService: clearCachedConfig is deprecated - API is primary source');
    try {
      localStorage.removeItem('smartbite-config');
    } catch (error) {
      console.error('Failed to clear cached config:', error);
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
   * Get default system configuration matching API format
   * @returns {Object} Default configuration
   */
  getDefaultConfig() {
    return {
      registers: {
        count: 2,
        names: ['Main Register', 'Secondary Register'],
        reserveAmount: 400.00,
        enabled: [true, true]
      },
      business: {
        name: 'SmartBite Restaurant',
        timezone: 'America/New_York',
        currency: 'USD',
        taxRate: 8.5
      },
      reconciliation: {
        dailyDeadline: '23:59',
        varianceTolerance: 5.00,
        requireManagerApproval: true
      },
      posTerminals: {
        count: 4,
        names: ['POS Terminal 1', 'POS Terminal 2', 'POS Terminal 3', 'POS Terminal 4'],
        enabled: [true, true, true, true]
      }
    };
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
      registers: result.config?.registers || this.getDefaultConfig().registers,
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
      posTerminals: result.config?.posTerminals || this.getDefaultConfig().posTerminals,
      message: result.message
    };
  }
};

export default configService;