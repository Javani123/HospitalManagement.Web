import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

import { pathologySampleService } from '../../services/pathologySampleService';
import { pathologyResultService } from '../../services/pathologyResultService';
import type {
  PathologySampleDto,
  RejectSampleRequest,
} from '../../types/pathologySample';
import type { PathologyResultDto } from '../../types/pathologyResult';

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
import { RejectSampleModal } from './components/RejectSampleModal';

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

export const SampleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { error, clearError, handleError } = useApiError();
  const { toasts, dismiss, success: toastSuccess } = useToast();

  const [sample, setSample] = useState<PathologySampleDto | null>(null);
  const [result, setResult] = useState<PathologyResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingResult, setIsCreatingResult] = useState(false);

  // Action states
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const loadSample = useCallback(async () => {
    if (!id || !Number.isInteger(Number(id))) return;
    clearError();
    setIsLoading(true);
    try {
      const sampleId = Number(id);
      const data = await pathologySampleService.getById(sampleId);
      setSample(data);

      // Attempt to load associated result if sample is active
      try {
        const resData = await pathologyResultService.getBySampleId(sampleId);
        setResult(resData);
      } catch {
        setResult(null);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id, clearError, handleError]);

  useEffect(() => {
    void loadSample();
  }, [loadSample]);

  // Create result entry
  const handleCreateResult = async () => {
    if (!sample) return;
    setIsCreatingResult(true);
    try {
      const created = await pathologyResultService.create({
        pathologySampleId: sample.id,
      });
      setResult(created);
      toastSuccess(`Result entry initialized (Status: Pending).`);
      navigate(`/pathology/results/${created.id}`);
    } catch (err) {
      handleError(err);
    } finally {
      setIsCreatingResult(false);
    }
  };

  // Receive action
  const handleConfirmReceive = async () => {
    if (!sample) return;
    setIsReceiving(true);
    try {
      const updated = await pathologySampleService.receive(sample.id);
      setSample(updated);
      toastSuccess(`Sample ${updated.sampleNumber} marked as Received.`);
      setIsReceiveDialogOpen(false);
      await loadSample();
    } catch (err) {
      handleError(err);
      setIsReceiveDialogOpen(false);
    } finally {
      setIsReceiving(false);
    }
  };

  // Reject action
  const handleSubmitReject = async (dto: RejectSampleRequest) => {
    if (!sample) return;
    setIsRejecting(true);
    setRejectError(null);
    try {
      const updated = await pathologySampleService.reject(sample.id, dto);
      setSample(updated);
      toastSuccess(`Sample ${updated.sampleNumber} has been Rejected.`);
      setIsRejectModalOpen(false);
    } catch (err) {
      const norm = handleError(err);
      setRejectError(norm.message);
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sample Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Samples', path: '/pathology/samples' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingState message="Loading specimen details..." />
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sample Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Samples', path: '/pathology/samples' },
            { label: 'Not Found' },
          ]}
        />
        {error && <ErrorAlert error={error} onDismiss={clearError} />}
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => navigate('/pathology/samples')}
        >
          Back to Samples
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Accession ${sample.sampleNumber}`}
        subtitle="Specimen collection tracking, intake verification, and audit trail."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Samples', path: '/pathology/samples' },
          { label: sample.sampleNumber },
        ]}
        badge={<StatusBadge status={sample.status} size="md" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => navigate('/pathology/samples')}
            >
              Back to Samples
            </Button>

            {sample.status === 'Collected' && (
              <Button
                variant="primary"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setIsReceiveDialogOpen(true)}
              >
                Receive Sample
              </Button>
            )}

            {(sample.status === 'Collected' || sample.status === 'Received') && (
              <Button
                variant="danger"
                leftIcon={<AlertTriangle className="w-4 h-4" />}
                onClick={() => {
                  setRejectError(null);
                  setIsRejectModalOpen(true);
                }}
              >
                Reject Sample
              </Button>
            )}
          </div>
        }
      />

      {error && !isRejectModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Rejection Alert Banner if Rejected */}
      {sample.status === 'Rejected' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-900">
              Sample Rejected — Audit Record
            </h4>
            <p className="text-sm text-rose-800">
              <strong>Reason:</strong> {sample.rejectionReason}
            </p>
            {sample.rejectedAt && (
              <p className="text-xs text-rose-600">
                Rejected at: {formatDateTime(sample.rejectedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Grid: Sample & Order & Patient */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Information */}
        <Card
          title="Specimen Accession"
          subtitle="Server-generated accession and specimen parameters"
          className="lg:col-span-2"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Accession / Sample Number"
              value={
                <span className="font-mono text-base font-bold text-violet-700 bg-violet-50 border border-violet-200/80 px-2.5 py-1 rounded-md">
                  {sample.sampleNumber}
                </span>
              }
            />
            <Field
              label="Current Status"
              value={<StatusBadge status={sample.status} size="md" />}
            />
            <Field
              label="Specimen Type"
              value={
                <span className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                  {sample.sampleTypeName} ({sample.sampleTypeCode})
                </span>
              }
            />
            <Field
              label="Collected By"
              value={sample.collectedBy || 'Not recorded'}
            />
            <Field
              label="Collection Timestamp"
              value={
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formatDateTime(sample.collectedAt)}</span>
                </div>
              }
            />
            <Field
              label="Laboratory Receipt Timestamp"
              value={
                sample.receivedAt ? (
                  <div className="flex items-center gap-1.5 text-sky-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    <span>{formatDateTime(sample.receivedAt)}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Pending receipt</span>
                )
              }
            />
            {sample.notes && (
              <div className="sm:col-span-2">
                <Field label="Collection Notes" value={sample.notes} />
              </div>
            )}
          </dl>
        </Card>

        {/* Patient & Order Context */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card title="Patient Profile" subtitle="Subject of laboratory testing">
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{sample.patientName}</p>
                  <p className="font-mono text-xs text-slate-500">{sample.patientNumber}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/patients/${sample.patientId}`)}
              >
                View Patient Profile
              </Button>
            </div>
          </Card>

          {/* Order Card */}
          <Card title="Parent Lab Order" subtitle="Diagnostic order reference">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order Number</span>
                <span className="font-mono text-xs font-bold text-blue-700">
                  {sample.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order Date</span>
                <span className="text-xs text-slate-700">
                  {formatDateTime(sample.orderDate)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate(`/pathology/lab-orders/${sample.pathologyLabOrderId}`)}
              >
                View Lab Order
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Test Association Card */}
      <Card
        title="Ordered Diagnostic Test"
        subtitle="Test coverage snapshot from laboratory master"
      >
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{sample.testName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {sample.testCode}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 block">Specimen Type</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {sample.sampleTypeName}
            </span>
          </div>
        </div>
      </Card>

      {/* Workflow Navigation & Diagnostic Result Card */}
      <Card
        title="Diagnostic Testing & Result Status (M11 & M12)"
        subtitle="Specimen analytical processing and report workflow"
      >
        {result ? (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Diagnostic Result: {result.resultValue ? `${result.resultValue} ${result.unit || ''}` : 'Pending Value Entry'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={result.status} size="sm" />
                    <ResultFlagBadge flag={result.resultFlag} size="sm" />
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/pathology/results/${result.id}`)}
              >
                Open Result Workflow
              </Button>
            </div>

            {result.referenceRange && (
              <p className="text-xs text-slate-500 font-mono">
                Reference Range: {result.referenceRange}
              </p>
            )}
          </div>
        ) : sample.status === 'Received' ? (
          <div className="p-4 bg-sky-50 border border-sky-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-sky-900">
                Specimen Received — Ready for Testing
              </h4>
              <p className="text-xs text-sky-700 mt-0.5">
                Initialize a diagnostic result entry to begin laboratory measurement and reference range evaluation.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreatingResult}
              onClick={handleCreateResult}
            >
              Start Result Entry
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-sm text-slate-600">
            <ClipboardList className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Following physical receipt in the laboratory, this specimen will proceed to{' '}
              <strong>Result Entry (M11)</strong>, <strong>Reference Range Evaluation (M12)</strong>, and{' '}
              <strong>Verification</strong> before report release.
            </p>
          </div>
        )}
      </Card>

      {/* Receive Dialog */}
      <ConfirmDialog
        isOpen={isReceiveDialogOpen}
        title="Receive Specimen in Laboratory?"
        message={`Mark sample ${sample.sampleNumber} (${sample.testName}) as Received?`}
        detail="This confirms physical delivery of the specimen to the diagnostic testing bench."
        confirmLabel="Confirm Receipt"
        confirmVariant="primary"
        isLoading={isReceiving}
        onConfirm={handleConfirmReceive}
        onCancel={() => !isReceiving && setIsReceiveDialogOpen(false)}
      />

      {/* Reject Modal */}
      <RejectSampleModal
        isOpen={isRejectModalOpen}
        sampleNumber={sample.sampleNumber}
        testName={sample.testName}
        isSubmitting={isRejecting}
        error={rejectError}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleSubmitReject}
        onClearError={() => setRejectError(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
