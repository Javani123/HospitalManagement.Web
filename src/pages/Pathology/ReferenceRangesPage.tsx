import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Layers,
  FileCheck2,
} from 'lucide-react';

import { pathologyReferenceRangeService } from '../../services/pathologyReferenceRangeService';
import { pathologyTestService } from '../../services/pathologyTestService';

import type {
  PathologyReferenceRangeDto,
  CreatePathologyReferenceRangeRequest,
  UpdatePathologyReferenceRangeRequest,
} from '../../types/pathologyReferenceRange';
import type { PathologyTestDto } from '../../types/pathologyTest';

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
import { ReferenceRangeModal } from './components/ReferenceRangeModal';

export const ReferenceRangesPage: React.FC = () => {
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [ranges, setRanges] = useState<PathologyReferenceRangeDto[]>([]);
  const [tests, setTests] = useState<PathologyTestDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRange, setEditingRange] = useState<PathologyReferenceRangeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<PathologyReferenceRangeDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [rangesData, testsData] = await Promise.all([
        pathologyReferenceRangeService.getAll(),
        pathologyTestService.getAll(),
      ]);

      setRanges(rangesData);
      setTests(testsData);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredRanges = useMemo(() => {
    let result = ranges;

    if (selectedTestFilter !== 'all') {
      const testId = Number(selectedTestFilter);
      result = result.filter((r) => r.pathologyTestId === testId);
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return result;

    return result.filter(
      (r) =>
        r.testName.toLowerCase().includes(query) ||
        r.testCode.toLowerCase().includes(query) ||
        r.gender.toLowerCase().includes(query) ||
        (r.textValue && r.textValue.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        (r.lowValue != null && String(r.lowValue).includes(query)) ||
        (r.highValue != null && String(r.highValue).includes(query))
    );
  }, [ranges, selectedTestFilter, searchQuery]);

  // Unique tests covered count
  const testsCoveredCount = useMemo(() => {
    const set = new Set(ranges.map((r) => r.pathologyTestId));
    return set.size;
  }, [ranges]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingRange(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (
    dto: CreatePathologyReferenceRangeRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await pathologyReferenceRangeService.create(dto);
      toastSuccess(`Reference range for "${created.testName}" created successfully.`);
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

  const handleOpenEditModal = (r: PathologyReferenceRangeDto) => {
    setEditingRange(r);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdatePathologyReferenceRangeRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await pathologyReferenceRangeService.update(id, dto);
      toastSuccess(`Reference range for "${updated.testName}" updated successfully.`);
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

  const handleOpenDeactivateDialog = (r: PathologyReferenceRangeDto) => {
    setDeactivateTarget(r);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await pathologyReferenceRangeService.deactivate(deactivateTarget.id);
      toastSuccess(`Reference range for "${deactivateTarget.testName}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Gender Badge Helper ───────────────────────────────────────────────────

  const getGenderBadge = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return <Badge variant="info" size="sm">Male</Badge>;
      case 'female':
        return <Badge variant="purple" size="sm">Female</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Any Gender</Badge>;
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<PathologyReferenceRangeDto>[] = [
    {
      key: 'testName',
      header: 'Diagnostic Test',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.testName}
          </span>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 inline-block mt-0.5">
            {row.testCode}
          </span>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      align: 'center',
      width: '120px',
      render: (row) => getGenderBadge(row.gender),
    },
    {
      key: 'minAge',
      header: 'Age Bracket',
      render: (row) => {
        if (row.minAge == null && row.maxAge == null) {
          return <span className="text-slate-500 text-xs">All Ages</span>;
        }
        if (row.minAge != null && row.maxAge != null) {
          return (
            <span className="text-slate-900 font-medium text-xs">
              {row.minAge} – {row.maxAge} {row.ageUnit}
            </span>
          );
        }
        if (row.minAge != null) {
          return (
            <span className="text-slate-900 font-medium text-xs">
              ≥ {row.minAge} {row.ageUnit}
            </span>
          );
        }
        return (
          <span className="text-slate-900 font-medium text-xs">
            ≤ {row.maxAge} {row.ageUnit}
          </span>
        );
      },
    },
    {
      key: 'lowValue',
      header: 'Normal Reference Range',
      render: (row) => {
        if (row.lowValue != null && row.highValue != null) {
          return (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs font-mono">
              {row.lowValue} – {row.highValue}
            </span>
          );
        }
        if (row.textValue) {
          return (
            <span className="inline-flex items-center gap-1 font-medium text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs">
              "{row.textValue}"
            </span>
          );
        }
        return <span className="text-slate-400 text-xs">—</span>;
      },
    },
    {
      key: 'description',
      header: 'Interpretation Notes',
      render: (row) => (
        <span className="text-slate-600 text-xs line-clamp-2 max-w-xs">
          {row.description || <span className="text-slate-400 italic">No notes</span>}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      width: '100px',
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
            aria-label={`Edit reference range for ${row.testName}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenDeactivateDialog(row)}
            aria-label={`Deactivate reference range for ${row.testName}`}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery || selectedTestFilter !== 'all'
    ? 'No reference ranges match your search or filter.'
    : hasLoaded
    ? 'No pathology reference ranges found.'
    : 'No pathology reference ranges found.';

  const emptyDescription = searchQuery || selectedTestFilter !== 'all'
    ? 'Try clearing the search query or selecting a different test filter.'
    : 'Configure normal reference ranges (age, gender, low/high values) consumed by automated diagnostic report evaluation (M12).';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Pathology Reference Ranges"
        subtitle="Configure normal diagnostic ranges, age brackets, gender criteria, and critical bounds consumed by M12 Result Evaluation."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Reference Ranges' },
        ]}
        badge={
          <Badge variant="purple" size="sm">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {ranges.length} {ranges.length === 1 ? 'Range' : 'Ranges'}
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
            Add Reference Range
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Ranges Count */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Reference Ranges</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{ranges.length}</p>
          </div>
        </div>

        {/* Tests Covered */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tests Covered</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {testsCoveredCount} of {tests.length}
            </p>
          </div>
        </div>

        {/* M12 Integration Status */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">M12 Integration</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Automatic Result Evaluation</p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by test, gender, bounds, text finding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Search reference ranges"
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

          {/* Test Filter Dropdown */}
          <div className="sm:w-64">
            <select
              value={selectedTestFilter}
              onChange={(e) => setSelectedTestFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Filter by diagnostic test"
            >
              <option value="all">All Tests ({tests.length})</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || selectedTestFilter !== 'all') && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredRanges.length}</strong> of <strong>{ranges.length}</strong> ranges
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedTestFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Reference Ranges Table */}
      <Table
        columns={columns}
        data={filteredRanges}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology reference ranges..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<SlidersHorizontal className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && selectedTestFilter === 'all' ? 'Add Reference Range' : undefined}
        onEmptyAction={!searchQuery && selectedTestFilter === 'all' ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Reference Range Modal */}
      <ReferenceRangeModal
        isOpen={isModalOpen}
        referenceRange={editingRange}
        tests={tests}
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
        title="Deactivate Reference Range?"
        message={`Are you sure you want to deactivate the reference range for "${deactivateTarget?.testName}" (${deactivateTarget?.gender})?`}
        detail="This reference range will no longer be used for automated diagnostic result evaluation (M12). Existing finalized reports will maintain historical integrity."
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
