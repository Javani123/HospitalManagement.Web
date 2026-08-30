import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { StatCard } from './components/StatCard';
import { RecentLabOrdersSection } from './components/RecentLabOrdersSection';
import { PendingResultsSection } from './components/PendingResultsSection';
import { QuickLinks } from './components/QuickLinks';
import { useTenant } from '../../hooks/useTenant';
import {
  mockDashboardMetrics,
  mockRecentLabOrders,
  mockPendingResults,
} from '../../services/dashboardMockData';
import { RotateCw } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface DashboardPageProps {
  /** Optional initial data override for future backend API integration */
  initialMetrics?: typeof mockDashboardMetrics;
  initialRecentOrders?: typeof mockRecentLabOrders;
  initialPendingResults?: typeof mockPendingResults;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  initialMetrics = mockDashboardMetrics,
  initialRecentOrders = mockRecentLabOrders,
  initialPendingResults = mockPendingResults,
}) => {
  const { tenant } = useTenant();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Simulated refresh handler for UI responsiveness
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

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

      {/* Summary KPI Metrics Grid (Requirement 8 & 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {initialMetrics.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Primary Dashboard Operational Sections (Requirement 10) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Recent Lab Orders Table (7 cols on large screens) */}
        <div className="xl:col-span-7">
          <RecentLabOrdersSection
            orders={initialRecentOrders}
            isLoading={isRefreshing}
          />
        </div>

        {/* Pending Results Queue (5 cols on large screens) */}
        <div className="xl:col-span-5">
          <PendingResultsSection
            pendingResults={initialPendingResults}
            isLoading={isRefreshing}
          />
        </div>
      </div>

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
