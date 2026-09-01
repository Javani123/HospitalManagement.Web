import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Receipt,
  ArrowLeft,
  User,
  FlaskConical,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  Ban,
  TrendingUp,
  AlertCircle,
  Shield,
  Printer,
  XCircle,
  Plus,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import { PaymentModal } from './components/PaymentModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import type { InvoiceDto, InvoiceStatus } from '../../types/invoice';
import type { PathologyLabOrderDto } from '../../types/pathologyLabOrder';
import type { PaymentDto } from '../../types/payment';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useAuth();
  const { toasts, success, error: toastError, dismiss } = useToast();
  const isAdmin = hasRole('Admin');
  const canCreatePayment = isAdmin || hasAnyRole(['Accountant', 'Receptionist']);
  const canVoidPayment = isAdmin || hasRole('Accountant');
  const canCancel = isAdmin || hasRole('Accountant');

  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [labOrder, setLabOrder] = useState<PathologyLabOrderDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Payment Settlement Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [receiptPayment, setReceiptPayment] = useState<PaymentDto | null>(null);
  const [voidingPayment, setVoidingPayment] = useState<PaymentDto | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid invoice identifier.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inv = await invoiceService.getById(Number(id));
      setInvoice(inv);

      // Load related lab order for immutable commission snapshot
      if (inv.pathologyLabOrderId) {
        try {
          const order = await pathologyLabOrderService.getById(
            inv.pathologyLabOrderId
          );
          setLabOrder(order);
        } catch {
          // Non-blocking if order details fail to load
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load invoice details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!invoice) return;

    setIsCancelling(true);
    try {
      const updated = await invoiceService.cancel(invoice.id, cancelReason);
      setInvoice(updated);
      setIsCancelModalOpen(false);
      setCancelReason('');
      success(`Invoice ${updated.invoiceNumber} has been cancelled.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to cancel invoice.';
      toastError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Void Payment
  const handleConfirmVoidPayment = async () => {
    if (!voidingPayment) return;

    if (!voidReason.trim()) {
      toastError('Please provide a reason for voiding this payment.');
      return;
    }

    setIsVoiding(true);
    try {
      const updated = await paymentService.void(voidingPayment.id, voidReason);
      success(`Payment ${updated.paymentNumber} has been voided.`);
      setVoidingPayment(null);
      setVoidReason('');
      void loadData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to void payment.';
      toastError(msg);
    } finally {
      setIsVoiding(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus | string) => {
    switch (status) {
      case 'Issued':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Issued
          </span>
        );
      case 'PartiallyPaid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            Partially Paid
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Paid
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3.5 h-3.5 text-slate-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Receipt className="w-10 h-10 text-blue-600 animate-pulse mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Button>
        <ErrorAlert error={error || 'Invoice not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/invoices')}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">
                {invoice.invoiceNumber}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued on {new Date(invoice.invoiceDate).toLocaleDateString()} at{' '}
              {new Date(invoice.invoiceDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </Button>

          {canCancel &&
            invoice.status !== 'Cancelled' &&
            invoice.paidAmount === 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsCancelModalOpen(true);
                  setCancelReason('');
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Invoice</span>
              </Button>
            )}
        </div>
      </div>

      {/* Main Grid: Left (Patient, Order, Items) | Right (Totals, Audit, Commission) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient & Lab Order Context Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Information</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {invoice.patientName}
                </div>
                <div className="text-xs font-mono text-slate-500">
                  MRN: {invoice.patientNumber} (ID: {invoice.patientId})
                </div>
              </div>
            </div>

            {/* Lab Order Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  <span>Originating Lab Order</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/pathology/lab-orders/${invoice.pathologyLabOrderId}`)
                  }
                  className="text-blue-600 hover:underline text-[11px] font-semibold lowercase"
                >
                  view order →
                </button>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-mono font-bold text-slate-900">
                  {invoice.orderNumber}
                </div>
                {labOrder && (
                  <div className="text-xs text-slate-500">
                    Status: <span className="font-semibold text-slate-700">{labOrder.status}</span> | Items: {labOrder.items?.length || 0}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Billed Tests */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Itemized Diagnostic Services ({invoice.items?.length || 0})</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4 text-center">Code</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.itemDescription}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {item.itemCode || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${Number(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        ${Number(item.discountAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(item.lineTotal || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlements / Payment Records (F14.11) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Transactions ({invoice.payments?.length || 0})</span>
              </div>
              
              <div className="flex items-center gap-2">
                {canCreatePayment &&
                  invoice.status !== 'Cancelled' &&
                  invoice.status !== 'Paid' &&
                  Number(invoice.outstandingAmount) > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="flex items-center gap-1 text-xs py-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Record Payment</span>
                    </Button>
                  )}
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Receipt #</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Reference</th>
                      <th className="py-2.5 px-4">Cashier</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptPayment({
                                ...p,
                                invoiceNumber: invoice.invoiceNumber,
                              })
                            }
                            className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-emerald-600" />
                            <span>{p.paymentNumber}</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                          {p.paymentMethod}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {p.referenceNumber || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px] whitespace-nowrap truncate max-w-[120px]">
                          {p.receivedByName || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          ${Number(p.amount).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 line-through'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setReceiptPayment({
                                  ...p,
                                  invoiceNumber: invoice.invoiceNumber,
                                })
                              }
                              className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="View Receipt"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/payments/${p.id}`)}
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                              title="Payment Details"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>

                            {canVoidPayment && p.status === 'Completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setVoidingPayment({
                                    ...p,
                                    invoiceNumber: invoice.invoiceNumber,
                                  });
                                  setVoidReason('');
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                title="Void Payment"
                              >
                                <Ban className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No payment settlements recorded against this invoice yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Totals, Doctor Commission Snapshot, Audit Info */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md space-y-4">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider pb-2 border-b border-slate-700/80">
              Financial Summary
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-white">
                  ${Number(invoice.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-rose-300">
                <span>Discount:</span>
                <span className="font-mono font-semibold">
                  {invoice.discountAmount > 0
                    ? `-$${Number(invoice.discountAmount).toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Tax:</span>
                <span className="font-mono font-semibold text-white">
                  ${Number(invoice.taxAmount).toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700/80 flex justify-between items-baseline text-sm font-bold text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-xl text-emerald-400">
                  ${Number(invoice.grandTotal).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-emerald-300 text-xs">
                <span>Amount Paid:</span>
                <span className="font-mono font-semibold">
                  ${Number(invoice.paidAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-sm font-bold pt-1">
                <span className="text-slate-300">Outstanding Balance:</span>
                <span
                  className={`font-mono text-lg font-bold ${
                    Number(invoice.outstandingAmount) > 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  ${Number(invoice.outstandingAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Commission Snapshot (F14.9 Separation - Strictly Immutable) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>Doctor Commission Snapshot</span>
            </div>

            {labOrder?.commission ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Referring Doctor:</span>
                  <span className="font-semibold text-slate-800">
                    {labOrder.referringDoctorName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Commission Type:</span>
                  <span className="font-medium text-slate-800">
                    {labOrder.commission.type}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Commission Rate:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {labOrder.commission.type === 'Percentage'
                      ? `${labOrder.commission.rate}%`
                      : `$${Number(labOrder.commission.rate).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Commissionable Base:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ${Number(labOrder.commission.commissionableAmount).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-emerald-700 text-xs">
                  <span>Calculated Commission:</span>
                  <span className="font-mono text-sm">
                    ${Number(labOrder.commission.commissionAmount).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  Historical snapshot recorded at order placement. Immutable & independent of invoice discount.
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                {labOrder?.referringDoctorStaffId
                  ? 'No active commission rule applied for referring doctor.'
                  : 'Self-referred order — No doctor commission.'}
              </div>
            )}
          </div>

          {/* Audit Metadata & Notes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Audit & Metadata</span>
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Billed By:</span>
                <span className="font-semibold text-slate-800">
                  {invoice.createdByName || 'System'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="font-mono">
                  {new Date(invoice.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-mono">
                  {new Date(invoice.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {invoice.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">Notes & Remarks:</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700 text-[11px] font-mono whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Invoice Modal */}
      {isCancelModalOpen && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Invoice?"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <p className="font-bold">
                  Are you sure you want to cancel invoice{' '}
                  <span className="font-mono">{invoice.invoiceNumber}</span>?
                </p>
                <p>
                  Grand Total: <strong>${Number(invoice.grandTotal).toFixed(2)}</strong>
                </p>
                <p className="text-rose-700">
                  Cancelling marks this invoice as cancelled for historical audit purposes. It cannot be reverted.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cancellation Reason / Remarks
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Patient decided to postpone tests, incorrect test items, etc."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleConfirmCancel()}
                disabled={isCancelling}
                className="flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Settlement Modal */}
      {isPaymentModalOpen && invoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          preselectedInvoice={invoice}
          preselectedInvoiceId={invoice.id}
          onSuccess={(newPayment) => {
            void loadData();
            success(
              `Payment ${newPayment.paymentNumber} recorded successfully for $${Number(
                newPayment.amount
              ).toFixed(2)}!`
            );
          }}
        />
      )}

      {/* Payment Settlement Receipt Modal */}
      {receiptPayment && (
        <PaymentReceiptModal
          isOpen={Boolean(receiptPayment)}
          onClose={() => setReceiptPayment(null)}
          payment={receiptPayment}
          patientName={invoice.patientName}
          patientNumber={invoice.patientNumber}
        />
      )}

      {/* Void Payment Confirmation Modal */}
      {voidingPayment && (
        <Modal
          isOpen={Boolean(voidingPayment)}
          onClose={() => setVoidingPayment(null)}
          title="Void Payment Transaction?"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <p className="font-bold">
                  Are you sure you want to void payment{' '}
                  <span className="font-mono">{voidingPayment.paymentNumber}</span>?
                </p>
                <p>
                  Amount: <strong>${Number(voidingPayment.amount).toFixed(2)}</strong> | Invoice:{' '}
                  <strong>{invoice.invoiceNumber}</strong>
                </p>
                <p className="text-rose-700">
                  This action marks the payment as voided and restores the outstanding balance on this invoice.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Void Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter audit reason for voiding this payment..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                disabled={isVoiding}
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoidingPayment(null)}
                disabled={isVoiding}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleConfirmVoidPayment()}
                disabled={isVoiding || !voidReason.trim()}
                className="flex items-center gap-1.5"
              >
                {isVoiding ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Voiding...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Void</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
