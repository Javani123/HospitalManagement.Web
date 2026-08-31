import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Microscope,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  FlaskConical,
  Award,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

import { technicianService } from '../../services/technicianService';
import { departmentService } from '../../services/departmentService';
import type {
  TechnicianProfileDto,
  CreateTechnicianProfileRequest,
  UpdateTechnicianProfileRequest,
} from '../../types/technician';
import type { DepartmentDto } from '../../types/department';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { ColumnDef } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { TechnicianModal } from './components/TechnicianModal';

export const TechniciansPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Data state
  const [technicians, setTechnicians] = useState<TechnicianProfileDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedBench, setSelectedBench] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTechnician, setEditingTechnician] = useState<TechnicianProfileDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<TechnicianProfileDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Reactivate dialog state
  const [reactivateTarget, setReactivateTarget] = useState<TechnicianProfileDto | null>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [techsData, deptData] = await Promise.all([
        technicianService.getAll(),
        departmentService.getAll(),
      ]);
      setTechnicians(techsData);
      setDepartments(deptData);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Derive unique laboratory benches for the bench filter
  const uniqueBenches = useMemo(() => {
    const benches = new Set<string>();
    technicians.forEach((t) => {
      if (t.primaryBench && t.primaryBench.trim()) {
        benches.add(t.primaryBench.trim());
      }
    });
    return Array.from(benches).sort();
  }, [technicians]);

  // ─── Search / Filtering ─────────────────────────────────────────────────────

  const filteredTechnicians = useMemo(() => {
    let list = technicians;

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((t) => t.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((t) => !t.isActive);
    }

    // 2. Department Filter
    if (selectedDeptId) {
      const deptIdNum = Number(selectedDeptId);
      list = list.filter((t) => t.departmentId === deptIdNum);
    }

    // 3. Primary Bench Filter
    if (selectedBench) {
      list = list.filter(
        (t) =>
          t.primaryBench &&
          t.primaryBench.toLowerCase() === selectedBench.toLowerCase()
      );
    }

    // 4. Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (t) =>
        t.technicianName.toLowerCase().includes(query) ||
        t.licenseNumber.toLowerCase().includes(query) ||
        t.employeeNumber.toLowerCase().includes(query) ||
        (t.primaryBench && t.primaryBench.toLowerCase().includes(query)) ||
        (t.certification && t.certification.toLowerCase().includes(query)) ||
        (t.departmentName && t.departmentName.toLowerCase().includes(query)) ||
        (t.departmentCode && t.departmentCode.toLowerCase().includes(query)) ||
        (t.email && t.email.toLowerCase().includes(query)) ||
        (t.phone && t.phone.toLowerCase().includes(query))
    );
  }, [technicians, statusFilter, selectedDeptId, selectedBench, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingTechnician(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateTechnicianProfileRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await technicianService.create(dto);
      toastSuccess(`Technician profile created for "${created.technicianName}" (${created.licenseNumber}).`);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────────────────────────

  const handleOpenEditModal = (tech: TechnicianProfileDto) => {
    setEditingTechnician(tech);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateTechnicianProfileRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await technicianService.update(id, dto);
      toastSuccess(`Technician profile for "${updated.technicianName}" updated successfully.`);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Deactivate Handler ─────────────────────────────────────────────────────

  const handleOpenDeactivateDialog = (tech: TechnicianProfileDto) => {
    setDeactivateTarget(tech);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await technicianService.deactivate(deactivateTarget.id);
      toastSuccess(`Technician profile for "${deactivateTarget.technicianName}" deactivated.`);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate technician profile.');
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Reactivate Handler ─────────────────────────────────────────────────────

  const handleOpenReactivateDialog = (tech: TechnicianProfileDto) => {
    setReactivateTarget(tech);
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateTarget) return;

    setIsReactivating(true);
    try {
      await technicianService.reactivate(reactivateTarget);
      toastSuccess(`Technician profile for "${reactivateTarget.technicianName}" reactivated.`);
      setReactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate technician profile.');
      setReactivateTarget(null);
    } finally {
      setIsReactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<TechnicianProfileDto>[] = [
    {
      key: 'licenseNumber',
      header: 'License No.',
      width: '160px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-md tracking-wider">
          {row.licenseNumber}
        </span>
      ),
    },
    {
      key: 'technicianName',
      header: 'Technician',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.technicianName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Staff: {row.employeeNumber} (ID: #{row.staffId})
            {row.designation ? ` • ${row.designation}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded">
            {row.departmentCode || 'DEPT'}
          </span>
          <span className="text-xs font-medium text-slate-700">
            {row.departmentName || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'primaryBench',
      header: 'Primary Bench',
      render: (row) =>
        row.primaryBench ? (
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="text-xs font-semibold text-teal-800 bg-teal-50/70 border border-teal-200/60 px-2 py-0.5 rounded-md">
              {row.primaryBench}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">General Diagnostics</span>
        ),
    },
    {
      key: 'certification',
      header: 'Certification & Degree',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-700">
          {row.certification ? (
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="font-medium text-slate-800">{row.certification}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Standard Certified</span>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          {row.email && (
            <div className="flex items-center gap-1.5 truncate max-w-xs">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.phone}</span>
            </div>
          )}
          {!row.email && !row.phone && (
            <span className="text-slate-400 italic">No contact info</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      width: '110px',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: 'Actions',
            align: 'right' as const,
            width: '170px',
            render: (row: TechnicianProfileDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEditModal(row)}
                  aria-label={`Edit technician profile for ${row.technicianName}`}
                >
                  Edit
                </Button>
                {row.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenDeactivateDialog(row)}
                    aria-label={`Deactivate technician profile for ${row.technicianName}`}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenReactivateDialog(row)}
                    aria-label={`Reactivate technician profile for ${row.technicianName}`}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const emptyTitle = searchQuery || selectedDeptId || selectedBench || statusFilter !== 'all'
    ? 'No technician profiles match your filter criteria'
    : hasLoaded
    ? 'No technician profiles registered'
    : 'No technician profiles found';

  const emptyDescription = searchQuery || selectedDeptId || selectedBench || statusFilter !== 'all'
    ? 'Try searching with a different license number, name, bench, or resetting filters.'
    : 'Register your first laboratory technician profile linked to an existing clinical staff member to enable test execution and bench workflows.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <PageHeader
        title="Technician Profiles"
        subtitle="Manage laboratory technician profiles, bench assignments, and professional certifications."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Organization' },
          { label: 'Technicians' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Microscope className="w-3.5 h-3.5" />
              {technicians.filter((t) => t.isActive).length} Active Technicians
            </span>
          </Badge>
        }
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateModal}
            >
              Register Technician
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Technicians */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Technicians</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {technicians.filter((t) => t.isActive).length}
            </p>
          </div>
        </div>

        {/* Laboratory Benches */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Laboratory Benches</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {uniqueBenches.length || 1}
            </p>
          </div>
        </div>

        {/* Tenant Security */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tenant Security</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Staff-Linked Master Profile</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search, Department & Bench Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, license no., bench, certification, staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              aria-label="Search technicians"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              aria-label="Filter by department"
            >
              <option value="">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          {/* Primary Bench Filter Dropdown */}
          {uniqueBenches.length > 0 && (
            <div className="w-full sm:w-48">
              <select
                value={selectedBench}
                onChange={(e) => setSelectedBench(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
                aria-label="Filter by laboratory bench"
              >
                <option value="">All Benches ({uniqueBenches.length})</option>
                {uniqueBenches.map((bench) => (
                  <option key={bench} value={bench}>
                    {bench}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto shrink-0">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'all' ? `All (${technicians.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Summary */}
      {(searchQuery || selectedDeptId || selectedBench || statusFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/60">
          <span>
            Showing <strong>{filteredTechnicians.length}</strong> of <strong>{technicians.length}</strong> technician profiles
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId('');
              setSelectedBench('');
              setStatusFilter('all');
            }}
            className="text-teal-600 hover:text-teal-800 font-medium underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Technicians Table */}
      <Table
        columns={columns}
        data={filteredTechnicians}
        keyExtractor={(tech) => tech.id}
        isLoading={isLoading}
        loadingMessage="Loading technician profiles..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Microscope className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && !selectedDeptId && !selectedBench && statusFilter === 'all' && isAdmin ? 'Register Technician' : undefined}
        onEmptyAction={!searchQuery && !selectedDeptId && !selectedBench && statusFilter === 'all' && isAdmin ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Technician Modal */}
      <TechnicianModal
        isOpen={isModalOpen}
        technician={editingTechnician}
        isSubmitting={isSubmitting}
        error={modalError}
        onClose={() => setIsModalOpen(false)}
        onSubmitCreate={handleCreateSubmit}
        onSubmitUpdate={handleUpdateSubmit}
        onClearError={() => setModalError(null)}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        title="Deactivate Technician Profile"
        message={`Are you sure you want to deactivate the profile for ${deactivateTarget?.technicianName} (${deactivateTarget?.licenseNumber})?`}
        detail="This technician will no longer appear in the active technician roster or be selectable for new laboratory bench assignments. Historical diagnostic results and verification records will remain preserved."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate Technician Profile"
        message={`Are you sure you want to reactivate the profile for ${reactivateTarget?.technicianName} (${reactivateTarget?.licenseNumber})?`}
        detail="This technician will be restored to active status and made available for bench assignments and laboratory workflows."
        confirmLabel="Reactivate"
        confirmVariant="primary"
        icon="info"
        isLoading={isReactivating}
        onConfirm={handleReactivateConfirm}
        onCancel={() => !isReactivating && setReactivateTarget(null)}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default TechniciansPage;
