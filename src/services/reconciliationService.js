/**
 * Reconciliation API service
 * Handles all reconciliation-related API calls with fallback behavior
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
          message: 'Reconciliation submitted successfully to server!'
        };
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.warn('API submission failed, using local fallback:', error);
      
      // Fallback: Save to localStorage for later sync
      return this.mockSubmitReconciliation(reconciliationData, employeeName);
    }
  },

  /**
   * Mock submission for fallback when API is unavailable
   * @param {Object} reconciliationData - Reconciliation data to submit
   * @param {string} employeeName - Name of the employee submitting
   * @returns {Promise<Object>} Mock submission result
   */
  async mockSubmitReconciliation(reconciliationData, employeeName) {
    try {
      // Generate a mock ID
      const mockId = `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create full reconciliation record
      const reconciliation = {
        id: mockId,
        ...reconciliationData,
        employeeName,
        submittedAt: new Date().toISOString(),
        status: 'pending_sync',
        syncStatus: 'local_only'
      };

      // Save to localStorage for later sync
      const pendingReconciliations = JSON.parse(
        localStorage.getItem('smartbite-pending-reconciliations') || '[]'
      );
      pendingReconciliations.push(reconciliation);
      localStorage.setItem(
        'smartbite-pending-reconciliations', 
        JSON.stringify(pendingReconciliations)
      );

      return {
        success: true,
        data: reconciliation,
        message: 'Reconciliation saved locally. Will sync when connection is restored.',
        isLocalFallback: true
      };
    } catch (error) {
      console.error('Failed to save reconciliation locally:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to save reconciliation. Please check your data and try again.',
        isLocalFallback: true
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
        // Merge with local pending reconciliations
        const localData = this.getLocalReconciliations();
        const mergedData = [...response.reconciliations, ...localData];
        
        return {
          success: true,
          data: mergedData,
          message: 'Reconciliations retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch reconciliations');
      }
    } catch (error) {
      console.warn('API fetch failed, using local fallback:', error);
      
      // Fallback to local data only
      const localData = this.getLocalReconciliations();
      
      return {
        success: true,
        data: localData,
        message: 'Showing locally stored reconciliations. Server connection unavailable.',
        isLocalFallback: true
      };
    }
  },

  /**
   * Get locally stored reconciliations
   * @returns {Array} Array of local reconciliations
   */
  getLocalReconciliations() {
    try {
      return JSON.parse(localStorage.getItem('smartbite-pending-reconciliations') || '[]');
    } catch (error) {
      console.error('Failed to parse local reconciliations:', error);
      return [];
    }
  },

  /**
   * Sync pending reconciliations to server
   * @returns {Promise<Object>} Sync result
   */
  async syncPendingReconciliations() {
    try {
      const pendingReconciliations = this.getLocalReconciliations();
      
      if (pendingReconciliations.length === 0) {
        return {
          success: true,
          message: 'No pending reconciliations to sync',
          syncedCount: 0
        };
      }

      const syncResults = [];
      let successCount = 0;

      for (const reconciliation of pendingReconciliations) {
        try {
          // Remove local-only fields before syncing
          const { id, syncStatus, ...syncData } = reconciliation;
          
          const response = await apiClient.post('/reconciliations', {
            ...syncData,
            originalLocalId: id
          });

          syncResults.push({ localId: id, success: true, serverId: response.id });
          successCount++;
        } catch (error) {
          console.error(`Failed to sync reconciliation ${reconciliation.id}:`, error);
          syncResults.push({ localId: reconciliation.id, success: false, error: error.message });
        }
      }

      // Remove successfully synced reconciliations from local storage
      const remainingReconciliations = pendingReconciliations.filter(recon => 
        !syncResults.find(result => result.localId === recon.id && result.success)
      );
      
      localStorage.setItem(
        'smartbite-pending-reconciliations', 
        JSON.stringify(remainingReconciliations)
      );

      return {
        success: true,
        message: `Successfully synced ${successCount} of ${pendingReconciliations.length} reconciliations`,
        syncedCount: successCount,
        totalCount: pendingReconciliations.length,
        results: syncResults
      };
    } catch (error) {
      console.error('Failed to sync reconciliations:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to sync pending reconciliations'
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