import api from './axios';
import { ApiResponse, User, UserRole } from '../types';

interface AuthData {
  token: string;
  user: User;
}

export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<ApiResponse<AuthData>> => {
    const response = await api.post<ApiResponse<AuthData>>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthData>> => {
    const response = await api.post<ApiResponse<AuthData>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
};
