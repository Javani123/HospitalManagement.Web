import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Users, UserPlus, FileSearch, ShieldCheck } from 'lucide-react';

export const PatientsPlaceholderPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Manage patient registrations, demographics, and clinical histories."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Patients' }]}
        badge={<Badge variant="success" size="sm" dot>Backend M8 Ready</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Patient Master Module"
          subtitle="Ready for Frontend UI Milestone"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              The backend <strong>Patient Master (M8)</strong> APIs, database models, and service contracts are completed. The frontend foundation service (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">patientService.ts</code>) is prepared.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <Users className="w-4 h-4 text-blue-600 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-800">Directory & Search</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Patient code, name, contact lookup & filtering</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <UserPlus className="w-4 h-4 text-emerald-600 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-800">Registration</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Demographics, age, DOB, blood group & contact info</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <FileSearch className="w-4 h-4 text-purple-600 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-800">Order History</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Linked pathology lab orders and reports</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Module Status" subtitle="F1 Architecture Boundary">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Backend Controller</span>
              <span className="font-mono text-slate-800 font-medium">/api/patients</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span>Frontend Service</span>
              <span className="font-mono text-blue-600 font-medium">patientService.ts</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Full CRUD UI</span>
              <Badge variant="warning" size="sm">Next Milestone</Badge>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-tenant isolation active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
