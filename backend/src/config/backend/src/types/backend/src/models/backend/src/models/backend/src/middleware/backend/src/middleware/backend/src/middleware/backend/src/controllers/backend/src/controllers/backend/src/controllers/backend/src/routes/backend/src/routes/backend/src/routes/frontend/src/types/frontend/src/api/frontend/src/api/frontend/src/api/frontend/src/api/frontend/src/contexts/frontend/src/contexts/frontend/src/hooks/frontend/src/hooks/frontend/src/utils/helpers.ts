import { LeadStatus, LeadSource } from '../types';

export const getStatusVariant = (
  status: LeadStatus
): 'success' | 'info' | 'warning' | 'danger' | 'gray' => {
  const map: Record<LeadStatus, 'success' | 'info' | 'warning' | 'danger' | 'gray'> = {
    New: 'info',
    Contacted: 'warning',
    Qualified: 'success',
    Lost: 'danger',
  };
  return map[status];
};

export const getSourceVariant = (
  source: LeadSource
): 'success' | 'info' | 'warning' | 'danger' | 'gray' => {
  const map: Record<LeadSource, 'success' | 'info' | 'warning' | 'danger' | 'gray'> = {
    Website: 'info',
    Instagram: 'warning',
    Referral: 'success',
  };
  return map[source];
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};
