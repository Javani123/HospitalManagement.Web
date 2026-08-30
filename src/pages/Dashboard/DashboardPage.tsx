import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { StatCard } from './components/StatCard';
import { RecentLabOrdersSection } from './components/RecentLabOrdersSection';
import { PendingResultsSection } from './components/PendingResultsSection';
import { QuickLinks } from './components/QuickLinks';
import { useTenant } from '../../hooks/useTenant';
import { useApiError } from '../../hooks/useApiError';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types/dashboard';
import { RotateCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingState } from '../../components/common/LoadingState';

export const DashboardPage: React.FC = () => {
  const { tenant } = useTenant();
  const { error, clearError, handleError } = useApiError();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(
    async (isManualRefresh = false) => {
      clearError();
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clearError, handleError]
  );

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    if (isRefreshing || isLoading) return;
    void loadDashboardData(true);
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Hospital Operations Dashboard"
          subtitle={`Real-time clinical and laboratory overview for ${tenant?.hospitalName || 'Demo Hospital'}`}
          badge={<Badge variant="info" size="sm">F2 Layout & Dashboard</Badge>}
        />
        <LoadingState message="Loading live operational metrics and laboratory queues..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Hospital Operations Dashboard"
        subtitle={`Real-time clinical and laboratory overview for ${tenant?.hospitalName || 'Demo Hospital'}`}
        badge={
          <Badge variant="info" size="sm">
            F2 Layout & Dashboard
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh View
          </Button>
        }
      />

      {/* Error alert if fetch failed */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      {/* Summary KPI Metrics Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.metrics.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {/* Primary Dashboard Operational Sections */}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Recent Lab Orders Table (7 cols on large screens) */}
          <div className="xl:col-span-7">
            <RecentLabOrdersSection
              orders={data.recentOrders}
              isLoading={isRefreshing}
            />
          </div>

          {/* Pending Results Queue (5 cols on large screens) */}
          <div className="xl:col-span-5">
            <PendingResultsSection
              pendingResults={data.pendingResults}
              isLoading={isRefreshing}
            />
          </div>
        </div>
      )}

      {/* Module Navigation Shortcuts */}
      <div className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">System Navigation Shortcuts</h3>
          <span className="text-xs text-slate-400">Pathology & Management Modules</span>
        </div>
        <QuickLinks />
      </div>
    </div>
  );
};

export default DashboardPage;
