import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { TestTube, CheckCircle2 } from 'lucide-react';

export const SampleTypesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample Types"
        subtitle="Configure biological specimen sample types (Blood, Serum, Urine, CSF, etc.)."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Sample Types' },
        ]}
        badge={<Badge variant="success" size="sm" dot>Backend M4 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Sample Type Master (M4)" subtitle="Specimen Definitions" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Defines biological specimens collected from patients for diagnostic tests, container specifications, and handling instructions.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-amber-600" />
                <span>Standard Specimen Fields</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                <li><code className="font-mono text-slate-700">Name</code> — Specimen name (e.g. Whole Blood, Serum, Plasma, Midstream Urine)</li>
                <li><code className="font-mono text-slate-700">Code</code> — Specimen short code (e.g. BLD, SER, URN)</li>
                <li><code className="font-mono text-slate-700">Description</code> — Collection guidelines and notes</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/sample-types</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Service Method</span>
              <span className="font-mono text-blue-600">pathologyService.sampleTypes</span>
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
