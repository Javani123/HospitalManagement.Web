import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { FileSpreadsheet } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';

export const ResultsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Result Entry & Verification"
        subtitle="Record laboratory test measurements, validate against biological reference intervals, and verify findings."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Results' },
        ]}
        badge={<Badge variant="neutral" size="sm">Workflow Milestone</Badge>}
      />

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Laboratory Result Processing</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Facilitates batch parameter entry, automated flag detection (High/Low/Critical), delta checks, and pathologist sign-off.
            </p>
          </div>
        </div>
      </Card>

      <EmptyState
        title="Result Entry Workspace"
        description="Diagnostic result entry and multi-level medical verification will be available in the upcoming laboratory workflow module."
        icon={<FileSpreadsheet className="w-6 h-6 text-indigo-600" />}
      />
    </div>
  );
};
