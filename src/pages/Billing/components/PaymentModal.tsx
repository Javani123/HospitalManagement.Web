import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  User,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { paymentService } from '../../../services/paymentService';
import { invoiceService } from '../../../services/invoiceService';
import type { InvoiceDto } from '../../../types/invoice';
import { PaymentMethod, type PaymentDto } from '../../../types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: PaymentDto) => void;
  preselectedInvoiceId?: number;
  preselectedInvoice?: InvoiceDto | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedInvoiceId,
  preselectedInvoice,
}) => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>(
    preselectedInvoiceId || ''
  );
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(
    preselectedInvoice || null
  );
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

  // Form Fields
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    invoice?: string;
    amount?: string;
    paymentMethod?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      setReferenceNumber('');
      setNotes('');
      setPaymentMethod(PaymentMethod.Cash);

      if (preselectedInvoice) {
        setSelectedInvoice(preselectedInvoice);
        setSelectedInvoiceId(preselectedInvoice.id);
        setAmount(String(preselectedInvoice.outstandingAmount || ''));
      } else if (preselectedInvoiceId) {
        setSelectedInvoiceId(preselectedInvoiceId);
      } else {
        setSelectedInvoice(null);
        setSelectedInvoiceId('');
        setAmount('');
      }
    }
  }, [isOpen, preselectedInvoice, preselectedInvoiceId]);

  // Load unpaid / partially paid invoices if not preselected
  const loadEligibleInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const allInvoices = await invoiceService.getAll();
      // Filter for active invoices with outstanding balance
      const eligible = allInvoices.filter(
        (i) =>
          i.status !== 'Cancelled' &&
          i.status !== 'Paid' &&
          Number(i.outstandingAmount) > 0
      );
      setInvoices(eligible);
    } catch {
      // Fallback
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !preselectedInvoice) {
      void loadEligibleInvoices();
    }
  }, [isOpen, preselectedInvoice, loadEligibleInvoices]);

  // Handle invoice change
  const handleInvoiceChange = async (invId: number | '') => {
    setSelectedInvoiceId(invId);
    setError(null);
    setFieldErrors({});

    if (!invId) {
      setSelectedInvoice(null);
      setAmount('');
      return;
    }

    const found = invoices.find((i) => i.id === invId);
    if (found) {
      setSelectedInvoice(found);
      setAmount(String(found.outstandingAmount || ''));
    } else {
      try {
        const full = await invoiceService.getById(invId);
        setSelectedInvoice(full);
        setAmount(String(full.outstandingAmount || ''));
      } catch {
        setSelectedInvoice(null);
        setAmount('');
      }
    }
  };

  const handlePayFullOutstanding = () => {
    if (selectedInvoice) {
      setAmount(String(selectedInvoice.outstandingAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errs: { invoice?: string; amount?: string; paymentMethod?: string } = {};

    if (!selectedInvoiceId || !selectedInvoice) {
      errs.invoice = 'Please select an invoice to settle.';
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Payment amount must be greater than $0.00.';
    } else if (selectedInvoice && parsedAmount > selectedInvoice.outstandingAmount) {
      errs.amount = `Payment amount cannot exceed remaining outstanding balance of $${Number(
        selectedInvoice.outstandingAmount
      ).toFixed(2)}.`;
    }

    if (!paymentMethod) {
      errs.paymentMethod = 'Please select a payment method.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const created = await paymentService.create({
        invoiceId: Number(selectedInvoiceId),
        amount: parsedAmount,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to record payment.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Settlement"
      subtitle="Collect payment against an outstanding hospital invoice."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorAlert error={error} />}

        {/* 1. Invoice Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Invoice <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedInvoiceId}
            onChange={(e) =>
              handleInvoiceChange(e.target.value ? Number(e.target.value) : '')
            }
            disabled={loadingInvoices || submitting || Boolean(preselectedInvoiceId)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.invoice
                ? 'border-rose-300 focus:ring-rose-200'
                : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
            }`}
          >
            <option value="">
              {loadingInvoices
                ? 'Loading eligible invoices...'
                : '-- Select Outstanding Invoice --'}
            </option>
            {preselectedInvoice && !invoices.some((i) => i.id === preselectedInvoice.id) && (
              <option value={preselectedInvoice.id}>
                {preselectedInvoice.invoiceNumber} — {preselectedInvoice.patientName} (Outstanding: $
                {Number(preselectedInvoice.outstandingAmount).toFixed(2)})
              </option>
            )}
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.patientName} (Outstanding: $
                {Number(inv.outstandingAmount).toFixed(2)}) [{inv.status}]
              </option>
            ))}
          </select>
          {fieldErrors.invoice && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {fieldErrors.invoice}
            </p>
          )}
        </div>

        {/* 2. Selected Invoice Financial Summary Card */}
        {selectedInvoice && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">
                  {selectedInvoice.patientName}
                </span>
                <span className="font-mono text-slate-400">
                  ({selectedInvoice.patientNumber})
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                <span>{selectedInvoice.invoiceNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Grand Total
                </span>
                <span className="font-bold font-mono text-slate-800">
                  ${Number(selectedInvoice.grandTotal).toFixed(2)}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Already Paid
                </span>
                <span className="font-bold font-mono text-emerald-600">
                  ${Number(selectedInvoice.paidAmount).toFixed(2)}
                </span>
              </div>

              <div className="p-2 bg-rose-50/70 rounded-lg border border-rose-100">
                <span className="text-rose-600 block text-[10px] font-semibold uppercase">
                  Outstanding Balance
                </span>
                <span className="font-bold font-mono text-rose-700">
                  ${Number(selectedInvoice.outstandingAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Payment Amount Field with Quick Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Amount ($) <span className="text-rose-500">*</span>
            </label>
            {selectedInvoice && Number(selectedInvoice.outstandingAmount) > 0 && (
              <button
                type="button"
                onClick={handlePayFullOutstanding}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                Pay Full (${Number(selectedInvoice.outstandingAmount).toFixed(2)})
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
              $
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={selectedInvoice ? selectedInvoice.outstandingAmount : undefined}
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setFieldErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              disabled={submitting || !selectedInvoice}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.amount
                  ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500 text-slate-900'
              }`}
            />
          </div>
          {fieldErrors.amount && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {fieldErrors.amount}
            </p>
          )}
        </div>

        {/* 4. Payment Method & Reference Number Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(Number(e.target.value) as PaymentMethod)}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value={PaymentMethod.Cash}>Cash</option>
              <option value={PaymentMethod.Card}>Credit / Debit Card</option>
              <option value={PaymentMethod.BankTransfer}>Bank Transfer / NEFT / RTGS</option>
              <option value={PaymentMethod.UPI}>UPI / QR Code</option>
              <option value={PaymentMethod.Insurance}>Health Insurance Claim</option>
              <option value={PaymentMethod.Cheque}>Cheque / Demand Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reference / Trx Number
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-987654, Card Auth 1234"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={submitting}
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 5. Notes / Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Remarks / Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Additional settlement notes or cashier remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            maxLength={500}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting || !selectedInvoice || Number(selectedInvoice.outstandingAmount) <= 0}
            className="flex items-center gap-1.5 min-w-[140px] justify-center"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
