/**
 * Reconciliation API service
 * Handles all reconciliation-related API calls - API-only, no local fallbacks
 */

import apiClient from './apiClient.js';

export const reconciliationService = {
  /**
   * Submit a reconciliation
   * @param {Object} reconciliationData - Reconciliation data to submit
   * @param {string} employeeName - Name of the employee submitting
   * @returns {Promise<Object>} Submission result
   */
  async submitReconciliation(reconciliationData, employeeName) {
    try {
      const response = await apiClient.post('/reconciliations', {
        ...reconciliationData,
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
        employeeName: employeeName || 'Unknown Employee'
      });

      if (response.success && response.reconciliation) {
        return {
          success: true,
          data: response.reconciliation,
          message: 'Reconciliation submitted successfully!'
        };
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Failed to submit reconciliation:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit reconciliation to server'
      };
    }
  },

  /**
   * Get reconciliation history
   * @param {Object} filters - Query filters (date, employee, etc.)
   * @returns {Promise<Object>} Reconciliation history
   */
  async getReconciliations(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reconciliations?${queryParams}` : '/reconciliations';
      
      const response = await apiClient.get(endpoint);
      
      if (response.success && response.reconciliations) {
        return {
          success: true,
          data: response.reconciliations,
          message: 'Reconciliations retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch reconciliations');
      }
    } catch (error) {
      console.error('Failed to fetch reconciliations from API:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to load reconciliations from server'
      };
    }
  },

  /**
   * Get a specific reconciliation by ID
   * @param {string} reconciliationId - Reconciliation ID
   * @returns {Promise<Object>} Reconciliation data
   */
  async getReconciliation(reconciliationId) {
    try {
      const response = await apiClient.get(`/reconciliations/${reconciliationId}`);
      
      if (response.success) {
        return {
          success: true,
          data: response,
          message: 'Reconciliation retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch reconciliation');
      }
    } catch (error) {
      console.error('Failed to get reconciliation:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve reconciliation'
      };
    }
  },

  /**
   * Update reconciliation status (for managers)
   * @param {string} reconciliationId - Reconciliation ID
   * @param {string} status - New status
   * @param {string} comments - Manager comments
   * @returns {Promise<Object>} Update result
   */
  async updateReconciliationStatus(reconciliationId, status, comments = '') {
    try {
      const response = await apiClient.put(`/reconciliations/${reconciliationId}`, {
        status,
        comments,
        reviewedAt: new Date().toISOString()
      });
      
      if (response.success) {
        return {
          success: true,
          data: response,
          message: 'Reconciliation status updated successfully'
        };
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to update reconciliation status:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update reconciliation status'
      };
    }
  }
};

export default reconciliationService;