import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  RefreshCw,
  Plus,
  Ban,
  CheckCircle2,
  Calendar,
  Eye,
  Printer,
  FileText,
  DollarSign,
  Receipt,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { paymentService } from '../../services/paymentService';
import { PaymentModal } from './components/PaymentModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import type { PaymentDto, PaymentStatusType } from '../../types/payment';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useAuth();
  const { toasts, success, error: toastError, dismiss } = useToast();
  const isAdmin = hasRole('Admin');
  const canCreate = isAdmin || hasAnyRole(['Accountant', 'Receptionist']);
  const canVoid = isAdmin || hasRole('Accountant');

  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [inspectingReceipt, setInspectingReceipt] = useState<PaymentDto | null>(null);
  const [voidingPayment, setVoidingPayment] = useState<PaymentDto | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getAll({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setPayments(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load payments.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // Real-time KPI Calculations
  const kpis = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter((p) => p.status === 'Completed').length;
    const voided = payments.filter((p) => p.status === 'Voided').length;

    const totalCollected = payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalVoided = payments
      .filter((p) => p.status === 'Voided')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const methodsUsed = new Set(
      payments.filter((p) => p.status === 'Completed').map((p) => p.paymentMethod)
    ).size;

    return {
      total,
      completed,
      voided,
      totalCollected,
      totalVoided,
      methodsUsed,
    };
  }, [payments]);

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Search text match
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchPaymentNo = p.paymentNumber?.toLowerCase().includes(term);
        const matchInvoiceNo = p.invoiceNumber?.toLowerCase().includes(term);
        const matchRefNo = p.referenceNumber?.toLowerCase().includes(term);
        const matchCashier = p.receivedByName?.toLowerCase().includes(term);
        if (!matchPaymentNo && !matchInvoiceNo && !matchRefNo && !matchCashier) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      // Method filter
      if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) {
        return false;
      }

      return true;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Handle Void Payment
  const handleConfirmVoid = async () => {
    if (!voidingPayment) return;

    if (!voidReason.trim()) {
      toastError('Please provide a reason for voiding this payment.');
      return;
    }

    setIsVoiding(true);
    try {
      const updated = await paymentService.void(voidingPayment.id, voidReason);
      setPayments((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      success(`Payment ${updated.paymentNumber} has been voided successfully.`);
      setVoidingPayment(null);
      setVoidReason('');
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

  const getStatusBadge = (status: PaymentStatusType | string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case 'Voided':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 line-through">
            <Ban className="w-3 h-3 text-rose-500" />
            Voided
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Page Header */}
      <PageHeader
        title="Payments & Receipts"
        subtitle="Track invoice settlements, payment receipts, outstanding balances, and payment history."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Billing', path: '/invoices' },
          { label: 'Payments & Receipts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPayments()}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsRecordModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </Button>
            )}
          </div>
        }
      />

      {error && <ErrorAlert error={error} />}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total</span>
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{kpis.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All transactions</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{kpis.completed}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Active settlements</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Voided</span>
            <Ban className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-600">{kpis.voided}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Reversed records</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Collected</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600">
            ${kpis.totalCollected.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Net cash in</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Voided</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            ${kpis.totalVoided.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Reversed funds</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Channels</span>
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-700">{kpis.methodsUsed}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active methods</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Payment #, Invoice #, Reference #, or Cashier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="BankTransfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Insurance">Insurance</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              title="From Date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              title="To Date"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          {['ALL', 'Completed', 'Voided'].map((statusKey) => (
            <button
              key={statusKey}
              type="button"
              onClick={() => setStatusFilter(statusKey)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === statusKey
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {statusKey === 'ALL' ? 'All Transactions' : statusKey}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400">
            Showing {filteredPayments.length} of {payments.length} transactions
          </span>
        </div>
      </div>

      {/* Main CareSync Payments Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <CreditCard className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading payment records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No payment transactions found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL' || methodFilter !== 'ALL'
                ? 'Try adjusting your search criteria or date filters.'
                : 'No invoice settlements recorded yet. Click "Record Payment" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/payments/${payment.id}`)}
                        className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{payment.paymentNumber}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/invoices/${payment.invoiceId}`)}
                        className="hover:underline"
                      >
                        {payment.invoiceNumber}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(payment.paymentDate).toLocaleDateString()} at{' '}
                      {new Date(payment.paymentDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      ${Number(payment.amount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {payment.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {payment.referenceNumber || '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-700 text-[11px] truncate max-w-[130px]">
                      {payment.receivedByName || '—'}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectingReceipt(payment)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="View Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/payments/${payment.id}`)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {canVoid && payment.status === 'Completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVoidingPayment(payment);
                              setVoidReason('');
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                            title="Void Payment"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <PaymentModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={(newPayment) => {
            setPayments((prev) => [newPayment, ...prev]);
            success(`Payment ${newPayment.paymentNumber} recorded successfully!`);
          }}
        />
      )}

      {/* Payment Receipt Modal */}
      {inspectingReceipt && (
        <PaymentReceiptModal
          isOpen={Boolean(inspectingReceipt)}
          onClose={() => setInspectingReceipt(null)}
          payment={inspectingReceipt}
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
                  <strong>{voidingPayment.invoiceNumber}</strong>
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
                placeholder="Enter audit reason for voiding this payment (e.g. incorrect amount, payment chargeback, duplicate entry)..."
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

export default PaymentsPage;
