import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Receipt,
  Printer,
  Ban,
  CheckCircle2,
  FileText,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useTenant } from '../../hooks/useTenant';
import { paymentService } from '../../services/paymentService';
import { invoiceService } from '../../services/invoiceService';
import type { PaymentDto } from '../../types/payment';
import type { InvoiceDto } from '../../types/invoice';

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { tenant } = useTenant();
  const { toasts, success, error: toastError, dismiss } = useToast();
  const isAdmin = hasRole('Admin');
  const canVoid = isAdmin || hasRole('Accountant');

  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Void Modal State
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid payment identifier.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const p = await paymentService.getById(Number(id));
      setPayment(p);

      // Load related invoice
      if (p.invoiceId) {
        try {
          const inv = await invoiceService.getById(p.invoiceId);
          setInvoice(inv);
        } catch {
          // Non-blocking
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load payment details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Void
  const handleConfirmVoid = async () => {
    if (!payment) return;

    if (!voidReason.trim()) {
      toastError('Please provide a reason for voiding this payment.');
      return;
    }

    setIsVoiding(true);
    try {
      const updated = await paymentService.void(payment.id, voidReason);
      setPayment(updated);
      setIsVoidModalOpen(false);
      setVoidReason('');
      success(`Payment ${updated.paymentNumber} has been voided.`);

      // Reload related invoice to refresh balance
      if (payment.invoiceId) {
        try {
          const inv = await invoiceService.getById(payment.invoiceId);
          setInvoice(inv);
        } catch {
          // ignore
        }
      }
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <CreditCard className="w-10 h-10 text-blue-600 animate-pulse mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading payment settlement details...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/payments')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Button>
        <ErrorAlert error={error || 'Payment not found.'} />
      </div>
    );
  }

  const isVoided = payment.status === 'Voided';

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
            onClick={() => navigate('/payments')}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            title="Back to Payments"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">
                {payment.paymentNumber}
              </h1>
              {isVoided ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  Voided
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Completed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Settled on {new Date(payment.paymentDate).toLocaleDateString()} at{' '}
              {new Date(payment.paymentDate).toLocaleTimeString([], {
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
            <span>Print Receipt</span>
          </Button>

          {canVoid && !isVoided && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsVoidModalOpen(true);
                setVoidReason('');
              }}
              className="flex items-center gap-1.5 text-xs"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Void Payment</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Settlement Information, Originating Invoice, Void Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voided Alert Banner (If Voided) */}
          {isVoided && (
            <div className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl text-rose-900 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Payment Reversal Audit Information</span>
              </div>
              <div className="text-xs space-y-1 text-rose-800 pl-7">
                <p>
                  <strong>Void Reason:</strong> {payment.voidReason || 'Not specified'}
                </p>
                <p>
                  <strong>Voided By:</strong> {payment.voidedByName || 'System'} on{' '}
                  {payment.voidedAt
                    ? `${new Date(payment.voidedAt).toLocaleDateString()} at ${new Date(
                        payment.voidedAt
                      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Payment Settlement Information Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Transaction Details</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                ID: #{payment.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <span className="text-slate-500 block text-[11px] font-medium mb-1">
                  Settled Amount
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-700">
                  ${Number(payment.amount).toFixed(2)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-500 block text-[11px] font-medium mb-1">
                  Payment Method
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {payment.paymentMethod}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-500 block text-[11px] font-medium mb-1">
                  Reference Number
                </span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {payment.referenceNumber || '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="text-xs space-y-1">
                <span className="text-slate-500 font-medium">Cashier / Collected By:</span>
                <p className="font-semibold text-slate-800">
                  {payment.receivedByName || '—'} (Staff ID: {payment.receivedByStaffId || '—'})
                </p>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-slate-500 font-medium">Created Timestamp:</span>
                <p className="font-mono text-slate-700">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {payment.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500 font-medium block mb-0.5">Remarks / Notes:</span>
                <p className="text-slate-800 italic">{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Linked Invoice Context Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Parent Invoice Record</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/invoices/${payment.invoiceId}`)}
                className="text-blue-600 hover:underline text-xs font-semibold"
              >
                View Full Invoice →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase">
                  Invoice Number
                </span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {payment.invoiceNumber}
                </span>
              </div>

              {invoice && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium uppercase">
                    Patient Name
                  </span>
                  <span className="font-semibold text-sm text-slate-900">
                    {invoice.patientName} ({invoice.patientNumber})
                  </span>
                </div>
              )}
            </div>

            {invoice && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Grand Total
                  </span>
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    ${Number(invoice.grandTotal).toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 block text-[10px] uppercase font-bold">
                    Total Paid
                  </span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    ${Number(invoice.paidAmount).toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-rose-700 block text-[10px] uppercase font-bold">
                    Outstanding Balance
                  </span>
                  <span className="font-bold font-mono text-rose-700 text-sm">
                    ${Number(invoice.outstandingAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Printable Receipt Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Settlement Receipt</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="p-1 text-slate-600 hover:text-blue-600"
                title="Print Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {tenant?.hospitalName || 'CareSync Medical Center'}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  {tenant?.hospitalCode || 'HOSP-001'}
                </p>
                <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                  RECEIPT #{payment.paymentNumber}
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-slate-800">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {payment.invoiceNumber}
                  </span>
                </div>
                {invoice && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-semibold text-slate-800">
                      {invoice.patientName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-semibold text-slate-800">
                    {payment.paymentMethod}
                  </span>
                </div>
                {payment.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono text-slate-700">
                      {payment.referenceNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">AMOUNT PAID:</span>
                <span className="text-base font-mono font-bold text-emerald-700">
                  ${Number(payment.amount).toFixed(2)}
                </span>
              </div>

              <div className="pt-1 text-center text-[10px] text-slate-400">
                Status: <strong>{payment.status}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void Payment Modal */}
      {isVoidModalOpen && (
        <Modal
          isOpen={isVoidModalOpen}
          onClose={() => setIsVoidModalOpen(false)}
          title="Void Payment Transaction?"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <p className="font-bold">
                  Are you sure you want to void payment{' '}
                  <span className="font-mono">{payment.paymentNumber}</span>?
                </p>
                <p>
                  Amount: <strong>${Number(payment.amount).toFixed(2)}</strong> | Method:{' '}
                  <strong>{payment.paymentMethod}</strong>
                </p>
                <p className="text-rose-700">
                  Voiding will reverse this payment from the invoice balance and mark the transaction as voided. The transaction will be preserved for audit purposes.
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
                onClick={() => setIsVoidModalOpen(false)}
                disabled={isVoiding}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmVoid}
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

export default PaymentDetailPage;
