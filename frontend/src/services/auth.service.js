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
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};