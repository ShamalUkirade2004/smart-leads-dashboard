import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, AlertCircle, Phone, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { leadsApi } from '../api/leads';
import { Lead, LeadStatus } from '../types';
import { Spinner, Badge } from '../components/ui';
import { getStatusVariant, formatDate } from '../utils/helpers';
import { Link } from 'react-router-dom';

interface Stats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  recentLeads: Lead[];
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await leadsApi.getLeads({ sort: 'latest', page: 1, limit: 50 });
      if (response.success && response.data) {
        const leads = response.data;
        const total = response.meta?.totalRecords || leads.length;

        const byStatus: Record<LeadStatus, number> = {
          New: 0, Contacted: 0, Qualified: 0, Lost: 0,
        };

        leads.forEach((lead) => {
          byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
        });

        setStats({ total, byStatus, recentLeads: leads.slice(0, 5) });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here's an overview of your leads pipeline
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Leads" value={stats.total} icon={<Users className="h-6 w-6 text-brand-600" />} color="bg-brand-50 dark:bg-brand-900/30" />
              <StatCard label="Qualified" value={stats.byStatus.Qualified} icon={<TrendingUp className="h-6 w-6 text-green-600" />} color="bg-green-50 dark:bg-green-900/30" />
              <StatCard label="Contacted" value={stats.byStatus.Contacted} icon={<Phone className="h-6 w-6 text-yellow-600" />} color="bg-yellow-50 dark:bg-yellow-900/30" />
              <StatCard label="Lost" value={stats.byStatus.Lost} icon={<AlertCircle className="h-6 w-6 text-red-600" />} color="bg-red-50 dark:bg-red-900/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Pipeline Breakdown</h2>
                <div className="space-y-3">
                  {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((status) => {
                    const count = stats.byStatus[status];
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={getStatusVariant(status)}>{status}</Badge>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {count} <span className="text-gray-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Recent Leads</h2>
                  <Link to="/leads" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all →</Link>
                </div>
                <div className="space-y-3">
                  {stats.recentLeads.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No leads yet</p>
                  ) : (
                    stats.recentLeads.map((lead) => (
                      <div key={lead._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(lead.createdAt)}</div>
                        </div>
                        <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
