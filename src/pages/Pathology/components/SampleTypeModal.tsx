import React, { useState, useEffect, useRef } from 'react';
import { X, TestTube, Edit3, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  SampleTypeDto,
  CreateSampleTypeRequest,
  UpdateSampleTypeRequest,
} from '../../../types/sampleType';
import type { AppError } from '../../../types/api';

interface SampleTypeModalProps {
  isOpen: boolean;
  sampleType: SampleTypeDto | null; // null for Create, sampleType object for Edit
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateSampleTypeRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateSampleTypeRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  name: string;
  code: string;
  description: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  description?: string;
}

interface SampleTypeFormContentProps {
  sampleType: SampleTypeDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateSampleTypeRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateSampleTypeRequest) => Promise<void>;
  onClearError: () => void;
}

const SampleTypeFormContent: React.FC<SampleTypeFormContentProps> = ({
  sampleType,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(sampleType);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: sampleType?.name || '',
    code: sampleType?.code || '',
    description: sampleType?.description || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim();

    if (!trimmedName) {
      errors.name = 'Sample type name is required.';
    } else if (trimmedName.length > 150) {
      errors.name = 'Sample type name must not exceed 150 characters.';
    }

    if (!trimmedCode) {
      errors.code = 'Sample type code is required.';
    } else if (trimmedCode.length > 20) {
      errors.code = 'Sample type code must not exceed 20 characters.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      errors.code = 'Sample type code must contain only letters, numbers, hyphens, or underscores.';
    }

    if (form.description && form.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Auto-uppercase sample type code for consistency
    const updatedValue = name === 'code' ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode && sampleType) {
      const updateDto: UpdateSampleTypeRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        isActive: sampleType.isActive ?? true,
      };
      await onSubmitUpdate(sampleType.id, updateDto);
    } else {
      const createDto: CreateSampleTypeRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Sample Type' : 'New Sample Type';
  const subtitle = isEditMode
    ? `Update biological specimen configuration for code ${sampleType?.code}`
    : 'Configure a new biological specimen type (e.g., Whole Blood, Serum, Urine).';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <TestTube className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="sample-type-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
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

      {/* Server / Validation Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Sample Type Name */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="sample-name" className="text-xs font-semibold text-slate-700">
              Sample Type Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.name.length}/150
            </span>
          </div>
          <input
            ref={nameInputRef}
            id="sample-name"
            name="name"
            type="text"
            required
            maxLength={150}
            placeholder="e.g., Whole Blood, Serum, Plasma, Urine, CSF"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
              formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.name && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Sample Type Code */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="sample-code" className="text-xs font-semibold text-slate-700">
              Sample Type Code <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.code.length}/20
            </span>
          </div>
          <input
            id="sample-code"
            name="code"
            type="text"
            required
            maxLength={20}
            placeholder="e.g., BLOOD, SERUM, PLASMA, URINE"
            value={form.code}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm font-mono uppercase tracking-wide border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
              formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          <p className="text-[11px] text-slate-500">
            Unique hospital specimen code (uppercase alphanumeric, max 20 chars).
          </p>
          {formErrors.code && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.code}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="sample-description" className="text-xs font-semibold text-slate-700">
              Description & Collection Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.description.length}/500
            </span>
          </div>
          <textarea
            id="sample-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Collection tube, preservation requirements, fasting instructions, etc..."
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none transition-colors ${
              formErrors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.description && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <TestTube className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Sample Type'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const SampleTypeModal: React.FC<SampleTypeModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, sampleType } = props;

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
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
      aria-labelledby="sample-type-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by sampleType id to reset state cleanly on open */}
      <SampleTypeFormContent
        key={sampleType ? `edit-${sampleType.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};
