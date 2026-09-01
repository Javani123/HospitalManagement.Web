import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Calendar, User, FlaskConical } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { pathologyLabOrderService } from '../../../services/pathologyLabOrderService';
import { invoiceService } from '../../../services/invoiceService';
import type { PathologyLabOrderDto } from '../../../types/pathologyLabOrder';
import type { InvoiceDto } from '../../../types/invoice';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: InvoiceDto) => void;
  preselectedOrderId?: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedOrderId,
}) => {
  const [orders, setOrders] = useState<PathologyLabOrderDto[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>(
    preselectedOrderId || ''
  );
  const [selectedOrder, setSelectedOrder] = useState<PathologyLabOrderDto | null>(null);
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      setDiscountAmount('0');
      setNotes('');
      const initialId = preselectedOrderId || '';
      setSelectedOrderId(initialId);

      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const list = await pathologyLabOrderService.getAll();
          setOrders(list);
          if (initialId) {
            const found = list.find((o) => o.id === initialId);
            setSelectedOrder(found || null);
          } else {
            setSelectedOrder(null);
          }
        } catch {
          setError('Failed to load lab orders.');
        } finally {
          setLoadingOrders(false);
        }
      };

      void fetchOrders();
    }
  }, [isOpen, preselectedOrderId]);

  // Update selected order details
  const handleOrderChange = (orderIdNum: number | '') => {
    setSelectedOrderId(orderIdNum);
    setError(null);
    setFieldErrors({});
    if (typeof orderIdNum === 'number') {
      const found = orders.find((o) => o.id === orderIdNum);
      setSelectedOrder(found || null);
    } else {
      setSelectedOrder(null);
    }
  };

  // Financial preview calculation
  const subtotal = selectedOrder ? Number(selectedOrder.totalOrderValue || 0) : 0;
  const discount = parseFloat(discountAmount) || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedOrderId) {
      errs.order = 'Please select a lab order to invoice.';
    }

    if (isNaN(discount) || discount < 0) {
      errs.discount = 'Discount cannot be negative.';
    } else if (discount > subtotal) {
      errs.discount = `Discount ($${discount.toFixed(2)}) cannot exceed subtotal ($${subtotal.toFixed(2)}).`;
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedOrderId) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await invoiceService.create({
        pathologyLabOrderId: Number(selectedOrderId),
        discountAmount: discount,
        notes: notes.trim() || null,
      });

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to create invoice.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Laboratory Invoice"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorAlert error={error} />}

        {/* 1. Lab Order Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Lab Order <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedOrderId}
            onChange={(e) =>
              handleOrderChange(e.target.value ? Number(e.target.value) : '')
            }
            disabled={loadingOrders || submitting || Boolean(preselectedOrderId)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.order
                ? 'border-rose-300 focus:ring-rose-200'
                : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
            }`}
          >
            <option value="">
              {loadingOrders ? 'Loading lab orders...' : '-- Select Lab Order --'}
            </option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.patientName} (${Number(o.totalOrderValue).toFixed(2)}) [{o.status}]
              </option>
            ))}
          </select>
          {fieldErrors.order && (
            <p className="mt-1 text-xs text-rose-500">{fieldErrors.order}</p>
          )}
        </div>

        {/* 2. Selected Order Breakdown */}
        {selectedOrder && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  {selectedOrder.patientName}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  ({selectedOrder.patientNumber})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Test Items Table */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ordered Diagnostic Tests ({selectedOrder.items?.length || 0})</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Test Name</th>
                      <th className="px-3 py-2 text-center font-semibold">Code</th>
                      <th className="px-3 py-2 text-right font-semibold">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {item.testNameSnapshot}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">
                          {item.testCodeSnapshot}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-slate-800">
                          ${Number(item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Discount Amount & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Discount Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={subtotal || undefined}
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  if (fieldErrors.discount) {
                    setFieldErrors((prev) => ({ ...prev, discount: '' }));
                  }
                }}
                disabled={submitting || !selectedOrder}
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-semibold bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.discount
                    ? 'border-rose-300 focus:ring-rose-200'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder="0.00"
              />
            </div>
            {fieldErrors.discount && (
              <p className="mt-1 text-xs text-rose-500">{fieldErrors.discount}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Cannot exceed subtotal (${subtotal.toFixed(2)})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Billing Remarks / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              maxLength={500}
              placeholder="e.g. Standard outpatient billing"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* 4. Financial Calculation Summary Preview */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">
            Financial Summary Preview
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Gross Subtotal:</span>
              <span className="font-mono font-semibold text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>Applied Discount:</span>
              <span className="font-mono font-semibold">
                -${discount.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700/80 flex justify-between text-sm font-bold text-white">
              <span>Invoice Grand Total:</span>
              <span className="font-mono text-emerald-400 text-base">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notice on Backend Authority */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            The invoice number and final financials are authoritatively generated by the server. An active lab order can only have one active invoice.
          </span>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !selectedOrderId}
            className="flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>{submitting ? 'Generating Invoice...' : 'Generate Invoice'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceModal;
