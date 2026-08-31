import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Edit3, Save, Building2, Calendar, Mail, Phone, Briefcase, User, Hash } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { departmentService } from '../../../services/departmentService';
import type { DepartmentDto } from '../../../types/department';
import type {
  StaffDto,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '../../../types/staff';
import type { AppError } from '../../../types/api';

interface StaffModalProps {
  isOpen: boolean;
  staff: StaffDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateStaffRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateStaffRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  departmentId: string;
  designation: string;
  phone: string;
  email: string;
  joiningDate: string;
}

interface FormErrors {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  departmentId?: string;
  designation?: string;
  phone?: string;
  email?: string;
  joiningDate?: string;
}

interface StaffFormContentProps {
  staff: StaffDto | null;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreateStaffRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdateStaffRequest) => Promise<void>;
  onClearError: () => void;
}

const StaffFormContent: React.FC<StaffFormContentProps> = ({
  staff,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(staff);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  // Departments list for dropdown
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState<boolean>(true);

  const [form, setForm] = useState<FormState>(() => ({
    firstName: staff?.firstName || '',
    middleName: staff?.middleName || '',
    lastName: staff?.lastName || '',
    departmentId: staff?.departmentId ? String(staff.departmentId) : '',
    designation: staff?.designation || '',
    phone: staff?.phone || '',
    email: staff?.email || '',
    joiningDate: staff?.joiningDate ? staff.joiningDate.substring(0, 10) : '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Focus first input
  useEffect(() => {
    firstNameInputRef.current?.focus();
  }, []);

  // Fetch departments for dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadDepts() {
      setIsLoadingDepts(true);
      try {
        const data = await departmentService.getAll();
        if (isMounted) {
          setDepartments(data);
          // If in create mode and there's only 1 active dept, select it by default
          if (!staff && data.length === 1 && !form.departmentId) {
            setForm((prev) => ({ ...prev, departmentId: String(data[0].id) }));
          }
        }
      } catch {
        // Handled silently; validation will block empty department
      } finally {
        if (isMounted) setIsLoadingDepts(false);
      }
    }
    loadDepts();
    return () => {
      isMounted = false;
    };
  }, [staff, form.departmentId]);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const trimmedFirstName = form.firstName.trim();
    const deptIdNum = Number(form.departmentId);

    if (!trimmedFirstName) {
      errors.firstName = 'First name is required.';
    } else if (trimmedFirstName.length > 100) {
      errors.firstName = 'First name must not exceed 100 characters.';
    }

    if (form.middleName && form.middleName.trim().length > 100) {
      errors.middleName = 'Middle name must not exceed 100 characters.';
    }

    if (form.lastName && form.lastName.trim().length > 100) {
      errors.lastName = 'Last name must not exceed 100 characters.';
    }

    if (!form.departmentId || isNaN(deptIdNum) || deptIdNum <= 0) {
      errors.departmentId = 'Department selection is required.';
    }

    if (form.designation && form.designation.trim().length > 100) {
      errors.designation = 'Designation must not exceed 100 characters.';
    }

    if (form.phone && form.phone.trim().length > 20) {
      errors.phone = 'Phone number must not exceed 20 characters.';
    }

    if (form.email && form.email.trim()) {
      const emailTrimmed = form.email.trim();
      if (emailTrimmed.length > 150) {
        errors.email = 'Email must not exceed 150 characters.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        errors.email = 'Please enter a valid email address.';
      }
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

    const deptId = Number(form.departmentId);

    if (isEditMode && staff) {
      const updateDto: UpdateStaffRequest = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        departmentId: deptId,
        designation: form.designation.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        joiningDate: form.joiningDate || undefined,
        isActive: staff.isActive ?? true,
      };
      await onSubmitUpdate(staff.id, updateDto);
    } else {
      const createDto: CreateStaffRequest = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        departmentId: deptId,
        designation: form.designation.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim().toLowerCase() || undefined,
        joiningDate: form.joiningDate || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Staff Profile' : 'Register Staff Member';
  const subtitle = isEditMode
    ? `Update profile details for employee ${staff?.employeeNumber}`
    : 'Register a new clinical staff member or administrative employee.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="staff-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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

      {/* Auto-generated Employee Number Info Banner */}
      {isEditMode && staff && (
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-800">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>Employee Number: <strong className="font-mono text-blue-900">{staff.employeeNumber}</strong></span>
          </div>
          <span className="text-[11px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 font-medium">
            Permanent Identifier
          </span>
        </div>
      )}

      {/* Server / Validation Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* First Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-firstName" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={firstNameInputRef}
              id="staff-firstName"
              name="firstName"
              type="text"
              required
              maxLength={100}
              placeholder="e.g., John"
              value={form.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.firstName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.firstName && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.firstName}
              </p>
            )}
          </div>

          {/* Middle Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-middleName" className="text-xs font-semibold text-slate-700">
              Middle Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="staff-middleName"
              name="middleName"
              type="text"
              maxLength={100}
              placeholder="e.g., Michael"
              value={form.middleName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-lastName" className="text-xs font-semibold text-slate-700">
              Last Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="staff-lastName"
              name="lastName"
              type="text"
              maxLength={100}
              placeholder="e.g., Doe"
              value={form.lastName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Department & Designation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Department Selection */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-departmentId" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              id="staff-departmentId"
              name="departmentId"
              required
              value={form.departmentId}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingDepts}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.departmentId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            >
              <option value="">
                {isLoadingDepts ? 'Loading departments...' : 'Select Department...'}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {formErrors.departmentId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.departmentId}
              </p>
            )}
          </div>

          {/* Designation */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-designation" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Designation / Role Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="staff-designation"
              name="designation"
              type="text"
              maxLength={100}
              placeholder="e.g., Senior Pathologist, Lab Technician, Receptionist"
              value={form.designation}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="staff-email"
              name="email"
              type="email"
              maxLength={150}
              placeholder="e.g., j.doe@hospital.com"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.email && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label htmlFor="staff-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="staff-phone"
              name="phone"
              type="tel"
              maxLength={20}
              placeholder="e.g., +1 555-0199"
              value={form.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.phone && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Joining Date */}
        <div className="flex flex-col gap-1 max-w-xs">
          <label htmlFor="staff-joiningDate" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Joining Date <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="staff-joiningDate"
            name="joiningDate"
            type="date"
            value={form.joiningDate}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Note on Auto-Numbering in Create Mode */}
        {!isEditMode && (
          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <strong>Note:</strong> A unique Employee Number (e.g., <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono font-bold">STF00000X</code>) will be generated automatically by the server upon successful registration.
          </p>
        )}

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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Register Staff'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const StaffModal: React.FC<StaffModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, staff } = props;

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
      aria-labelledby="staff-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by staff id to reset form state cleanly */}
      <StaffFormContent
        key={staff ? `edit-${staff.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};

export default StaffModal;
