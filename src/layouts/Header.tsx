import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Building2, Bell, Shield, Activity } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';
import { Badge } from '../components/common/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

// Route to Human-Readable Title & Breadcrumbs Mapping
const routeTitleMap: Record<string, { title: string; section?: string }> = {
  '/dashboard': { title: 'Dashboard', section: 'Operations' },
  '/patients': { title: 'Patient Directory', section: 'Operations' },
  '/patients/new': { title: 'Register Patient', section: 'Operations' },
  '/pathology': { title: 'Pathology Management', section: 'Laboratory' },
  '/pathology/test-categories': { title: 'Test Categories', section: 'Laboratory Masters' },
  '/pathology/sample-types': { title: 'Sample Types', section: 'Laboratory Masters' },
  '/pathology/units': { title: 'Measurement Units', section: 'Laboratory Masters' },
  '/pathology/tests': { title: 'Diagnostic Tests', section: 'Laboratory Masters' },
  '/pathology/reference-ranges': { title: 'Reference Ranges', section: 'Laboratory Masters' },
  '/pathology/lab-orders': { title: 'Lab Orders', section: 'Laboratory Workflow' },
  '/pathology/samples': { title: 'Sample Collection', section: 'Laboratory Workflow' },
  '/pathology/results': { title: 'Result Entry & Verification', section: 'Laboratory Workflow' },
  '/pathology/reports': { title: 'Diagnostic Reports', section: 'Laboratory Workflow' },
  '/settings': { title: 'System Settings', section: 'Configuration' },
};

function resolveRouteMeta(pathname: string): { title: string; section?: string } {
  // Exact match first
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];
  // Lab Order detail: /pathology/lab-orders/:id
  if (/^\/pathology\/lab-orders\/\d+$/.test(pathname)) return { title: 'Lab Order Details', section: 'Laboratory Workflow' };
  if (/^\/pathology\/lab-orders\/new$/.test(pathname)) return { title: 'Create Lab Order', section: 'Laboratory Workflow' };
  // Sample detail: /pathology/samples/:id
  if (/^\/pathology\/samples\/\d+$/.test(pathname)) return { title: 'Sample Details', section: 'Laboratory Workflow' };
  // Result detail: /pathology/results/:id
  if (/^\/pathology\/results\/\d+$/.test(pathname)) return { title: 'Diagnostic Result Details', section: 'Laboratory Workflow' };
  // Final Lab Report: /pathology/reports/:orderId
  if (/^\/pathology\/reports\/.+$/.test(pathname)) return { title: 'Final Pathology Lab Report', section: 'Laboratory Workflow' };
  // Patient edit: /patients/:id/edit
  if (/^\/patients\/\d+\/edit$/.test(pathname)) return { title: 'Edit Patient', section: 'Operations' };
  // Patient detail: /patients/:id
  if (/^\/patients\/\d+$/.test(pathname)) return { title: 'Patient Profile', section: 'Operations' };
  return { title: 'Hospital Management', section: 'Overview' };
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { tenant } = useTenant();

  const currentRouteMeta = resolveRouteMeta(location.pathname);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Toggle + Location Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Route Title & Section Breadcrumb Indicator */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{currentRouteMeta.section}</span>
            <span>/</span>
            <span className="font-medium text-slate-600 truncate">{currentRouteMeta.title}</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 leading-none truncate hidden sm:block">
            {currentRouteMeta.title}
          </h2>
        </div>
      </div>

      {/* Right Actions: Tenant Context + Notifications + Demo User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active Hospital Context */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold">{tenant?.hospitalName || 'Demo Hospital'}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-[11px] text-slate-500">{tenant?.hospitalCode || 'HOSP-001'}</span>
        </div>

        {/* System Connectivity Indicator */}
        <div className="hidden xl:flex items-center">
          <Badge variant="success" size="sm" dot>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              Connected
            </span>
          </Badge>
        </div>

        {/* Notification Bell Placeholder */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Placeholder (Clearly fictional placeholder) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            DU
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Demo User</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Shield className="w-3 h-3 text-blue-600 inline" />
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const TopHeader = Header;
