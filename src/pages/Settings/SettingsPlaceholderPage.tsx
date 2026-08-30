import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Building2, Sliders, Shield } from 'lucide-react';
import { useTenant } from '../../hooks/useTenant';
import { config } from '../../config/env';

export const SettingsPlaceholderPage: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage hospital preferences, system configuration, and tenant parameters."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]}
        badge={<Badge variant="neutral" size="sm">System Configuration</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tenant Configuration" subtitle="Hospital Metadata & Environment" className="lg:col-span-2">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Active Hospital Environment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Hospital Name</span>
                  <span className="font-semibold text-slate-800">{tenant?.hospitalName || 'Demo Hospital'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Hospital Code</span>
                  <span className="font-mono font-semibold text-slate-800">{tenant?.hospitalCode || 'HOSP-001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">API Base URL</span>
                  <span className="font-mono text-slate-800">{config.api.baseUrl}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">App Version</span>
                  <span className="font-mono text-slate-800">{config.app.version}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                <Sliders className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">General Preferences</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Date formats, currency & reporting templates</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Security & Roles</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Access control and audit logs</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="SaaS Tenancy" subtitle="Multi-Tenant Readiness">
          <div className="space-y-3 text-xs text-slate-600">
            <p className="text-slate-500 text-[11px] leading-relaxed">
              In this F1 foundation phase, tenant context is statically initialized with development settings. Full tenant switching and subscription management will be added in future milestones.
            </p>
            <div className="pt-2">
              <Badge variant="info" size="sm">
                Dev Mode Active
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
