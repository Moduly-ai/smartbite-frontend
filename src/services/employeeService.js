/**
 * Employee management API service
 * Handles all employee-related API calls
 */

import apiClient from './apiClient.js';

export const employeeService = {
  /**
   * Get all employees
   * @returns {Promise<Object>} Employee list
   */
  async getEmployees() {
    try {
      const response = await apiClient.get('/employees');
      
      if (response.success && response.employees) {
        return {
          success: true,
          data: response.employees,
          count: response.count || response.employees.length,
          message: 'Employees retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Failed to get employees:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve employees from server'
      };
    }
  },

  /**
   * Get a specific employee by ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Employee data
   */
  async getEmployee(employeeId) {
    try {
      const response = await apiClient.get(`/employees/${employeeId}`);
      
      if (response.success && response.employee) {
        return {
          success: true,
          data: response.employee,
          message: 'Employee retrieved successfully'
        };
      } else {
        throw new Error(response.error || 'Employee not found');
      }
    } catch (error) {
      console.error('Failed to get employee:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve employee from server'
      };
    }
  },

  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Creation result
   */
  async createEmployee(employeeData) {
    try {
      const requestData = {
        name: employeeData.name,
        userType: employeeData.hasReconciliationAccess ? 'manager' : 'employee',
        email: employeeData.email || `${employeeData.name.toLowerCase().replace(/\s+/g, '.')}@smartbite.com`
      };

      // Add PIN if provided (API will auto-generate if not provided)
      if (employeeData.pin && employeeData.pin.trim()) {
        requestData.pin = employeeData.pin;
      }

      const response = await apiClient.post('/employees', requestData);

      if (response.success) {
        // API is working, check for employee data in response
        if (response.employee) {
          return {
            success: true,
            data: response.employee,
            message: response.message || 'Employee created successfully'
          };
        } else {
          throw new Error('Employee created but no employee data returned');
        }
      } else {
        throw new Error(response.error || response.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Failed to create employee:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to create employee'
      };
    }
  },

  /**
   * Update an existing employee
   * @param {string} employeeId - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise<Object>} Update result
   */
  async updateEmployee(employeeId, employeeData) {
    try {
      const requestData = {
        name: employeeData.name,
        userType: employeeData.hasReconciliationAccess ? 'manager' : 'employee',
        email: employeeData.email || `${employeeData.name.toLowerCase().replace(/\s+/g, '.')}@smartbite.com`
      };

      // Add PIN if provided (will update PIN if not empty)
      if (employeeData.pin && employeeData.pin.trim()) {
        requestData.pin = employeeData.pin;
      }

      const response = await apiClient.put(`/employees/${employeeId}`, requestData);

      if (response.success && response.employee) {
        return {
          success: true,
          data: response.employee,
          message: 'Employee updated successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update employee'
      };
    }
  },

  /**
   * Delete an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteEmployee(employeeId) {
    try {
      const response = await apiClient.delete(`/employees/${employeeId}`);

      if (response.success) {
        return {
          success: true,
          message: 'Employee deleted successfully'
        };
      } else {
        throw new Error(response.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete employee'
      };
    }
  },

};

export default employeeService;