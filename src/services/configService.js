/**
 * Configuration service
 * Handles system configuration API calls
 */

import apiClient from './apiClient.js';

export const configService = {
  /**
   * Get system configuration
   * @returns {Promise<Object>} Configuration data
   */
  async getSystemConfig() {
    try {
      const response = await apiClient.get('/config/system');
      
      if (response.success) {
        return {
          success: true,
          config: response.config,
          message: 'Configuration retrieved successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to get configuration');
      }
    } catch (error) {
      console.warn('Configuration API not available, using default config:', error);
      
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
    try {
      const response = await apiClient.put('/config/system', config);
      
      if (response.success) {
        // Update cached config
        localStorage.setItem('smartbite-config', JSON.stringify(config));
        
        return {
          success: true,
          config: response.config,
          message: 'Configuration updated successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Failed to update configuration:', error);
      
      // For development, save to localStorage as fallback
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        localStorage.setItem('smartbite-config', JSON.stringify(config));
        console.warn('API not available, saved config locally');
        
        return {
          success: true,
          config: config,
          message: 'Configuration saved locally (API not available)'
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update configuration'
      };
    }
  },

  /**
   * Get cached configuration from localStorage
   * @returns {Object|null} Cached configuration
   */
  getCachedConfig() {
    try {
      const cachedConfig = localStorage.getItem('smartbite-config');
      return cachedConfig ? JSON.parse(cachedConfig) : null;
    } catch (error) {
      console.error('Failed to parse cached config:', error);
      return null;
    }
  },

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfig() {
    return {
      registers: {
        count: 2,
        names: ['Main Register', 'Secondary Register'],
        reserveAmount: 400
      },
      posTerminals: {
        count: 4,
        names: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4'],
        enabled: [true, true, true, false]
      },
      reconciliation: {
        dailyDeadline: '23:59',
        varianceTolerance: 5.00,
        requireManagerApproval: true
      },
      tenant: {
        id: 'tenant-001',
        name: 'SmartBite Restaurant',
        timezone: 'Australia/Sydney'
      }
    };
  },

  /**
   * Get configuration with fallback to cached/default
   * @returns {Promise<Object>} Configuration data
   */
  async getConfig() {
    try {
      // Try to get from API first
      const result = await this.getSystemConfig();
      return result;
    } catch (error) {
      // Fall back to cached config
      const cached = this.getCachedConfig();
      if (cached) {
        return {
          success: true,
          config: cached,
          message: 'Using cached configuration'
        };
      }
      
      // Fall back to default config
      return {
        success: true,
        config: this.getDefaultConfig(),
        message: 'Using default configuration'
      };
    }
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
      if (!config.registers.reserveAmount || config.registers.reserveAmount < 0) {
        errors.push('Reserve amount must be a positive number');
      }
      if (!config.registers.names || config.registers.names.length !== config.registers.count) {
        errors.push('Number of register names must match register count');
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
      if (config.reconciliation.varianceTolerance < 0) {
        errors.push('Variance tolerance must be a positive number');
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