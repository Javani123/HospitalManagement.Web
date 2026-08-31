import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';

import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import type {
  StaffDto,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '../../types/staff';
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
import { formatDate } from '../../utils/formatters';
import { StaffModal } from './components/StaffModal';

export const StaffPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions: Admin can mutate, non-admin has read-only access
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Data state
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<StaffDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Reactivate dialog state
  const [reactivateTarget, setReactivateTarget] = useState<StaffDto | null>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [staffData, deptData] = await Promise.all([
        staffService.getAll(),
        departmentService.getAll(),
      ]);
      setStaffList(staffData);
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

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredStaff = useMemo(() => {
    let list = staffList;

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((s) => s.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((s) => !s.isActive);
    }

    // 2. Department Filter
    if (selectedDeptId) {
      const deptIdNum = Number(selectedDeptId);
      list = list.filter((s) => s.departmentId === deptIdNum);
    }

    // 3. Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        s.employeeNumber.toLowerCase().includes(query) ||
        (s.designation && s.designation.toLowerCase().includes(query)) ||
        (s.departmentName && s.departmentName.toLowerCase().includes(query)) ||
        (s.departmentCode && s.departmentCode.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.phone && s.phone.toLowerCase().includes(query))
    );
  }, [staffList, statusFilter, selectedDeptId, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateStaffRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await staffService.create(dto);
      toastSuccess(`Staff member "${created.fullName}" registered with ID ${created.employeeNumber}.`);
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

  const handleOpenEditModal = (staff: StaffDto) => {
    setEditingStaff(staff);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateStaffRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await staffService.update(id, dto);
      toastSuccess(`Staff member "${updated.fullName}" (${updated.employeeNumber}) updated successfully.`);
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

  const handleOpenDeactivateDialog = (staff: StaffDto) => {
    setDeactivateTarget(staff);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await staffService.deactivate(deactivateTarget.id);
      toastSuccess(`Staff member "${deactivateTarget.fullName}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate staff member.');
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Reactivate Handler ─────────────────────────────────────────────────────

  const handleOpenReactivateDialog = (staff: StaffDto) => {
    setReactivateTarget(staff);
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateTarget) return;

    setIsReactivating(true);
    try {
      await staffService.reactivate(reactivateTarget);
      toastSuccess(`Staff member "${reactivateTarget.fullName}" reactivated successfully.`);
      setReactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate staff member.');
      setReactivateTarget(null);
    } finally {
      setIsReactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<StaffDto>[] = [
    {
      key: 'employeeNumber',
      header: 'Employee No.',
      width: '140px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-md tracking-wider">
          {row.employeeNumber}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Staff Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.fullName}
          </span>
          <span className="text-[11px] text-slate-400">
            ID: #{row.id}
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
      key: 'designation',
      header: 'Designation',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.designation || <span className="text-slate-400 italic">Unspecified</span>}
        </span>
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
      key: 'joiningDate',
      header: 'Joining Date',
      width: '130px',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.joiningDate ? formatDate(row.joiningDate) : '—'}
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
            render: (row: StaffDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEditModal(row)}
                  aria-label={`Edit staff member ${row.fullName}`}
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
                    aria-label={`Deactivate staff member ${row.fullName}`}
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
                    aria-label={`Reactivate staff member ${row.fullName}`}
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

  const emptyTitle = searchQuery || selectedDeptId || statusFilter !== 'all'
    ? 'No staff members match your filter criteria'
    : hasLoaded
    ? 'No staff members registered'
    : 'No staff found';

  const emptyDescription = searchQuery || selectedDeptId || statusFilter !== 'all'
    ? 'Try searching with a different name, employee number, or resetting department / status filters.'
    : 'Register your first clinical or administrative staff member to assign roles, orders, and diagnostic operations.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Staff Master"
        subtitle="Manage hospital staff, clinical designations, and departmental assignments."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Organization' },
          { label: 'Staff' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {staffList.filter((s) => s.isActive).length} Active Staff
            </span>
          </Badge>
        }
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenCreateModal}
            >
              Register Staff
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Active Staff */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Staff Members</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {staffList.filter((s) => s.isActive).length}
            </p>
          </div>
        </div>

        {/* Departments Covered */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Departments Covered</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {new Set(staffList.map((s) => s.departmentId)).size}
            </p>
          </div>
        </div>

        {/* Tenant Isolation Security */}
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search Input & Department Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, employee number, designation, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Search staff"
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
          <div className="w-full sm:w-56">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
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
        </div>

        {/* Right: Status Filter Tabs */}
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
              {status === 'all' ? `All (${staffList.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Summary if filters applied */}
      {(searchQuery || selectedDeptId || statusFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/60">
          <span>
            Showing <strong>{filteredStaff.length}</strong> of <strong>{staffList.length}</strong> staff members
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId('');
              setStatusFilter('all');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Staff Table */}
      <Table
        columns={columns}
        data={filteredStaff}
        keyExtractor={(staff) => staff.id}
        isLoading={isLoading}
        loadingMessage="Loading hospital staff members..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Users className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && !selectedDeptId && statusFilter === 'all' && isAdmin ? 'Register Staff' : undefined}
        onEmptyAction={!searchQuery && !selectedDeptId && statusFilter === 'all' && isAdmin ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        staff={editingStaff}
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
        title="Deactivate Staff Member"
        message={`Are you sure you want to deactivate ${deactivateTarget?.fullName} (${deactivateTarget?.employeeNumber})?`}
        detail="This staff member will no longer appear in the active staff directory or be selectable for new clinical assignments. Historical records and audit trails will be preserved."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate Staff Member"
        message={`Are you sure you want to reactivate ${reactivateTarget?.fullName} (${reactivateTarget?.employeeNumber})?`}
        detail="This staff member will be restored to active status and made available for departmental assignments."
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

export default StaffPage;
