import React, { useState, useEffect } from 'react';
import { reconciliationService } from '../../services/reconciliationService.js';

const OwnerReconciliationReview = () => {
  const [reconciliations, setReconciliations] = useState([]);
  const [selectedReconciliation, setSelectedReconciliation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Load reconciliations from API
  useEffect(() => {
    loadReconciliations();
  }, []);

  const loadReconciliations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await reconciliationService.getReconciliations();
      
      if (result.success) {
        setReconciliations(result.data);
        
        // Show sync status if using local fallback
        if (result.isLocalFallback) {
          setSyncStatus({
            type: 'warning',
            message: 'Showing locally stored data. Server connection unavailable.'
          });
        }
      } else {
        setError(result.message);
        // Fallback to mock data if API completely fails
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to load reconciliations:', error);
      setError('Failed to load reconciliation data');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockReconciliations = [
      {
        id: '2025-08-18-john-001',
        date: '2025-08-18',
        employeeName: 'John Smith',
        submittedAt: '2025-08-18T09:30:00Z',
        status: 'pending_review',
        formData: {
          totalSales: 2500.75,
          eftpos: 900.50,
          payouts: 125.00,
          actualBanking: 1475.25,
          comments: 'Busy Saturday, all registers balanced'
        },
        calculations: {
          expectedBanking: 1475.25,
          variance: 0,
          isBalanced: true,
          register1Total: 850.50,
          register2Total: 624.75,
          totalCash: 1475.25
        }
      },
      {
        id: '2025-08-17-jane-001',
        date: '2025-08-17',
        employeeName: 'Jane Doe',
        submittedAt: '2025-08-17T18:45:00Z',
        status: 'variance_found',
        formData: {
          totalSales: 1850.00,
          eftpos: 650.00,
          payouts: 80.00,
          actualBanking: 1110.00,
          comments: 'Short $10 in register 2, could not locate'
        },
        calculations: {
          expectedBanking: 1120.00,
          variance: -10.00,
          isBalanced: false,
          register1Total: 720.00,
          register2Total: 390.00,
          totalCash: 1110.00
        }
      },
      {
        id: '2025-08-16-mike-001',
        date: '2025-08-16',
        employeeName: 'Mike Johnson',
        submittedAt: '2025-08-16T20:15:00Z',
        status: 'approved',
        formData: {
          totalSales: 3200.25,
          eftpos: 1200.75,
          payouts: 200.00,
          actualBanking: 1799.50,
          comments: 'Perfect balance, all counts verified'
        },
        calculations: {
          expectedBanking: 1799.50,
          variance: 0,
          isBalanced: true,
          register1Total: 950.25,
          register2Total: 849.25,
          totalCash: 1799.50
        }
      }
    ];
    setReconciliations(mockReconciliations);
  };

  const syncPendingReconciliations = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      
      const result = await reconciliationService.syncPendingReconciliations();
      
      if (result.success) {
        setSyncStatus({
          type: 'success',
          message: result.message
        });
        
        // Reload reconciliations after successful sync
        await loadReconciliations();
      } else {
        setSyncStatus({
          type: 'error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Failed to sync reconciliations:', error);
      setSyncStatus({
        type: 'error',
        message: 'Failed to sync pending reconciliations'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'pending_sync': return 'bg-blue-100 text-blue-800';
      case 'variance_found': return 'bg-red-100 text-red-800';
      case 'requires_correction': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-green-600';
    if (variance > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const handleViewDetails = (reconciliation) => {
    setSelectedReconciliation(reconciliation);
  };

  const handleEditReconciliation = (reconciliation) => {
    setEditData({
      totalSales: reconciliation.formData.totalSales,
      eftpos: reconciliation.formData.eftpos,
      payouts: reconciliation.formData.payouts,
      actualBanking: reconciliation.formData.actualBanking,
      comments: reconciliation.formData.comments
    });
    setSelectedReconciliation(reconciliation);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Recalculate with new values
      const expectedBanking = editData.totalSales - editData.eftpos - editData.payouts;
      const variance = editData.actualBanking - expectedBanking;
      const newStatus = Math.abs(variance) < 0.01 ? 'approved' : 'variance_found';
      
      // Update via API if possible
      const result = await reconciliationService.updateReconciliationStatus(
        selectedReconciliation.id,
        newStatus,
        `Updated by manager: ${editData.comments || 'No additional comments'}`
      );
      
      if (result.success) {
        // Update local state
        setReconciliations(prev => prev.map(rec => 
          rec.id === selectedReconciliation.id 
            ? {
                ...rec,
                formData: { ...rec.formData, ...editData },
                calculations: {
                  ...rec.calculations,
                  expectedBanking,
                  variance,
                  isBalanced: Math.abs(variance) < 0.01
                },
                status: newStatus
              }
            : rec
        ));
        setSyncStatus({
          type: 'success',
          message: 'Reconciliation updated successfully'
        });
      } else {
        // Fallback to local update
        setReconciliations(prev => prev.map(rec => 
          rec.id === selectedReconciliation.id 
            ? {
                ...rec,
                formData: { ...rec.formData, ...editData },
                calculations: {
                  ...rec.calculations,
                  expectedBanking,
                  variance,
                  isBalanced: Math.abs(variance) < 0.01
                },
                status: newStatus,
                localUpdate: true
              }
            : rec
        ));
        setSyncStatus({
          type: 'warning',
          message: 'Updated locally. Changes will sync when connection is restored.'
        });
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save edit:', error);
      setSyncStatus({
        type: 'error',
        message: 'Failed to save changes'
      });
    }
  };

  const handleApprove = async (reconciliationId) => {
    try {
      const result = await reconciliationService.updateReconciliationStatus(
        reconciliationId,
        'approved',
        'Approved by manager'
      );
      
      if (result.success) {
        setReconciliations(prev => prev.map(rec =>
          rec.id === reconciliationId ? { ...rec, status: 'approved' } : rec
        ));
        setSyncStatus({
          type: 'success',
          message: 'Reconciliation approved successfully'
        });
      } else {
        // Fallback to local update
        setReconciliations(prev => prev.map(rec =>
          rec.id === reconciliationId ? { ...rec, status: 'approved', localUpdate: true } : rec
        ));
        setSyncStatus({
          type: 'warning',
          message: 'Approved locally. Changes will sync when connection is restored.'
        });
      }
    } catch (error) {
      console.error('Failed to approve reconciliation:', error);
      setSyncStatus({
        type: 'error',
        message: 'Failed to approve reconciliation'
      });
    }
  };

  const filteredReconciliations = reconciliations
    .filter(rec => filterStatus === 'all' || rec.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'variance') return Math.abs(b.calculations.variance) - Math.abs(a.calculations.variance);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reconciliations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {syncStatus && (
        <div className={`p-4 rounded-lg ${
          syncStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : syncStatus.type === 'warning'
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{syncStatus.message}</span>
            <button 
              onClick={() => setSyncStatus(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Daily Reconciliation Review</h3>
            <p className="text-gray-600">Review and approve employee reconciliations</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={loadReconciliations}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            
            <button
              onClick={syncPendingReconciliations}
              disabled={isSyncing}
              className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Pending'}
            </button>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending_review">Pending Review</option>
              <option value="pending_sync">Pending Sync</option>
              <option value="variance_found">Variance Found</option>
              <option value="approved">Approved</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="variance">Sort by Variance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reconciliation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReconciliations.map(reconciliation => (
          <div key={reconciliation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{reconciliation.employeeName}</h4>
                    {reconciliation.localUpdate && (
                      <span className="w-2 h-2 bg-orange-400 rounded-full" title="Has local changes pending sync"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{new Date(reconciliation.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reconciliation.status)}`}>
                  {reconciliation.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-medium">${(reconciliation.formData?.totalSales || reconciliation.totalSales || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expected Banking</span>
                  <span className="font-medium">${(reconciliation.calculations?.expectedBanking || reconciliation.expectedBanking || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actual Banking</span>
                  <span className="font-medium">${(reconciliation.formData?.actualBanking || reconciliation.actualBanking || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Variance</span>
                  <span className={`font-bold ${getVarianceColor(reconciliation.calculations?.variance || reconciliation.variance || 0)}`}>
                    ${(reconciliation.calculations?.variance || reconciliation.variance || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(reconciliation)}
                  className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  View Details
                </button>
                
                {reconciliation.status !== 'approved' && (
                  <>
                    <button
                      onClick={() => handleEditReconciliation(reconciliation)}
                      className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit & Fix
                    </button>
                    
                    {reconciliation.calculations.isBalanced && (
                      <button
                        onClick={() => handleApprove(reconciliation.id)}
                        className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedReconciliation && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Reconciliation Details</h3>
                <button
                  onClick={() => setSelectedReconciliation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Employee Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{selectedReconciliation.employeeName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{new Date(selectedReconciliation.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <span className="ml-2 font-medium">{new Date(selectedReconciliation.submittedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedReconciliation.status)}`}>
                        {selectedReconciliation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">${selectedReconciliation.formData.totalSales.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">EFTPOS:</span>
                        <span className="font-medium">${selectedReconciliation.formData.eftpos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payouts:</span>
                        <span className="font-medium">${selectedReconciliation.formData.payouts.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Banking:</span>
                        <span className="font-medium">${selectedReconciliation.calculations.expectedBanking.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Banking:</span>
                        <span className="font-medium">${selectedReconciliation.formData.actualBanking.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold text-gray-700">Variance:</span>
                        <span className={`font-bold ${getVarianceColor(selectedReconciliation.calculations.variance)}`}>
                          ${selectedReconciliation.calculations.variance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {selectedReconciliation.formData.comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Comments</h4>
                    <p className="text-gray-700">{selectedReconciliation.formData.comments}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {selectedReconciliation.status !== 'approved' && (
                    <>
                      <button
                        onClick={() => handleEditReconciliation(selectedReconciliation)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Edit & Fix
                      </button>
                      {selectedReconciliation.calculations.isBalanced && (
                        <button
                          onClick={() => handleApprove(selectedReconciliation.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReconciliation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Reconciliation - {selectedReconciliation.employeeName}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                <div>
                  <label className="form-label">Total Sales ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editData.totalSales}
                    onChange={(e) => setEditData(prev => ({ ...prev, totalSales: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="form-label">EFTPOS ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editData.eftpos}
                    onChange={(e) => setEditData(prev => ({ ...prev, eftpos: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="form-label">Payouts ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editData.payouts}
                    onChange={(e) => setEditData(prev => ({ ...prev, payouts: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="form-label">Actual Banking ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editData.actualBanking}
                    onChange={(e) => setEditData(prev => ({ ...prev, actualBanking: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={editData.comments}
                    onChange={(e) => setEditData(prev => ({ ...prev, comments: e.target.value }))}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>New Expected Banking:</strong> ${(editData.totalSales - editData.eftpos - editData.payouts).toFixed(2)}
                    <br />
                    <strong>New Variance:</strong> ${(editData.actualBanking - (editData.totalSales - editData.eftpos - editData.payouts)).toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerReconciliationReview;