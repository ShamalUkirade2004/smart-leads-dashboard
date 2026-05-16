import React, { useState } from 'react';
import { Search, Filter, X, Download, SortAsc, SortDesc } from 'lucide-react';
import { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Input, Button } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';

interface LeadFiltersProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onExport: () => void;
  totalRecords: number;
}

const STATUS_OPTS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const SOURCE_OPTS = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const LeadFiltersBar: React.FC<LeadFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  totalRecords,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = filters.status || filters.source || filters.search;

  const clearFilters = () => {
    setSearchInput('');
    onFilterChange({ status: undefined, source: undefined, search: undefined, page: 1 });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: (e.target.value as LeadStatus) || undefined })}
            className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={filters.source || ''}
            onChange={(e) => onFilterChange({ source: (e.target.value as LeadSource) || undefined })}
            className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Sources</option>
            {SOURCE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => onFilterChange({ sort: filters.sort === 'oldest' ? 'latest' : 'oldest' })}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {filters.sort === 'oldest' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            {filters.sort === 'oldest' ? 'Oldest' : 'Latest'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}

          <Button variant="secondary" onClick={onExport} className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Active filters:
          </span>
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-md text-xs">
              Status: {filters.status}
              <button onClick={() => onFilterChange({ status: undefined })}><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.source && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-md text-xs">
              Source: {filters.source}
              <button onClick={() => onFilterChange({ source: undefined })}><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-md text-xs">
              Search: "{filters.search}"
              <button onClick={() => { setSearchInput(''); onFilterChange({ search: undefined }); }}><X className="h-3 w-3" /></button>
            </span>
          )}
          <span className="text-xs text-gray-400">{totalRecords} result{totalRecords !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default LeadFiltersBar;
