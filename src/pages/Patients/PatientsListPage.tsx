import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, X, Users } from 'lucide-react';

import { patientService } from '../../services/patientService';
import type { PatientDto } from '../../types/patient';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGenderBadgeVariant(gender: string): 'info' | 'purple' | 'neutral' | 'success' {
  switch (gender) {
    case 'Male':
      return 'info';
    case 'Female':
      return 'purple';
    case 'Other':
      return 'success';
    default:
      return 'neutral';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PatientsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  // Deactivate dialog state
  const [deactivateTarget, setDeactivateTarget] = useState<PatientDto | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // ─── Data loading ───────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    clearError();
    setIsLoading(true);
    setIsSearchMode(false);
    setActiveQuery('');
    try {
      const data = await patientService.getAll();
      setPatients(data);
      setHasLoaded(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  // Load on first render
  useEffect(() => {
    void loadAll();
  // loadAll is stable (useCallback with stable deps), so this is safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async () => {
    const query = searchInput.trim();
    if (!query) {
      loadAll();
      return;
    }
    clearError();
    setIsLoading(true);
    setIsSearchMode(true);
    setActiveQuery(query);
    try {
      const data = await patientService.search(query);
      setPatients(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchInput, loadAll, clearError, handleError]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    loadAll();
  }, [loadAll]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ─── Deactivate ─────────────────────────────────────────────────────────────

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      await patientService.deactivate(deactivateTarget.id);
      toastSuccess(`Patient ${deactivateTarget.patientNumber} deactivated successfully.`);
      setDeactivateTarget(null);
      // Refresh — re-fetch from API rather than guessing state
      if (isSearchMode && activeQuery) {
        const data = await patientService.search(activeQuery);
        setPatients(data);
      } else {
        const data = await patientService.getAll();
        setPatients(data);
      }
    } catch (err) {
      handleError(err);
      setDeactivateTarget(null);
    } finally {
      setIsDeactivating(false);
    }
  }, [deactivateTarget, toastSuccess, handleError, isSearchMode, activeQuery]);

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: ColumnDef<PatientDto>[] = [
    {
      key: 'patientNumber',
      header: 'Patient No.',
      width: '110px',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {row.patientNumber}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Patient Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{row.fullName}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      align: 'center',
      render: (row) => (
        <Badge variant={getGenderBadgeVariant(row.gender)} size="sm">
          {row.gender}
        </Badge>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      align: 'center',
      render: (row) => (
        <span className="text-slate-700">
          {row.age != null ? `${row.age} yrs` : '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => (
        <span className="text-slate-600 text-sm">{row.phone || '—'}</span>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      align: 'center',
      render: (row) => (
        row.bloodGroup ? (
          <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-xs">
            {row.bloodGroup}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      ),
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      render: (row) => (
        <span className="text-slate-600 text-sm">{formatDate(row.dateOfBirth) || '—'}</span>
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
      key: '_actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.id}`); }}
            aria-label={`View patient ${row.patientNumber}`}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/patients/${row.id}/edit`); }}
            aria-label={`Edit patient ${row.patientNumber}`}
          >
            Edit
          </Button>
          {row.isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={(e) => { e.stopPropagation(); setDeactivateTarget(row); }}
              aria-label={`Deactivate patient ${row.patientNumber}`}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ─── Empty state text ────────────────────────────────────────────────────────

  const emptyTitle = isSearchMode
    ? 'No patients match your search'
    : hasLoaded
    ? 'No patients registered yet'
    : 'No patients found';

  const emptyDescription = isSearchMode
    ? `No results found for "${activeQuery}". Try a different patient number, name, or phone number.`
    : 'Register your first patient to get started.';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Management"
        subtitle="Register, search, and manage patient records across the hospital."
        breadcrumbs={[{ label: 'Patients' }]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => navigate('/patients/new')}
          >
            Register Patient
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="patient-search-input"
              type="text"
              placeholder="Search by patient number, name, or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-colors"
              aria-label="Search patients"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Search className="w-4 h-4" />}
            onClick={handleSearch}
            isLoading={isLoading && isSearchMode}
            disabled={isLoading}
          >
            Search
          </Button>
          {isSearchMode && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          )}
        </div>
        {isSearchMode && activeQuery && !isLoading && (
          <p className="mt-2 text-xs text-slate-500">
            Showing results for <span className="font-semibold text-slate-700">"{activeQuery}"</span>
            {' — '}{patients.length} patient{patients.length !== 1 ? 's' : ''} found.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Patient Table */}
      <Table
        columns={columns}
        data={patients}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        loadingMessage="Loading patients..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Users className="w-6 h-6" />}
        emptyActionLabel={!isSearchMode ? 'Register Patient' : undefined}
        onEmptyAction={!isSearchMode ? () => navigate('/patients/new') : undefined}
        onRowClick={(p) => navigate(`/patients/${p.id}`)}
        striped
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        icon="warning"
        title="Deactivate Patient"
        message={`Are you sure you want to deactivate ${deactivateTarget?.fullName ?? 'this patient'} (${deactivateTarget?.patientNumber ?? ''})?`}
        detail="The patient will no longer appear in the active patient list. Their clinical records are preserved and they can be reactivated from their profile page."
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
