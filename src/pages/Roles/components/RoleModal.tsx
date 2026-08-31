import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldPlus, Edit3, Save, Shield, FileText } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type { RoleDto, CreateRoleRequest, UpdateRoleRequest } from '../../../types/role';
import type { AppError } from '../../../types/api';

interface RoleModalProps {
  isOpen: boolean;
  role: RoleDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateRoleRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateRoleRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
}

interface RoleFormContentProps {
  role: RoleDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateRoleRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateRoleRequest) => Promise<void>;
  onClearError: () => void;
}

const RoleFormContent: React.FC<RoleFormContentProps> = ({
  role,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(role);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    name: role?.name || '',
    description: role?.description || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = form.name.trim();

    if (!trimmedName) {
      errors.name = 'Role name is required.';
    } else if (trimmedName.length > 50) {
      errors.name = 'Role name must not exceed 50 characters.';
    }

    if (form.description && form.description.trim().length > 250) {
      errors.description = 'Description must not exceed 250 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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

    if (isEditMode && role) {
      const updateDto: UpdateRoleRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isActive: role.isActive ?? true,
      };
      await onSubmitUpdate(role.id, updateDto);
    } else {
      const createDto: CreateRoleRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Custom Role' : 'Create Custom Role';
  const subtitle = isEditMode
    ? `Update role metadata and description for "${role?.name}"`
    : 'Create a new customized authorization role for hospital staff assignment.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <ShieldPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="role-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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

      {/* System Role Protected Banner if editing system role */}
      {isEditMode && role?.isSystem && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This is a built-in <strong>System Role</strong>. Its name is locked to preserve core permission integrity.</span>
        </div>
      )}

      {/* Server / Validation Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Role Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="role-name" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Role Name <span className="text-rose-500">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="role-name"
            name="name"
            type="text"
            required
            maxLength={50}
            placeholder="e.g., Radiologist, Pharmacist, Auditor"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting || (isEditMode && role?.isSystem)}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors ${
              formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            } ${(isEditMode && role?.isSystem) ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
          />
          {formErrors.name && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="role-description" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="role-description"
            name="description"
            rows={3}
            maxLength={250}
            placeholder="Describe the operational responsibilities and scope of this role..."
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors ${
              formErrors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.description && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.description}
            </p>
          )}
          <p className="text-[11px] text-slate-400 text-right">
            {form.description.length} / 250
          </p>
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <ShieldPlus className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const RoleModal: React.FC<RoleModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, role } = props;

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
      aria-labelledby="role-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <RoleFormContent
        key={role ? `edit-role-${role.id}` : 'create-new-role'}
        {...props}
      />
    </div>
  );
};

export default RoleModal;
