// Safely check if the app is running in a browser and if it's on HTTPS
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

export const API_CONFIG = {
  // If HTTPS, use the production backend URL. Otherwise, use localhost.
  BASE_URL: isHttps 
    ? (import.meta.env.VITE_BACKEND_URL || '') 
    : 'http://localhost:5000',
  API_VERSION: '/api/v1',
};

export const ENDPOINTS = {
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    validateOrg: '/auth/validate-org',    
    requestReset: '/auth/request-reset', 
    completeReset: '/auth/reset-password', 
    logout: '/auth/logout' 
  }
};