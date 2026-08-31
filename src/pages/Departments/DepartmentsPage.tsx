import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Layers,
  ShieldCheck,
  Building,
} from 'lucide-react';

import { departmentService } from '../../services/departmentService';
import type {
  DepartmentDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentStatusFilter,
} from '../../types/department';
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
import { formatDate } from '../../utils/formatters';
import { DepartmentModal } from './components/DepartmentModal';

export const DepartmentsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions: Admin can mutate, non-admin has read-only access
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Data state
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DepartmentStatusFilter>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<DepartmentDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Reactivate dialog state
  const [reactivateTarget, setReactivateTarget] = useState<DepartmentDto | null>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadDepartments = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredDepartments = useMemo(() => {
    let list = departments;

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((d) => d.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((d) => !d.isActive);
    }

    // 2. Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.code.toLowerCase().includes(query) ||
        (dept.description && dept.description.toLowerCase().includes(query))
    );
  }, [departments, statusFilter, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateDepartmentRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await departmentService.create(dto);
      toastSuccess(`Department "${created.name}" (${created.code}) created successfully.`);
      setIsModalOpen(false);
      await loadDepartments();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────────────────────────

  const handleOpenEditModal = (dept: DepartmentDto) => {
    setEditingDepartment(dept);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateDepartmentRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await departmentService.update(id, dto);
      toastSuccess(`Department "${updated.name}" (${updated.code}) updated successfully.`);
      setIsModalOpen(false);
      await loadDepartments();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Deactivate Handler ─────────────────────────────────────────────────────

  const handleOpenDeactivateDialog = (dept: DepartmentDto) => {
    setDeactivateTarget(dept);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await departmentService.deactivate(deactivateTarget.id);
      toastSuccess(`Department "${deactivateTarget.name}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadDepartments();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate department.');
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Reactivate Handler ─────────────────────────────────────────────────────

  const handleOpenReactivateDialog = (dept: DepartmentDto) => {
    setReactivateTarget(dept);
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateTarget) return;

    setIsReactivating(true);
    try {
      await departmentService.reactivate(reactivateTarget);
      toastSuccess(`Department "${reactivateTarget.name}" reactivated successfully.`);
      setReactivateTarget(null);
      await loadDepartments();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate department.');
      setReactivateTarget(null);
    } finally {
      setIsReactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<DepartmentDto>[] = [
    {
      key: 'code',
      header: 'Department Code',
      width: '140px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-md tracking-wider">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.name}
          </span>
          <span className="text-[11px] text-slate-400">
            ID: #{row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-slate-600 text-xs line-clamp-2 max-w-md">
          {row.description || <span className="text-slate-400 italic">No description provided</span>}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created On',
      width: '140px',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {formatDate(row.createdAt)}
        </span>
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
            render: (row: DepartmentDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEditModal(row)}
                  aria-label={`Edit department ${row.name}`}
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
                    aria-label={`Deactivate department ${row.name}`}
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
                    aria-label={`Reactivate department ${row.name}`}
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

  const emptyTitle = searchQuery || statusFilter !== 'all'
    ? 'No departments match your filters'
    : hasLoaded
    ? 'No hospital departments registered'
    : 'No departments found';

  const emptyDescription = searchQuery || statusFilter !== 'all'
    ? `No departments found matching your current filter criteria. Try clearing search or status filter.`
    : 'Register your first department (e.g., Pathology and Lab Medicine, Cardiology, Radiology) to organize staff and hospital operations.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Departments"
        subtitle="Manage hospital departments used across staff, doctors, technicians, and operational workflows."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Organization' },
          { label: 'Departments' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {departments.filter((d) => d.isActive).length} Active
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
              Add Department
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Active Departments */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Departments</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {departments.filter((d) => d.isActive).length}
            </p>
          </div>
        </div>

        {/* Master Scope Info */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Master Scope</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Hospital Clinical & Admin Units</p>
          </div>
        </div>

        {/* Tenant Isolation Badge */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tenant Security</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Hospital-Isolated Master</p>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by department name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
            aria-label="Search departments"
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
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
              {status === 'all' ? `All (${departments.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Departments Table */}
      <Table
        columns={columns}
        data={filteredDepartments}
        keyExtractor={(dept) => dept.id}
        isLoading={isLoading}
        loadingMessage="Loading hospital departments..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Building2 className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && statusFilter === 'all' && isAdmin ? 'Add Department' : undefined}
        onEmptyAction={!searchQuery && statusFilter === 'all' && isAdmin ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        department={editingDepartment}
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
        title="Deactivate Department"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}" (${deactivateTarget?.code})?`}
        detail="This department will no longer be available for new operational assignments. Existing staff and records will maintain historical integrity."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate Department"
        message={`Are you sure you want to reactivate "${reactivateTarget?.name}" (${reactivateTarget?.code})?`}
        detail="This department will be restored to active status and made available for staff and operational assignments."
        confirmLabel="Reactivate"
        confirmVariant="primary"
        icon="info"
        isLoading={isReactivating}
        onConfirm={handleReactivateConfirm}
        onCancel={() => !isReactivating && setReactivateTarget(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default DepartmentsPage;
