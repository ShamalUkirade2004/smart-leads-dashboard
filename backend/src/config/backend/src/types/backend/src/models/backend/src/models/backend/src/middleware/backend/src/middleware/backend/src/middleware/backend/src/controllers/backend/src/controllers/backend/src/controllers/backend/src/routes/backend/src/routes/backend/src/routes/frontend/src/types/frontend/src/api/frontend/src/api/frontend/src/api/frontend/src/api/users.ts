import api from './axios';
import { ApiResponse, UserRole } from '../types';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const usersApi = {
  getUsers: async (): Promise<ApiResponse<AppUser[]>> => {
    const response = await api.get<ApiResponse<AppUser[]>>('/users');
    return response.data;
  },

  updateRole: async (id: string, role: UserRole): Promise<ApiResponse<AppUser>> => {
    const response = await api.patch<ApiResponse<AppUser>>(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },
};
