import axios from 'axios';
import { ENDPOINTS } from '../config/api.config';

const apiClient = axios.create({
  baseURL: ENDPOINTS.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;