import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Layers,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

import { pathologyCategoryService } from '../../services/pathologyCategoryService';
import type {
  PathologyTestCategoryDto,
  CreatePathologyTestCategoryRequest,
  UpdatePathologyTestCategoryRequest,
} from '../../types/pathologyCategory';
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
import { CategoryModal } from './components/CategoryModal';

export const TestCategoriesPage: React.FC = () => {
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [categories, setCategories] = useState<PathologyTestCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal (Create / Edit) state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<PathologyTestCategoryDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<PathologyTestCategoryDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await pathologyCategoryService.getAll();
      setCategories(data);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Client-side Search / Filtering ─────────────────────────────────────────

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.code.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // ─── Create Handler ─────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (dto: CreatePathologyTestCategoryRequest) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const created = await pathologyCategoryService.create(dto);
      toastSuccess(`Test category "${created.name}" created successfully.`);
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Edit Handler ───────────────────────────────────────────────────────────

  const handleOpenEditModal = (cat: PathologyTestCategoryDto) => {
    setEditingCategory(cat);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    id: number,
    dto: UpdatePathologyTestCategoryRequest
  ) => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      const updated = await pathologyCategoryService.update(id, dto);
      toastSuccess(`Test category "${updated.name}" updated successfully.`);
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      const normalized = handleError(err);
      setModalError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Deactivate Handler ─────────────────────────────────────────────────────

  const handleOpenDeactivateDialog = (cat: PathologyTestCategoryDto) => {
    setDeactivateTarget(cat);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;

    setIsDeactivating(true);
    try {
      await pathologyCategoryService.deactivate(deactivateTarget.id);
      toastSuccess(`Test category "${deactivateTarget.name}" deactivated successfully.`);
      setDeactivateTarget(null);
      await loadCategories();
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // ─── Table Column Definitions ───────────────────────────────────────────────

  const columns: ColumnDef<PathologyTestCategoryDto>[] = [
    {
      key: 'code',
      header: 'Category Code',
      width: '130px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md tracking-wider">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Category Name',
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
            aria-label={`Edit category ${row.name}`}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleOpenDeactivateDialog(row)}
            aria-label={`Deactivate category ${row.name}`}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery
    ? 'No categories match your search'
    : hasLoaded
    ? 'No pathology test categories registered'
    : 'No categories found';

  const emptyDescription = searchQuery
    ? `No test categories found matching "${searchQuery}". Try searching with a different name or code.`
    : 'Register your first test category (e.g., Hematology, Biochemistry) to organize diagnostic laboratory tests.';

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Page Header */}
      <PageHeader
        title="Pathology Test Categories"
        subtitle="Manage diagnostic test departments, clinical classifications, and lab divisions."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Test Categories' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5" />
              {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
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
            Add Category
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards & Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Active Categories Stat */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Categories</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{categories.length}</p>
          </div>
        </div>

        {/* Department Scope Info */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Master Scope</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Laboratory Diagnostic Divisions</p>
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
            placeholder="Search by category name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
            aria-label="Search test categories"
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
              Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> categories
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

      {/* Categories Table */}
      <Table
        columns={columns}
        data={filteredCategories}
        keyExtractor={(cat) => cat.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology test categories..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<FolderTree className="w-6 h-6" />}
        emptyActionLabel={!searchQuery ? 'Add Category' : undefined}
        onEmptyAction={!searchQuery ? handleOpenCreateModal : undefined}
        striped
      />

      {/* Create / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={editingCategory}
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
        title="Deactivate Test Category"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}" (${deactivateTarget?.code})?`}
        detail="The category will be removed from the active category list. Existing test records associated with this category will maintain historical integrity."
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
