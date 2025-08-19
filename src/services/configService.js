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
    console.log('ConfigService: getSystemConfig called');
    
    try {
      console.log('ConfigService: Making GET request to /config/system');
      const response = await apiClient.get('/config/system');
      console.log('ConfigService: GET response received:', response);
      
      if (response.success) {
        console.log('ConfigService: API get successful');
        
        // Check if the response contains actual config data
        if (response.config) {
          console.log('ConfigService: API returned config data:', response.config);
        } else {
          console.warn('ConfigService: API response missing config data:', response);
        }
        
        return {
          success: true,
          config: response.config,
          message: 'Configuration retrieved successfully'
        };
      } else {
        console.warn('ConfigService: API returned success=false:', response);
        throw new Error(response.message || 'Failed to get configuration');
      }
    } catch (error) {
      console.error('ConfigService: API get error:', {
        message: error.message,
        stack: error.stack
      });
      
      console.warn('ConfigService: API error, using default config:', error);
      
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
    console.log('ConfigService: updateSystemConfig called with config:');
    console.log('=== CONFIG OBJECT START ===');
    console.log(JSON.stringify(config, null, 2));
    console.log('=== CONFIG OBJECT END ===');
    
    try {
      console.log('ConfigService: Making PUT request to /config/system');
      console.log('ConfigService: Request URL:', `${apiClient.baseURL}/config/system`);
      console.log('ConfigService: Request body (stringified):', JSON.stringify(config));
      
      const response = await apiClient.put('/config/system', config);
      console.log('ConfigService: PUT response received:', response);
      
      if (response.success) {
        console.log('ConfigService: API update successful');
        
        // Check if the response contains the updated config
        if (response.config) {
          console.log('ConfigService: API returned updated config:', response.config);
        } else {
          console.warn('ConfigService: API did not return updated config, using sent config');
        }
        
        // Clear any existing cache to ensure fresh data is fetched next time
        this.clearCachedConfig();
        
        // Store the updated config with a timestamp
        const configWithTimestamp = {
          ...config,
          _lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('smartbite-config', JSON.stringify(configWithTimestamp));
        console.log('ConfigService: Config cached locally');
        
        return {
          success: true,
          config: response.config || config, // Use API config if available, otherwise use sent config
          message: response.message || 'Configuration updated successfully'
        };
      } else {
        console.warn('ConfigService: API returned success=false:', response);
        throw new Error(response.message || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('ConfigService: API error details:', {
        message: error.message,
        stack: error.stack,
        isNetworkError: error.message.includes('fetch') || error.message.includes('NetworkError')
      });
      
      // For development, save to localStorage as fallback
      if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        console.warn('ConfigService: API not available, falling back to localStorage');
        // Clear cache first, then set new config
        this.clearCachedConfig();
        const configWithTimestamp = {
          ...config,
          _lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('smartbite-config', JSON.stringify(configWithTimestamp));
        console.warn('ConfigService: Config saved locally only');
        
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
   * Clear cached configuration from localStorage
   */
  clearCachedConfig() {
    try {
      localStorage.removeItem('smartbite-config');
    } catch (error) {
      console.error('Failed to clear cached config:', error);
    }
  },

  /**
   * Get fresh configuration directly from API (bypass cache)
   * @returns {Promise<Object>} Configuration data
   */
  async getFreshConfig() {
    try {
      // Always try to get from API first, don't use cache
      const result = await this.getSystemConfig();
      if (result.success) {
        // Update cache with fresh data
        localStorage.setItem('smartbite-config', JSON.stringify(result.config));
      }
      return result;
    } catch (error) {
      console.error('ConfigService: Failed to get fresh config:', error);
      // Only fall back to default config if API fails completely
      return {
        success: true,
        config: this.getDefaultConfig(),
        message: 'Using default configuration (API unavailable)'
      };
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
      console.error('ConfigService: API error, using default config:', error);
      // Fall back to default config if API fails
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