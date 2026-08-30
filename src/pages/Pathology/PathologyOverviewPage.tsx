import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { QuickLinks } from '../Dashboard/components/QuickLinks';
import { FlaskConical } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const PathologyOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pathology Management"
        subtitle="Master directory configuration and laboratory diagnostic test management."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Pathology' }]}
        badge={<Badge variant="info" size="sm">Masters M3–M7 Ready</Badge>}
      />

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Pathology Master Directory</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Configure diagnostic hierarchies including categories, specimen sample types, measurement units, test catalog with pricing, and demographic-specific reference ranges.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Pathology Modules</h3>
        <QuickLinks />
      </div>
    </div>
  );
};
