import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  Plus,
  FileText,
} from 'lucide-react';

import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import { pathologySampleService } from '../../services/pathologySampleService';

import type {
  PathologyLabOrderDto,
  PathologyLabOrderItemDto,
} from '../../types/pathologyLabOrder';
import type {
  PathologySampleDto,
  CollectSampleRequest,
  RejectSampleRequest,
} from '../../types/pathologySample';

import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

import { CollectSampleModal } from './components/CollectSampleModal';
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

export const PathologyLabOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { error, clearError, handleError } = useApiError();
  const { toasts, dismiss, success: toastSuccess } = useToast();

  const [order, setOrder] = useState<PathologyLabOrderDto | null>(null);
  const [samples, setSamples] = useState<PathologySampleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Collect Sample state
  const [collectingItem, setCollectingItem] = useState<PathologyLabOrderItemDto | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  // Receive dialog state
  const [receiveTarget, setReceiveTarget] = useState<PathologySampleDto | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<PathologySampleDto | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id || !Number.isInteger(Number(id))) return;
    clearError();
    setIsLoading(true);
    try {
      const orderId = Number(id);
      const [orderData, samplesData] = await Promise.all([
        pathologyLabOrderService.getById(orderId),
        pathologySampleService.getByOrder(orderId),
      ]);
      setOrder(orderData);
      setSamples(samplesData);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id, clearError, handleError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Flash toast from navigation state
  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      toastSuccess(state.toast);
      window.history.replaceState({}, '');
    }
  }, [location.state, toastSuccess]);

  // ─── Collect Specimen Action ────────────────────────────────────────────────

  const handleOpenCollect = (item: PathologyLabOrderItemDto) => {
    setCollectingItem(item);
    setCollectError(null);
  };

  const handleCollectSubmit = async (dto: CollectSampleRequest) => {
    setIsCollecting(true);
    setCollectError(null);
    try {
      const created = await pathologySampleService.collect(dto);
      toastSuccess(
        `Specimen accession ${created.sampleNumber} collected for ${created.testName}.`
      );
      setCollectingItem(null);
      await loadData();
    } catch (err) {
      const norm = handleError(err);
      setCollectError(norm.message);
    } finally {
      setIsCollecting(false);
    }
  };

  // ─── Receive Action ─────────────────────────────────────────────────────────

  const handleConfirmReceive = async () => {
    if (!receiveTarget) return;
    setIsReceiving(true);
    try {
      const updated = await pathologySampleService.receive(receiveTarget.id);
      toastSuccess(`Sample ${updated.sampleNumber} received in laboratory.`);
      setReceiveTarget(null);
      await loadData();
    } catch (err) {
      handleError(err);
      setReceiveTarget(null);
    } finally {
      setIsReceiving(false);
    }
  };

  // ─── Reject Action ──────────────────────────────────────────────────────────

  const handleSubmitReject = async (dto: RejectSampleRequest) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    setRejectError(null);
    try {
      const updated = await pathologySampleService.reject(rejectTarget.id, dto);
      toastSuccess(`Sample ${updated.sampleNumber} has been rejected.`);
      setRejectTarget(null);
      await loadData();
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
          title="Lab Order Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Lab Orders', path: '/pathology/lab-orders' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingState message="Loading lab order and sample accessions..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Lab Order Details"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Lab Orders', path: '/pathology/lab-orders' },
            { label: 'Not Found' },
          ]}
        />
        {error && <ErrorAlert error={error} onDismiss={clearError} />}
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => navigate('/pathology/lab-orders')}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Lab Order ${order.orderNumber}`}
        subtitle="Historical order snapshots, ordered test items, and specimen accessioning."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Lab Orders', path: '/pathology/lab-orders' },
          { label: order.orderNumber },
        ]}
        badge={<StatusBadge status={order.status} size="md" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => void loadData()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => navigate('/pathology/lab-orders')}
            >
              Back to Orders
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => navigate(`/pathology/reports/${order.id}`)}
            >
              View Final Report
            </Button>
          </div>
        }
      />

      {error && !collectingItem && !rejectTarget && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Order Info & Patient Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <Card
          title="Order Information"
          subtitle="Backend-generated order metadata"
          className="lg:col-span-2"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Order Number"
              value={
                <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
                  {order.orderNumber}
                </span>
              }
            />
            <Field
              label="Order Date"
              value={formatDateTime(order.orderDate)}
            />
            <Field
              label="Order Status"
              value={<StatusBadge status={order.status} />}
            />
            <Field
              label="Total Order Value"
              value={
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order.totalOrderValue)}
                </span>
              }
            />
            {order.clinicalNotes && (
              <div className="sm:col-span-2">
                <Field label="Clinical Notes" value={order.clinicalNotes} />
              </div>
            )}
          </dl>
        </Card>

        {/* Patient Information */}
        <Card
          title="Patient Profile"
          subtitle="Patient selected at order creation"
        >
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{order.patientName}</p>
                <p className="font-mono text-xs text-slate-500">{order.patientNumber}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/patients/${order.patientId}`)}
            >
              View Patient Profile
            </Button>
          </div>
        </Card>
      </div>

      {/* Ordered Tests & Specimen Accessions (M10 Integration) */}
      <Card
        title="Ordered Tests & Specimen Collection"
        subtitle="Collect specimens, track accession numbers (SAM######), and manage laboratory sample intake."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-slate-50/80 text-xs font-semibold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="p-3.5">Test</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Sample / Accession</th>
                <th className="p-3.5">Specimen Type</th>
                <th className="p-3.5 text-center">Sample Status</th>
                <th className="p-3.5">Collection Info</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const sample = samples.find(
                  (s) => s.pathologyLabOrderItemId === item.id
                );

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Test Code & Name */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {item.testNameSnapshot}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {item.testCodeSnapshot}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-3.5 font-medium text-slate-700">
                      {formatCurrency(item.price)}
                    </td>

                    {/* Accession Number */}
                    <td className="p-3.5">
                      {sample ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/pathology/samples/${sample.id}`)}
                          className="font-mono text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200/80 px-2 py-0.5 rounded tracking-wide transition-colors cursor-pointer"
                          title="View Sample Details"
                        >
                          {sample.sampleNumber}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Not Collected
                        </span>
                      )}
                    </td>

                    {/* Specimen Type */}
                    <td className="p-3.5">
                      {sample ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          {sample.sampleTypeName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Sample Status */}
                    <td className="p-3.5 text-center">
                      {sample ? (
                        <StatusBadge status={sample.status} size="sm" />
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Pending Collection
                        </span>
                      )}
                    </td>

                    {/* Collection Info */}
                    <td className="p-3.5 text-xs text-slate-600">
                      {sample ? (
                        <div className="space-y-0.5">
                          <div>{formatDateTime(sample.collectedAt)}</div>
                          {sample.collectedBy && (
                            <div className="text-[11px] text-slate-400">
                              By: {sample.collectedBy}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      {sample ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {sample.status === 'Collected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sky-700 border-sky-200 hover:bg-sky-50"
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => setReceiveTarget(sample)}
                              title="Receive in Lab"
                            >
                              Receive
                            </Button>
                          )}

                          {(sample.status === 'Collected' || sample.status === 'Received') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setRejectError(null);
                                setRejectTarget(sample);
                              }}
                              title="Reject Sample"
                            >
                              Reject
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => navigate(`/pathology/samples/${sample.id}`)}
                            title="View Details"
                          >
                            View
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenCollect(item)}
                          disabled={order.status === 'Cancelled'}
                        >
                          Collect Sample
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t bg-slate-50/50">
              <tr>
                <td colSpan={1} className="p-3.5 text-slate-700 font-semibold">
                  Total Value
                </td>
                <td className="p-3.5 font-bold text-slate-900">
                  {formatCurrency(order.totalOrderValue)}
                </td>
                <td colSpan={5} className="p-3.5 text-right text-xs text-slate-500">
                  {samples.length} of {order.items.length} sample(s) collected
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Collect Sample Modal */}
      {collectingItem && (
        <CollectSampleModal
          isOpen={Boolean(collectingItem)}
          orderItem={collectingItem}
          orderNumber={order.orderNumber}
          patientName={order.patientName}
          isSubmitting={isCollecting}
          error={collectError}
          onClose={() => setCollectingItem(null)}
          onSubmit={handleCollectSubmit}
          onClearError={() => setCollectError(null)}
        />
      )}

      {/* Receive Dialog */}
      <ConfirmDialog
        isOpen={Boolean(receiveTarget)}
        title="Receive Specimen in Laboratory?"
        message={`Mark sample ${receiveTarget?.sampleNumber} (${receiveTarget?.testName}) as Received?`}
        detail="This confirms physical delivery of the specimen to the diagnostic testing bench."
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
