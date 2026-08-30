import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type { RejectSampleRequest } from '../../../types/pathologySample';
import type { AppError } from '../../../types/api';

interface RejectSampleModalProps {
  isOpen: boolean;
  sampleNumber: string;
  testName: string;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmit: (dto: RejectSampleRequest) => Promise<void>;
  onClearError: () => void;
}

interface RejectFormContentProps extends RejectSampleModalProps {}

const RejectFormContent: React.FC<RejectFormContentProps> = ({
  sampleNumber,
  testName,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onClearError,
}) => {
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();

  useEffect(() => {
    reasonRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError('Rejection reason is required.');
      return;
    }
    if (trimmed.length > 500) {
      setReasonError('Rejection reason must not exceed 500 characters.');
      return;
    }
    setReasonError(undefined);
    await onSubmit({ reason: trimmed });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (reasonError) setReasonError(undefined);
    if (error) onClearError();
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-rose-200/60 w-full max-w-md p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="reject-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              Reject Sample
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              This action is permanent and creates an audit record.
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

      {/* Sample info */}
      <div className="p-3 bg-rose-50/60 border border-rose-200/60 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-rose-700">{sampleNumber}</span>
          <span className="text-slate-400">·</span>
          <span className="font-medium text-slate-700">{testName}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Sample will be permanently marked as Rejected. The specimen must be recollected.
        </p>
      </div>

      {/* Error */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="reject-reason" className="text-xs font-semibold text-slate-700">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {reason.length}/500
            </span>
          </div>
          <textarea
            ref={reasonRef}
            id="reject-reason"
            name="reason"
            rows={4}
            maxLength={500}
            required
            placeholder='e.g., "Insufficient volume", "Haemolysed sample", "Wrong tube used", "Clotted sample"'
            value={reason}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-describedby={reasonError ? 'reject-reason-error' : undefined}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-400 resize-none transition-colors ${
              reasonError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {reasonError && (
            <p id="reject-reason-error" className="text-xs text-rose-600 mt-0.5" role="alert">
              {reasonError}
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
            variant="danger"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </div>
  );
};

export const RejectSampleModal: React.FC<RejectSampleModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, sampleNumber } = props;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <RejectFormContent
        key={`reject-${sampleNumber}`}
        {...props}
      />
    </div>
  );
};
