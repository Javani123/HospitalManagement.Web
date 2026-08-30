import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { ClipboardList, Clock } from 'lucide-react';

export const LabOrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Orders"
        subtitle="Manage diagnostic laboratory test orders, requisitions, sample collection, and result tracking."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Lab Orders' },
        ]}
        badge={<Badge variant="warning" size="sm" dot>M9 In Development</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Lab Order Workflow (M9)" subtitle="Clinical Diagnostics Life Cycle" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              The backend for <strong>Pathology Lab Orders (M9)</strong> is actively being developed. Frontend models and service methods have been prepared.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span>Planned Diagnostic Order Flow</span>
              </div>
              <ol className="space-y-1 text-slate-600 pl-5 list-decimal">
                <li><strong>Requisition:</strong> Order placement with patient details and selected test profiles</li>
                <li><strong>Sample Collection:</strong> Specimen barcode generation & collection timestamping</li>
                <li><strong>Result Entry:</strong> Quantitative / qualitative parameter values input</li>
                <li><strong>Verification:</strong> Pathologist sign-off and report generation</li>
              </ol>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/lab-orders</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Frontend Types</span>
              <span className="font-mono text-blue-600">PathologyLabOrderDto</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-medium pt-1">
              <Clock className="w-4 h-4" />
              <span>Pending M9 backend completion</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
