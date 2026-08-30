import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const ReferenceRangesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reference Ranges"
        subtitle="Configure gender and age-specific normal reference intervals and qualitative interpretation text."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Reference Ranges' },
        ]}
        badge={<Badge variant="success" size="sm" dot>Backend M7 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Reference Range Master (M7)" subtitle="Normal Clinical Intervals" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Defines quantitative interval bounds (Min/Max values) or qualitative text values partitioned by patient gender and age spans.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                <span>Standard Range Rules</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                <li><code className="font-mono text-slate-700">TestId</code> — Linked diagnostic test</li>
                <li><code className="font-mono text-slate-700">Gender</code> — Male, Female, or Both</li>
                <li><code className="font-mono text-slate-700">Age Range & Unit</code> — AgeMin to AgeMax (Years, Months, Days)</li>
                <li><code className="font-mono text-slate-700">MinVal / MaxVal</code> — Numeric normal boundaries for flags</li>
                <li><code className="font-mono text-slate-700">TextVal</code> — Qualitative description (e.g. Negative, Non-reactive)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/reference-ranges</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Service Method</span>
              <span className="font-mono text-blue-600">pathologyService.referenceRanges</span>
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
