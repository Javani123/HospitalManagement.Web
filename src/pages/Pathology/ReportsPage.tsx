import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Pathology Reports"
        subtitle="Generate formatted diagnostic reports, dispatch electronic laboratory findings, and archive medical records."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Reports' },
        ]}
        badge={<Badge variant="neutral" size="sm">Workflow Milestone</Badge>}
      />

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Diagnostic Reports Engine</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Generates hospital-branded laboratory reports with digital signatures, QR codes, critical alert highlights, and PDF export.
            </p>
          </div>
        </div>
      </Card>

      <EmptyState
        title="Reports Archive"
        description="Diagnostic report generation and PDF distribution features will be available in the upcoming laboratory reporting module."
        icon={<FileText className="w-6 h-6 text-teal-600" />}
      />
    </div>
  );
};
