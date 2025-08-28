/**
 * Reconciliation API service
 * Handles all reconciliation-related API calls - API-only, no local fallbacks
 */

import apiClient from './apiClient.js';
import { env } from '../config/env.js';

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
  },

  /**
   * Update reconciliation fields (totals, eftpos, payouts, actualBanking, comments) and optionally status
   * @param {string} reconciliationId
   * @param {{ totalSales?: number, eftpos?: number, payouts?: number, actualBanking?: number, comments?: string }} updates
   * @param {{ status?: string }} options
   * @returns {Promise<Object>} Update result
   */
  async updateReconciliation(reconciliationId, updates = {}, options = {}) {
    try {
      const has = (k) => updates[k] !== undefined && updates[k] !== null;
      const numOr = (v, d) => v != null ? Number(v) : d;

      const ts = has('totalSales') ? Number(updates.totalSales) : undefined;
      const ef = has('eftpos') ? Number(updates.eftpos) : undefined;
      const po = has('payouts') ? Number(updates.payouts) : undefined;
      const ab = has('actualBanking') ? Number(updates.actualBanking) : undefined;

      // Compute expected and variance when we have enough inputs
      const eb = has('expectedBanking')
        ? Number(updates.expectedBanking)
        : (ts != null || ef != null || po != null)
          ? (numOr(ts, 0) - numOr(ef, 0) - numOr(po, 0))
          : undefined;
      const varc = has('variance')
        ? Number(updates.variance)
        : (ab != null && eb != null)
          ? (ab - eb)
          : undefined;
      const isBalanced = varc != null ? Math.abs(varc) < 0.01 : undefined;

      const body = {
        // status/comments
        ...(options.status ? { status: options.status } : {}),
        ...(updates.comments ? { comments: updates.comments } : {}),
        reviewedAt: new Date().toISOString(),
        
        // Only include fields that were provided to avoid overwriting server values
        ...(ts != null ? { totalSales: ts } : {}),
        ...(ef != null ? { eftpos: ef } : {}),
        ...(po != null ? { payouts: po } : {}),
        ...(ab != null ? { actualBanking: ab } : {}),

        formData: {
          ...(ts != null ? { totalSales: ts } : {}),
          ...(ef != null ? { eftpos: { total: ef } } : {}),
          ...(po != null ? { payouts: po } : {}),
          ...(ab != null ? { actualBanking: ab } : {}),
          ...(updates.comments ? { comments: updates.comments } : {})
        },
        summary: {
          ...(ts != null ? { totalSales: ts } : {}),
          ...(ef != null ? { totalEftpos: ef } : {}),
          ...(po != null ? { payouts: po } : {}),
          ...(ab != null ? { actualBanking: ab } : {}),
          ...(eb != null ? { expectedBanking: eb } : {}),
          ...(varc != null ? { variance: varc } : {})
        },
        calculations: {
          ...(eb != null ? { expectedBanking: eb } : {}),
          ...(varc != null ? { variance: varc } : {}),
          ...(isBalanced != null ? { isBalanced } : {})
        }
      };

      if (env.ENABLE_LOGGING) {
        try { console.debug('[Reconciliation] PUT payload', { reconciliationId, body }); } catch {}
      }

      const response = await apiClient.put(`/reconciliations/${reconciliationId}`, body);

      if (env.ENABLE_LOGGING) {
        try { console.debug('[Reconciliation] PUT response', response); } catch {}
      }

      if (response.success) {
        return {
          success: true,
          data: response,
          message: 'Reconciliation updated successfully'
        };
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to update reconciliation:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update reconciliation'
      };
    }
  },

  /**
   * Approve a reconciliation (Manager/Owner only)
   * @param {string} reconciliationId - Reconciliation ID
   * @returns {Promise<Object>} Approval result
   */
  async approveReconciliation(reconciliationId) {
    try {
      const response = await apiClient.put(`/reconciliations/${reconciliationId}/approve`);
      
      if (response.success) {
        return {
          success: true,
          data: response,
          message: 'Reconciliation approved successfully'
        };
      } else {
        throw new Error(response.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Failed to approve reconciliation:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to approve reconciliation'
      };
    }
  },

  /**
   * Reject a reconciliation (Manager/Owner only)
   * @param {string} reconciliationId - Reconciliation ID
   * @param {string} rejectionReason - Reason for rejection
   * @returns {Promise<Object>} Rejection result
   */
  async rejectReconciliation(reconciliationId, rejectionReason) {
    try {
      const response = await apiClient.put(`/reconciliations/${reconciliationId}/reject`, {
        rejectionReason
      });
      
      if (response.success) {
        return {
          success: true,
          data: response,
          message: 'Reconciliation rejected successfully'
        };
      } else {
        throw new Error(response.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('Failed to reject reconciliation:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to reject reconciliation'
      };
    }
  },

  /**
   * Get pending reconciliations awaiting approval (Manager/Owner only)
   * @returns {Promise<Object>} Pending reconciliations
   */
  async getPendingReconciliations() {
    try {
      const response = await apiClient.get('/reconciliations/pending');
      
      if (response.success && response.reconciliations) {
        return {
          success: true,
          data: response.reconciliations,
          message: 'Pending reconciliations retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch pending reconciliations');
      }
    } catch (error) {
      console.error('Failed to fetch pending reconciliations:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to load pending reconciliations'
      };
    }
  }
};

export default reconciliationService;