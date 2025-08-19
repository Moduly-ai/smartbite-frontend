/**
 * Authentication service
 * Handles all authentication-related API calls
 */

import apiClient from './apiClient.js';

export const authService = {
  /**
   * Authenticate user with PIN
   * @param {string} employeeId - Employee ID (e.g., 'employee-001', 'manager-001', 'owner-001')
   * @param {string} pin - User PIN
   * @returns {Promise<Object>} Authentication result
   */
  async login(employeeId, pin) {
    try {
      const response = await apiClient.post('/auth/login', {
        employeeId,
        pin
      });

      if (response.success && response.token) {
        // Store token for future requests
        apiClient.setAuthToken(response.token);
        
        // Store user session in localStorage
        localStorage.setItem('smartbite-session', JSON.stringify({
          user: response.user,
          token: response.token,
          expiresAt: Date.now() + (response.expiresIn * 1000 || 8 * 60 * 60 * 1000),
          loginTime: new Date().toISOString()
        }));

        return {
          success: true,
          user: response.user,
          token: response.token,
          message: 'Login successful'
        };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('API authentication failed:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Only fallback to mock if it's a network error, not an authentication error
      if (error.message.includes('fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('timeout') ||
          error.name === 'TypeError') {
        console.warn('Network error detected, using mock fallback');
        return this.mockLogin(employeeId, pin);
      }
      
      // For authentication errors, return the actual error
      return {
        success: false,
        error: error.message,
        message: error.message.includes('Login failed') ? 'Invalid credentials' : 'Login failed. Please try again.'
      };
    }
  },

  /**
   * Mock authentication for development/fallback
   * @param {string} employeeId - Employee ID
   * @param {string} pin - User PIN
   * @returns {Object} Authentication result
   */
  mockLogin(employeeId, pin) {
    const mockUsers = [
      { 
        employeeId: 'employee-001',
        name: 'John Smith', 
        pin: 'employee789', 
        userType: 'employee',
        hasReconciliationAccess: true,
        permissions: ['reconciliation']
      },
      { 
        employeeId: 'manager-001',
        name: 'Jane Manager', 
        pin: 'manager456', 
        userType: 'manager',
        hasReconciliationAccess: true,
        permissions: ['reconciliation', 'reports']
      },
      { 
        employeeId: 'owner-001',
        name: 'Owner Admin', 
        pin: 'owner123', 
        userType: 'owner',
        permissions: ['reconciliation', 'reports', 'configuration', 'employee-management']
      }
    ];

    const user = mockUsers.find(u => 
      u.employeeId === employeeId && u.pin === pin
    );

    if (user) {
      const session = {
        user: {
          id: user.employeeId,
          name: user.name,
          userType: user.userType,
          hasReconciliationAccess: user.hasReconciliationAccess,
          permissions: user.permissions,
          tenantId: 'tenant-001'
        },
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('smartbite-session', JSON.stringify(session));

      return {
        success: true,
        user: session.user,
        token: session.token,
        message: 'Login successful (Mock)'
      };
    } else {
      return {
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid credentials'
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      // Call logout API if token exists
      const session = this.getSession();
      if (session?.token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local session
      localStorage.removeItem('smartbite-session');
      apiClient.setAuthToken(null);
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  /**
   * Verify current session
   * @returns {Promise<Object>} Verification result
   */
  async verifySession() {
    const session = this.getSession();
    
    if (!session) {
      return { success: false, message: 'No session found' };
    }

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.logout();
      return { success: false, message: 'Session expired' };
    }

    try {
      // Verify with API if available
      const response = await apiClient.get('/auth/verify');
      
      if (response.success) {
        return {
          success: true,
          user: session.user,
          message: 'Session valid'
        };
      } else {
        throw new Error('Session verification failed');
      }
    } catch (error) {
      console.warn('Session verification failed, using local validation:', error);
      
      // Fall back to local session validation
      return {
        success: true,
        user: session.user,
        message: 'Session valid (local)'
      };
    }
  },

  /**
   * Get current session from localStorage
   * @returns {Object|null} User session
   */
  getSession() {
    try {
      const sessionData = localStorage.getItem('smartbite-session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to parse session data:', error);
      localStorage.removeItem('smartbite-session');
      return null;
    }
  },

  /**
   * Get current user
   * @returns {Object|null} Current user
   */
  getCurrentUser() {
    const session = this.getSession();
    return session?.user || null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const session = this.getSession();
    return session && Date.now() < session.expiresAt;
  },

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Permission status
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }
};

export default authService;