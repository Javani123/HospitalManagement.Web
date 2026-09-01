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
  Percent,
  Coins,
  Receipt,
} from 'lucide-react';

import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import { pathologySampleService } from '../../services/pathologySampleService';
import { invoiceService } from '../../services/invoiceService';

import type {
  PathologyLabOrderDto,
  PathologyLabOrderItemDto,
} from '../../types/pathologyLabOrder';
import type {
  PathologySampleDto,
  CollectSampleRequest,
  RejectSampleRequest,
} from '../../types/pathologySample';
import type { InvoiceDto } from '../../types/invoice';

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
import { InvoiceModal } from '../Billing/components/InvoiceModal';

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
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invoice modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
      const [orderData, samplesData, invoiceData] = await Promise.all([
        pathologyLabOrderService.getById(orderId),
        pathologySampleService.getByOrder(orderId),
        invoiceService.getByOrder(orderId).catch(() => null),
      ]);
      setOrder(orderData);
      setSamples(samplesData);
      setInvoice(invoiceData);
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

      {/* Order Info, Patient Context, Referring Doctor Commission & Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Order Information */}
        <Card
          title="Order Information"
          subtitle="Backend-generated order metadata"
        >
          <dl className="space-y-3.5">
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
              <Field label="Clinical Notes" value={order.clinicalNotes} />
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

        {/* Referring Doctor & Commission Snapshot Card (F14.9) */}
        <Card
          title="Referring Doctor & Commission"
          subtitle="Immutable historical commission snapshot"
        >
          {order.referringDoctorName ? (
            <div className="space-y-3">
              {/* Doctor Details */}
              <div className="p-2.5 bg-teal-50/70 border border-teal-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    Dr
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {order.referringDoctorName}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {order.referringDoctorRegistrationNumber && (
                        <span className="font-mono text-teal-800 font-semibold bg-teal-100/70 px-1 py-0.2 rounded">
                          {order.referringDoctorRegistrationNumber}
                        </span>
                      )}
                      {order.referringDoctorSpecialization && (
                        <span className="truncate">• {order.referringDoctorSpecialization}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Snapshot */}
              {order.commission ? (
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                    <dt className="text-[10px] font-medium text-slate-500">Commission Type</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 flex items-center gap-1">
                      {order.commission.type.toLowerCase() === 'percentage' ? (
                        <span className="inline-flex items-center gap-0.5 text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                          <Percent className="w-2.5 h-2.5" /> Percentage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                          <Coins className="w-2.5 h-2.5" /> Fixed
                        </span>
                      )}
                    </dd>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                    <dt className="text-[10px] font-medium text-slate-500">Rate / Fee</dt>
                    <dd className="mt-0.5 font-mono font-bold text-slate-900 text-xs">
                      {order.commission.type.toLowerCase() === 'percentage'
                        ? `${order.commission.rate.toFixed(2)}%`
                        : formatCurrency(order.commission.rate)}
                    </dd>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                    <dt className="text-[10px] font-medium text-slate-500">Commission Base</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900 text-xs">
                      {formatCurrency(order.commission.commissionableAmount)}
                    </dd>
                  </div>

                  <div className="p-2 bg-emerald-50/90 border border-emerald-200 rounded-lg">
                    <dt className="text-[10px] font-medium text-emerald-800 font-semibold">Calculated Amount</dt>
                    <dd className="mt-0.5 font-mono font-bold text-emerald-900 text-sm">
                      {formatCurrency(order.commission.commissionAmount)}
                    </dd>
                  </div>

                  <div className="col-span-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>Snapshot: {formatDateTime(order.commission.calculatedAt)}</span>
                    {order.commission.ruleId && (
                      <span className="font-mono">Rule #{order.commission.ruleId}</span>
                    )}
                  </div>
                </dl>
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-center text-xs text-slate-500">
                  No commission calculated.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">No Referring Doctor</p>
              <p className="text-[11px] text-slate-400">
                Self-referred lab order. No commission calculated.
              </p>
            </div>
          )}
        </Card>

        {/* Billing & Invoice Card (F14.10) */}
        <Card
          title="Billing & Invoice"
          subtitle="Laboratory billing & payment status"
        >
          {invoice ? (
            <div className="space-y-3">
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-blue-900 text-xs">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.status === 'PartiallyPaid'
                      ? 'bg-amber-100 text-amber-800'
                      : invoice.status === 'Cancelled'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                  <dt className="text-[10px] font-medium text-slate-500">Grand Total</dt>
                  <dd className="mt-0.5 font-mono font-bold text-slate-900 text-xs">
                    {formatCurrency(invoice.grandTotal)}
                  </dd>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                  <dt className="text-[10px] font-medium text-slate-500">Paid Amount</dt>
                  <dd className="mt-0.5 font-mono font-bold text-emerald-700 text-xs">
                    {formatCurrency(invoice.paidAmount)}
                  </dd>
                </div>
                <div className="col-span-2 p-2 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-500">Outstanding Balance</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      Number(invoice.outstandingAmount) > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {formatCurrency(invoice.outstandingAmount)}
                  </span>
                </div>
              </dl>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                View Full Invoice
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">Not Invoiced</p>
              <p className="text-[11px] text-slate-400">
                No billing invoice has been generated for this lab order yet.
              </p>
              {order.status !== 'Cancelled' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs mt-1 w-full"
                  onClick={() => setIsInvoiceModalOpen(true)}
                >
                  Generate Invoice
                </Button>
              )}
            </div>
          )}
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

      {/* Invoice Modal (F14.10) */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          preselectedOrderId={order.id}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={(newInv) => {
            setInvoice(newInv);
            toastSuccess(`Invoice ${newInv.invoiceNumber} generated successfully!`);
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
