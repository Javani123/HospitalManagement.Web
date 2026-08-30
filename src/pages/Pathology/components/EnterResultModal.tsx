import React, { useState, useEffect, useRef } from 'react';
import { X, FlaskConical, Edit3, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  PathologyResultDto,
  EnterResultRequest,
} from '../../../types/pathologyResult';
import type { AppError } from '../../../types/api';

interface EnterResultModalProps {
  isOpen: boolean;
  result: PathologyResultDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmit: (id: number, dto: EnterResultRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  resultValue: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  remarks: string;
  enteredBy: string;
}

interface FormErrors {
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  remarks?: string;
  enteredBy?: string;
}

interface FormContentProps extends EnterResultModalProps {}

const EnterResultFormContent: React.FC<FormContentProps> = ({
  result,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onClearError,
}) => {
  const resultInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    resultValue: result?.resultValue || '',
    unit: result?.unit || '',
    referenceRange: result?.referenceRange || '',
    interpretation: result?.interpretation || '',
    remarks: result?.remarks || '',
    enteredBy: result?.enteredBy || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    resultInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const trimmedVal = form.resultValue.trim();

    if (!trimmedVal) {
      errs.resultValue = 'Result value is required.';
    } else if (trimmedVal.length > 200) {
      errs.resultValue = 'Result value must not exceed 200 characters.';
    }

    if (form.unit && form.unit.length > 50) {
      errs.unit = 'Unit must not exceed 50 characters.';
    }

    if (form.referenceRange && form.referenceRange.length > 200) {
      errs.referenceRange = 'Reference range must not exceed 200 characters.';
    }

    if (form.interpretation && form.interpretation.length > 100) {
      errs.interpretation = 'Interpretation must not exceed 100 characters.';
    }

    if (form.remarks && form.remarks.length > 1000) {
      errs.remarks = 'Remarks must not exceed 1000 characters.';
    }

    if (form.enteredBy && form.enteredBy.length > 200) {
      errs.enteredBy = 'Entered by must not exceed 200 characters.';
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
    if (!validate() || !result) return;

    await onSubmit(result.id, {
      resultValue: form.resultValue.trim(),
      unit: form.unit.trim() || undefined,
      referenceRange: form.referenceRange.trim() || undefined,
      interpretation: form.interpretation.trim() || undefined,
      remarks: form.remarks.trim() || undefined,
      enteredBy: form.enteredBy.trim() || undefined,
    });
  };

  if (!result) return null;

  const isCorrection = result.status === 'ResultEntered';
  const title = isCorrection ? 'Edit / Correct Result Values' : 'Enter Diagnostic Result Values';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {isCorrection ? <Edit3 className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="result-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reference range evaluation (M12) runs automatically on submission.
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

      {/* Context Badge Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{result.testName}</span>
            <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
              {result.testCode}
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            {result.sampleTypeName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Sample:</span>{' '}
            <span className="font-mono font-semibold text-violet-700">{result.sampleNumber}</span>
          </div>
          <div>
            <span className="text-slate-400">Patient:</span>{' '}
            <span className="font-medium text-slate-900">{result.patientName}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Result Value & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="res-value" className="text-xs font-semibold text-slate-700">
                Observed / Measured Result Value <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.resultValue.length}/200
              </span>
            </div>
            <input
              ref={resultInputRef}
              id="res-value"
              name="resultValue"
              type="text"
              required
              placeholder='e.g., "14.2", "110", "Negative", "Positive"'
              value={form.resultValue}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm font-semibold border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors ${
                formErrors.resultValue ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.resultValue && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.resultValue}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="res-unit" className="text-xs font-semibold text-slate-700">
              Unit <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="res-unit"
              name="unit"
              type="text"
              maxLength={50}
              placeholder="e.g., g/dL, mg/dL, %"
              value={form.unit}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Reference Range Snapshot & Interpretation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="res-ref-range" className="text-xs font-semibold text-slate-700">
              Reference Range Snapshot <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="res-ref-range"
              name="referenceRange"
              type="text"
              maxLength={200}
              placeholder="e.g., 13.0 - 17.0 g/dL"
              value={form.referenceRange}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
            />
            <p className="text-[10px] text-slate-400">
              Leave blank to auto-derive from matched reference range.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="res-interp" className="text-xs font-semibold text-slate-700">
              Clinical Interpretation <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="res-interp"
              name="interpretation"
              type="text"
              maxLength={100}
              placeholder="e.g., Normal, Borderline, Reactive"
              value={form.interpretation}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        {/* Row 3: Entered By */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="res-entered-by" className="text-xs font-semibold text-slate-700">
              Entered By / Laboratory Technician <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.enteredBy.length}/200
            </span>
          </div>
          <input
            id="res-entered-by"
            name="enteredBy"
            type="text"
            maxLength={200}
            placeholder="e.g., Lab Tech — Alex"
            value={form.enteredBy}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* Row 4: Remarks */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="res-remarks" className="text-xs font-semibold text-slate-700">
              Technical Remarks & Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.remarks.length}/1000
            </span>
          </div>
          <textarea
            id="res-remarks"
            name="remarks"
            rows={3}
            maxLength={1000}
            placeholder="Analytical methodology, repeats, specimen condition notes..."
            value={form.remarks}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-none transition-colors"
          />
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
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isCorrection ? 'Save Changes' : 'Save & Evaluate Result'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const EnterResultModal: React.FC<EnterResultModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, result } = props;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <EnterResultFormContent
        key={`result-modal-${result.id}`}
        {...props}
      />
    </div>
  );
};
