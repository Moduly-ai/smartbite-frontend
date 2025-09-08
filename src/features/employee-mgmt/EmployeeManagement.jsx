import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { formatErrorDisplay, getLoadingMessage } from '../../utils/errorMessages.js';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import { safeError } from '../../utils/logger.js';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    hasReconciliationAccess: false
  });

  // Load employees from API
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await employeeService.getEmployees();
      
      if (result.success) {
        setEmployees(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      safeError('Failed to load employees:', error);
      setError('Failed to load employees from server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setFormData({ name: '', email: '', pin: '', hasReconciliationAccess: false });
    setEditingEmployee(null);
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      pin: employee.pin || '',
      hasReconciliationAccess: employee.userType === 'manager'
    });
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleSaveEmployee = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let result;
      
      if (editingEmployee) {
        // Update existing employee
        result = await employeeService.updateEmployee(editingEmployee.id, formData);
      } else {
        // Create new employee
        result = await employeeService.createEmployee(formData);
      }

      if (result.success) {
        // Reload employees from server
        await loadEmployees();
        setShowAddModal(false);
        setError(null);
      } else {
        setError(formatErrorDisplay(result.message || result.error, 'employee'));
      }
    } catch (error) {
      safeError('Failed to save employee:', error);
      setError(formatErrorDisplay(error, 'employee'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const result = await employeeService.deleteEmployee(employee.id);
        
        if (result.success) {
          // Reload employees from server
          await loadEmployees();
          setError(null);
        } else {
          setError(result.message);
        }
      } catch (error) {
        safeError('Failed to delete employee:', error);
        setError('Failed to delete employee');
      }
    }
  };

  const toggleReconciliationAccess = async (employee) => {
    try {
      const updatedData = {
        name: employee.name,
        email: employee.email,
        pin: employee.pin, // Keep existing PIN
        hasReconciliationAccess: employee.userType !== 'manager' // Toggle the access
      };
      
      const result = await employeeService.updateEmployee(employee.id, updatedData);
      
      if (result.success) {
        // Reload employees from server
        await loadEmployees();
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (error) {
      safeError('Failed to update employee access:', error);
      setError('Failed to update employee access');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
          <p className="text-gray-600">Manage employee access and permissions</p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                  <p className="text-sm text-gray-600">{employee.id}</p>
                  <p className="text-xs text-gray-500">{employee.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Reconciliation Access</span>
                <button
                  onClick={() => toggleReconciliationAccess(employee)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    employee.userType === 'manager' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      employee.userType === 'manager' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V7a2 2 0 012-2h2a2 2 0 012 2v2m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                </svg>
                <span>PIN: {employee.pin}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
                <span>Since: {new Date(employee.createdAt).toLocaleDateString()}</span>
              </div>

              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                employee.userType === 'manager'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.userType === 'manager' ? 'Manager Access' : 'Employee Access'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEmployee(); }} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="employee@smartbite.com"
                />
              </div>

              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label className="form-label">PIN (4 digits)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder={editingEmployee ? "Current PIN or enter new PIN" : "Leave empty for auto-generated PIN"}
                  maxLength="4"
                  pattern="[0-9]{4}"
                />
                {!editingEmployee && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate a PIN</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="form-label mb-0">Reconciliation Access</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasReconciliationAccess: !prev.hasReconciliationAccess }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.hasReconciliationAccess ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasReconciliationAccess ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;