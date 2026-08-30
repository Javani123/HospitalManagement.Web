import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Pipette } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';

export const SamplesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample Collection & Tracking"
        subtitle="Manage specimen intake, barcode accessioning, and phlebotomy collection status."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Samples' },
        ]}
        badge={<Badge variant="neutral" size="sm">Workflow Milestone</Badge>}
      />

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Pipette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Specimen Tracking & Collection</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Handles sample collection timestamps, specimen tube barcoding, container type validation, and phlebotomist assignment.
            </p>
          </div>
        </div>
      </Card>

      <EmptyState
        title="Sample Collection Queue"
        description="Sample collection workflow and specimen accessioning features will be available in the upcoming laboratory workflow module."
        icon={<Pipette className="w-6 h-6 text-purple-600" />}
      />
    </div>
  );
};
