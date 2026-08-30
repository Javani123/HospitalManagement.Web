import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Microscope, CheckCircle2 } from 'lucide-react';

export const TestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pathology Tests"
        subtitle="Maintain diagnostic laboratory test catalogue, sample requirements, methods, and billing price."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Tests' },
        ]}
        badge={<Badge variant="success" size="sm" dot>Backend M6 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Pathology Test Master (M6)" subtitle="Diagnostic Test Catalogue" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Links category, sample type, and unit of measurement with test metadata, diagnostic method, and default price.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-cyan-600" />
                <span>Standard Test Catalogue Fields</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                <li><code className="font-mono text-slate-700">Name / Code / ShortName</code> — Complete Blood Count (CBC)</li>
                <li><code className="font-mono text-slate-700">CategoryId</code> — Linked Test Category</li>
                <li><code className="font-mono text-slate-700">SampleTypeId</code> — Linked Specimen Type</li>
                <li><code className="font-mono text-slate-700">UnitId</code> — Linked Measurement Unit (optional for qualitative tests)</li>
                <li><code className="font-mono text-slate-700">Method</code> — Diagnostic method (e.g. Automated Flow Cytometry, ELISA)</li>
                <li><code className="font-mono text-slate-700">Price</code> — Standard billable amount</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/tests</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Service Method</span>
              <span className="font-mono text-blue-600">pathologyService.tests</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Types & abstractions generated</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
