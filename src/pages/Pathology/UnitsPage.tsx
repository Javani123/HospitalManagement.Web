import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Scale,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Activity,
  ShieldCheck,
  Binary,
} from 'lucide-react';

import { pathologyUnitService } from '../../services/pathologyUnitService';
import type {
  PathologyUnitDto,
  CreatePathologyUnitRequest,
  UpdatePathologyUnitRequest,
} from '../../types/pathologyUnit';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { ColumnDef } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';
import { UnitModal } from './components/UnitModal';

export const UnitsPage: React.FC = () => {
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [units, setUnits] = useState<PathologyUnitDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<PathologyUnitDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<PathologyUnitDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadUnits = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await pathologyUnitService.getAll();
      setUnits(data);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredUnits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return units;

    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.code.toLowerCase().includes(query) ||
        u.symbol.toLowerCase().includes(query) ||
        (u.description && u.description.toLowerCase().includes(query))
    );
  }, [units, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingUnit(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreatePathologyUnitRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await pathologyUnitService.create(dto);
      toastSuccess(`Measurement unit "${created.name}" (${created.symbol}) created successfully.`);
      setIsModalOpen(false);
      await loadUnits();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────────────────────────

  const handleOpenEditModal = (u: PathologyUnitDto) => {
    setEditingUnit(u);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdatePathologyUnitRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await pathologyUnitService.update(id, dto);
      toastSuccess(`Measurement unit "${updated.name}" updated successfully.`);
      setIsModalOpen(false);
      await loadUnits();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Deactivate Handler ─────────────────────────────────────────────────────

  const handleOpenDeactivateDialog = (u: PathologyUnitDto) => {
    setDeactivateTarget(u);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await pathologyUnitService.deactivate(deactivateTarget.id);
      toastSuccess(`Measurement unit "${deactivateTarget.name}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadUnits();
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<PathologyUnitDto>[] = [
    {
      key: 'symbol',
      header: 'Symbol / Display',
      width: '130px',
      render: (row) => (
        <span className="font-semibold text-xs text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Unit Name',
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
      key: 'code',
      header: 'Unit Code',
      width: '120px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
          {row.code}
        </span>
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
    {
      key: '_actions',
      header: 'Actions',
      align: 'right',
      width: '140px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenEditModal(row)}
            aria-label={`Edit unit ${row.name}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenDeactivateDialog(row)}
            aria-label={`Deactivate unit ${row.name}`}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery
    ? 'No units match your search.'
    : hasLoaded
    ? 'No pathology units found.'
    : 'No pathology units found.';

  const emptyDescription = searchQuery
    ? `No measurement units found matching "${searchQuery}". Try searching with a different name, code, or symbol.`
    : 'Register your first measurement unit (e.g., mg/dL, g/dL, IU/L, %) to configure diagnostic test values and reference ranges.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Pathology Units"
        subtitle="Configure diagnostic test measurement units and reporting symbols (mg/dL, g/dL, IU/L, %, etc.)."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Units' },
        ]}
        badge={
          <Badge variant="purple" size="sm">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              {units.length} {units.length === 1 ? 'Unit' : 'Units'}
            </span>
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Add Unit
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Units Count */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Units</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{units.length}</p>
          </div>
        </div>

        {/* Unit Scope Info */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Reporting Standard</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Clinical Diagnostic Units</p>
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

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by unit name, code, symbol, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
            aria-label="Search measurement units"
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

        {searchQuery && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredUnits.length}</strong> of <strong>{units.length}</strong> units
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>

      {/* Units Table */}
      <Table
        columns={columns}
        data={filteredUnits}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology test units..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Binary className="w-6 h-6" />}
        emptyActionLabel={!searchQuery ? 'Add Unit' : undefined}
        onEmptyAction={!searchQuery ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Unit Modal */}
      <UnitModal
        isOpen={isModalOpen}
        unit={editingUnit}
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
        title="Deactivate Unit?"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}" (${deactivateTarget?.symbol})?`}
        detail="This unit will no longer appear in active pathology unit lists. Existing diagnostic records and reference ranges will maintain historical integrity."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setDeactivateTarget(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
