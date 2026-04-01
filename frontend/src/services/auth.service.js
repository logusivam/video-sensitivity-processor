import apiClient from './apiClient';
import { ENDPOINTS } from '../config/api.config';

export const authService = {
  validateOrg: async (name) => {
    const response = await apiClient.post(ENDPOINTS.auth.validateOrg, { name });
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.auth.register, userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post(ENDPOINTS.auth.login, credentials);
    return response.data;
  },
  // --- Password Reset Methods ---
  requestReset: async (email) => {
    const response = await apiClient.post('/auth/request-reset', { email });
    return response.data;
  },
  completeReset: async (data) => {
    // data should contain { token, newPassword }
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
  logout: async () => {
    // Backend should clear the cookie on this call
    return await apiClient.post('/auth/logout');
  }
};