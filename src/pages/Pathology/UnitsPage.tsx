import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Scale, CheckCircle2 } from 'lucide-react';

export const UnitsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Measurement Units"
        subtitle="Configure quantitative reporting units of measurement (mg/dL, g/dL, mmol/L, %, etc.)."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Units' },
        ]}
        badge={<Badge variant="success" size="sm" dot>Backend M5 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Measurement Unit Master (M5)" subtitle="Quantitative Reporting" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Standardized units for laboratory result reporting, reference interval calculations, and print formatting.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Standard Unit Fields</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                <li><code className="font-mono text-slate-700">Name</code> — Full descriptive name (e.g. Milligram per Deciliter)</li>
                <li><code className="font-mono text-slate-700">Symbol</code> — Short display symbol (e.g. mg/dL, g/dL, 10^3/uL)</li>
                <li><code className="font-mono text-slate-700">Description</code> — Usage context and SI references</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/test-units</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Service Method</span>
              <span className="font-mono text-blue-600">pathologyService.units</span>
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
