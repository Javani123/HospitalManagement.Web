import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, UserPlus, Edit3 } from 'lucide-react';

import { patientService } from '../../services/patientService';
import type { PatientDto, CreatePatientRequest, UpdatePatientRequest } from '../../types/patient';
import { BLOOD_GROUP_OPTIONS } from '../../types/patient';
import { useApiError } from '../../hooks/useApiError';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ['Unknown', 'Male', 'Female', 'Other'] as const;

const TODAY = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const emptyForm = (): FormState => ({
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'Unknown',
  bloodGroup: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
});

function fromPatient(p: PatientDto): FormState {
  return {
    firstName: p.firstName ?? '',
    middleName: p.middleName ?? '',
    lastName: p.lastName ?? '',
    dateOfBirth: p.dateOfBirth ?? '',        // Already "YYYY-MM-DD" from backend
    gender: p.gender ?? 'Unknown',
    bloodGroup: p.bloodGroup ?? '',
    phone: p.phone ?? '',
    email: p.email ?? '',
    address: p.address ?? '',
    city: p.city ?? '',
    state: p.state ?? '',
    postalCode: p.postalCode ?? '',
    emergencyContactName: p.emergencyContactName ?? '',
    emergencyContactPhone: p.emergencyContactPhone ?? '',
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface FormErrors {
  firstName?: string;
  dateOfBirth?: string;
  email?: string;
  gender?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (form.dateOfBirth && form.dateOfBirth > TODAY) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!GENDER_OPTIONS.includes(form.gender as typeof GENDER_OPTIONS[number])) {
    errors.gender = 'Please select a valid gender.';
  }

  return errors;
}

// ─── Form field helper ────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, htmlFor, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-rose-600 mt-0.5" role="alert">{error}</p>}
  </div>
);

const inputClass = (hasError?: string) =>
  `w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
    hasError ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
  }`;

// ─── Component ────────────────────────────────────────────────────────────────

export const PatientFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { error, handleError, clearError } = useApiError();

  const [form, setForm] = useState<FormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoadingPatient, setIsLoadingPatient] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We must know the current isActive to forward it unchanged on update
  const [currentIsActive, setCurrentIsActive] = useState(true);
  const [patientNumber, setPatientNumber] = useState<string>('');

  // ─── Load existing patient for edit ────────────────────────────────────────

  useEffect(() => {
    if (!isEditMode || !id) return;

    (async () => {
      clearError();
      setIsLoadingPatient(true);
      try {
        const patient = await patientService.getById(Number(id));
        setForm(fromPatient(patient));
        setCurrentIsActive(patient.isActive);
        setPatientNumber(patient.patientNumber);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoadingPatient(false);
      }
    })();
  }, [isEditMode, id, clearError, handleError]);

  // ─── Field change ───────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      // Clear field-level error when user edits
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [formErrors]
  );

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      const errors = validate(form);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        // Scroll to first error
        const firstErrorEl = document.querySelector('[aria-invalid="true"], [role="alert"]');
        firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setIsSubmitting(true);

      try {
        if (isEditMode && id) {
          // Build UpdatePatientRequest — forward isActive unchanged from the loaded patient.
          // isActive is NEVER user-controlled from this form.
          const dto: UpdatePatientRequest = {
            firstName: form.firstName.trim(),
            middleName: form.middleName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            gender: form.gender,
            bloodGroup: form.bloodGroup || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            address: form.address.trim() || undefined,
            city: form.city.trim() || undefined,
            state: form.state.trim() || undefined,
            postalCode: form.postalCode.trim() || undefined,
            emergencyContactName: form.emergencyContactName.trim() || undefined,
            emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
            isActive: currentIsActive,  // Mirror exactly — do not change
          };
          const updated = await patientService.update(Number(id), dto);
          navigate(`/patients/${updated.id}`, {
            state: { toast: 'Patient updated successfully.' },
          });
        } else {
          // Create
          const dto: CreatePatientRequest = {
            firstName: form.firstName.trim(),
            middleName: form.middleName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            gender: form.gender,
            bloodGroup: form.bloodGroup || undefined,
            phone: form.phone.trim() || undefined,
            email: form.email.trim() || undefined,
            address: form.address.trim() || undefined,
            city: form.city.trim() || undefined,
            state: form.state.trim() || undefined,
            postalCode: form.postalCode.trim() || undefined,
            emergencyContactName: form.emergencyContactName.trim() || undefined,
            emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
          };
          const created = await patientService.create(dto);
          navigate(`/patients/${created.id}`, {
            state: { toast: 'Patient registered successfully.' },
          });
        }
      } catch (err) {
        handleError(err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isEditMode, id, currentIsActive, navigate, clearError, handleError]
  );

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (isLoadingPatient) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Patient"
          breadcrumbs={[{ label: 'Patients', path: '/patients' }, { label: 'Edit...' }]}
        />
        <LoadingSpinner label="Loading patient record..." className="py-16" />
      </div>
    );
  }

  // ─── Breadcrumbs & page meta ────────────────────────────────────────────────

  const breadcrumbs = isEditMode
    ? [
        { label: 'Patients', path: '/patients' },
        { label: patientNumber, path: `/patients/${id}` },
        { label: 'Edit' },
      ]
    : [
        { label: 'Patients', path: '/patients' },
        { label: 'Register Patient' },
      ];

  const pageTitle = isEditMode ? 'Edit Patient' : 'Register Patient';
  const pageSubtitle = isEditMode
    ? `Editing profile for ${patientNumber}. Patient number and activation status cannot be changed here.`
    : 'Complete the form below to register a new patient. The patient number will be generated automatically.';

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbs}
        badge={
          isEditMode ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Edit3 className="w-3 h-3" /> Editing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <UserPlus className="w-3 h-3" /> New Patient
            </span>
          )
        }
        actions={
          <Button
            variant="outline"
            size="md"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate(isEditMode ? `/patients/${id}` : '/patients')}
            type="button"
          >
            {isEditMode ? 'Back to Profile' : 'Back to Patients'}
          </Button>
        }
      />

      {/* API / server error */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      <form onSubmit={handleSubmit} noValidate aria-label={pageTitle}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main form — left 2 columns */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <Card title="Personal Information" subtitle="Patient's legal name and demographics">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrapper label="First Name" htmlFor="firstName" required error={formErrors.firstName}>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    maxLength={100}
                    autoComplete="given-name"
                    aria-required="true"
                    aria-invalid={!!formErrors.firstName}
                    className={inputClass(formErrors.firstName)}
                  />
                </FieldWrapper>

                <FieldWrapper label="Middle Name" htmlFor="middleName">
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Middle name (optional)"
                    maxLength={100}
                    autoComplete="additional-name"
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Last Name" htmlFor="lastName">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Doe"
                    maxLength={100}
                    autoComplete="family-name"
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Date of Birth" htmlFor="dateOfBirth" error={formErrors.dateOfBirth}>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={TODAY}
                    aria-invalid={!!formErrors.dateOfBirth}
                    className={inputClass(formErrors.dateOfBirth)}
                  />
                </FieldWrapper>

                <FieldWrapper label="Gender" htmlFor="gender" error={formErrors.gender}>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    aria-invalid={!!formErrors.gender}
                    className={inputClass(formErrors.gender)}
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper label="Blood Group" htmlFor="bloodGroup">
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="">— Select blood group —</option>
                    {BLOOD_GROUP_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>
            </Card>

            {/* Contact Details */}
            <Card title="Contact Details" subtitle="Primary phone, email, and address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrapper label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    maxLength={20}
                    autoComplete="tel"
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Email" htmlFor="email" error={formErrors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. patient@email.com"
                    maxLength={150}
                    autoComplete="email"
                    aria-invalid={!!formErrors.email}
                    className={inputClass(formErrors.email)}
                  />
                </FieldWrapper>

                <div className="sm:col-span-2">
                  <FieldWrapper label="Address" htmlFor="address">
                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      maxLength={250}
                      rows={2}
                      autoComplete="street-address"
                      className={`${inputClass()} resize-none`}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="City" htmlFor="city">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    maxLength={100}
                    autoComplete="address-level2"
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="State" htmlFor="state">
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State / Province"
                    maxLength={100}
                    autoComplete="address-level1"
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Postal Code" htmlFor="postalCode">
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="Postal / ZIP code"
                    maxLength={20}
                    autoComplete="postal-code"
                    className={inputClass()}
                  />
                </FieldWrapper>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card title="Emergency Contact" subtitle="Optional — next of kin or emergency contact">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldWrapper label="Contact Name" htmlFor="emergencyContactName">
                  <input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    value={form.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Emergency contact full name"
                    maxLength={150}
                    className={inputClass()}
                  />
                </FieldWrapper>

                <FieldWrapper label="Contact Phone" htmlFor="emergencyContactPhone">
                  <input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="Emergency contact phone"
                    maxLength={20}
                    className={inputClass()}
                  />
                </FieldWrapper>
              </div>
            </Card>
          </div>

          {/* Right column: Summary + Submit */}
          <div className="space-y-6">

            {/* Form Summary */}
            <Card title="Registration Summary" subtitle="Review before submitting">
              <div className="space-y-3 text-xs text-slate-600">
                {isEditMode && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span>Patient Number</span>
                    <span className="font-mono font-semibold text-blue-700">{patientNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>First Name</span>
                  <span className="font-medium text-slate-800">{form.firstName || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Gender</span>
                  <span className="font-medium text-slate-800">{form.gender}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Date of Birth</span>
                  <span className="font-medium text-slate-800">{form.dateOfBirth || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>Blood Group</span>
                  <span className="font-medium text-slate-800">{form.bloodGroup || '—'}</span>
                </div>

                {!isEditMode && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Patient Number (UHID) will be automatically assigned by the system upon registration.
                  </div>
                )}

                {isEditMode && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Patient number and activation status are not editable here. Use the patient profile page to deactivate or reactivate.
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Actions */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                className="w-full justify-center"
                aria-label={isEditMode ? 'Save patient changes' : 'Register new patient'}
              >
                {isEditMode ? 'Save Changes' : 'Register Patient'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate(isEditMode ? `/patients/${id}` : '/patients')}
                disabled={isSubmitting}
                className="w-full justify-center"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
