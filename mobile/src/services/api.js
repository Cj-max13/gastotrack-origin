import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set EXPO_PUBLIC_API_URL in mobile/.env
// e.g. EXPO_PUBLIC_API_URL=http://192.168.0.11:3000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.11:3000';

console.log('[API] BASE_URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Could not retrieve token from AsyncStorage:', error.message);
  }
  console.log('[API] Request:', config.method.toUpperCase(), config.url);
  return config;
});

// Log responses and errors
api.interceptors.response.use(
  response => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('[API] Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
