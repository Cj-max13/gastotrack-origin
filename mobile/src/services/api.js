import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set EXPO_PUBLIC_API_URL in mobile/.env
// e.g. EXPO_PUBLIC_API_URL=http://192.168.0.11:3000
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.11:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
