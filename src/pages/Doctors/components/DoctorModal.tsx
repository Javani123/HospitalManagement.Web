import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Stethoscope,
  Edit3,
  Save,
  UserCheck,
  Building2,
  Award,
  DollarSign,
  Percent,
  Hash,
  Share2,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { staffService } from '../../../services/staffService';
import type { StaffDto } from '../../../types/staff';
import type {
  DoctorProfileDto,
  CreateDoctorProfileRequest,
  UpdateDoctorProfileRequest,
} from '../../../types/doctor';
import type { AppError } from '../../../types/api';

interface DoctorModalProps {
  isOpen: boolean;
  doctor: DoctorProfileDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateDoctorProfileRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateDoctorProfileRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  staffId: string;
  registrationNumber: string;
  specialization: string;
  qualification: string;
  consultationFee: string;
  defaultCommissionRate: string;
  isExternalReferrer: boolean;
}

interface FormErrors {
  staffId?: string;
  registrationNumber?: string;
  specialization?: string;
  qualification?: string;
  consultationFee?: string;
  defaultCommissionRate?: string;
}

interface DoctorFormContentProps {
  doctor: DoctorProfileDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateDoctorProfileRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateDoctorProfileRequest) => Promise<void>;
  onClearError: () => void;
}

const DoctorFormContent: React.FC<DoctorFormContentProps> = ({
  doctor,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(doctor);
  const regInputRef = useRef<HTMLInputElement>(null);

  // Staff members for create mode
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(!isEditMode);

  const [form, setForm] = useState<FormState>(() => ({
    staffId: doctor?.staffId ? String(doctor.staffId) : '',
    registrationNumber: doctor?.registrationNumber || '',
    specialization: doctor?.specialization || '',
    qualification: doctor?.qualification || '',
    consultationFee: doctor ? String(doctor.consultationFee) : '0.00',
    defaultCommissionRate: doctor ? String(doctor.defaultCommissionRate) : '0.00',
    isExternalReferrer: doctor?.isExternalReferrer || false,
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    regInputRef.current?.focus();
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

    const trimmedReg = form.registrationNumber.trim();
    if (!trimmedReg) {
      errors.registrationNumber = 'Medical registration number is required.';
    } else if (trimmedReg.length > 50) {
      errors.registrationNumber = 'Registration number cannot exceed 50 characters.';
    }

    if (form.specialization && form.specialization.trim().length > 100) {
      errors.specialization = 'Specialization cannot exceed 100 characters.';
    }

    if (form.qualification && form.qualification.trim().length > 100) {
      errors.qualification = 'Qualification cannot exceed 100 characters.';
    }

    const feeNum = parseFloat(form.consultationFee);
    if (isNaN(feeNum) || feeNum < 0) {
      errors.consultationFee = 'Consultation fee must be a valid non-negative number.';
    } else if (feeNum > 999999.99) {
      errors.consultationFee = 'Consultation fee cannot exceed 999,999.99.';
    }

    const commNum = parseFloat(form.defaultCommissionRate);
    if (isNaN(commNum) || commNum < 0 || commNum > 100) {
      errors.defaultCommissionRate = 'Commission rate must be between 0.00% and 100.00%.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({ ...prev, [name]: val }));

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

    const feeNum = parseFloat(form.consultationFee) || 0;
    const commNum = parseFloat(form.defaultCommissionRate) || 0;

    if (isEditMode && doctor) {
      const updateDto: UpdateDoctorProfileRequest = {
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        specialization: form.specialization.trim() || undefined,
        qualification: form.qualification.trim() || undefined,
        consultationFee: feeNum,
        defaultCommissionRate: commNum,
        isExternalReferrer: form.isExternalReferrer,
        isActive: doctor.isActive ?? true,
      };
      await onSubmitUpdate(doctor.id, updateDto);
    } else {
      const createDto: CreateDoctorProfileRequest = {
        staffId: Number(form.staffId),
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        specialization: form.specialization.trim() || undefined,
        qualification: form.qualification.trim() || undefined,
        consultationFee: feeNum,
        defaultCommissionRate: commNum,
        isExternalReferrer: form.isExternalReferrer,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Doctor Profile' : 'Register Doctor Profile';
  const subtitle = isEditMode
    ? `Update professional profile for ${doctor?.doctorName} (${doctor?.registrationNumber})`
    : 'Attach a professional clinical doctor profile to an existing hospital staff member.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="doctor-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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
      {isEditMode && doctor && (
        <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              Dr
            </div>
            <div>
              <p className="font-bold text-slate-900">{doctor.doctorName}</p>
              <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-teal-700 font-semibold">{doctor.employeeNumber}</span>
                <span>•</span>
                <span>{doctor.departmentName} ({doctor.departmentCode})</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 font-medium">
            Linked Staff #{doctor.staffId}
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
            <label htmlFor="doctor-staffId" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Select Hospital Staff Member <span className="text-rose-500">*</span>
            </label>
            <select
              id="doctor-staffId"
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

        {/* Registration Number & Specialization Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Registration Number */}
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor-registrationNumber" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              Medical Registration Number <span className="text-rose-500">*</span>
            </label>
            <input
              ref={regInputRef}
              id="doctor-registrationNumber"
              name="registrationNumber"
              type="text"
              required
              maxLength={50}
              placeholder="e.g., MED-CARD-1001"
              value={form.registrationNumber}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 font-mono transition-colors uppercase ${
                formErrors.registrationNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.registrationNumber && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.registrationNumber}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor-specialization" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              Clinical Specialization <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="doctor-specialization"
              name="specialization"
              type="text"
              maxLength={100}
              placeholder="e.g., Interventional Cardiology, Pathology"
              value={form.specialization}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.specialization ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.specialization && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.specialization}
              </p>
            )}
          </div>
        </div>

        {/* Qualification & Consultation Fee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Qualification */}
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor-qualification" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Qualifications & Degrees <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="doctor-qualification"
              name="qualification"
              type="text"
              maxLength={100}
              placeholder="e.g., MBBS, MD, DM (Cardiology)"
              value={form.qualification}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.qualification ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.qualification && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.qualification}
              </p>
            )}
          </div>

          {/* Consultation Fee */}
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor-consultationFee" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Standard Consultation Fee <span className="text-rose-500">*</span>
            </label>
            <input
              id="doctor-consultationFee"
              name="consultationFee"
              type="number"
              min="0"
              max="999999.99"
              step="0.01"
              required
              placeholder="0.00"
              value={form.consultationFee}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.consultationFee ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.consultationFee && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.consultationFee}
              </p>
            )}
          </div>
        </div>

        {/* Commission Rate & External Referrer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Default Commission Rate */}
          <div className="flex flex-col gap-1">
            <label htmlFor="doctor-defaultCommissionRate" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              Default Commission Rate (%) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="doctor-defaultCommissionRate"
              name="defaultCommissionRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={form.defaultCommissionRate}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-colors ${
                formErrors.defaultCommissionRate ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.defaultCommissionRate && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.defaultCommissionRate}
              </p>
            )}
          </div>

          {/* External Referrer Checkbox */}
          <div className="flex items-center gap-2.5 pt-4">
            <input
              id="doctor-isExternalReferrer"
              name="isExternalReferrer"
              type="checkbox"
              checked={form.isExternalReferrer}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="doctor-isExternalReferrer" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Share2 className="w-3.5 h-3.5 text-teal-600" />
              External Referring Doctor
            </label>
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Register Doctor'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const DoctorModal: React.FC<DoctorModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, doctor } = props;

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
      aria-labelledby="doctor-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />
      <DoctorFormContent
        key={doctor ? `edit-doc-${doctor.id}` : 'create-new-doc'}
        {...props}
      />
    </div>
  );
};

export default DoctorModal;
