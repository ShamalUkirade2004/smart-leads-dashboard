import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import { leadsApi } from '../api/leads';
import toast from 'react-hot-toast';

interface UseLeadsReturn {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
  filters: LeadFilters;
  setFilters: (filters: Partial<LeadFilters>) => void;
  refetch: () => void;
  deleteLead: (id: string) => Promise<void>;
  createLead: (data: Partial<Lead>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [filters, setFiltersState] = useState<LeadFilters>({
    sort: 'latest',
    page: 1,
  });

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leadsApi.getLeads(filters);
      if (response.success) {
        setLeads(response.data || []);
        setMeta(response.meta || null);
      }
    } catch (err) {
      const message = 'Failed to fetch leads';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const setFilters = (newFilters: Partial<LeadFilters>): void => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const deleteLead = async (id: string): Promise<void> => {
    try {
      await leadsApi.deleteLead(id);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const createLead = async (data: Partial<Lead>): Promise<void> => {
    await leadsApi.createLead(data);
    toast.success('Lead created successfully');
    fetchLeads();
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<void> => {
    await leadsApi.updateLead(id, data);
    toast.success('Lead updated successfully');
    fetchLeads();
  };

  return {
    leads,
    isLoading,
    error,
    meta,
    filters,
    setFilters,
    refetch: fetchLeads,
    deleteLead,
    createLead,
    updateLead,
  };
};
