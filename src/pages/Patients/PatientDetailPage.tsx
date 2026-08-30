import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Heart, Calendar, Hash,
  Edit3, AlertTriangle, CheckCircle2, ChevronLeft, RefreshCw
} from 'lucide-react';

import { patientService } from '../../services/patientService';
import type { PatientDto } from '../../types/patient';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDate, formatDateTime } from '../../utils/formatters';

// ─── Detail field helper ──────────────────────────────────────────────────────

interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  mono?: boolean;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value, icon, mono = false }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </dt>
    <dd className={`text-sm text-slate-900 ${mono ? 'font-mono font-semibold' : 'font-medium'}`}>
      {value != null && value !== '' ? String(value) : <span className="text-slate-400 font-normal">—</span>}
    </dd>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show toast passed via navigate state (after create/update)
  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      toastSuccess(state.toast);
      // Clear state so refresh doesn't re-show the toast
      window.history.replaceState({}, '');
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog state
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  // ─── Load patient ──────────────────────────────────────────────────────────

  const loadPatient = useCallback(async () => {
    if (!id) return;
    clearError();
    setIsLoading(true);
    try {
      const data = await patientService.getById(Number(id));
      setPatient(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id, clearError, handleError]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  // ─── Deactivate ────────────────────────────────────────────────────────────

  const handleDeactivateConfirm = useCallback(async () => {
    if (!patient) return;
    setIsDeactivating(true);
    try {
      await patientService.deactivate(patient.id);
      toastSuccess(`Patient ${patient.patientNumber} has been deactivated.`);
      setShowDeactivate(false);
      // Re-fetch to get latest state
      const updated = await patientService.getById(patient.id);
      setPatient(updated);
    } catch (err) {
      handleError(err);
      toastError('Failed to deactivate patient. Please try again.');
      setShowDeactivate(false);
    } finally {
      setIsDeactivating(false);
    }
  }, [patient, toastSuccess, toastError, handleError]);

  // ─── Reactivate ────────────────────────────────────────────────────────────

  const handleReactivateConfirm = useCallback(async () => {
    if (!patient) return;
    setIsReactivating(true);
    try {
      const updated = await patientService.reactivate(patient);
      toastSuccess(`Patient ${patient.patientNumber} has been reactivated.`);
      setShowReactivate(false);
      setPatient(updated);
    } catch (err) {
      handleError(err);
      toastError('Failed to reactivate patient. Please try again.');
      setShowReactivate(false);
    } finally {
      setIsReactivating(false);
    }
  }, [patient, toastSuccess, toastError, handleError]);

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Patient Details"
          breadcrumbs={[{ label: 'Patients', path: '/patients' }, { label: 'Loading...' }]}
        />
        <LoadingSpinner label="Loading patient record..." className="py-16" />
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Patient Details"
          breadcrumbs={[{ label: 'Patients', path: '/patients' }, { label: 'Not Found' }]}
        />
        <ErrorAlert error={error} onDismiss={clearError} />
        <div className="flex justify-start">
          <Button variant="outline" size="md" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const breadcrumbs = [
    { label: 'Patients', path: '/patients' },
    { label: patient.patientNumber },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={patient.fullName}
        subtitle={`Patient record · ${patient.patientNumber}`}
        breadcrumbs={breadcrumbs}
        badge={
          <Badge variant={patient.isActive ? 'success' : 'neutral'} size="sm" dot>
            {patient.isActive ? 'Active' : 'Inactive'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Inline error banner */}
            {error && (
              <span className="text-xs text-rose-600 font-medium">{error.message}</span>
            )}
            {!patient.isActive && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<RefreshCw className="w-4 h-4 text-emerald-600" />}
                onClick={() => setShowReactivate(true)}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                Reactivate Patient
              </Button>
            )}
            <Link to={`/patients/${patient.id}/edit`}>
              <Button variant="outline" size="md" leftIcon={<Edit3 className="w-4 h-4" />}>
                Edit
              </Button>
            </Link>
            {patient.isActive && (
              <Button
                variant="danger"
                size="md"
                leftIcon={<AlertTriangle className="w-4 h-4" />}
                onClick={() => setShowDeactivate(true)}
              >
                Deactivate
              </Button>
            )}
          </div>
        }
      />

      {/* Inline error (for action failures shown on detail page) */}
      {error && patient && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Inactive banner */}
      {!patient.isActive && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Patient is inactive</p>
            <p className="text-amber-700 mt-0.5 text-xs">
              This patient has been deactivated and will not appear in the active patient directory. Use "Reactivate Patient" to restore access.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Identity + Contact + Emergency */}
        <div className="lg:col-span-2 space-y-6">

          {/* Patient Identity */}
          <Card title="Patient Identity" subtitle="Core identification and demographics">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <DetailField
                label="Patient Number (UHID)"
                value={patient.patientNumber}
                icon={<Hash className="w-3.5 h-3.5" />}
                mono
              />
              <DetailField
                label="Full Name"
                value={patient.fullName}
                icon={<User className="w-3.5 h-3.5" />}
              />
              <DetailField label="First Name" value={patient.firstName} />
              <DetailField label="Middle Name" value={patient.middleName} />
              <DetailField label="Last Name" value={patient.lastName} />
              <DetailField
                label="Gender"
                value={patient.gender}
                icon={<User className="w-3.5 h-3.5" />}
              />
              <DetailField
                label="Date of Birth"
                value={formatDate(patient.dateOfBirth)}
                icon={<Calendar className="w-3.5 h-3.5" />}
              />
              <DetailField
                label="Age"
                value={patient.age != null ? `${patient.age} years` : undefined}
              />
            </dl>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" subtitle="Phone, email, and address details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <DetailField
                label="Phone"
                value={patient.phone}
                icon={<Phone className="w-3.5 h-3.5" />}
              />
              <DetailField
                label="Email"
                value={patient.email}
                icon={<Mail className="w-3.5 h-3.5" />}
              />
              <div className="sm:col-span-2">
                <DetailField
                  label="Address"
                  value={patient.address}
                  icon={<MapPin className="w-3.5 h-3.5" />}
                />
              </div>
              <DetailField label="City" value={patient.city} />
              <DetailField label="State" value={patient.state} />
              <DetailField label="Postal Code" value={patient.postalCode} />
            </dl>
          </Card>

          {/* Emergency Contact */}
          {(patient.emergencyContactName || patient.emergencyContactPhone) && (
            <Card title="Emergency Contact" subtitle="Next of kin or emergency contact person">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <DetailField label="Contact Name" value={patient.emergencyContactName} />
                <DetailField
                  label="Contact Phone"
                  value={patient.emergencyContactPhone}
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
              </dl>
            </Card>
          )}
        </div>

        {/* Right column: Clinical Summary + Record Info */}
        <div className="space-y-6">

          {/* Clinical Summary */}
          <Card title="Clinical Summary" subtitle="Medical reference data">
            <dl className="space-y-5">
              <DetailField
                label="Blood Group"
                value={patient.bloodGroup}
                icon={<Heart className="w-3.5 h-3.5" />}
              />
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-slate-500">Status</dt>
                <dd>
                  <Badge variant={patient.isActive ? 'success' : 'neutral'} size="md" dot>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Record Info */}
          <Card title="Record Information" subtitle="System metadata">
            <dl className="space-y-5">
              <DetailField
                label="Registered On"
                value={formatDateTime(patient.createdAt)}
                icon={<Calendar className="w-3.5 h-3.5" />}
              />
              <DetailField
                label="Last Updated"
                value={formatDateTime(patient.updatedAt)}
              />
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  Verification
                </dt>
                <dd className="text-xs text-slate-500">
                  Patient number and hospital assignment are managed by the system.
                </dd>
              </div>
            </dl>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Link to={`/patients/${patient.id}/edit`} className="w-full">
                <Button variant="outline" size="md" leftIcon={<Edit3 className="w-4 h-4" />} className="w-full justify-center">
                  Edit Patient Profile
                </Button>
              </Link>
              {patient.isActive ? (
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                  className="w-full justify-center text-rose-600 hover:bg-rose-50"
                  onClick={() => setShowDeactivate(true)}
                >
                  Deactivate Patient
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="md"
                  leftIcon={<RefreshCw className="w-4 h-4 text-emerald-500" />}
                  className="w-full justify-center text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setShowReactivate(true)}
                >
                  Reactivate Patient
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={showDeactivate}
        icon="warning"
        title="Deactivate Patient"
        message={`Are you sure you want to deactivate ${patient.fullName} (${patient.patientNumber})?`}
        detail="The patient will no longer appear in the active patient list. Their clinical records are preserved and the patient can be reactivated at any time."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => !isDeactivating && setShowDeactivate(false)}
      />

      {/* Reactivate Confirmation */}
      <ConfirmDialog
        isOpen={showReactivate}
        icon="info"
        title="Reactivate Patient"
        message={`Reactivate ${patient.fullName} (${patient.patientNumber})?`}
        detail="The patient will be restored to the active patient directory and will appear in search results and lists."
        confirmLabel="Reactivate"
        confirmVariant="primary"
        isLoading={isReactivating}
        onConfirm={handleReactivateConfirm}
        onCancel={() => !isReactivating && setShowReactivate(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
