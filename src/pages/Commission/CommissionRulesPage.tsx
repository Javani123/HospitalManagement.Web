import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Percent,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Stethoscope,
  Calendar,
  Layers,
  Coins,
  CheckCircle2,
} from 'lucide-react';

import { commissionService } from '../../services/commissionService';
import { doctorService } from '../../services/doctorService';
import type {
  DoctorCommissionRuleDto,
  CreateDoctorCommissionRuleRequest,
  UpdateDoctorCommissionRuleRequest,
  CommissionType,
} from '../../types/commission';
import type { DoctorProfileDto } from '../../types/doctor';
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
import { formatDate, formatCurrency } from '../../utils/formatters';
import { CommissionRuleModal } from './components/CommissionRuleModal';

export const CommissionRulesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions: Admin can mutate, other roles view-only
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Data state
  const [rules, setRules] = useState<DoctorCommissionRuleDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoctorStaffId, setSelectedDoctorStaffId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | CommissionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<DoctorCommissionRuleDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<DoctorCommissionRuleDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Reactivate dialog state
  const [reactivateTarget, setReactivateTarget] = useState<DoctorCommissionRuleDto | null>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [rulesData, doctorsData] = await Promise.all([
        commissionService.getAll(),
        doctorService.getAll(),
      ]);
      setRules(rulesData);
      setDoctors(doctorsData);
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

  // ─── Filter Logic ───────────────────────────────────────────────────────────

  const filteredRules = useMemo(() => {
    let list = rules;

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((r) => r.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((r) => !r.isActive);
    }

    // 2. Type Filter
    if (typeFilter !== 'all') {
      list = list.filter(
        (r) => r.commissionType.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // 3. Doctor Filter
    if (selectedDoctorStaffId) {
      const staffIdNum = Number(selectedDoctorStaffId);
      list = list.filter((r) => r.doctorStaffId === staffIdNum);
    }

    // 4. Search Query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (r) =>
        r.doctorName.toLowerCase().includes(query) ||
        r.doctorRegistrationNumber.toLowerCase().includes(query) ||
        (r.doctorSpecialization &&
          r.doctorSpecialization.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        String(r.doctorStaffId).includes(query)
    );
  }, [rules, statusFilter, typeFilter, selectedDoctorStaffId, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateDoctorCommissionRuleRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await commissionService.create(dto);
      toastSuccess(
        `Commission rule created for "${created.doctorName}" (${
          created.commissionType === 'Percentage'
            ? `${created.commissionValue}%`
            : formatCurrency(created.commissionValue)
        }).`
      );
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

  const handleOpenEditModal = (rule: DoctorCommissionRuleDto) => {
    setEditingRule(rule);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateDoctorCommissionRuleRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await commissionService.update(id, dto);
      toastSuccess(
        `Commission rule for "${updated.doctorName}" updated successfully.`
      );
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

  const handleOpenDeactivateDialog = (rule: DoctorCommissionRuleDto) => {
    setDeactivateTarget(rule);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await commissionService.deactivate(deactivateTarget.id);
      toastSuccess(
        `Commission rule for "${deactivateTarget.doctorName}" deactivated.`
      );
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate commission rule.');
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Reactivate Handler ─────────────────────────────────────────────────────

  const handleOpenReactivateDialog = (rule: DoctorCommissionRuleDto) => {
    setReactivateTarget(rule);
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateTarget) return;

    setIsReactivating(true);
    try {
      await commissionService.reactivate(reactivateTarget);
      toastSuccess(
        `Commission rule for "${reactivateTarget.doctorName}" reactivated.`
      );
      setReactivateTarget(null);
      await loadData();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate commission rule.');
      setReactivateTarget(null);
    } finally {
      setIsReactivating(false);
    }
  };

  // ─── Summary KPIs Calculation ───────────────────────────────────────────────

  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.isActive).length;
  const uniqueDoctorsWithRules = new Set(
    rules.filter((r) => r.isActive).map((r) => r.doctorStaffId)
  ).size;
  const percentageRules = rules.filter(
    (r) => r.commissionType.toLowerCase() === 'percentage' && r.isActive
  ).length;
  const fixedRules = rules.filter(
    (r) => r.commissionType.toLowerCase() === 'fixedamount' && r.isActive
  ).length;

  // ─── Table Columns ──────────────────────────────────────────────────────────

  const columns: ColumnDef<DoctorCommissionRuleDto>[] = [
    {
      key: 'doctorName',
      header: 'Referring Doctor',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold text-teal-900 text-sm">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{row.doctorName}</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
            {row.doctorRegistrationNumber ? (
              <span className="text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded font-semibold">
                {row.doctorRegistrationNumber}
              </span>
            ) : (
              <span>—</span>
            )}
            <span>Staff #{row.doctorStaffId}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'doctorSpecialization',
      header: 'Specialization',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.doctorSpecialization || (
            <span className="text-slate-400 italic">General Practice</span>
          )}
        </span>
      ),
    },
    {
      key: 'commissionType',
      header: 'Commission Type',
      align: 'center',
      render: (row) => {
        const isPct = row.commissionType.toLowerCase() === 'percentage';
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isPct
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            }`}
          >
            {isPct ? (
              <Percent className="w-3 h-3 text-blue-600" />
            ) : (
              <Coins className="w-3 h-3 text-emerald-600" />
            )}
            <span>{isPct ? 'Percentage' : 'Fixed Amount'}</span>
          </span>
        );
      },
    },
    {
      key: 'commissionValue',
      header: 'Rate / Amount',
      align: 'right',
      render: (row) => {
        const isPct = row.commissionType.toLowerCase() === 'percentage';
        return (
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-slate-900">
              {isPct
                ? `${row.commissionValue.toFixed(2)}%`
                : formatCurrency(row.commissionValue)}
            </span>
            <span className="block text-[10px] text-slate-400">
              {isPct ? 'of test value' : 'per lab order'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'effectiveDates',
      header: 'Effective Window',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>From: {formatDate(row.effectiveFrom)}</span>
          </div>
          <div className="text-[11px] text-slate-500 pl-4">
            {row.effectiveTo ? (
              <span>To: {formatDate(row.effectiveTo)}</span>
            ) : (
              <span className="text-teal-700 font-medium bg-teal-50 px-1 rounded">
                Ongoing / Indefinite
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: 'Actions',
            align: 'right' as const,
            render: (row: DoctorCommissionRuleDto) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEditModal(row)}
                  aria-label={`Edit commission rule for ${row.doctorName}`}
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
                    aria-label={`Deactivate commission rule for ${row.doctorName}`}
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
                    aria-label={`Reactivate commission rule for ${row.doctorName}`}
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

  const emptyTitle =
    searchQuery || selectedDoctorStaffId || statusFilter !== 'all' || typeFilter !== 'all'
      ? 'No commission rules match your filter criteria'
      : hasLoaded
      ? 'No doctor commission rules configured'
      : 'No commission rules found';

  const emptyDescription =
    searchQuery || selectedDoctorStaffId || statusFilter !== 'all' || typeFilter !== 'all'
      ? 'Try searching with a different keyword or resetting your filter options.'
      : 'Configure commission rules for referring doctors to automatically calculate financial incentives on diagnostic lab orders.';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Doctor Commission Rules"
        subtitle="Manage referring doctor commission rules and historical commission behavior."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Administration' },
          { label: 'Doctor Commission' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              {activeRules} Active Rules
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
              New Commission Rule
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Rules */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Rules</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalRules}</p>
          </div>
        </div>

        {/* Active Rules */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Rules</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{activeRules}</p>
          </div>
        </div>

        {/* Doctors with Rules */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Covered Doctors</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {uniqueDoctorsWithRules}
            </p>
          </div>
        </div>

        {/* Percentage Rules */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Percentage Rules</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{percentageRules}</p>
          </div>
        </div>

        {/* Fixed Amount Rules */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Fixed Amount</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{fixedRules}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by doctor name, reg no, specialization, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              aria-label="Search commission rules"
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

          {/* Doctor Selector Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedDoctorStaffId}
              onChange={(e) => setSelectedDoctorStaffId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              aria-label="Filter by doctor"
            >
              <option value="">All Doctors ({doctors.length})</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.staffId}>
                  {doc.doctorName} ({doc.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Calculation Type Tabs */}
          <div className="md:col-span-3 flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'Percentage', 'FixedAmount'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors text-center truncate ${
                  typeFilter === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all'
                  ? 'All Types'
                  : type === 'Percentage'
                  ? 'Percentage'
                  : 'Fixed'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === 'all' ? `All (${rules.length})` : status}
              </button>
            ))}
          </div>

          {(searchQuery ||
            selectedDoctorStaffId ||
            typeFilter !== 'all' ||
            statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDoctorStaffId('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="text-teal-600 hover:text-teal-800 font-medium underline cursor-pointer"
            >
              Reset all filters ({filteredRules.length} matching)
            </button>
          )}
        </div>
      </div>

      {/* Rules Table */}
      <Table
        columns={columns}
        data={filteredRules}
        keyExtractor={(rule) => rule.id}
        isLoading={isLoading}
        loadingMessage="Loading doctor commission rules..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Percent className="w-6 h-6" />}
        emptyActionLabel={
          !searchQuery &&
          !selectedDoctorStaffId &&
          typeFilter === 'all' &&
          statusFilter === 'all' &&
          isAdmin
            ? 'New Commission Rule'
            : undefined
        }
        onEmptyAction={
          !searchQuery &&
          !selectedDoctorStaffId &&
          typeFilter === 'all' &&
          statusFilter === 'all' &&
          isAdmin
            ? handleOpenCreateModal
            : undefined
        }
        striped
      />

      {/* Create / Edit Commission Rule Modal */}
      <CommissionRuleModal
        isOpen={isModalOpen}
        rule={editingRule}
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
        title="Deactivate Commission Rule"
        message={`Are you sure you want to deactivate the commission rule for ${deactivateTarget?.doctorName}?`}
        detail="This rule will no longer be applied to new lab orders. Historical lab orders with recorded commission snapshots will remain unchanged."
        confirmLabel="Deactivate Rule"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateTarget)}
        title="Reactivate Commission Rule"
        message={`Are you sure you want to reactivate the commission rule for ${reactivateTarget?.doctorName}?`}
        detail="This rule will be restored to active status and applied to eligible new diagnostic lab orders within its effective date range."
        confirmLabel="Reactivate Rule"
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

export default CommissionRulesPage;
