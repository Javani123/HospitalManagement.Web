import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Microscope,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  FolderTree,
} from 'lucide-react';

import { pathologyTestService } from '../../services/pathologyTestService';
import { pathologyCategoryService } from '../../services/pathologyCategoryService';
import { sampleTypeService } from '../../services/sampleTypeService';
import { pathologyUnitService } from '../../services/pathologyUnitService';

import type {
  PathologyTestDto,
  CreatePathologyTestRequest,
  UpdatePathologyTestRequest,
} from '../../types/pathologyTest';
import type { PathologyTestCategoryDto } from '../../types/pathologyCategory';
import type { SampleTypeDto } from '../../types/sampleType';
import type { PathologyUnitDto } from '../../types/pathologyUnit';

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
import { formatCurrency } from '../../utils/formatters';
import { TestModal } from './components/TestModal';

export const TestsPage: React.FC = () => {
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [tests, setTests] = useState<PathologyTestDto[]>([]);
  const [categories, setCategories] = useState<PathologyTestCategoryDto[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleTypeDto[]>([]);
  const [units, setUnits] = useState<PathologyUnitDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTest, setEditingTest] = useState<PathologyTestDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<PathologyTestDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const [testsData, categoriesData, sampleTypesData, unitsData] = await Promise.all([
        pathologyTestService.getAll(),
        pathologyCategoryService.getAll(),
        sampleTypeService.getAll(),
        pathologyUnitService.getAll(),
      ]);

      setTests(testsData);
      setCategories(categoriesData);
      setSampleTypes(sampleTypesData);
      setUnits(unitsData);
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

  const filteredTests = useMemo(() => {
    let result = tests;

    if (selectedCategoryFilter !== 'all') {
      const catId = Number(selectedCategoryFilter);
      result = result.filter((t) => t.category.id === catId);
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return result;

    return result.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query) ||
        (t.shortName && t.shortName.toLowerCase().includes(query)) ||
        t.category.name.toLowerCase().includes(query) ||
        t.sampleType.name.toLowerCase().includes(query) ||
        (t.unit && t.unit.symbol.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }, [tests, selectedCategoryFilter, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingTest(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreatePathologyTestRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await pathologyTestService.create(dto);
      toastSuccess(`Diagnostic test "${created.name}" (${created.code}) created successfully.`);
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

  const handleOpenEditModal = (t: PathologyTestDto) => {
    setEditingTest(t);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdatePathologyTestRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await pathologyTestService.update(id, dto);
      toastSuccess(`Diagnostic test "${updated.name}" updated successfully.`);
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

  const handleOpenDeactivateDialog = (t: PathologyTestDto) => {
    setDeactivateTarget(t);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await pathologyTestService.deactivate(deactivateTarget.id);
      toastSuccess(`Diagnostic test "${deactivateTarget.name}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<PathologyTestDto>[] = [
    {
      key: 'code',
      header: 'Test Code',
      width: '120px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md tracking-wider">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Test Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.name}
          </span>
          {row.shortName && (
            <span className="text-[11px] text-slate-500 font-medium">
              Abbr: <code className="font-mono text-slate-700">{row.shortName}</code>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
          {row.category.name}
        </span>
      ),
    },
    {
      key: 'sampleType',
      header: 'Specimen',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
          {row.sampleType.name}
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (row) => (
        row.unit ? (
          <span className="font-semibold text-xs text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md">
            {row.unit.symbol}
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">Qualitative</span>
        )
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      width: '110px',
      render: (row) => (
        <span className="font-semibold text-slate-900 text-sm">
          {formatCurrency(row.price)}
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
            aria-label={`Edit test ${row.name}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenDeactivateDialog(row)}
            aria-label={`Deactivate test ${row.name}`}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery || selectedCategoryFilter !== 'all'
    ? 'No tests match your search or filter.'
    : hasLoaded
    ? 'No pathology tests found.'
    : 'No pathology tests found.';

  const emptyDescription = searchQuery || selectedCategoryFilter !== 'all'
    ? 'Try clearing the search query or selecting a different category filter.'
    : 'Register your first diagnostic laboratory test (e.g., Complete Blood Count, Fasting Blood Glucose) to begin.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Pathology Tests"
        subtitle="Configure diagnostic laboratory tests, specimen requirements, reporting units, and test pricing."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Tests' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Microscope className="w-3.5 h-3.5" />
              {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
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
            Add Test
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Tests Count */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Diagnostic Tests</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{tests.length}</p>
          </div>
        </div>

        {/* Categories Covered */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Departments Covered</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              {categories.length} Diagnostic Categories
            </p>
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by test name, code, category, specimen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Search diagnostic tests"
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

          {/* Category Filter Dropdown */}
          <div className="sm:w-56">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Filter by category"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || selectedCategoryFilter !== 'all') && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredTests.length}</strong> of <strong>{tests.length}</strong> tests
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Tests Table */}
      <Table
        columns={columns}
        data={filteredTests}
        keyExtractor={(t) => t.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology diagnostic tests..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Microscope className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && selectedCategoryFilter === 'all' ? 'Add Test' : undefined}
        onEmptyAction={!searchQuery && selectedCategoryFilter === 'all' ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Test Modal */}
      <TestModal
        isOpen={isModalOpen}
        test={editingTest}
        categories={categories}
        sampleTypes={sampleTypes}
        units={units}
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
        title="Deactivate Diagnostic Test?"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}" (${deactivateTarget?.code})?`}
        detail="This test will no longer appear in active diagnostic ordering menus. Existing orders and reference ranges will maintain historical integrity."
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
