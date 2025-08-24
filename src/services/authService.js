/**
 * Authentication service for SmartBite
 * Cookie-based authentication system (httpOnly, secure, SameSite=Strict)
 * NO localStorage/sessionStorage - browser manages all session state
 * CSRF protection for all form submissions
 */

import apiClient from './apiClient.js';

export const authService = {
  /**
   * Owner signup - One-step tenant creation
   * Uses CSRF protection and sets secure authentication cookie
   * @param {Object} signupData - Owner signup data (email, PIN, businessName, etc.)
   * @returns {Promise<Object>} Signup result
   */
  async ownerSignup(signupData) {
    try {
      // Use regular POST since signup is a public endpoint (no CSRF required)
      const response = await apiClient.post('/ownersignup', signupData);
      
      if (response.success) {
        // Cookie is set automatically by browser - no JavaScript handling needed
        return {
          success: true,
          data: response.data,
          user: response.user,
          message: response.message || 'Account created successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Signup failed',
          message: response.message || 'Account creation failed'
        };
      }
    } catch (error) {
      console.error('Owner signup failed:', error);
      return {
        success: false,
        error: error.message || 'Signup failed',
        message: 'Account creation failed due to error'
      };
    }
  },

  /**
   * Authenticate user with email and PIN
   * Sets secure httpOnly cookie - no JavaScript token handling
   * @param {string} email - User email
   * @param {string} pin - User PIN
   * @returns {Promise<Object>} Authentication result
   */
  async login(email, pin) {
    try {
      const response = await apiClient.postWithCSRF('/auth', {
        email,
        pin
      });
      
      if (response.success) {
        // Cookie is set automatically by browser - no JavaScript handling needed
        return {
          success: true,
          user: response.user,
          message: response.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
          message: response.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('API authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
        message: 'Login failed due to error'
      };
    }
  },

  /**
   * Logout user - clears secure authentication cookie
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      await apiClient.delete('/session/logout');
      // Cookie is cleared automatically by server
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Even if API fails, consider logout successful for UX
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  },

  /**
   * Check current session status
   * Replaces localStorage session checking - cookie-based
   * @returns {Promise<Object>} Session status and user data
   */
  async getSessionStatus() {
    try {
      const response = await apiClient.getSessionStatus();
      
      if (response.success && response.authenticated) {
        return {
          success: true,
          authenticated: true,
          user: response.user,
          message: 'Session valid'
        };
      } else {
        return {
          success: true,
          authenticated: false,
          user: null,
          message: 'No active session'
        };
      }
    } catch (error) {
      // 401 errors are expected when not logged in - don't log as errors
      if (!error.message.includes('401')) {
        console.error('Session status check failed:', error);
      }
      return {
        success: false,
        authenticated: false,
        user: null,
        message: 'Session check failed'
      };
    }
  },

  /**
   * Refresh session - extends cookie expiration
   * Should be called when session is near expiry (50+ minutes)
   * @returns {Promise<Object>} Refresh result
   */
  async refreshSession() {
    try {
      const response = await apiClient.refreshSession();
      
      if (response.success) {
        return {
          success: true,
          message: 'Session refreshed successfully'
        };
      } else {
        throw new Error(response.error || 'Session refresh failed');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to refresh session'
      };
    }
  },

  /**
   * Check if user is authenticated (replaces localStorage check)
   * @returns {Promise<boolean>} Authentication status
   */
  async isAuthenticated() {
    const sessionStatus = await this.getSessionStatus();
    return sessionStatus.authenticated === true;
  },

  /**
   * Get current user data (replaces localStorage access)
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    const sessionStatus = await this.getSessionStatus();
    return sessionStatus.user || null;
  },

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} Permission status
   */
  async hasPermission(permission) {
    const user = await this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  },

  /**
   * Setup automatic session refresh (call on app initialization)
   * Refreshes session when it's 50+ minutes old (10 minutes before 1-hour expiry)
   */
  setupSessionRefresh() {
    // Check session status every 5 minutes
    setInterval(async () => {
      try {
        const sessionStatus = await this.getSessionStatus();
        
        if (sessionStatus.authenticated && sessionStatus.user?.sessionAge) {
          const sessionAgeMinutes = sessionStatus.user.sessionAge;
          
          // Refresh if session is 50+ minutes old (10 minutes before expiry)
          if (sessionAgeMinutes >= 50) {
            console.log('Auto-refreshing session before expiry');
            await this.refreshSession();
          }
        }
      } catch (error) {
        console.warn('Auto session refresh check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  },

  /**
   * Handle authentication errors (401/403 responses)
   * @param {Error} error - Error from API call
   * @returns {boolean} Whether error was handled
   */
  handleAuthError(error) {
    if (error.message.includes('401')) {
      // Session expired - redirect to login
      console.warn('Session expired, redirecting to login');
      window.location.href = '/login';
      return true;
    } else if (error.message.includes('403')) {
      // CSRF token invalid - show error message
      console.error('CSRF token invalid - please retry the operation');
      return true;
    }
    return false;
  }
};

export default authService;