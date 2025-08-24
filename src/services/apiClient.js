/**
 * Centralized API client for SmartBite application
 * Uses secure cookie-based authentication (httpOnly, secure, SameSite=Strict)
 * NO localStorage/sessionStorage - browser handles all session management
 * CSRF protection for all state-changing operations
 */

import { env } from '../config/env.js';

class ApiClient {
  constructor() {
    this.baseURL = env.API_BASE_URL;
    this.timeout = env.API_TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.csrfToken = null;
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    if (error.name === 'AbortError') return false;
    if (error.message.includes('401') || error.message.includes('403')) return false;
    return true;
  }

  /**
   * Makes an HTTP request with common configuration and retry logic
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      credentials: 'include', // MANDATORY for cookie-based auth
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE'].includes(options.method) && this.csrfToken) {
      config.headers['X-CSRF-Token'] = this.csrfToken;
    }


    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    let lastError;
    
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          
          // Don't retry for client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            console.error('API Client Error:', errorText);
            throw error;
          }
          
          // Retry for server errors (5xx) if attempts remain
          if (attempt < this.retryAttempts) {
            console.warn(`API request failed (attempt ${attempt + 1}/${this.retryAttempts + 1}):`, errorText);
            await this.sleep(this.retryDelay * (attempt + 1));
            continue;
          }
          
          throw error;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();
          return jsonResponse;
        }
        
        const textResponse = await response.text();
        return textResponse;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        // Don't retry if error is not retryable or no attempts left
        if (!this.isRetryableError(error) || attempt >= this.retryAttempts) {
          console.error('API request failed:', error);
          throw error;
        }
        
        console.warn(`API request failed (attempt ${attempt + 1}/${this.retryAttempts + 1}):`, error.message);
        await this.sleep(this.retryDelay * (attempt + 1));
      }
    }
    
    throw lastError;
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * CSRF-protected POST request (automatically gets CSRF token)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async postWithCSRF(endpoint, data = null, options = {}) {
    try {
      await this.getCSRFToken();
      const response = await this.post(endpoint, data, options);
      this.clearCSRFToken(); // Clear token after use (one-time only)
      return response;
    } catch (error) {
      this.clearCSRFToken();
      throw error;
    }
  }

  /**
   * CSRF-protected PUT request (automatically gets CSRF token)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async putWithCSRF(endpoint, data = null, options = {}) {
    try {
      await this.getCSRFToken();
      const response = await this.put(endpoint, data, options);
      this.clearCSRFToken(); // Clear token after use (one-time only)
      return response;
    } catch (error) {
      this.clearCSRFToken();
      throw error;
    }
  }

  /**
   * CSRF-protected DELETE request (automatically gets CSRF token)
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async deleteWithCSRF(endpoint, options = {}) {
    try {
      await this.getCSRFToken();
      const response = await this.delete(endpoint, options);
      this.clearCSRFToken(); // Clear token after use (one-time only)
      return response;
    } catch (error) {
      this.clearCSRFToken();
      throw error;
    }
  }

  /**
   * Get CSRF token for form submissions
   * @returns {Promise<string>} CSRF token
   */
  async getCSRFToken() {
    try {
      const response = await this.get('/csrf/token');
      if (response.success && response.token) {
        this.csrfToken = response.token;
        return response.token;
      }
      throw new Error('Failed to get CSRF token');
    } catch (error) {
      console.error('CSRF token request failed:', error);
      throw error;
    }
  }

  /**
   * Clear CSRF token (called after use since tokens are one-time only)
   */
  clearCSRFToken() {
    this.csrfToken = null;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<Object>} Session status
   */
  async getSessionStatus() {
    try {
      return await this.get('/session/status');
    } catch (error) {
      console.error('Session status check failed:', error);
      return { success: false, authenticated: false };
    }
  }

  /**
   * Refresh session (extends cookie expiration)
   * @returns {Promise<Object>} Refresh result
   */
  async refreshSession() {
    try {
      return await this.post('/session/refresh');
    } catch (error) {
      console.error('Session refresh failed:', error);
      throw error;
    }
  }

  /**
   * Set custom header
   * @param {string} key - Header name
   * @param {string} value - Header value
   */
  setHeader(key, value) {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove custom header
   * @param {string} key - Header name
   */
  removeHeader(key) {
    delete this.defaultHeaders[key];
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;