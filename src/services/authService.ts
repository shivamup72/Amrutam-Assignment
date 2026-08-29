import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await apiClient.post(
    ENDPOINTS.AUTH.LOGIN,
    () => ({
      token: 'mock_jwt_token_amrutam_123',
      user: {
        id: 'usr_1',
        name: 'Patient User',
        email: credentials.email || 'user@amrutam.co.in',
      },
    })
  );

  if (response.data?.token) {
    apiClient.setAuthToken(response.data.token);
  }

  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post(
    ENDPOINTS.AUTH.LOGOUT,
    () => ({ success: true })
  );

  apiClient.setAuthToken(null);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get(
    ENDPOINTS.AUTH.PROFILE,
    () => ({
      id: 'usr_1',
      name: 'Patient User',
      email: 'user@amrutam.co.in',
      phone: '+91 9876543210',
    })
  );
  return response.data;
};
