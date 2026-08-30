import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  FlaskConical,
  Play,
  ShieldCheck,
  Send,
  Edit3,
  RefreshCw,
  FileCheck2,
  Lock,
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
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ResultFlagBadge } from '../../components/common/ResultFlagBadge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDateTime } from '../../utils/formatters';

import { EnterResultModal } from './components/EnterResultModal';
import { VerifyResultModal } from './components/VerifyResultModal';

const Field = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div>
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-900">
      {children || value || '—'}
    </dd>
  </div>
);

export const PathologyResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { error, clearError, handleError } = useApiError();
  const { toasts, dismiss, success: toastSuccess } = useToast();

  const [result, setResult] = useState<PathologyResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Dialog states
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [enterError, setEnterError] = useState<string | null>(null);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const loadResult = useCallback(async () => {
    if (!id || !Number.isInteger(Number(id))) return;
    clearError();
    setIsLoading(true);
    try {
      const data = await pathologyResultService.getById(Number(id));
      setResult(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id, clearError, handleError]);

  useEffect(() => {
    void loadResult();
  }, [loadResult]);

  // ─── Process Action (Pending -> Processing) ─────────────────────────────────

  const handleConfirmProcess = async () => {
    if (!result) return;
    setIsProcessing(true);
    try {
      const updated = await pathologyResultService.startProcessing(result.id);
      setResult(updated);
      toastSuccess(`Result moved to Processing status.`);
      setIsProcessDialogOpen(false);
    } catch (err) {
      handleError(err);
      setIsProcessDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Enter / Edit Result Action ─────────────────────────────────────────────

  const handleSubmitEnterResult = async (resId: number, dto: EnterResultRequest) => {
    setIsEntering(true);
    setEnterError(null);
    try {
      const updated = await pathologyResultService.enterResult(resId, dto);
      setResult(updated);
      toastSuccess(`Diagnostic result values saved and evaluated successfully.`);
      setIsEnterModalOpen(false);
    } catch (err) {
      const norm = handleError(err);
      setEnterError(norm.message);
    } finally {
      setIsEntering(false);
    }
  };

  // ─── Re-evaluate Result Action ──────────────────────────────────────────────

  const handleConfirmEvaluate = async () => {
    if (!result) return;
    setIsEvaluating(true);
    try {
      const updated = await pathologyResultService.evaluate(result.id);
      setResult(updated);
      toastSuccess(`Result re-evaluated: Flag is ${updated.resultFlag}.`);
      setIsEvaluateDialogOpen(false);
    } catch (err) {
      handleError(err);
      setIsEvaluateDialogOpen(false);
    } finally {
      setIsEvaluating(false);
    }
  };

  // ─── Verify Action (ResultEntered -> Verified) ──────────────────────────────

  const handleSubmitVerify = async (resId: number, dto: VerifyResultRequest) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const updated = await pathologyResultService.verify(resId, dto);
      setResult(updated);
      toastSuccess(`Result verified by ${updated.verifiedBy}.`);
      setIsVerifyModalOpen(false);
    } catch (err) {
      const norm = handleError(err);
      setVerifyError(norm.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Release Action (Verified -> Released) ──────────────────────────────────

  const handleConfirmRelease = async () => {
    if (!result) return;
    setIsReleasing(true);
    try {
      const updated = await pathologyResultService.release(result.id);
      setResult(updated);
      toastSuccess(`Result released for reporting.`);
      setIsReleaseDialogOpen(false);
    } catch (err) {
      handleError(err);
      setIsReleaseDialogOpen(false);
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Diagnostic Result Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Results', path: '/pathology/results' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingState message="Loading diagnostic result..." />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Diagnostic Result Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Results', path: '/pathology/results' },
            { label: 'Not Found' },
          ]}
        />
        {error && <ErrorAlert error={error} onDismiss={clearError} />}
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => navigate('/pathology/results')}
        >
          Back to Results
        </Button>
      </div>
    );
  }

  const isReleased = result.status === 'Released';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Result for ${result.testName}`}
        subtitle={`Sample Accession ${result.sampleNumber} · Order ${result.orderNumber}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Results', path: '/pathology/results' },
          { label: result.sampleNumber },
        ]}
        badge={<StatusBadge status={result.status} size="md" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => navigate('/pathology/results')}
            >
              Back to Queue
            </Button>

            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => void loadResult()}
              disabled={isLoading}
            >
              Refresh
            </Button>

            {/* Pending -> Start Processing */}
            {result.status === 'Pending' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Play className="w-4 h-4" />}
                onClick={() => setIsProcessDialogOpen(true)}
              >
                Start Processing
              </Button>
            )}

            {/* Processing -> Enter Result */}
            {result.status === 'Processing' && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<FlaskConical className="w-4 h-4" />}
                onClick={() => {
                  setEnterError(null);
                  setIsEnterModalOpen(true);
                }}
              >
                Enter Result
              </Button>
            )}

            {/* ResultEntered -> Edit Result, Evaluate, Verify */}
            {result.status === 'ResultEntered' && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                  onClick={() => {
                    setEnterError(null);
                    setIsEnterModalOpen(true);
                  }}
                >
                  Edit Result
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<FileCheck2 className="w-4 h-4" />}
                  onClick={() => setIsEvaluateDialogOpen(true)}
                >
                  Re-evaluate
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  onClick={() => {
                    setVerifyError(null);
                    setIsVerifyModalOpen(true);
                  }}
                >
                  Verify Result
                </Button>
              </>
            )}

            {/* Verified -> Release */}
            {result.status === 'Verified' && (
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => setIsReleaseDialogOpen(true)}
              >
                Release Result
              </Button>
            )}

            {/* Released -> View Final Report */}
            {result.status === 'Released' && (
              <Button
                variant="primary"
                size="md"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                onClick={() => navigate(`/pathology/reports/${result.pathologyLabOrderId}`)}
              >
                View Final Lab Report
              </Button>
            )}
          </div>
        }
      />

      {/* Global Error Banner */}
      {error && !isEnterModalOpen && !isVerifyModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Released Read-Only Banner */}
      {isReleased && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">
              Result Released — Finalized Medical Record
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              This result has been formally released and locked for diagnostic report inclusion (M13). Historical preservation rules apply.
            </p>
          </div>
        </div>
      )}

      {/* Diagnostic Result Measurement Card */}
      <Card
        title="Diagnostic Measurement & Reference Range Flag"
        subtitle="Automatic M12 reference range evaluation against demographic criteria"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          {/* Result Value */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Reported Value
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {result.resultValue || <span className="text-slate-400 font-normal italic">Not Entered</span>}
              </span>
              {result.unit && (
                <span className="text-sm font-bold text-slate-600">{result.unit}</span>
              )}
            </div>
          </div>

          {/* Reference Range Flag */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Reference Range Flag
            </span>
            <div className="mt-2">
              <ResultFlagBadge flag={result.resultFlag} size="md" />
            </div>
          </div>

          {/* Reference Range */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Applicable Reference Range
            </span>
            <span className="mt-2 block font-semibold text-slate-800 text-sm font-mono">
              {result.referenceRange || <span className="text-slate-400 font-normal italic">None configured</span>}
            </span>
          </div>

          {/* Interpretation */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Interpretation
            </span>
            <span className="mt-2 block font-medium text-slate-800 text-sm">
              {result.interpretation || <span className="text-slate-400 italic">No interpretation</span>}
            </span>
          </div>
        </div>

        {/* Technical Remarks */}
        {result.remarks && (
          <div className="mt-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-slate-700">
            <span className="font-semibold text-blue-900 block mb-1">Technical Remarks:</span>
            {result.remarks}
          </div>
        )}
      </Card>

      {/* Grid: Specimen + Order & Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specimen Information */}
        <Card
          title="Specimen Accession Context"
          subtitle="Physical sample intake parameters"
          className="lg:col-span-2"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Sample Accession Number"
              value={
                <button
                  type="button"
                  onClick={() => navigate(`/pathology/samples/${result.pathologySampleId}`)}
                  className="font-mono text-sm font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {result.sampleNumber}
                </button>
              }
            />
            <Field
              label="Specimen Status"
              value={<StatusBadge status={result.sampleStatus} />}
            />
            <Field
              label="Specimen Type"
              value={
                <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs">
                  {result.sampleTypeName} ({result.sampleTypeCode})
                </span>
              }
            />
            <Field
              label="Diagnostic Test"
              value={
                <div>
                  <span className="font-semibold text-slate-900">{result.testName}</span>
                  <span className="font-mono text-xs text-slate-500 block">{result.testCode}</span>
                </div>
              }
            />
            <Field
              label="Collection Timestamp"
              value={formatDateTime(result.collectedAt)}
            />
            <Field
              label="Laboratory Receipt Timestamp"
              value={formatDateTime(result.receivedAt)}
            />
          </dl>
        </Card>

        {/* Patient & Order Context */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card title="Patient Profile" subtitle="Diagnostic subject">
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{result.patientName}</p>
                  <p className="font-mono text-xs text-slate-500">{result.patientNumber}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/patients/${result.patientId}`)}
              >
                View Patient Profile
              </Button>
            </div>
          </Card>

          {/* Order Card */}
          <Card title="Parent Lab Order" subtitle="Diagnostic requisition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order Number</span>
                <span className="font-mono text-xs font-bold text-blue-700">
                  {result.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order Date</span>
                <span className="text-xs text-slate-700">
                  {formatDateTime(result.orderDate)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate(`/pathology/lab-orders/${result.pathologyLabOrderId}`)}
              >
                View Lab Order
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Audit History & Workflow Timestamps */}
      <Card
        title="Audit Trail & Workflow History"
        subtitle="Server-controlled timestamps and staff references"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-500 block">1. Result Entered</span>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {result.enteredBy || <span className="text-slate-400 font-normal italic">Pending</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {result.enteredAt ? formatDateTime(result.enteredAt) : '—'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-500 block">2. Verified</span>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {result.verifiedBy || <span className="text-slate-400 font-normal italic">Pending verification</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {result.verifiedAt ? formatDateTime(result.verifiedAt) : '—'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-500 block">3. Released</span>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {result.releasedAt ? (
                <span className="text-emerald-700 font-bold">Released for Report</span>
              ) : (
                <span className="text-slate-400 font-normal italic">Pending release</span>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {result.releasedAt ? formatDateTime(result.releasedAt) : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Enter / Edit Result Modal */}
      {isEnterModalOpen && (
        <EnterResultModal
          isOpen={isEnterModalOpen}
          result={result}
          isSubmitting={isEntering}
          error={enterError}
          onClose={() => setIsEnterModalOpen(false)}
          onSubmit={handleSubmitEnterResult}
          onClearError={() => setEnterError(null)}
        />
      )}

      {/* Verify Result Modal */}
      {isVerifyModalOpen && (
        <VerifyResultModal
          isOpen={isVerifyModalOpen}
          result={result}
          isSubmitting={isVerifying}
          error={verifyError}
          onClose={() => setIsVerifyModalOpen(false)}
          onSubmit={handleSubmitVerify}
          onClearError={() => setVerifyError(null)}
        />
      )}

      {/* Process Confirm Dialog */}
      <ConfirmDialog
        isOpen={isProcessDialogOpen}
        title="Start Result Processing?"
        message={`Move result for sample ${result.sampleNumber} (${result.testName}) to Processing status?`}
        detail="This assigns the specimen to an analytical bench workstation for testing."
        confirmLabel="Start Processing"
        confirmVariant="primary"
        isLoading={isProcessing}
        onConfirm={handleConfirmProcess}
        onCancel={() => !isProcessing && setIsProcessDialogOpen(false)}
      />

      {/* Re-evaluate Confirm Dialog */}
      <ConfirmDialog
        isOpen={isEvaluateDialogOpen}
        title="Re-evaluate Result Against Reference Ranges?"
        message={`Re-evaluate result value "${result.resultValue}" against configured master reference ranges?`}
        detail="This computes and updates the ResultFlag (Low, Normal, High) based on patient age, gender, and configured ranges."
        confirmLabel="Run Evaluation"
        confirmVariant="primary"
        isLoading={isEvaluating}
        onConfirm={handleConfirmEvaluate}
        onCancel={() => !isEvaluating && setIsEvaluateDialogOpen(false)}
      />

      {/* Release Confirm Dialog */}
      <ConfirmDialog
        isOpen={isReleaseDialogOpen}
        title="Release Diagnostic Result?"
        message={`Release verified result for sample ${result.sampleNumber} (${result.testName})?`}
        detail="Releasing makes the result immutable and immediately available for final laboratory report compilation (M13)."
        confirmLabel="Confirm Release"
        confirmVariant="primary"
        isLoading={isReleasing}
        onConfirm={handleConfirmRelease}
        onCancel={() => !isReleasing && setIsReleaseDialogOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
