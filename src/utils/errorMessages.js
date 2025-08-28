/**
 * User-friendly error message system
 * Converts technical errors into user-friendly messages with support contact
 */

const SUPPORT_EMAIL = 'imran@moduly.ai';

export const getErrorMessage = (error, context = 'general') => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
  const errorLower = errorMessage.toLowerCase();

  // Network and connectivity errors
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('cors')) {
    return {
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      showSupport: true
    };
  }

  // Authentication errors
  if (context === 'auth' || errorLower.includes('auth') || errorLower.includes('login')) {
    if (errorLower.includes('invalid') || errorLower.includes('incorrect')) {
      return {
        message: 'Invalid credentials. Please check your email and PIN and try again.',
        showSupport: false
      };
    }
    if (errorLower.includes('expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        showSupport: false
      };
    }
  }

  // Reconciliation errors
  if (context === 'reconciliation') {
    if (errorLower.includes('already submitted')) {
      return {
        message: 'You have already submitted a reconciliation for today.',
        showSupport: false
      };
    }
    if (errorLower.includes('variance') || errorLower.includes('tolerance')) {
      return {
        message: 'Cash variance exceeds allowed limits. Manager approval may be required.',
        showSupport: false
      };
    }
  }

  // Employee management errors
  if (context === 'employee') {
    if (errorLower.includes('duplicate') || errorLower.includes('exists')) {
      return {
        message: 'An employee with this information already exists.',
        showSupport: false
      };
    }
    if (errorLower.includes('permission') || errorLower.includes('unauthorized')) {
      return {
        message: 'You do not have permission to perform this action.',
        showSupport: false
      };
    }
  }

  // Configuration errors
  if (context === 'config') {
    if (errorLower.includes('validation') || errorLower.includes('invalid')) {
      return {
        message: 'Please check your settings and try again. Some values may be invalid.',
        showSupport: false
      };
    }
  }

  // Server errors (5xx)
  if (errorLower.includes('500') || errorLower.includes('internal server') || errorLower.includes('server error')) {
    return {
      message: 'We\'re experiencing technical difficulties. Please try again in a few moments.',
      showSupport: true
    };
  }

  // Rate limiting
  if (errorLower.includes('too many') || errorLower.includes('rate limit')) {
    return {
      message: 'Too many requests. Please wait a moment before trying again.',
      showSupport: false
    };
  }

  // Validation errors
  if (errorLower.includes('validation') || errorLower.includes('required') || errorLower.includes('invalid')) {
    return {
      message: 'Please check your information and make sure all required fields are filled correctly.',
      showSupport: false
    };
  }

  // Default technical error
  return {
    message: 'Something went wrong. Please try again or contact support if the problem continues.',
    showSupport: true
  };
};

export const formatErrorDisplay = (error, context = 'general') => {
  const { message, showSupport } = getErrorMessage(error, context);
  
  if (showSupport) {
    return `${message}\n\nIf this problem persists, please contact support at ${SUPPORT_EMAIL}`;
  }
  
  return message;
};

// Loading messages for different operations
export const getLoadingMessage = (context) => {
  const loadingMessages = {
    auth: 'Signing you in...',
    signup: 'Creating your account...',
    reconciliation_submit: 'Submitting reconciliation...',
    reconciliation_load: 'Loading reconciliation data...',
    employee_create: 'Adding new employee...',
    employee_update: 'Updating employee information...',
    employee_delete: 'Removing employee...',
    employee_load: 'Loading employee data...',
    config_update: 'Saving configuration...',
    config_load: 'Loading system settings...',
    general: 'Processing...'
  };

  return loadingMessages[context] || loadingMessages.general;
};