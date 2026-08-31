import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Building2, Bell, Shield, Activity, LogOut, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/common/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

// Route to Human-Readable Title & Breadcrumbs Mapping
const routeTitleMap: Record<string, { title: string; section?: string }> = {
  '/dashboard': { title: 'Dashboard', section: 'Operations' },
  '/patients': { title: 'Patient Directory', section: 'Operations' },
  '/patients/new': { title: 'Register Patient', section: 'Operations' },
  '/departments': { title: 'Departments', section: 'Organization' },
  '/staff': { title: 'Staff Directory', section: 'Organization' },
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
  '/roles': { title: 'Roles & Permissions', section: 'Administration' },
  '/settings': { title: 'System Settings', section: 'Configuration' },
};

function resolveRouteMeta(pathname: string): { title: string; section?: string } {
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];
  if (/^\/pathology\/lab-orders\/\d+$/.test(pathname)) return { title: 'Lab Order Details', section: 'Laboratory Workflow' };
  if (/^\/pathology\/lab-orders\/new$/.test(pathname)) return { title: 'Create Lab Order', section: 'Laboratory Workflow' };
  if (/^\/pathology\/samples\/\d+$/.test(pathname)) return { title: 'Sample Details', section: 'Laboratory Workflow' };
  if (/^\/pathology\/results\/\d+$/.test(pathname)) return { title: 'Diagnostic Result Details', section: 'Laboratory Workflow' };
  if (/^\/pathology\/reports\/.+$/.test(pathname)) return { title: 'Final Pathology Lab Report', section: 'Laboratory Workflow' };
  if (/^\/patients\/\d+\/edit$/.test(pathname)) return { title: 'Edit Patient', section: 'Operations' };
  if (/^\/patients\/\d+$/.test(pathname)) return { title: 'Patient Profile', section: 'Operations' };
  return { title: 'Hospital Management', section: 'Overview' };
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentRouteMeta = resolveRouteMeta(location.pathname);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (): string => {
    if (!user) return 'U';
    if (user.fullName) {
      const parts = user.fullName.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const primaryRole = user?.roles?.[0] || 'User';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Toggle + Location Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Right Actions: Tenant Context + Connectivity + Notifications + User Profile */}
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
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* Authenticated User Profile with Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {getInitials()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                {user?.fullName || user?.username || 'Signed In'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Shield className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate max-w-[100px]">{primaryRole}</span>
              </div>
            </div>
          </button>

          {/* User Profile Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Details Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email || `@${user?.username}`}
                </p>
                
                {/* Roles Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        <Shield className="w-2.5 h-2.5 text-blue-600" />
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">No roles assigned</span>
                  )}
                </div>

                {/* Linked Staff Info if available */}
                {user?.staffName && (
                  <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Staff: <strong>{user.staffName}</strong></span>
                  </div>
                )}
              </div>

              {/* Menu Actions */}
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const TopHeader = Header;
export default Header;
