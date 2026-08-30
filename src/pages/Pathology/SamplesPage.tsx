import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pipette,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  FlaskConical,
  Clock,
  Ban,
} from 'lucide-react';

import { pathologySampleService } from '../../services/pathologySampleService';
import type {
  PathologySampleDto,
  RejectSampleRequest,
} from '../../types/pathologySample';

import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { ColumnDef } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDateTime } from '../../utils/formatters';
import { RejectSampleModal } from './components/RejectSampleModal';

export const SamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [samples, setSamples] = useState<PathologySampleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Receive confirmation state
  const [receiveTarget, setReceiveTarget] = useState<PathologySampleDto | null>(null);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<PathologySampleDto | null>(null);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await pathologySampleService.getAll();
      setSamples(data);
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

  // ─── Filter Logic ───────────────────────────────────────────────────────────

  const filteredSamples = useMemo(() => {
    let result = samples;

    if (statusFilter !== 'all') {
      result = result.filter(
        (s) => s.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    return result.filter(
      (s) =>
        s.sampleNumber.toLowerCase().includes(q) ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.patientName.toLowerCase().includes(q) ||
        s.patientNumber.toLowerCase().includes(q) ||
        s.testName.toLowerCase().includes(q) ||
        s.testCode.toLowerCase().includes(q) ||
        s.sampleTypeName.toLowerCase().includes(q) ||
        (s.collectedBy && s.collectedBy.toLowerCase().includes(q)) ||
        (s.rejectionReason && s.rejectionReason.toLowerCase().includes(q))
    );
  }, [samples, statusFilter, searchQuery]);

  // Status counts
  const counts = useMemo(() => {
    const total = samples.length;
    const collected = samples.filter((s) => s.status === 'Collected').length;
    const received = samples.filter((s) => s.status === 'Received').length;
    const rejected = samples.filter((s) => s.status === 'Rejected').length;
    return { total, collected, received, rejected };
  }, [samples]);

  // ─── Receive Handler (Collected -> Received) ────────────────────────────────

  const handleOpenReceive = (s: PathologySampleDto) => {
    setReceiveTarget(s);
  };

  const handleConfirmReceive = async () => {
    if (!receiveTarget) return;
    setIsReceiving(true);
    try {
      const updated = await pathologySampleService.receive(receiveTarget.id);
      toastSuccess(`Sample ${updated.sampleNumber} marked as Received.`);
      setReceiveTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setReceiveTarget(null);
    } finally {
      setIsReceiving(false);
    }
  };

  // ─── Reject Handler (Collected / Received -> Rejected) ──────────────────────

  const handleOpenReject = (s: PathologySampleDto) => {
    setRejectTarget(s);
    setRejectError(null);
  };

  const handleSubmitReject = async (dto: RejectSampleRequest) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    setRejectError(null);
    try {
      const updated = await pathologySampleService.reject(rejectTarget.id, dto);
      toastSuccess(`Sample ${updated.sampleNumber} has been Rejected.`);
      setRejectTarget(null);
      await loadData();
    } catch (err) {
      const norm = handleError(err);
      setRejectError(norm.message);
    } finally {
      setIsRejecting(false);
    }
  };

  // ─── Columns Definition ─────────────────────────────────────────────────────

  const columns: ColumnDef<PathologySampleDto>[] = [
    {
      key: 'sampleNumber',
      header: 'Sample # / Accession',
      width: '150px',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/pathology/samples/${row.id}`)}
            className="font-mono text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 px-2 py-0.5 rounded-md tracking-wide transition-colors cursor-pointer"
            title="View Sample Details"
          >
            {row.sampleNumber}
          </button>
        </div>
      ),
    },
    {
      key: 'orderNumber',
      header: 'Order #',
      width: '130px',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/pathology/lab-orders/${row.pathologyLabOrderId}`)}
          className="font-mono text-xs font-semibold text-blue-700 hover:underline"
        >
          {row.orderNumber}
        </button>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.patientName}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {row.patientNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'test',
      header: 'Test & Specimen',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 text-sm block">
            {row.testName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              {row.testCode}
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full font-medium">
              {row.sampleTypeName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'collectedAt',
      header: 'Timestamps',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700">
            <span className="text-slate-400">Collected:</span> {formatDateTime(row.collectedAt)}
          </div>
          {row.receivedAt && (
            <div className="text-sky-700">
              <span className="text-slate-400">Received:</span> {formatDateTime(row.receivedAt)}
            </div>
          )}
          {row.rejectedAt && (
            <div className="text-rose-700">
              <span className="text-slate-400">Rejected:</span> {formatDateTime(row.rejectedAt)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      width: '120px',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: '_actions',
      header: 'Actions',
      align: 'right',
      width: '200px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Receive button (only when Collected) */}
          {row.status === 'Collected' && (
            <Button
              variant="outline"
              size="sm"
              className="text-sky-700 border-sky-200 hover:bg-sky-50"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleOpenReceive(row)}
            >
              Receive
            </Button>
          )}

          {/* Reject button (when Collected or Received) */}
          {(row.status === 'Collected' || row.status === 'Received') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
              onClick={() => handleOpenReject(row)}
            >
              Reject
            </Button>
          )}

          {/* View Details */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/pathology/samples/${row.id}`)}
            aria-label={`View sample ${row.sampleNumber}`}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery || statusFilter !== 'all'
    ? 'No samples match your search or filter.'
    : hasLoaded
    ? 'No collected samples found.'
    : 'No collected samples found.';

  const emptyDescription = searchQuery || statusFilter !== 'all'
    ? 'Try clearing the search query or selecting a different status filter.'
    : 'Specimens are accessioned directly from Lab Orders. Open any active Lab Order to collect samples.';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pathology Samples"
        subtitle="Manage specimen intake, accession numbering (SAM######), laboratory intake reception, and sample rejection auditing."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Samples' },
        ]}
        badge={
          <Badge variant="purple" size="sm">
            <span className="flex items-center gap-1">
              <Pipette className="w-3.5 h-3.5" />
              {samples.length} {samples.length === 1 ? 'Sample' : 'Samples'}
            </span>
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => void loadData()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        }
      />

      {/* Global Error Banner */}
      {error && !rejectTarget && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Samples */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Pipette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Accessions</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{counts.total}</p>
          </div>
        </div>

        {/* Collected */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Collected (In Transit)</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{counts.collected}</p>
          </div>
        </div>

        {/* Received */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Received in Lab</p>
            <p className="text-xl font-bold text-sky-700 mt-0.5">{counts.received}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rejected</p>
            <p className="text-xl font-bold text-rose-700 mt-0.5">{counts.rejected}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by SAM#, Order#, Patient, Test, Specimen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 focus:bg-white transition-colors"
              aria-label="Search pathology samples"
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

          {/* Status Filter */}
          <div className="sm:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 focus:bg-white transition-colors"
              aria-label="Filter by sample status"
            >
              <option value="all">All Statuses ({samples.length})</option>
              <option value="Collected">Collected ({counts.collected})</option>
              <option value="Received">Received ({counts.received})</option>
              <option value="Rejected">Rejected ({counts.rejected})</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredSamples.length}</strong> of <strong>{samples.length}</strong> samples
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Samples Table */}
      <Table
        columns={columns}
        data={filteredSamples}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        loadingMessage="Loading pathology samples..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<Pipette className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && statusFilter === 'all' ? 'Go to Lab Orders' : undefined}
        onEmptyAction={!searchQuery && statusFilter === 'all' ? () => navigate('/pathology/lab-orders') : undefined}
        striped
      />

      {/* Receive Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(receiveTarget)}
        title="Receive Specimen at Laboratory?"
        message={`Mark sample ${receiveTarget?.sampleNumber} (${receiveTarget?.testName}) as Received in the laboratory?`}
        detail="This confirms physical receipt and enables the sample for laboratory processing and result entry."
        confirmLabel="Confirm Receipt"
        confirmVariant="primary"
        isLoading={isReceiving}
        onConfirm={handleConfirmReceive}
        onCancel={() => !isReceiving && setReceiveTarget(null)}
      />

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectSampleModal
          isOpen={Boolean(rejectTarget)}
          sampleNumber={rejectTarget.sampleNumber}
          testName={rejectTarget.testName}
          isSubmitting={isRejecting}
          error={rejectError}
          onClose={() => setRejectTarget(null)}
          onSubmit={handleSubmitReject}
          onClearError={() => setRejectError(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
