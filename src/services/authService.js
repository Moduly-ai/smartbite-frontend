/**
 * Authentication service
 * Handles all authentication-related API calls
 */

import apiClient from './apiClient.js';

export const authService = {
  /**
   * Owner signup - One-step tenant creation
   * @param {Object} signupData - Owner signup data
   * @returns {Promise<Object>} Signup result
   */
  async ownerSignup(signupData) {
    try {
      const response = await apiClient.post('/owner-signup', signupData);
      
      if (response.success && response.data) {
        const { credentials, tenant } = response.data;
        
        // Auto-login the new owner with provided credentials
        if (credentials?.token) {
          apiClient.setAuthToken(credentials.token);
          const sessionData = {
            user: {
              employeeId: credentials.employeeId,
              userType: 'owner',
              name: `${signupData.firstName} ${signupData.lastName}`,
              email: signupData.email,
              tenantId: tenant.id
            },
            token: credentials.token,
            expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
            loginTime: new Date().toISOString()
          };
          localStorage.setItem('smartbite-session', JSON.stringify(sessionData));
        }
        
        return {
          success: true,
          data: response.data,
          user: sessionData.user,
          credentials: credentials,
          message: 'Account created successfully'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Signup failed',
          message: 'Account creation failed'
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
        apiClient.setAuthToken(response.token);
        const sessionData = {
          user: response.user,
          token: response.token,
          expiresAt: Date.now() + (response.expiresIn * 1000 || 8 * 60 * 60 * 1000),
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('smartbite-session', JSON.stringify(sessionData));
        return {
          success: true,
          user: response.user,
          token: response.token,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
          message: 'Invalid credentials'
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
    if (Date.now() > session.expiresAt) {
      await this.logout();
      return { success: false, message: 'Session expired' };
    }
    try {
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
      return {
        success: false,
        message: 'Session verification failed',
        error: error.message
      };
    }
  },

  /**
   * Validate session data structure
   * @param {Object} session - Session data to validate
   * @returns {boolean} True if session is valid
   */
  isValidSessionStructure(session) {
    return session &&
           typeof session === 'object' &&
           session.user &&
           session.token &&
           session.expiresAt &&
           typeof session.expiresAt === 'number';
  },

  /**
   * Get current session from localStorage
   * @returns {Object|null} User session
   */
  getSession() {
    try {
      const sessionData = localStorage.getItem('smartbite-session');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Validate session structure
      if (!this.isValidSessionStructure(session)) {
        console.warn('Invalid session structure found, clearing session');
        localStorage.removeItem('smartbite-session');
        return null;
      }
      
      return session;
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