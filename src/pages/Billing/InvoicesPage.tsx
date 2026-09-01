import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { invoiceService } from '../../services/invoiceService';
import { InvoiceModal } from './components/InvoiceModal';
import { PaymentModal } from './components/PaymentModal';
import type { InvoiceDto, InvoiceStatus } from '../../types/invoice';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useAuth();
  const { toasts, success, error: toastError, dismiss } = useToast();
  const isAdmin = hasRole('Admin');
  const canCreate = isAdmin || hasAnyRole(['Accountant', 'Receptionist']);
  const canCancel = isAdmin || hasRole('Accountant');

  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fromFilterDate, setFromFilterDate] = useState<string>('');
  const [toFilterDate, setToFilterDate] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [cancellingInvoice, setCancellingInvoice] = useState<InvoiceDto | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<InvoiceDto | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getAll({
        fromInvoiceDate: fromFilterDate || undefined,
        toInvoiceDate: toFilterDate || undefined,
      });
      setInvoices(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load invoices.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fromFilterDate, toFilterDate]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // KPI Calculations based purely on backend returned data
  const kpis = useMemo(() => {
    const total = invoices.length;
    const issued = invoices.filter((i) => i.status === 'Issued').length;
    const partiallyPaid = invoices.filter((i) => i.status === 'PartiallyPaid').length;
    const paid = invoices.filter((i) => i.status === 'Paid').length;
    const cancelled = invoices.filter((i) => i.status === 'Cancelled').length;

    const nonCancelled = invoices.filter((i) => i.status !== 'Cancelled');
    const totalBilled = nonCancelled.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
    const totalOutstanding = nonCancelled.reduce(
      (sum, i) => sum + Number(i.outstandingAmount || 0),
      0
    );

    return {
      total,
      issued,
      partiallyPaid,
      paid,
      cancelled,
      totalBilled,
      totalOutstanding,
    };
  }, [invoices]);

  // Client-side filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search match
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(term);
        const matchOrder = inv.orderNumber?.toLowerCase().includes(term);
        const matchPatient = inv.patientName?.toLowerCase().includes(term);
        const matchPatientNo = inv.patientNumber?.toLowerCase().includes(term);
        if (!matchNumber && !matchOrder && !matchPatient && !matchPatientNo) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingInvoice) return;

    setIsCancelling(true);
    try {
      const updated = await invoiceService.cancel(cancellingInvoice.id, cancelReason);
      setInvoices((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
      success(`Invoice ${updated.invoiceNumber} cancelled successfully.`);
      setCancellingInvoice(null);
      setCancelReason('');
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

  const getStatusBadge = (status: InvoiceStatus | string) => {
    switch (status) {
      case 'Issued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            Issued
          </span>
        );
      case 'PartiallyPaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <TrendingUp className="w-3 h-3 text-amber-500" />
            Partially Paid
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Paid
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3 h-3 text-slate-400" />
            Cancelled
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
        title="Billing & Invoices"
        subtitle="Manage laboratory billing, invoice issuance, outstanding balances, and invoice lifecycle."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Billing', path: '/invoices' },
          { label: 'Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/payments')}
              className="flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments & Receipts</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadInvoices()}
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
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </Button>
            )}
          </div>
        }
      />

      {error && <ErrorAlert error={error} />}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total</span>
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-800">{kpis.total}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Issued</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-600">{kpis.issued}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Partial</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-600">{kpis.partiallyPaid}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Paid</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{kpis.paid}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cancelled</span>
            <Ban className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-500">{kpis.cancelled}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Billed</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-800">
            ${kpis.totalBilled.toFixed(2)}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Outstanding</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-lg font-bold font-mono text-rose-600">
            ${kpis.totalOutstanding.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Invoice #, Order #, Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>From:</span>
              <input
                type="date"
                value={fromFilterDate}
                onChange={(e) => setFromFilterDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>To:</span>
              <input
                type="date"
                value={toFilterDate}
                onChange={(e) => setToFilterDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {[
            { key: 'ALL', label: 'All Invoices' },
            { key: 'Issued', label: 'Issued' },
            { key: 'PartiallyPaid', label: 'Partially Paid' },
            { key: 'Paid', label: 'Paid' },
            { key: 'Cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search filters or status selection.'
                : 'Generate your first laboratory invoice from an active Lab Order.'}
            </p>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Lab Order</th>
                  <th className="py-3.5 px-4">Invoice Date</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 text-right">Discount</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Billed By</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="hover:underline flex items-center gap-1 text-left"
                      >
                        <Receipt className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{inv.invoiceNumber}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {inv.patientName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {inv.patientNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/pathology/lab-orders/${inv.pathologyLabOrderId}`)
                        }
                        className="hover:underline hover:text-blue-600"
                      >
                        {inv.orderNumber}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${Number(inv.subtotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-rose-600">
                      {inv.discountAmount > 0
                        ? `-$${Number(inv.discountAmount).toFixed(2)}`
                        : '$0.00'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${Number(inv.grandTotal).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                      ${Number(inv.paidAmount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      {Number(inv.outstandingAmount) > 0 ? (
                        <span className="text-rose-600">
                          ${Number(inv.outstandingAmount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[120px]">
                      {inv.createdByName || '—'}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="View Invoice Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {canCreate &&
                          inv.status !== 'Cancelled' &&
                          inv.status !== 'Paid' &&
                          Number(inv.outstandingAmount) > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPaymentModalInvoice(inv)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </Button>
                          )}

                        {canCancel &&
                          inv.status !== 'Cancelled' &&
                          inv.paidAmount === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCancellingInvoice(inv);
                                setCancelReason('');
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                              title="Cancel Invoice"
                            >
                              <XCircle className="w-3.5 h-3.5" />
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

      {/* Invoice Generation Modal */}
      {isCreateModalOpen && (
        <InvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newInvoice) => {
            setInvoices((prev) => [newInvoice, ...prev]);
            success(
              `Invoice ${newInvoice.invoiceNumber} created successfully!`
            );
          }}
        />
      )}

      {/* Payment Settlement Modal */}
      {paymentModalInvoice && (
        <PaymentModal
          isOpen={Boolean(paymentModalInvoice)}
          onClose={() => setPaymentModalInvoice(null)}
          preselectedInvoice={paymentModalInvoice}
          preselectedInvoiceId={paymentModalInvoice.id}
          onSuccess={(_newPayment) => {
            void loadInvoices();
            success(
              `Payment recorded successfully for invoice ${paymentModalInvoice.invoiceNumber}!`
            );
            setPaymentModalInvoice(null);
          }}
        />
      )}

      {/* Cancel Invoice Confirmation Modal */}
      {cancellingInvoice && (
        <Modal
          isOpen={Boolean(cancellingInvoice)}
          onClose={() => setCancellingInvoice(null)}
          title="Cancel Invoice?"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <p className="font-bold">
                  Are you sure you want to cancel invoice{' '}
                  <span className="font-mono">{cancellingInvoice.invoiceNumber}</span>?
                </p>
                <p>
                  Patient: <strong>{cancellingInvoice.patientName}</strong> | Grand Total:{' '}
                  <strong>${Number(cancellingInvoice.grandTotal).toFixed(2)}</strong>
                </p>
                <p className="text-rose-700">
                  This action marks the invoice as cancelled for historical audit purposes. It cannot be undone.
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
                placeholder="e.g. Patient decided to postpone tests, incorrect order items, etc."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingInvoice(null)}
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
    </div>
  );
};

export default InvoicesPage;

