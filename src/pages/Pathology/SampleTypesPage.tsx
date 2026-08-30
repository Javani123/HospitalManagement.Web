import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TestTube,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Pipette,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';

import { sampleTypeService } from '../../services/sampleTypeService';
import type {
  SampleTypeDto,
  CreateSampleTypeRequest,
  UpdateSampleTypeRequest,
} from '../../types/sampleType';
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
import { SampleTypeModal } from './components/SampleTypeModal';

export const SampleTypesPage: React.FC = () => {
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [sampleTypes, setSampleTypes] = useState<SampleTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSampleType, setEditingSampleType] = useState<SampleTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<SampleTypeDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadSampleTypes = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await sampleTypeService.getAll();
      setSampleTypes(data);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadSampleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredSampleTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sampleTypes;

    return sampleTypes.filter(
      (st) =>
        st.name.toLowerCase().includes(query) ||
        st.code.toLowerCase().includes(query) ||
        (st.description && st.description.toLowerCase().includes(query))
    );
  }, [sampleTypes, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingSampleType(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreateSampleTypeRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await sampleTypeService.create(dto);
      toastSuccess(`Sample type "${created.name}" created successfully.`);
      setIsModalOpen(false);
      await loadSampleTypes();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────────────────────────

  const handleOpenEditModal = (st: SampleTypeDto) => {
    setEditingSampleType(st);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdateSampleTypeRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await sampleTypeService.update(id, dto);
      toastSuccess(`Sample type "${updated.name}" updated successfully.`);
      setIsModalOpen(false);
      await loadSampleTypes();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Deactivate Handler ─────────────────────────────────────────────────────

  const handleOpenDeactivateDialog = (st: SampleTypeDto) => {
    setDeactivateTarget(st);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await sampleTypeService.deactivate(deactivateTarget.id);
      toastSuccess(`Sample type "${deactivateTarget.name}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadSampleTypes();
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<SampleTypeDto>[] = [
    {
      key: 'code',
      header: 'Sample Code',
      width: '130px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md tracking-wider">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Sample Type Name',
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
      header: 'Description & Guidelines',
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
            aria-label={`Edit sample type ${row.name}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenDeactivateDialog(row)}
            aria-label={`Deactivate sample type ${row.name}`}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery
    ? 'No matching sample types.'
    : hasLoaded
    ? 'No sample types found.'
    : 'No sample types found';

  const emptyDescription = searchQuery
    ? `No biological specimen types found matching "${searchQuery}". Try searching with a different name or code.`
    : 'Register your first biological specimen type (e.g., Whole Blood, Serum, Urine) to configure diagnostic tests.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Pathology Sample Types"
        subtitle="Configure biological specimen sample types (Blood, Serum, Urine, CSF, etc.)."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Sample Types' },
        ]}
        badge={
          <Badge variant="warning" size="sm">
            <span className="flex items-center gap-1">
              <TestTube className="w-3.5 h-3.5" />
              {sampleTypes.length} {sampleTypes.length === 1 ? 'Specimen' : 'Specimens'}
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
            Add Sample Type
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Sample Types Count */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Pipette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Sample Types</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{sampleTypes.length}</p>
          </div>
        </div>

        {/* Specimen Scope Info */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Specimen Scope</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Biological Specimen Registry</p>
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
            placeholder="Search by sample type name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
            aria-label="Search sample types"
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
              Showing <strong>{filteredSampleTypes.length}</strong> of <strong>{sampleTypes.length}</strong> sample types
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

      {/* Sample Types Table */}
      <Table
        columns={columns}
        data={filteredSampleTypes}
        keyExtractor={(st) => st.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology sample types..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<TestTube className="w-6 h-6" />}
        emptyActionLabel={!searchQuery ? 'Add Sample Type' : undefined}
        onEmptyAction={!searchQuery ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Sample Type Modal */}
      <SampleTypeModal
        isOpen={isModalOpen}
        sampleType={editingSampleType}
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
        title="Deactivate Sample Type?"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}" (${deactivateTarget?.code})?`}
        detail="This sample type will no longer appear in active lists. Existing diagnostic records will maintain historical integrity."
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
