import api from './axios';
import { ApiResponse, Lead, LeadFilters } from '../types';

export const leadsApi = {
  getLeads: async (filters: LeadFilters): Promise<ApiResponse<Lead[]>> => {
    const params: Record<string, string> = {};

    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const response = await api.get<ApiResponse<Lead[]>>('/leads', { params });
    return response.data;
  },

  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return response.data;
  },

  createLead: async (
    data: Partial<Lead>
  ): Promise<ApiResponse<Lead>> => {
    const response = await api.post<ApiResponse<Lead>>('/leads', data);
    return response.data;
  },

  updateLead: async (
    id: string,
    data: Partial<Lead>
  ): Promise<ApiResponse<Lead>> => {
    const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/leads/${id}`);
    return response.data;
  },

  exportCSV: (filters: Omit<LeadFilters, 'page' | 'sort'>): void => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);

    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const url = `${baseUrl}/leads/export/csv?${params.toString()}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  },
};
