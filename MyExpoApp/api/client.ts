import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.100.45:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    console.log(`[API REQUEST]: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token from SecureStore', error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const targetUrl = error.config ? `${error.config.baseURL}${error.config.url}` : BASE_URL;
    if (error.response) {
      console.log(`[API ERROR ${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.log(`[NETWORK ERROR]: Không thể kết nối tới Server. Đang cố kết nối đến: ${targetUrl}`);
      error.message = `Lỗi mạng khi gọi ${targetUrl}`;
    } else {
      console.log('[ERROR]:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
