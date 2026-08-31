import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Mail,
  Phone,
  ShieldCheck,
  Award,
} from 'lucide-react';

import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import type {
  DoctorProfileDto,
  CreateDoctorProfileRequest,
  UpdateDoctorProfileRequest,
} from '../../types/doctor';
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
import { formatCurrency } from '../../utils/formatters';
import { DoctorModal } from './components/DoctorModal';

export const DoctorsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Data state
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfileDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<DoctorProfileDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Reactivate dialog state
  const [reactivateTarget, setReactivateTarget] = useState<DoctorProfileDto | null>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [doctorsData, deptData] = await Promise.all([
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setDoctors(doctorsData);
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

  // ─── Search / Filtering ─────────────────────────────────────────────────────

  const filteredDoctors = useMemo(() => {
    let list = doctors;

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((d) => d.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((d) => !d.isActive);
    }

    // 2. Department Filter
    if (selectedDeptId) {
      const deptIdNum = Number(selectedDeptId);
      list = list.filter((d) => d.departmentId === deptIdNum);
    }

    // 3. Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (d) =>
        d.doctorName.toLowerCase().includes(query) ||
        d.registrationNumber.toLowerCase().includes(query) ||
        d.employeeNumber.toLowerCase().includes(query) ||
        (d.specialization && d.specialization.toLowerCase().includes(query)) ||
        (d.qualification && d.qualification.toLowerCase().includes(query)) ||
        (d.departmentName && d.departmentName.toLowerCase().includes(query)) ||
        (d.departmentCode && d.departmentCode.toLowerCase().includes(query)) ||
        (d.email && d.email.toLowerCase().includes(query)) ||
        (d.phone && d.phone.toLowerCase().includes(query))
    );
  }, [doctors, statusFilter, selectedDeptId, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingDoctor(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateDoctorProfileRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await doctorService.create(dto);
      toastSuccess(`Doctor profile created for "${created.doctorName}" (${created.registrationNumber}).`);
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

  const handleOpenEditModal = (doctor: DoctorProfileDto) => {
    setEditingDoctor(doctor);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateDoctorProfileRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await doctorService.update(id, dto);
      toastSuccess(`Doctor profile for "${updated.doctorName}" updated successfully.`);
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

  const handleOpenDeactivateDialog = (doctor: DoctorProfileDto) => {
    setDeactivateTarget(doctor);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await doctorService.deactivate(deactivateTarget.id);
      toastSuccess(`Doctor profile for "${deactivateTarget.doctorName}" deactivated.`);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate doctor profile.');
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Reactivate Handler ─────────────────────────────────────────────────────

  const handleOpenReactivateDialog = (doctor: DoctorProfileDto) => {
    setReactivateTarget(doctor);
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateTarget) return;

    setIsReactivating(true);
    try {
      await doctorService.reactivate(reactivateTarget);
      toastSuccess(`Doctor profile for "${reactivateTarget.doctorName}" reactivated.`);
      setReactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate doctor profile.');
      setReactivateTarget(null);
    } finally {
      setIsReactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<DoctorProfileDto>[] = [
    {
      key: 'registrationNumber',
      header: 'Reg. Number',
      width: '150px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-md tracking-wider">
          {row.registrationNumber}
        </span>
      ),
    },
    {
      key: 'doctorName',
      header: 'Doctor',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm block">
              {row.doctorName}
            </span>
            {row.isExternalReferrer && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                External Referrer
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Staff: {row.employeeNumber} (ID: #{row.staffId})
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
      key: 'specialization',
      header: 'Specialization & Degree',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-700">
          <div className="font-medium text-slate-800">
            {row.specialization || <span className="text-slate-400 italic">General Practice</span>}
          </div>
          {row.qualification && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Award className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.qualification}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'consultationFee',
      header: 'Consultation Fee',
      align: 'right',
      width: '140px',
      render: (row) => (
        <div className="text-right">
          <span className="font-semibold text-sm text-slate-900">
            {formatCurrency(row.consultationFee)}
          </span>
          {row.defaultCommissionRate > 0 && (
            <span className="block text-[10px] text-slate-400">
              {row.defaultCommissionRate}% Comm.
            </span>
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
            render: (row: DoctorProfileDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEditModal(row)}
                  aria-label={`Edit doctor profile for ${row.doctorName}`}
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
                    aria-label={`Deactivate doctor profile for ${row.doctorName}`}
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
                    aria-label={`Reactivate doctor profile for ${row.doctorName}`}
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
    ? 'No doctor profiles match your filter criteria'
    : hasLoaded
    ? 'No doctor profiles registered'
    : 'No doctor profiles found';

  const emptyDescription = searchQuery || selectedDeptId || statusFilter !== 'all'
    ? 'Try searching with a different registration number, name, or resetting filters.'
    : 'Register your first doctor profile linked to an existing clinical staff member to enable diagnostic orders and referrals.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <PageHeader
        title="Doctor Profiles"
        subtitle="Manage registered clinical doctors and professional medical profiles."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Organization' },
          { label: 'Doctors' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              {doctors.filter((d) => d.isActive).length} Active Doctors
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
              Register Doctor
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
        {/* Active Doctors */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Doctors</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {doctors.filter((d) => d.isActive).length}
            </p>
          </div>
        </div>

        {/* Specializations Covered */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Clinical Specializations</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {new Set(doctors.map((d) => d.specialization || 'General')).size}
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
        {/* Search & Department Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by doctor, registration no., specialization, staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              aria-label="Search doctors"
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
              {status === 'all' ? `All (${doctors.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Summary */}
      {(searchQuery || selectedDeptId || statusFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/60">
          <span>
            Showing <strong>{filteredDoctors.length}</strong> of <strong>{doctors.length}</strong> doctor profiles
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId('');
              setStatusFilter('all');
            }}
            className="text-teal-600 hover:text-teal-800 font-medium underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Doctors Table */}
      <Table
        columns={columns}
        data={filteredDoctors}
        keyExtractor={(doc) => doc.id}
        isLoading={isLoading}
        loadingMessage="Loading doctor profiles..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Stethoscope className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && !selectedDeptId && statusFilter === 'all' && isAdmin ? 'Register Doctor' : undefined}
        onEmptyAction={!searchQuery && !selectedDeptId && statusFilter === 'all' && isAdmin ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        doctor={editingDoctor}
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
        title="Deactivate Doctor Profile"
        message={`Are you sure you want to deactivate the profile for ${deactivateTarget?.doctorName} (${deactivateTarget?.registrationNumber})?`}
        detail="This doctor will no longer appear in the active doctors directory or be selectable for new lab order assignments. Historical diagnostic orders and reports will remain preserved."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate Doctor Profile"
        message={`Are you sure you want to reactivate the profile for ${reactivateTarget?.doctorName} (${reactivateTarget?.registrationNumber})?`}
        detail="This doctor will be restored to active status and made available for clinical assignments and diagnostic orders."
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

export default DoctorsPage;
