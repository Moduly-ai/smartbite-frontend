/**
 * Form validation utilities
 */

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value) => {
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
  },

  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim().length > 0;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return !value || value.length <= max;
  },

  zipCode: (value) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(value);
  },

  businessName: (value) => {
    return value && value.trim().length >= 2 && value.trim().length <= 100;
  }
};

export const validateField = (value, rules) => {
  const errors = [];
  
  for (const rule of rules) {
    if (typeof rule === 'string') {
      if (rule === 'required' && !validators.required(value)) {
        errors.push('This field is required');
      } else if (rule === 'email' && value && !validators.email(value)) {
        errors.push('Please enter a valid email address');
      } else if (rule === 'phone' && value && !validators.phone(value)) {
        errors.push('Please enter a valid phone number');
      } else if (rule === 'businessName' && value && !validators.businessName(value)) {
        errors.push('Business name must be 2-100 characters');
      }
    } else if (typeof rule === 'object') {
      const { type, min, max, message } = rule;
      
      if (type === 'minLength' && value && !validators.minLength(value, min)) {
        errors.push(message || `Must be at least ${min} characters`);
      } else if (type === 'maxLength' && value && !validators.maxLength(value, max)) {
        errors.push(message || `Must be no more than ${max} characters`);
      }
    }
  }
  
  return errors;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let hasErrors = false;
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const fieldValue = getNestedValue(formData, field);
    const fieldErrors = validateField(fieldValue, rules);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0]; // Show only first error
      hasErrors = true;
    }
  }
  
  return { isValid: !hasErrors, errors };
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};