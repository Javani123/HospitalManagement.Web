import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { FolderTree, CheckCircle2 } from 'lucide-react';

export const TestCategoriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Categories"
        subtitle="Manage diagnostic test departments and classification categories."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Test Categories' },
        ]}
        badge={<Badge variant="success" size="sm" dot>Backend M3 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Test Category Master (M3)" subtitle="Departmental Organization" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Provides top-level categorization for laboratory tests (e.g. Hematology, Biochemistry, Immunology, Microbiology, Histopathology).
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-purple-600" />
                <span>Standard Category Fields</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-5 list-disc">
                <li><code className="font-mono text-slate-700">Name</code> — Category display title (e.g., Hematology)</li>
                <li><code className="font-mono text-slate-700">Code</code> — Unique hospital-scoped category identifier (e.g., HEM)</li>
                <li><code className="font-mono text-slate-700">Description</code> — Scope and departmental details</li>
                <li><code className="font-mono text-slate-700">IsActive</code> — Soft delete & operational status</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Service Status" subtitle="Integration Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Endpoint</span>
              <span className="font-mono text-slate-800">/api/pathology/test-categories</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Service Method</span>
              <span className="font-mono text-blue-600">pathologyService.categories</span>
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
