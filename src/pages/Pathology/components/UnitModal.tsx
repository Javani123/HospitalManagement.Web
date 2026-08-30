import React, { useState, useEffect, useRef } from 'react';
import { X, Scale, Edit3, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  PathologyUnitDto,
  CreatePathologyUnitRequest,
  UpdatePathologyUnitRequest,
} from '../../../types/pathologyUnit';
import type { AppError } from '../../../types/api';

interface UnitModalProps {
  isOpen: boolean;
  unit: PathologyUnitDto | null; // null for Create, unit object for Edit
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyUnitRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyUnitRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  name: string;
  code: string;
  symbol: string;
  description: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  symbol?: string;
  description?: string;
}

interface UnitFormContentProps {
  unit: PathologyUnitDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyUnitRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyUnitRequest) => Promise<void>;
  onClearError: () => void;
}

const UnitFormContent: React.FC<UnitFormContentProps> = ({
  unit,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(unit);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: unit?.name || '',
    code: unit?.code || '',
    symbol: unit?.symbol || '',
    description: unit?.description || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim();
    const trimmedSymbol = form.symbol.trim();

    if (!trimmedName) {
      errors.name = 'Unit name is required.';
    } else if (trimmedName.length > 150) {
      errors.name = 'Unit name must not exceed 150 characters.';
    }

    if (!trimmedCode) {
      errors.code = 'Unit code is required.';
    } else if (trimmedCode.length > 20) {
      errors.code = 'Unit code must not exceed 20 characters.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      errors.code = 'Unit code must contain only letters, numbers, hyphens, or underscores.';
    }

    if (!trimmedSymbol) {
      errors.symbol = 'Unit symbol is required.';
    } else if (trimmedSymbol.length > 30) {
      errors.symbol = 'Unit symbol must not exceed 30 characters.';
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
    // Auto-uppercase unit code for consistency
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

    if (isEditMode && unit) {
      const updateDto: UpdatePathologyUnitRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        symbol: form.symbol.trim(),
        description: form.description.trim() || undefined,
        isActive: unit.isActive ?? true,
      };
      await onSubmitUpdate(unit.id, updateDto);
    } else {
      const createDto: CreatePathologyUnitRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        symbol: form.symbol.trim(),
        description: form.description.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Measurement Unit' : 'New Measurement Unit';
  const subtitle = isEditMode
    ? `Update measurement unit configuration for code ${unit?.code}`
    : 'Configure a clinical measurement unit (e.g., mg/dL, g/dL, IU/L, %).';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="unit-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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
        {/* Unit Name */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="unit-name" className="text-xs font-semibold text-slate-700">
              Unit Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.name.length}/150
            </span>
          </div>
          <input
            ref={nameInputRef}
            id="unit-name"
            name="name"
            type="text"
            required
            maxLength={150}
            placeholder="e.g., Milligrams per Deciliter, Grams per Deciliter"
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

        {/* Unit Code & Symbol Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit Code */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="unit-code" className="text-xs font-semibold text-slate-700">
                Unit Code <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.code.length}/20
              </span>
            </div>
            <input
              id="unit-code"
              name="code"
              type="text"
              required
              maxLength={20}
              placeholder="e.g., MGDL, GDL, IUL"
              value={form.code}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm font-mono uppercase tracking-wide border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.code && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.code}
              </p>
            )}
          </div>

          {/* Unit Symbol */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="unit-symbol" className="text-xs font-semibold text-slate-700">
                Symbol / Display <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.symbol.length}/30
              </span>
            </div>
            <input
              id="unit-symbol"
              name="symbol"
              type="text"
              required
              maxLength={30}
              placeholder="e.g., mg/dL, g/dL, %"
              value={form.symbol}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm font-semibold border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.symbol ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.symbol && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.symbol}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="unit-description" className="text-xs font-semibold text-slate-700">
              Description & Clinical Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.description.length}/500
            </span>
          </div>
          <textarea
            id="unit-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Reference context, international standard, or conversion notes..."
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Unit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const UnitModal: React.FC<UnitModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, unit } = props;

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
      aria-labelledby="unit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by unit id to reset state cleanly on open */}
      <UnitFormContent
        key={unit ? `edit-${unit.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};
