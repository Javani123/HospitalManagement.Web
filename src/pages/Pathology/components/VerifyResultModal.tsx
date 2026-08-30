import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { ResultFlagBadge } from '../../../components/common/ResultFlagBadge';
import type {
  PathologyResultDto,
  VerifyResultRequest,
} from '../../../types/pathologyResult';
import type { AppError } from '../../../types/api';

interface VerifyResultModalProps {
  isOpen: boolean;
  result: PathologyResultDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmit: (id: number, dto: VerifyResultRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormContentProps extends VerifyResultModalProps {}

const VerifyResultFormContent: React.FC<FormContentProps> = ({
  result,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onClearError,
}) => {
  const verifiedByRef = useRef<HTMLInputElement>(null);
  const [verifiedBy, setVerifiedBy] = useState('');
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    verifiedByRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = verifiedBy.trim();
    if (!trimmed) {
      setFormError('Verified By (Pathologist / Senior Reviewer name) is required.');
      return;
    }
    if (trimmed.length > 200) {
      setFormError('Verified by must not exceed 200 characters.');
      return;
    }
    if (!result) return;
    setFormError(undefined);
    await onSubmit(result.id, { verifiedBy: trimmed });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifiedBy(e.target.value);
    if (formError) setFormError(undefined);
    if (error) onClearError();
  };

  if (!result) return null;

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-teal-200/80 w-full max-w-md p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="verify-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              Verify Laboratory Result
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clinical validation before final report release.
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

      {/* Result Verification Summary Box */}
      <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-xl space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">{result.testName}</span>
          <span className="font-mono text-xs text-slate-500">{result.testCode}</span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-teal-200/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Reported Value</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {result.resultValue} {result.unit}
            </span>
          </div>
          <ResultFlagBadge flag={result.resultFlag} size="md" />
        </div>

        {result.referenceRange && (
          <div className="text-xs text-slate-600">
            <span className="text-slate-400">Reference Range:</span>{' '}
            <span className="font-semibold text-slate-800">{result.referenceRange}</span>
          </div>
        )}

        <div className="text-xs text-slate-500">
          Patient: <strong>{result.patientName}</strong> ({result.patientNumber}) | Order:{' '}
          <strong className="font-mono">{result.orderNumber}</strong>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="verify-by" className="text-xs font-semibold text-slate-700">
              Verified By (Pathologist / Senior Reviewer) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {verifiedBy.length}/200
            </span>
          </div>
          <input
            ref={verifiedByRef}
            id="verify-by"
            name="verifiedBy"
            type="text"
            required
            maxLength={200}
            placeholder="e.g., Dr. H. Pathologist, MD"
            value={verifiedBy}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-describedby={formError ? 'verify-by-error' : undefined}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
              formError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formError && (
            <p id="verify-by-error" className="text-xs text-rose-600 mt-0.5" role="alert">
              {formError}
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
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Verify Result
          </Button>
        </div>
      </form>
    </div>
  );
};

export const VerifyResultModal: React.FC<VerifyResultModalProps> = (props) => {
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
      aria-labelledby="verify-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <VerifyResultFormContent
        key={`verify-modal-${result.id}`}
        {...props}
      />
    </div>
  );
};
