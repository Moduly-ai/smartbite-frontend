/**
 * Reconciliation API service
 * Handles all reconciliation-related API calls
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
      // Set employee name header
      apiClient.setHeader('x-employee-name', employeeName || 'Unknown Employee');
      
      const response = await apiClient.post('/reconciliations', {
        ...reconciliationData,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });

      return {
        success: true,
        data: response,
        message: 'Reconciliation submitted successfully!'
      };
    } catch (error) {
      console.error('Failed to submit reconciliation:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit reconciliation. Please try again.'
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
      
      return {
        success: true,
        data: response,
        message: 'Reconciliations retrieved successfully'
      };
    } catch (error) {
      console.error('Failed to get reconciliations:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve reconciliation history'
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
      
      return {
        success: true,
        data: response,
        message: 'Reconciliation retrieved successfully'
      };
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
      const response = await apiClient.put(`/reconciliations/${reconciliationId}/status`, {
        status,
        managerComments: comments,
        reviewedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        data: response,
        message: 'Reconciliation status updated successfully'
      };
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