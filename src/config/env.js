/**
 * Environment configuration
 * Centralized access to environment variables
 */

export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://func-smartbite-reconciliation.azurewebsites.net/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SmartBite Frontend',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  
  // Debug and Logging Configuration
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE !== 'false',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
};

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'];

requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    // Only warn in development - production should have all required vars set
    if (import.meta.env.DEV) {
      console.warn(`Warning: ${envVar} environment variable is not set`);
    }
  }
});

export default env;