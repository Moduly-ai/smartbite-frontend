/**
 * Secure logging utility
 * Prevents sensitive data from being logged in production
 */

import { env } from '../config/env.js';

/**
 * Safe console.log that respects debug mode settings
 * @param {...any} args - Arguments to log
 */
export const debugLog = (...args) => {
  if (env.DEBUG_MODE) {
    console.log(...args);
  }
};

/**
 * Safe console.warn that respects debug mode settings
 * @param {...any} args - Arguments to log
 */
export const debugWarn = (...args) => {
  if (env.DEBUG_MODE) {
    console.warn(...args);
  }
};

/**
 * Safe console.error that respects debug mode settings
 * @param {...any} args - Arguments to log
 */
export const debugError = (...args) => {
  if (env.DEBUG_MODE) {
    console.error(...args);
  }
};

/**
 * Sanitize sensitive data from objects before logging
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data safe for logging
 */
export const sanitizeForLogging = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['token', 'password', 'pin', 'authorization', 'auth', 'secret', 'key'];
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => keyLower.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Safe debug log that sanitizes sensitive data
 * @param {string} message - Log message
 * @param {any} data - Data to log (will be sanitized)
 */
export const safeDebugLog = (message, data) => {
  if (env.DEBUG_MODE && data) {
    debugLog(message, sanitizeForLogging(data));
  } else if (env.DEBUG_MODE) {
    debugLog(message);
  }
};