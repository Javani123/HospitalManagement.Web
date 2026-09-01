import React from 'react';
import {
  Printer,
  Receipt,
  CheckCircle2,
  Ban,
  Building2,
  Calendar,
  CreditCard,
  User,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useTenant } from '../../../hooks/useTenant';
import type { PaymentDto } from '../../../types/payment';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentDto | null;
  patientName?: string;
  patientNumber?: string;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  patientName,
  patientNumber,
}) => {
  const { tenant } = useTenant();

  if (!payment) return null;

  const isVoided = payment.status === 'Voided';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Settlement Receipt"
      subtitle={`Receipt #${payment.paymentNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Printable Receipt Container */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs print:border-none print:p-0 print:shadow-none space-y-6">
          {/* Receipt Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {tenant?.hospitalName || 'CareSync Medical Center'}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Hospital Code: {tenant?.hospitalCode || 'HOSP-001'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="flex items-center sm:justify-end gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {payment.paymentNumber}
                </span>
                {isVoided ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Ban className="w-3 h-3 text-rose-500" />
                    Voided
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(payment.paymentDate).toLocaleDateString()} at{' '}
                {new Date(payment.paymentDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Void Alert Banner (If Voided) */}
          {isVoided && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>This payment transaction has been VOIDED</span>
              </div>
              <p>
                <strong>Reason:</strong> {payment.voidReason || 'Not specified'}
              </p>
              {payment.voidedByName && (
                <p className="text-rose-700">
                  Voided by: <strong>{payment.voidedByName}</strong> on{' '}
                  {payment.voidedAt
                    ? new Date(payment.voidedAt).toLocaleDateString()
                    : '—'}
                </p>
              )}
            </div>
          )}

          {/* Patient & Invoice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Details</span>
              </div>
              <div className="font-bold text-sm text-slate-900">
                {patientName || 'Patient Record'}
              </div>
              {patientNumber && (
                <div className="text-xs font-mono text-slate-500">
                  MRN: {patientNumber}
                </div>
              )}
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                <span>Linked Invoice</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900">
                {payment.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500">
                Invoice ID: #{payment.invoiceId}
              </div>
            </div>
          </div>

          {/* Amount Paid Highlight Box */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/80 rounded-2xl p-5 text-center">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              Amount Paid
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-700">
              ${Number(payment.amount).toFixed(2)}
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              Settlement via {payment.paymentMethod}
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1 mb-0.5">
                <CreditCard className="w-3 h-3 text-slate-400" />
                Payment Method
              </span>
              <span className="font-bold text-slate-800">{payment.paymentMethod}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3 text-slate-400" />
                Reference / Trx ID
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {payment.referenceNumber || '—'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[11px] font-medium flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3 text-slate-400" />
                Cashier / Received By
              </span>
              <span className="font-semibold text-slate-800">
                {payment.receivedByName || 'Billing Desk'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500 block text-[11px] font-medium mb-0.5">
                Payment Remarks
              </span>
              <p className="text-slate-700 italic">{payment.notes}</p>
            </div>
          )}

          {/* Footer Receipt Disclaimer */}
          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Computer generated payment receipt. CareSync Hospital Management System.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
