import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
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
} from 'lucide-react';
import { useTenant } from '../hooks/useTenant';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const location = useLocation();
  const { tenant } = useTenant();

  // Pathology group expansion state: starts expanded
  const isPathologyRoute = location.pathname.startsWith('/pathology');
  const [isPathologyExpanded, setIsPathologyExpanded] = useState<boolean>(true);

  const togglePathology = () => {
    setIsPathologyExpanded((prev) => !prev);
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
                {tenant?.hospitalCode || 'HOSP-001'} (Dev Context)
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
              <SidebarItem
                to="/patients"
                icon={<Users className="w-4 h-4" />}
                label="Patients"
                onClick={onCloseMobile}
              />
            </div>
          </div>

          {/* Pathology Section (Expandable Accordion) */}
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

                  <SidebarItem
                    to="/pathology/lab-orders"
                    icon={<ClipboardList className="w-3.5 h-3.5" />}
                    label="Lab Orders"
                    isSubItem
                    onClick={onCloseMobile}
                  />

                  <SidebarItem
                    to="/pathology/samples"
                    icon={<Pipette className="w-3.5 h-3.5" />}
                    label="Samples"
                    isSubItem
                    onClick={onCloseMobile}
                  />

                  <SidebarItem
                    to="/pathology/results"
                    icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                    label="Results"
                    isSubItem
                    onClick={onCloseMobile}
                  />

                  <SidebarItem
                    to="/pathology/reports"
                    icon={<FileText className="w-3.5 h-3.5" />}
                    label="Reports"
                    isSubItem
                    onClick={onCloseMobile}
                  />
                </div>
              )}
            </div>
          </div>

          {/* System Section */}
          <div>
            <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Configuration
            </div>
            <div className="space-y-1">
              <SidebarItem
                to="/settings"
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                onClick={onCloseMobile}
              />
            </div>
          </div>
        </nav>

        {/* Footer / Application Status Indicator */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-600">Hospital SaaS F2</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v0.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
