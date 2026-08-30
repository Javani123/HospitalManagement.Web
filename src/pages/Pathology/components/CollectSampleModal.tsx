import React, { useState, useEffect, useRef } from 'react';
import { X, Pipette, FlaskConical } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type { PathologyLabOrderItemDto } from '../../../types/pathologyLabOrder';
import type { CollectSampleRequest } from '../../../types/pathologySample';
import type { AppError } from '../../../types/api';

interface CollectSampleModalProps {
  isOpen: boolean;
  orderItem: PathologyLabOrderItemDto | null;
  orderNumber: string;
  patientName: string;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmit: (dto: CollectSampleRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  collectedBy: string;
  notes: string;
}

interface FormErrors {
  collectedBy?: string;
  notes?: string;
}

interface CollectFormContentProps extends CollectSampleModalProps {}

const CollectFormContent: React.FC<CollectFormContentProps> = ({
  orderItem,
  orderNumber,
  patientName,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onClearError,
}) => {
  const collectedByRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    collectedBy: '',
    notes: '',
  }));
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    collectedByRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (form.collectedBy.length > 200) {
      errs.collectedBy = 'Collector name must not exceed 200 characters.';
    }
    if (form.notes.length > 1000) {
      errs.notes = 'Notes must not exceed 1000 characters.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) onClearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !orderItem) return;

    await onSubmit({
      pathologyLabOrderItemId: orderItem.id,
      collectedBy: form.collectedBy.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  if (!orderItem) return null;

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Pipette className="w-5 h-5" />
          </div>
          <div>
            <h2 id="collect-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              Collect Specimen
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accession will be generated server-side (SAM######)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context panel */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-violet-500 shrink-0" />
          <div className="font-semibold text-slate-900">{orderItem.testNameSnapshot}</div>
          <span className="font-mono text-xs text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200/60">
            {orderItem.testCodeSnapshot}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Order:</span>{' '}
            <span className="font-mono font-semibold text-blue-700">{orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400">Patient:</span>{' '}
            <span className="font-medium text-slate-900">{patientName}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Sample type will be resolved by the server from the test's master configuration.
        </p>
      </div>

      {/* Error */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Collected By */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="collect-by" className="text-xs font-semibold text-slate-700">
              Collected By{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.collectedBy.length}/200
            </span>
          </div>
          <input
            ref={collectedByRef}
            id="collect-by"
            name="collectedBy"
            type="text"
            maxLength={200}
            placeholder="e.g., Dr. Smith, Lab Tech — Jane"
            value={form.collectedBy}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-colors ${
              formErrors.collectedBy ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.collectedBy && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.collectedBy}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="collect-notes" className="text-xs font-semibold text-slate-700">
              Collection Notes{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.notes.length}/1000
            </span>
          </div>
          <textarea
            id="collect-notes"
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="Collection conditions, patient state, difficult draw, etc."
            value={form.notes}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 resize-none transition-colors ${
              formErrors.notes ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.notes && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Pipette className="w-4 h-4" />}
          >
            Collect Specimen
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CollectSampleModal: React.FC<CollectSampleModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, orderItem } = props;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !orderItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collect-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <CollectFormContent
        key={`collect-${orderItem.id}`}
        {...props}
      />
    </div>
  );
};
