import apiClient from './client';

export const loginAPI = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const verifyLoginOtpAPI = async (email: string, otp: string) => {
  const response = await apiClient.post('/auth/verify-login-otp', { email, otp });
  return response.data;
};

export const signupAPI = async (fullname: string, email: string, password: string) => {
  const response = await apiClient.post('/auth/signup', { fullname, email, password });
  return response.data;
};

export const verifyOtpAPI = async (email: string, otp: string) => {
  const response = await apiClient.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const logoutAPI = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const checkAuthAPI = async () => {
  const response = await apiClient.get('/auth/check');
  return response.data;
};

export const sendOtpAPI = async (email: string) => {
  const response = await apiClient.post('/auth/send-otp', { email });
  return response.data;
};
