import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Percent,
  DollarSign,
  Calendar,
  Save,
  Plus,
  Stethoscope,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { doctorService } from '../../../services/doctorService';
import type { DoctorProfileDto } from '../../../types/doctor';
import type {
  DoctorCommissionRuleDto,
  CreateDoctorCommissionRuleRequest,
  UpdateDoctorCommissionRuleRequest,
  CommissionType,
} from '../../../types/commission';
import type { AppError } from '../../../types/api';

interface CommissionRuleModalProps {
  isOpen: boolean;
  rule: DoctorCommissionRuleDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateDoctorCommissionRuleRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateDoctorCommissionRuleRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  doctorStaffId: string;
  commissionType: CommissionType;
  commissionValue: string;
  effectiveFrom: string;
  effectiveTo: string;
  description: string;
  isActive: boolean;
}

interface FormErrors {
  doctorStaffId?: string;
  commissionType?: string;
  commissionValue?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
}

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CommissionRuleFormContent: React.FC<CommissionRuleModalProps> = ({
  rule,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(rule);
  const valueInputRef = useRef<HTMLInputElement>(null);

  // Active doctors list for create mode
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(!isEditMode);

  const [form, setForm] = useState<FormState>(() => ({
    doctorStaffId: rule ? String(rule.doctorStaffId) : '',
    commissionType: (rule?.commissionType as CommissionType) || 'Percentage',
    commissionValue: rule ? String(rule.commissionValue) : '10.00',
    effectiveFrom: rule?.effectiveFrom || getTodayDateString(),
    effectiveTo: rule?.effectiveTo || '',
    description: rule?.description || '',
    isActive: rule ? rule.isActive : true,
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Focus value input on open
  useEffect(() => {
    valueInputRef.current?.focus();
  }, []);

  // Fetch doctors for create mode
  useEffect(() => {
    let isMounted = true;
    if (!isEditMode) {
      async function loadDoctors() {
        setIsLoadingDoctors(true);
        try {
          const docs = await doctorService.getAll();
          if (isMounted) {
            setDoctors(docs.filter((d) => d.isActive));
          }
        } catch {
          // Handled silently
        } finally {
          if (isMounted) setIsLoadingDoctors(false);
        }
      }
      void loadDoctors();
    }
    return () => {
      isMounted = false;
    };
  }, [isEditMode]);

  // Selected doctor preview in create mode
  const selectedDoctor = doctors.find(
    (d) => String(d.staffId) === form.doctorStaffId
  );

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!isEditMode) {
      const parsedStaffId = Number(form.doctorStaffId);
      if (!form.doctorStaffId || isNaN(parsedStaffId) || parsedStaffId <= 0) {
        errors.doctorStaffId = 'Please select a registered clinical doctor.';
      }
    }

    const valNum = parseFloat(form.commissionValue);
    if (isNaN(valNum) || valNum < 0) {
      errors.commissionValue = 'Commission value must be a non-negative number.';
    } else if (form.commissionType === 'Percentage' && valNum > 100) {
      errors.commissionValue = 'Percentage commission cannot exceed 100.00%.';
    } else if (form.commissionType === 'FixedAmount' && valNum > 1000000) {
      errors.commissionValue = 'Fixed commission amount cannot exceed $1,000,000.00.';
    }

    if (!form.effectiveFrom) {
      errors.effectiveFrom = 'Effective From date is required.';
    }

    if (form.effectiveTo && form.effectiveFrom) {
      if (form.effectiveTo < form.effectiveFrom) {
        errors.effectiveTo = 'Effective To date cannot be earlier than Effective From date.';
      }
    }

    if (form.description && form.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({ ...prev, [name]: val }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      onClearError();
    }
  };

  const handleTypeSwitch = (newType: CommissionType) => {
    setForm((prev) => ({
      ...prev,
      commissionType: newType,
      // Adjust default suggested value if currently default
      commissionValue:
        newType === 'Percentage'
          ? prev.commissionValue === '25.00'
            ? '10.00'
            : prev.commissionValue
          : prev.commissionValue === '10.00'
          ? '25.00'
          : prev.commissionValue,
    }));
    if (formErrors.commissionValue) {
      setFormErrors((prev) => ({ ...prev, commissionValue: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const valNum = parseFloat(form.commissionValue) || 0;

    if (isEditMode && rule) {
      const updateDto: UpdateDoctorCommissionRuleRequest = {
        commissionType: form.commissionType,
        commissionValue: valNum,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo ? form.effectiveTo : null,
        description: form.description.trim() || null,
        isActive: form.isActive,
      };
      await onSubmitUpdate(rule.id, updateDto);
    } else {
      const createDto: CreateDoctorCommissionRuleRequest = {
        doctorStaffId: Number(form.doctorStaffId),
        commissionType: form.commissionType,
        commissionValue: valNum,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo ? form.effectiveTo : null,
        description: form.description.trim() || null,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode
    ? 'Edit Doctor Commission Rule'
    : 'Create Doctor Commission Rule';
  const subtitle = isEditMode
    ? `Update commission calculation rule for ${rule?.doctorName}`
    : 'Configure referring doctor commission calculation parameters for diagnostic lab orders.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {isEditMode ? (
              <Percent className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2
              id="commission-modal-title"
              className="text-base font-bold text-slate-900 leading-snug"
            >
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

      {/* Edit Mode Linked Doctor Information Banner */}
      {isEditMode && rule && (
        <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              Dr
            </div>
            <div>
              <p className="font-bold text-slate-900">{rule.doctorName}</p>
              <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                {rule.doctorRegistrationNumber && (
                  <span className="font-mono text-teal-700 font-semibold bg-teal-100/60 px-1.5 py-0.2 rounded">
                    {rule.doctorRegistrationNumber}
                  </span>
                )}
                {rule.doctorSpecialization && (
                  <span>• {rule.doctorSpecialization}</span>
                )}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 font-medium">
            Staff #{rule.doctorStaffId}
          </span>
        </div>
      )}

      {/* Server Error / Overlap Rejection Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Create Mode: Doctor Selector */}
        {!isEditMode && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="commission-doctorStaffId"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Select Referring Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              id="commission-doctorStaffId"
              name="doctorStaffId"
              required
              value={form.doctorStaffId}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingDoctors}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.doctorStaffId
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-200'
              }`}
            >
              <option value="">
                {isLoadingDoctors
                  ? 'Loading active doctors...'
                  : 'Choose a registered doctor profile...'}
              </option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.staffId}>
                  {doc.doctorName} ({doc.registrationNumber}) —{' '}
                  {doc.specialization || 'General Practice'} [Staff #{doc.staffId}]
                </option>
              ))}
            </select>
            {formErrors.doctorStaffId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.doctorStaffId}
              </p>
            )}

            {/* Selected Doctor Summary Card */}
            {selectedDoctor && (
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Dept:{' '}
                    <strong>
                      {selectedDoctor.departmentName} ({selectedDoctor.departmentCode})
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Reg: <strong>{selectedDoctor.registrationNumber}</strong>
                  </span>
                </div>
                <span className="text-teal-700 font-medium">
                  Default Comm: {selectedDoctor.defaultCommissionRate}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Commission Type Switcher */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Calculation Method <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeSwitch('Percentage')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.commissionType === 'Percentage'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Percent className="w-4 h-4 text-teal-600" />
              <span>Percentage (%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSwitch('FixedAmount')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.commissionType === 'FixedAmount'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>Fixed Amount ($)</span>
            </button>
          </div>
        </div>

        {/* Commission Value Input */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="commission-value"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            {form.commissionType === 'Percentage' ? (
              <>
                <Percent className="w-3.5 h-3.5 text-teal-600" />
                Commission Rate (%) <span className="text-rose-500">*</span>
              </>
            ) : (
              <>
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                Fixed Commission Amount ($) <span className="text-rose-500">*</span>
              </>
            )}
          </label>
          <div className="relative">
            <input
              ref={valueInputRef}
              id="commission-value"
              name="commissionValue"
              type="number"
              min="0"
              max={form.commissionType === 'Percentage' ? '100' : '1000000'}
              step="0.01"
              required
              placeholder={form.commissionType === 'Percentage' ? '10.00' : '25.00'}
              value={form.commissionValue}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.commissionValue
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-200'
              }`}
            />
          </div>
          {formErrors.commissionValue && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.commissionValue}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            {form.commissionType === 'Percentage'
              ? 'Calculated against total commissionable order value (e.g. 10.00% of $175 = $17.50).'
              : 'Fixed monetary amount credited per lab order (e.g. $25.00 per order).'}
          </p>
        </div>

        {/* Effective Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Effective From */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="commission-effectiveFrom"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Effective From <span className="text-rose-500">*</span>
            </label>
            <input
              id="commission-effectiveFrom"
              name="effectiveFrom"
              type="date"
              required
              value={form.effectiveFrom}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.effectiveFrom
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-200'
              }`}
            />
            {formErrors.effectiveFrom && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.effectiveFrom}
              </p>
            )}
          </div>

          {/* Effective To */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="commission-effectiveTo"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Effective To <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="commission-effectiveTo"
              name="effectiveTo"
              type="date"
              value={form.effectiveTo}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.effectiveTo
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-200'
              }`}
            />
            {formErrors.effectiveTo && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.effectiveTo}
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              Leave blank for indefinite / ongoing active rule.
            </p>
          </div>
        </div>

        {/* Description / Justification */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="commission-description"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Description / Justification{' '}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="commission-description"
            name="description"
            rows={2}
            maxLength={500}
            placeholder="e.g. Standard referring doctor contract rate for 2026."
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
              formErrors.description
                ? 'border-rose-400 bg-rose-50/50'
                : 'border-slate-200'
            }`}
          />
          {formErrors.description && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Active Status (Edit Mode) */}
        {isEditMode && (
          <div className="flex items-center gap-2.5 pt-2">
            <input
              id="commission-isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
            />
            <label
              htmlFor="commission-isActive"
              className="text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Active Rule (used for new lab orders within effective dates)
            </label>
          </div>
        )}

        {/* Immutability Note Alert */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Historical Snapshot Rule:</strong> Updating this rule applies
            only to newly created orders. Existing lab order commission snapshots
            will remain immutable.
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
            leftIcon={
              isEditMode ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
          >
            {isEditMode ? 'Save Changes' : 'Create Commission Rule'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CommissionRuleModal: React.FC<CommissionRuleModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, rule } = props;

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
      aria-labelledby="commission-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <CommissionRuleFormContent
        key={rule ? `edit-comm-${rule.id}` : 'create-new-comm'}
        {...props}
      />
    </div>
  );
};

export default CommissionRuleModal;
