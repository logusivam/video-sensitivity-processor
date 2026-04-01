import axios from 'axios';
import { ENDPOINTS } from '../config/api.config';

const apiClient = axios.create({
  baseURL: ENDPOINTS.baseURL,
  withCredentials: true, // 📌 REQUIRED for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
 
export default apiClient;