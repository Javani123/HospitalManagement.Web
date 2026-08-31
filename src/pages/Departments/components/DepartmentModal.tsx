import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, Edit3, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  DepartmentDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../../../types/department';
import type { AppError } from '../../../types/api';

interface DepartmentModalProps {
  isOpen: boolean;
  department: DepartmentDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateDepartmentRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateDepartmentRequest) => Promise<void>;
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

interface DepartmentFormContentProps {
  department: DepartmentDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateDepartmentRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateDepartmentRequest) => Promise<void>;
  onClearError: () => void;
}

const DepartmentFormContent: React.FC<DepartmentFormContentProps> = ({
  department,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(department);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || '',
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
      errors.name = 'Department name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Department name must not exceed 100 characters.';
    }

    if (!trimmedCode) {
      errors.code = 'Department code is required.';
    } else if (trimmedCode.length > 30) {
      errors.code = 'Department code must not exceed 30 characters.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      errors.code = 'Department code must contain only letters, numbers, hyphens, or underscores.';
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

    if (isEditMode && department) {
      const updateDto: UpdateDepartmentRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        isActive: department.isActive ?? true,
      };
      await onSubmitUpdate(department.id, updateDto);
    } else {
      const createDto: CreateDepartmentRequest = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Department' : 'New Department';
  const subtitle = isEditMode
    ? `Update information for department code ${department?.code}`
    : 'Add a new hospital department or clinical unit.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="department-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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
        {/* Department Name */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="dept-name" className="text-xs font-semibold text-slate-700">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.name.length}/100
            </span>
          </div>
          <input
            ref={nameInputRef}
            id="dept-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g., Cardiology, Pathology and Lab Medicine, Radiology"
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

        {/* Department Code */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="dept-code" className="text-xs font-semibold text-slate-700">
              Department Code <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.code.length}/30
            </span>
          </div>
          <input
            id="dept-code"
            name="code"
            type="text"
            required
            maxLength={30}
            placeholder="e.g., CARD, PATH, RAD, OPD"
            value={form.code}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm font-mono uppercase tracking-wide border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
              formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          <p className="text-[11px] text-slate-500">
            Unique hospital identifier (uppercase alphanumeric, max 30 chars).
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
            <label htmlFor="dept-description" className="text-xs font-semibold text-slate-700">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.description.length}/500
            </span>
          </div>
          <textarea
            id="dept-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Provide department context, clinical specialities, or operational scope..."
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Department'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const DepartmentModal: React.FC<DepartmentModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, department } = props;

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
      aria-labelledby="department-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by department id to reset state cleanly on open */}
      <DepartmentFormContent
        key={department ? `edit-${department.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};

export default DepartmentModal;
