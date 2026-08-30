import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Search,
  X,
  Play,
  Edit3,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import { pathologyResultService } from '../../services/pathologyResultService';
import type {
  PathologyResultDto,
  EnterResultRequest,
  VerifyResultRequest,
} from '../../types/pathologyResult';

import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { ColumnDef } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ResultFlagBadge } from '../../components/common/ResultFlagBadge';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDateTime } from '../../utils/formatters';

import { EnterResultModal } from './components/EnterResultModal';
import { VerifyResultModal } from './components/VerifyResultModal';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, dismiss } = useToast();

  // Data state
  const [results, setResults] = useState<PathologyResultDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  // Modal / Dialog states
  const [enterTarget, setEnterTarget] = useState<PathologyResultDto | null>(null);
  const [isEntering, setIsEntering] = useState<boolean>(false);
  const [enterError, setEnterError] = useState<string | null>(null);

  const [verifyTarget, setVerifyTarget] = useState<PathologyResultDto | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [processTarget, setProcessTarget] = useState<PathologyResultDto | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [releaseTarget, setReleaseTarget] = useState<PathologyResultDto | null>(null);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    clearError();
    setIsLoading(true);
    try {
      const data = await pathologyResultService.getAll();
      setResults(data);
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

  const filteredResults = useMemo(() => {
    let list = results;

    if (statusFilter !== 'all') {
      list = list.filter(
        (r) => r.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (flagFilter !== 'all') {
      list = list.filter(
        (r) => r.resultFlag.toLowerCase() === flagFilter.toLowerCase()
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (r) =>
        r.orderNumber.toLowerCase().includes(q) ||
        r.sampleNumber.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        r.patientNumber.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.testCode.toLowerCase().includes(q) ||
        (r.resultValue && r.resultValue.toLowerCase().includes(q)) ||
        (r.enteredBy && r.enteredBy.toLowerCase().includes(q)) ||
        (r.verifiedBy && r.verifiedBy.toLowerCase().includes(q))
    );
  }, [results, statusFilter, flagFilter, searchQuery]);

  // Operational metrics
  const counts = useMemo(() => {
    const total = results.length;
    const pending = results.filter((r) => r.status === 'Pending').length;
    const processing = results.filter((r) => r.status === 'Processing').length;
    const entered = results.filter((r) => r.status === 'ResultEntered').length;
    const verified = results.filter((r) => r.status === 'Verified').length;
    const released = results.filter((r) => r.status === 'Released').length;
    return { total, pending, processing, entered, verified, released };
  }, [results]);

  // ─── Process Action (Pending -> Processing) ─────────────────────────────────

  const handleConfirmProcess = async () => {
    if (!processTarget) return;
    setIsProcessing(true);
    try {
      const updated = await pathologyResultService.startProcessing(processTarget.id);
      toastSuccess(`Result for sample ${updated.sampleNumber} moved to Processing.`);
      setProcessTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setProcessTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Enter Result Action ────────────────────────────────────────────────────

  const handleOpenEnterModal = (r: PathologyResultDto) => {
    setEnterTarget(r);
    setEnterError(null);
  };

  const handleSubmitEnterResult = async (resId: number, dto: EnterResultRequest) => {
    setIsEntering(true);
    setEnterError(null);
    try {
      const updated = await pathologyResultService.enterResult(resId, dto);
      toastSuccess(
        `Result values for ${updated.testName} saved (Evaluated: ${updated.resultFlag}).`
      );
      setEnterTarget(null);
      await loadData();
    } catch (err) {
      const norm = handleError(err);
      setEnterError(norm.message);
    } finally {
      setIsEntering(false);
    }
  };

  // ─── Verify Action ──────────────────────────────────────────────────────────

  const handleOpenVerifyModal = (r: PathologyResultDto) => {
    setVerifyTarget(r);
    setVerifyError(null);
  };

  const handleSubmitVerify = async (resId: number, dto: VerifyResultRequest) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const updated = await pathologyResultService.verify(resId, dto);
      toastSuccess(`Result for ${updated.testName} verified by ${updated.verifiedBy}.`);
      setVerifyTarget(null);
      await loadData();
    } catch (err) {
      const norm = handleError(err);
      setVerifyError(norm.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Release Action ─────────────────────────────────────────────────────────

  const handleConfirmRelease = async () => {
    if (!releaseTarget) return;
    setIsReleasing(true);
    try {
      const updated = await pathologyResultService.release(releaseTarget.id);
      toastSuccess(`Result for ${updated.testName} released for reporting.`);
      setReleaseTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setReleaseTarget(null);
    } finally {
      setIsReleasing(false);
    }
  };

  // ─── Table Columns ──────────────────────────────────────────────────────────

  const columns: ColumnDef<PathologyResultDto>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      width: '120px',
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
      key: 'sampleNumber',
      header: 'Sample #',
      width: '130px',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/pathology/samples/${row.pathologySampleId}`)}
          className="font-mono text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 px-2 py-0.5 rounded tracking-wide transition-colors cursor-pointer"
        >
          {row.sampleNumber}
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
      header: 'Diagnostic Test',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900 text-sm block">
            {row.testName}
          </span>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {row.testCode}
          </span>
        </div>
      ),
    },
    {
      key: 'resultValue',
      header: 'Result Measurement',
      render: (row) => (
        <div>
          {row.resultValue ? (
            <div className="font-mono font-bold text-sm text-slate-900">
              {row.resultValue} {row.unit}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Not entered</span>
          )}
          {row.referenceRange && (
            <span className="text-[11px] text-slate-500 font-mono block">
              Ref: {row.referenceRange}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'resultFlag',
      header: 'Flag (M12)',
      align: 'center',
      width: '130px',
      render: (row) => <ResultFlagBadge flag={row.resultFlag} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      width: '120px',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'enteredAt',
      header: 'Entered At',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.enteredAt ? formatDateTime(row.enteredAt) : '—'}
        </span>
      ),
    },
    {
      key: '_actions',
      header: 'Actions',
      align: 'right',
      width: '190px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Pending -> Process */}
          {row.status === 'Pending' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={() => setProcessTarget(row)}
              title="Start Processing"
            >
              Process
            </Button>
          )}

          {/* Processing -> Enter */}
          {row.status === 'Processing' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FlaskConical className="w-3.5 h-3.5" />}
              onClick={() => handleOpenEnterModal(row)}
              title="Enter Result"
            >
              Enter
            </Button>
          )}

          {/* ResultEntered -> Edit & Verify */}
          {row.status === 'ResultEntered' && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEnterModal(row)}
                title="Edit Result"
              >
                Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => handleOpenVerifyModal(row)}
                title="Verify Result"
              >
                Verify
              </Button>
            </>
          )}

          {/* Verified -> Release */}
          {row.status === 'Verified' && (
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => setReleaseTarget(row)}
              title="Release Result"
            >
              Release
            </Button>
          )}

          {/* View Details */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/pathology/results/${row.id}`)}
            aria-label={`View result details for ${row.testName}`}
            title="View Details"
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const emptyTitle = searchQuery || statusFilter !== 'all' || flagFilter !== 'all'
    ? 'No results match your search or filter.'
    : hasLoaded
    ? 'No pathology results found.'
    : 'No pathology results found.';

  const emptyDescription = searchQuery || statusFilter !== 'all' || flagFilter !== 'all'
    ? 'Try clearing the search query or selecting different status/flag filters.'
    : 'Results are initiated when laboratory specimens are marked as Received. Open Samples or Lab Orders to begin processing.';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pathology Results"
        subtitle="Manage diagnostic result entry, automated reference range evaluation (M12), supervisor verification, and report release."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Results' },
        ]}
        badge={
          <Badge variant="purple" size="sm">
            <span className="flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              {results.length} {results.length === 1 ? 'Result' : 'Results'}
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

      {/* Global Error Alert */}
      {error && !enterTarget && !verifyTarget && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pending */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Processing</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">{counts.pending}</p>
          </div>
        </div>

        {/* Processing */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">In Processing</p>
            <p className="text-xl font-bold text-blue-700 mt-0.5">{counts.processing}</p>
          </div>
        </div>

        {/* Result Entered */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Result Entered</p>
            <p className="text-xl font-bold text-indigo-700 mt-0.5">{counts.entered}</p>
          </div>
        </div>

        {/* Verified */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Verified</p>
            <p className="text-xl font-bold text-teal-700 mt-0.5">{counts.verified}</p>
          </div>
        </div>

        {/* Released */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Released</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{counts.released}</p>
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
              placeholder="Search by Order#, Sample#, Patient, Test, Value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-colors"
              aria-label="Search diagnostic results"
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
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-colors"
              aria-label="Filter by lifecycle status"
            >
              <option value="all">All Statuses ({results.length})</option>
              <option value="Pending">Pending ({counts.pending})</option>
              <option value="Processing">Processing ({counts.processing})</option>
              <option value="ResultEntered">Result Entered ({counts.entered})</option>
              <option value="Verified">Verified ({counts.verified})</option>
              <option value="Released">Released ({counts.released})</option>
            </select>
          </div>

          {/* Flag Filter */}
          <div className="sm:w-44">
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-colors"
              aria-label="Filter by result flag"
            >
              <option value="all">All Flags</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="NotEvaluated">Not Evaluated</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all' || flagFilter !== 'all') && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredResults.length}</strong> of <strong>{results.length}</strong> results
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setFlagFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <Table
        columns={columns}
        data={filteredResults}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        loadingMessage="Loading diagnostic results..."
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={<FlaskConical className="w-6 h-6" />}
        emptyActionLabel={!searchQuery && statusFilter === 'all' && flagFilter === 'all' ? 'View Samples Queue' : undefined}
        onEmptyAction={!searchQuery && statusFilter === 'all' && flagFilter === 'all' ? () => navigate('/pathology/samples') : undefined}
        striped
      />

      {/* Enter Result Modal */}
      {enterTarget && (
        <EnterResultModal
          isOpen={Boolean(enterTarget)}
          result={enterTarget}
          isSubmitting={isEntering}
          error={enterError}
          onClose={() => setEnterTarget(null)}
          onSubmit={handleSubmitEnterResult}
          onClearError={() => setEnterError(null)}
        />
      )}

      {/* Verify Result Modal */}
      {verifyTarget && (
        <VerifyResultModal
          isOpen={Boolean(verifyTarget)}
          result={verifyTarget}
          isSubmitting={isVerifying}
          error={verifyError}
          onClose={() => setVerifyTarget(null)}
          onSubmit={handleSubmitVerify}
          onClearError={() => setVerifyError(null)}
        />
      )}

      {/* Process Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(processTarget)}
        title="Start Result Processing?"
        message={`Move result for sample ${processTarget?.sampleNumber} (${processTarget?.testName}) to Processing?`}
        detail="This confirms that the specimen has been loaded onto an analytical bench or workstation."
        confirmLabel="Start Processing"
        confirmVariant="primary"
        isLoading={isProcessing}
        onConfirm={handleConfirmProcess}
        onCancel={() => !isProcessing && setProcessTarget(null)}
      />

      {/* Release Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(releaseTarget)}
        title="Release Diagnostic Result?"
        message={`Release verified result for sample ${releaseTarget?.sampleNumber} (${releaseTarget?.testName})?`}
        detail="Releasing makes the result immutable and immediately available for final lab report compilation (M13)."
        confirmLabel="Confirm Release"
        confirmVariant="primary"
        isLoading={isReleasing}
        onConfirm={handleConfirmRelease}
        onCancel={() => !isReleasing && setReleaseTarget(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
