import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Microscope,
  Edit3,
  Save,
  UserCheck,
  Building2,
  Award,
  FlaskConical,
  Hash,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { staffService } from '../../../services/staffService';
import type { StaffDto } from '../../../types/staff';
import type {
  TechnicianProfileDto,
  CreateTechnicianProfileRequest,
  UpdateTechnicianProfileRequest,
} from '../../../types/technician';
import type { AppError } from '../../../types/api';

interface TechnicianModalProps {
  isOpen: boolean;
  technician: TechnicianProfileDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateTechnicianProfileRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateTechnicianProfileRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  staffId: string;
  licenseNumber: string;
  certification: string;
  primaryBench: string;
}

interface FormErrors {
  staffId?: string;
  licenseNumber?: string;
  certification?: string;
  primaryBench?: string;
}

interface TechnicianFormContentProps {
  technician: TechnicianProfileDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateTechnicianProfileRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateTechnicianProfileRequest) => Promise<void>;
  onClearError: () => void;
}

const TechnicianFormContent: React.FC<TechnicianFormContentProps> = ({
  technician,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(technician);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Staff members for create mode
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(!isEditMode);

  const [form, setForm] = useState<FormState>(() => ({
    staffId: technician?.staffId ? String(technician.staffId) : '',
    licenseNumber: technician?.licenseNumber || '',
    certification: technician?.certification || '',
    primaryBench: technician?.primaryBench || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    licenseInputRef.current?.focus();
  }, []);

  // Fetch staff list for dropdown in create mode
  useEffect(() => {
    let isMounted = true;
    if (!isEditMode) {
      async function loadStaff() {
        setIsLoadingStaff(true);
        try {
          const staffData = await staffService.getAll();
          if (isMounted) {
            // Keep active staff
            setStaffList(staffData.filter((s) => s.isActive));
          }
        } catch {
          // Handled silently
        } finally {
          if (isMounted) setIsLoadingStaff(false);
        }
      }
      loadStaff();
    }
    return () => {
      isMounted = false;
    };
  }, [isEditMode]);

  // Selected staff details preview in create mode
  const selectedStaff = staffList.find((s) => String(s.id) === form.staffId);

  const validate = (): boolean => {
    const errors: FormErrors = {};

    if (!isEditMode) {
      const parsedStaffId = Number(form.staffId);
      if (!form.staffId || isNaN(parsedStaffId) || parsedStaffId <= 0) {
        errors.staffId = 'Please select a hospital staff member.';
      }
    }

    const trimmedLic = form.licenseNumber.trim();
    if (!trimmedLic) {
      errors.licenseNumber = 'Professional license number is required.';
    } else if (trimmedLic.length > 50) {
      errors.licenseNumber = 'License number cannot exceed 50 characters.';
    }

    if (form.certification && form.certification.trim().length > 100) {
      errors.certification = 'Certification cannot exceed 100 characters.';
    }

    if (form.primaryBench && form.primaryBench.trim().length > 100) {
      errors.primaryBench = 'Primary bench cannot exceed 100 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (isEditMode && technician) {
      const updateDto: UpdateTechnicianProfileRequest = {
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        certification: form.certification.trim() || undefined,
        primaryBench: form.primaryBench.trim() || undefined,
        isActive: technician.isActive ?? true,
      };
      await onSubmitUpdate(technician.id, updateDto);
    } else {
      const createDto: CreateTechnicianProfileRequest = {
        staffId: Number(form.staffId),
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        certification: form.certification.trim() || undefined,
        primaryBench: form.primaryBench.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Technician Profile' : 'Register Technician Profile';
  const subtitle = isEditMode
    ? `Update professional profile for ${technician?.technicianName} (${technician?.licenseNumber})`
    : 'Attach a professional laboratory technician profile to an existing hospital staff member.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Microscope className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="technician-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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

      {/* Edit Mode Linked Staff Information Banner */}
      {isEditMode && technician && (
        <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              Tech
            </div>
            <div>
              <p className="font-bold text-slate-900">{technician.technicianName}</p>
              <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-teal-700 font-semibold">{technician.employeeNumber}</span>
                <span>•</span>
                <span>{technician.departmentName} ({technician.departmentCode})</span>
                {technician.designation && <span>• {technician.designation}</span>}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 font-medium">
            Linked Staff #{technician.staffId}
          </span>
        </div>
      )}

      {/* Server / Validation Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Create Mode: Staff Member Picker */}
        {!isEditMode && (
          <div className="flex flex-col gap-1">
            <label htmlFor="tech-staffId" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Select Hospital Staff Member <span className="text-rose-500">*</span>
            </label>
            <select
              id="tech-staffId"
              name="staffId"
              required
              value={form.staffId}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingStaff}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.staffId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            >
              <option value="">
                {isLoadingStaff ? 'Loading hospital staff...' : 'Choose a staff member...'}
              </option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.employeeNumber}) — {staff.departmentName}
                  {staff.designation ? ` [${staff.designation}]` : ''}
                </option>
              ))}
            </select>
            {formErrors.staffId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.staffId}
              </p>
            )}

            {/* Selected Staff Info Snippet */}
            {selectedStaff && (
              <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Department: <strong>{selectedStaff.departmentName} ({selectedStaff.departmentCode})</strong></span>
                </div>
                <span className="font-mono text-slate-500 font-medium">
                  {selectedStaff.employeeNumber}
                </span>
              </div>
            )}
          </div>
        )}

        {/* License Number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="tech-licenseNumber" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            Professional License / Registration Number <span className="text-rose-500">*</span>
          </label>
          <input
            ref={licenseInputRef}
            id="tech-licenseNumber"
            name="licenseNumber"
            type="text"
            required
            maxLength={50}
            placeholder="e.g., TECH-PATH-8801"
            value={form.licenseNumber}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 font-mono transition-colors uppercase ${
              formErrors.licenseNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.licenseNumber && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.licenseNumber}
            </p>
          )}
        </div>

        {/* Primary Bench & Certification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Primary Bench */}
          <div className="flex flex-col gap-1">
            <label htmlFor="tech-primaryBench" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
              Primary Laboratory Bench <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="tech-primaryBench"
              name="primaryBench"
              type="text"
              maxLength={100}
              placeholder="e.g., Hematology, Biochemistry, Microbiology"
              value={form.primaryBench}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.primaryBench ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.primaryBench && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.primaryBench}
              </p>
            )}
          </div>

          {/* Certification */}
          <div className="flex flex-col gap-1">
            <label htmlFor="tech-certification" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Certifications & Degrees <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="tech-certification"
              name="certification"
              type="text"
              maxLength={100}
              placeholder="e.g., BMLT, ASCP Certified, DMLT"
              value={form.certification}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.certification ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.certification && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.certification}
              </p>
            )}
          </div>
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Register Technician'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const TechnicianModal: React.FC<TechnicianModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, technician } = props;

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
      aria-labelledby="technician-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <TechnicianFormContent
        key={technician ? `edit-tech-${technician.id}` : 'create-new-tech'}
        {...props}
      />
    </div>
  );
};

export default TechnicianModal;
