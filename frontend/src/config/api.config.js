export const API_CONFIG = {
  // Using Vite's env variable system, falling back to localhost
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  API_VERSION: '/api/v1',
};

export const ENDPOINTS = {
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    validateOrg: '/auth/validate-org',
  }
};