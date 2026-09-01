import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  FlaskConical,
  FolderTree,
  TestTube,
  Scale,
  Microscope,
  SlidersHorizontal,
  ClipboardList,
  Pipette,
  FileSpreadsheet,
  FileText,
  Settings,
  Building2,
  ChevronDown,
  X,
  LogOut,
  Shield,
  Fingerprint,
  Percent,
  Receipt,
  CreditCard,
  Landmark,
  BookOpen,
  Layers,
} from 'lucide-react';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../hooks/useAuth';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user, logout, hasRole, hasAnyRole } = useAuth();

  // Pathology group expansion state: starts expanded
  const isPathologyRoute = location.pathname.startsWith('/pathology');
  const [isPathologyExpanded, setIsPathologyExpanded] = useState<boolean>(true);

  // Accounting group expansion state
  const isAccountingRoute = location.pathname.startsWith('/accounting');
  const [isAccountingExpanded, setIsAccountingExpanded] = useState<boolean>(true);

  const togglePathology = () => {
    setIsPathologyExpanded((prev) => !prev);
  };

  const toggleAccounting = () => {
    setIsAccountingExpanded((prev) => !prev);
  };

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login', { replace: true });
  };

  // Role permissions evaluation (Admin has full access)
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;
  const canViewPatients = isAdmin || hasAnyRole(['Doctor', 'Receptionist', 'Nurse', 'Accountant']);
  const canViewDepartments = isAdmin || hasAnyRole(['Doctor', 'Technician', 'LabDirector', 'Receptionist', 'Nurse', 'Accountant']);
  const canViewStaff = isAdmin || hasAnyRole(['Doctor', 'Technician', 'LabDirector', 'Receptionist', 'Nurse', 'Accountant']);
  const canViewDoctors = isAdmin || hasAnyRole(['Doctor', 'Technician', 'LabDirector', 'Receptionist', 'Nurse', 'Accountant']);
  const canViewTechnicians = isAdmin || hasAnyRole(['Doctor', 'Technician', 'LabDirector', 'Receptionist', 'Nurse', 'Accountant']);
  const canViewCommissions = isAdmin || hasAnyRole(['Doctor', 'Accountant', 'Receptionist', 'LabDirector']);
  const canViewInvoices = isAdmin || hasAnyRole(['Accountant', 'Receptionist', 'Doctor', 'LabDirector']);
  const canViewPayments = isAdmin || hasAnyRole(['Accountant', 'Receptionist', 'Doctor', 'LabDirector']);
  const canViewAccounting = isAdmin || hasRole('Accountant');
  const canViewPathology = isAdmin || hasAnyRole(['Technician', 'LabDirector', 'Doctor', 'Nurse']);
  const canViewRoles = isAdmin;
  const canViewAuditActor = isAdmin;
  const canViewSettings = isAdmin;

  // Granular pathology item permissions
  const canViewLabMasters = isAdmin || hasAnyRole(['Technician', 'LabDirector']);
  const canViewLabOrders = isAdmin || hasAnyRole(['Technician', 'LabDirector', 'Doctor', 'Receptionist']);
  const canViewSamples = isAdmin || hasAnyRole(['Technician', 'LabDirector', 'Nurse']);
  const canViewResults = isAdmin || hasAnyRole(['Technician', 'LabDirector', 'Doctor']);
  const canViewReports = isAdmin || hasAnyRole(['Technician', 'LabDirector', 'Doctor', 'Accountant', 'Receptionist']);

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

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Application Navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none block">
                CareSync
              </span>
              <span className="text-[11px] font-medium text-slate-400 leading-none">
                Hospital SaaS
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Scope Widget */}
        <div className="p-3 mx-3 mt-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {tenant?.hospitalName || 'Demo Hospital'}
              </p>
              <p className="text-[10px] font-mono text-slate-500 truncate">
                {tenant?.hospitalCode || 'HOSP-001'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto" aria-label="Main Navigation">
          {/* Operations Navigation Group */}
          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Operations
            </div>
            <div className="space-y-1">
              <SidebarItem
                to="/dashboard"
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
                onClick={onCloseMobile}
              />
              {canViewPatients && (
                <SidebarItem
                  to="/patients"
                  icon={<Users className="w-4 h-4" />}
                  label="Patients"
                  onClick={onCloseMobile}
                />
              )}
              {canViewDepartments && (
                <SidebarItem
                  to="/departments"
                  icon={<Building2 className="w-4 h-4" />}
                  label="Departments"
                  onClick={onCloseMobile}
                />
              )}
              {canViewStaff && (
                <SidebarItem
                  to="/staff"
                  icon={<UserCheck className="w-4 h-4" />}
                  label="Staff"
                  onClick={onCloseMobile}
                />
              )}
              {canViewDoctors && (
                <SidebarItem
                  to="/doctors"
                  icon={<Stethoscope className="w-4 h-4" />}
                  label="Doctors"
                  onClick={onCloseMobile}
                />
              )}
              {canViewTechnicians && (
                <SidebarItem
                  to="/technicians"
                  icon={<Microscope className="w-4 h-4" />}
                  label="Technicians"
                  onClick={onCloseMobile}
                />
              )}
              {canViewCommissions && (
                <SidebarItem
                  to="/commissions"
                  icon={<Percent className="w-4 h-4" />}
                  label="Doctor Commission"
                  onClick={onCloseMobile}
                />
              )}
            </div>
          </div>

          {/* Pathology Section (Expandable Accordion) */}
          {canViewPathology && (
            <div>
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Laboratory
                </span>
              </div>

              <div className="space-y-1">
                {/* Pathology Collapsible Header Button */}
                <button
                  type="button"
                  onClick={togglePathology}
                  aria-expanded={isPathologyExpanded}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isPathologyRoute
                      ? 'text-blue-900 bg-blue-50/70 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical className={`w-4 h-4 ${isPathologyRoute ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Pathology</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isPathologyExpanded ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {/* Collapsible Children Container */}
                {isPathologyExpanded && (
                  <div className="pl-4 ml-3 border-l border-slate-200 space-y-0.5 mt-1 pt-0.5">
                    {canViewLabMasters && (
                      <>
                        <SidebarItem
                          to="/pathology/test-categories"
                          icon={<FolderTree className="w-3.5 h-3.5" />}
                          label="Test Categories"
                          isSubItem
                          onClick={onCloseMobile}
                        />

                        <SidebarItem
                          to="/pathology/sample-types"
                          icon={<TestTube className="w-3.5 h-3.5" />}
                          label="Sample Types"
                          isSubItem
                          onClick={onCloseMobile}
                        />

                        <SidebarItem
                          to="/pathology/units"
                          icon={<Scale className="w-3.5 h-3.5" />}
                          label="Units"
                          isSubItem
                          onClick={onCloseMobile}
                        />

                        <SidebarItem
                          to="/pathology/tests"
                          icon={<Microscope className="w-3.5 h-3.5" />}
                          label="Tests"
                          isSubItem
                          onClick={onCloseMobile}
                        />

                        <SidebarItem
                          to="/pathology/reference-ranges"
                          icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                          label="Reference Ranges"
                          isSubItem
                          onClick={onCloseMobile}
                        />
                      </>
                    )}

                    {canViewLabOrders && (
                      <SidebarItem
                        to="/pathology/lab-orders"
                        icon={<ClipboardList className="w-3.5 h-3.5" />}
                        label="Lab Orders"
                        isSubItem
                        onClick={onCloseMobile}
                      />
                    )}

                    {canViewSamples && (
                      <SidebarItem
                        to="/pathology/samples"
                        icon={<Pipette className="w-3.5 h-3.5" />}
                        label="Samples"
                        isSubItem
                        onClick={onCloseMobile}
                      />
                    )}

                    {canViewResults && (
                      <SidebarItem
                        to="/pathology/results"
                        icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                        label="Results"
                        isSubItem
                        onClick={onCloseMobile}
                      />
                    )}

                    {canViewReports && (
                      <SidebarItem
                        to="/pathology/reports"
                        icon={<FileText className="w-3.5 h-3.5" />}
                        label="Reports"
                        isSubItem
                        onClick={onCloseMobile}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing & Finance Section (F14.10, F14.11) */}
          {(canViewInvoices || canViewPayments) && (
            <div>
              <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Billing & Finance
              </div>
              <div className="space-y-1">
                {canViewInvoices && (
                  <SidebarItem
                    to="/invoices"
                    icon={<Receipt className="w-4 h-4" />}
                    label="Invoices"
                    onClick={onCloseMobile}
                  />
                )}
                {canViewPayments && (
                  <SidebarItem
                    to="/payments"
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Payments & Receipts"
                    onClick={onCloseMobile}
                  />
                )}
              </div>
            </div>
          )}

          {/* Accounting & General Ledger Section (F15) */}
          {canViewAccounting && (
            <div>
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Accounting & Ledger
                </span>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={toggleAccounting}
                  aria-expanded={isAccountingExpanded}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isAccountingRoute
                      ? 'text-blue-900 bg-blue-50/70 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Landmark className={`w-4 h-4 ${isAccountingRoute ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Accounting</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isAccountingExpanded ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isAccountingExpanded && (
                  <div className="pl-4 ml-3 border-l border-slate-200 space-y-0.5 mt-1 pt-0.5">
                    <SidebarItem
                      to="/accounting"
                      icon={<LayoutDashboard className="w-3.5 h-3.5" />}
                      label="Accounting Dashboard"
                      isSubItem
                      onClick={onCloseMobile}
                    />
                    <SidebarItem
                      to="/accounting/accounts"
                      icon={<BookOpen className="w-3.5 h-3.5" />}
                      label="Chart of Accounts"
                      isSubItem
                      onClick={onCloseMobile}
                    />
                    <SidebarItem
                      to="/accounting/journals"
                      icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                      label="Journal Register"
                      isSubItem
                      onClick={onCloseMobile}
                    />
                    <SidebarItem
                      to="/accounting/ledger"
                      icon={<Layers className="w-3.5 h-3.5" />}
                      label="General Ledger"
                      isSubItem
                      onClick={onCloseMobile}
                    />
                    <SidebarItem
                      to="/accounting/trial-balance"
                      icon={<Scale className="w-3.5 h-3.5" />}
                      label="Trial Balance"
                      isSubItem
                      onClick={onCloseMobile}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Section */}
          {canViewSettings && (
            <div>
              <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Configuration
              </div>
              <div className="space-y-1">
                {canViewRoles && (
                  <SidebarItem
                    to="/roles"
                    icon={<Shield className="w-4 h-4" />}
                    label="Roles & Permissions"
                    onClick={onCloseMobile}
                  />
                )}
                {canViewAuditActor && (
                  <SidebarItem
                    to="/audit-actor"
                    icon={<Fingerprint className="w-4 h-4" />}
                    label="Audit Actor"
                    onClick={onCloseMobile}
                  />
                )}
                <SidebarItem
                  to="/settings"
                  icon={<Settings className="w-4 h-4" />}
                  label="Settings"
                  onClick={onCloseMobile}
                />
              </div>
            </div>
          )}
        </nav>

        {/* User Session & Logout Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials()}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-blue-600 inline" />
                  <span className="truncate">{user?.roles?.[0] || 'Member'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
