import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLeads } from '../hooks/useLeads';
import LeadCard from '../components/leads/LeadCard';
import LeadFiltersBar from '../components/leads/LeadFilters';
import Pagination from '../components/leads/Pagination';
import LeadForm from '../components/leads/LeadForm';
import { Button, Spinner, EmptyState, Modal } from '../components/ui';
import { Lead } from '../types';
import { leadsApi } from '../api/leads';

const LeadsPage: React.FC = () => {
  const {
    leads,
    isLoading,
    error,
    meta,
    filters,
    setFilters,
    deleteLead,
    createLead,
    updateLead,
  } = useLeads();

  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (data: Partial<Lead>) => {
    setIsCreating(true);
    try {
      await createLead(data);
      setShowCreate(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = () => {
    leadsApi.exportCSV({
      status: filters.status,
      source: filters.source,
      search: filters.search,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and track your sales pipeline
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </div>

        <LeadFiltersBar
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          totalRecords={meta?.totalRecords || 0}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description={
              filters.search || filters.status || filters.source
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first lead.'
            }
            icon={<Users className="h-8 w-8" />}
            action={
              !filters.search && !filters.status && !filters.source ? (
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lead
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onDelete={deleteLead}
                  onUpdate={updateLead}
                />
              ))}
            </div>

            {meta && (
              <Pagination
                meta={meta}
                onPageChange={(page) => setFilters({ page })}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Lead"
        size="md"
      >
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          isLoading={isCreating}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default LeadsPage;
