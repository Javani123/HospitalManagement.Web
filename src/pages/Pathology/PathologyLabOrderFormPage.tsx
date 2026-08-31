import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, ChevronLeft, Plus, Stethoscope, Building2, Award, X } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { pathologyService } from '../../services/pathologyService';
import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import { doctorService } from '../../services/doctorService';
import type { PatientDto } from '../../types/patient';
import type { PathologyTestDto } from '../../types/pathology';
import type { DoctorProfileDto } from '../../types/doctor';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ToastContainer } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';

export const PathologyLabOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, clearError, handleError } = useApiError();
  const { toasts, dismiss, success } = useToast();

  // Patient Search & Selection
  const [query, setQuery] = useState('');
  const [patientResults, setPatientResults] = useState<PatientDto[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Referring Doctor Selection (M14.8 / F14.8)
  const [doctors, setDoctors] = useState<DoctorProfileDto[]>([]);
  const [selectedDoctorStaffId, setSelectedDoctorStaffId] = useState<string>('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Pathology Tests Selection
  const [tests, setTests] = useState<PathologyTestDto[]>([]);
  const [selectedTests, setSelectedTests] = useState<PathologyTestDto[]>([]);
  const [testQuery, setTestQuery] = useState('');

  // Clinical Notes & Form state
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load active tests and active doctor profiles
  useEffect(() => {
    void pathologyService.tests
      .getAll()
      .then((data) => setTests(data.filter((test) => test.isActive)))
      .catch(handleError);

    setIsLoadingDoctors(true);
    void doctorService
      .getAll()
      .then((data) => setDoctors(data.filter((doc) => doc.isActive)))
      .catch(handleError)
      .finally(() => setIsLoadingDoctors(false));
  }, [handleError]);

  const searchPatients = useCallback(async () => {
    if (!query.trim()) {
      setPatientResults([]);
      return;
    }
    setIsSearching(true);
    try {
      setPatientResults(await patientService.search(query.trim()));
    } catch (err) {
      handleError(err);
    } finally {
      setIsSearching(false);
    }
  }, [query, handleError]);

  const addTest = (test: PathologyTestDto) => {
    if (!selectedTests.some((item) => item.id === test.id)) {
      setSelectedTests((current) => [...current, test]);
    }
  };

  const selectedDoctor = selectedDoctorStaffId
    ? doctors.find((d) => String(d.staffId) === selectedDoctorStaffId)
    : null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (!selectedPatient) {
      setFormError('Select a patient before creating the order.');
      return;
    }
    if (!selectedTests.length) {
      setFormError('Add at least one pathology test.');
      return;
    }

    setIsSubmitting(true);
    try {
      const referringStaffIdNum = selectedDoctorStaffId ? Number(selectedDoctorStaffId) : null;

      const order = await pathologyLabOrderService.create({
        patientId: selectedPatient.id,
        clinicalNotes: notes.trim() || undefined,
        referringDoctorStaffId: referringStaffIdNum,
        items: selectedTests.map((test) => ({ pathologyTestId: test.id })),
      });

      success('Lab order created successfully.');
      navigate(`/pathology/lab-orders/${order.id}`, {
        state: { toast: 'Lab order created successfully.' },
      });
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleTests = tests.filter((test) =>
    `${test.code} ${test.name}`.toLowerCase().includes(testQuery.toLowerCase())
  );

  return (
    <form className="space-y-6" onSubmit={submit}>
      <PageHeader
        title="Create Lab Order"
        subtitle="Select an active patient, an optional referring doctor, and one or more pathology tests."
        breadcrumbs={[
          { label: 'Pathology', path: '/pathology' },
          { label: 'Lab Orders', path: '/pathology/lab-orders' },
          { label: 'New Order' },
        ]}
        actions={
          <Button
            type="button"
            variant="outline"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate('/pathology/lab-orders')}
          >
            Back to Orders
          </Button>
        }
      />

      {(error || formError) && (
        <ErrorAlert
          error={formError || error}
          onDismiss={() => {
            setFormError(null);
            clearError();
          }}
        />
      )}

      {/* Patient Section */}
      <Card
        title="Patient"
        subtitle="Search the active patient directory; patient IDs are never entered manually."
      >
        <div className="space-y-3">
          {!selectedPatient ? (
            <>
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <span className="sr-only">Search patient</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), void searchPatients())
                    }
                    placeholder="Search patient number, name, or phone..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void searchPatients()}
                  isLoading={isSearching}
                >
                  Search
                </Button>
              </div>
              {patientResults.length > 0 && (
                <ul className="divide-y border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                  {patientResults.map((patient) => (
                    <li key={patient.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setPatientResults([]);
                        }}
                        className="w-full p-3 text-left hover:bg-teal-50/50 transition-colors"
                      >
                        <span className="font-medium text-slate-900">{patient.fullName}</span>
                        <span className="ml-2 font-mono text-xs text-slate-500">
                          {patient.patientNumber}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {patient.age ?? '—'} yrs · {patient.gender} · {patient.phone || 'No phone'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedPatient.fullName}{' '}
                  <span className="font-mono text-xs text-teal-700">
                    {selectedPatient.patientNumber}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  {selectedPatient.age ?? '—'} yrs · {selectedPatient.gender} ·{' '}
                  {selectedPatient.phone || 'No phone'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                Change patient
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Referring Doctor Section (M14.8 / F14.8) */}
      <Card
        title="Referring Doctor"
        subtitle="Optional: Select the registered physician referring this patient for diagnostic tests."
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-1 max-w-xl">
            <label
              htmlFor="order-referringDoctor"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              Referring Physician <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <select
                id="order-referringDoctor"
                value={selectedDoctorStaffId}
                onChange={(e) => setSelectedDoctorStaffId(e.target.value)}
                disabled={isLoadingDoctors || isSubmitting}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white transition-colors"
              >
                <option value="">No Referring Doctor (Self-Referred)</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.staffId}>
                    {doc.doctorName} ({doc.registrationNumber}) — {doc.departmentName}
                    {doc.specialization ? ` [${doc.specialization}]` : ''}
                  </option>
                ))}
              </select>
              {selectedDoctorStaffId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDoctorStaffId('')}
                  aria-label="Clear referring doctor"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </Button>
              )}
            </div>
          </div>

          {/* Selected Doctor Live Preview Card */}
          {selectedDoctor && (
            <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-slate-700 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  Dr
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedDoctor.doctorName}</p>
                  <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-teal-800 font-semibold">
                      {selectedDoctor.registrationNumber}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {selectedDoctor.departmentName} ({selectedDoctor.departmentCode})
                    </span>
                    {selectedDoctor.specialization && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-slate-400" />
                          {selectedDoctor.specialization}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                Staff #{selectedDoctor.staffId}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Pathology Tests Section */}
      <Card
        title="Diagnostic Tests"
        subtitle="Only active tests returned by the pathology test master can be selected."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Find pathology test</span>
            <input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Find test by code or name..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y">
            {visibleTests.map((test) => (
              <div key={test.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    <span className="font-mono text-xs text-teal-700">{test.code}</span> {test.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Sample: {test.sampleTypeName || '—'} · Unit: {test.unitSymbol || '—'} ·{' '}
                    {formatCurrency(test.price)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={selectedTests.some((item) => item.id === test.id)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => addTest(test)}
                >
                  Add
                </Button>
              </div>
            ))}
            {!visibleTests.length && (
              <p className="p-4 text-sm text-slate-500">
                No active pathology tests match this search.
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="text-left font-semibold text-slate-900 mb-2">
                Selected Tests ({selectedTests.length})
              </caption>
              <thead className="text-xs text-slate-500 border-b">
                <tr>
                  <th className="py-2 text-left">Test</th>
                  <th className="py-2 text-left">Sample</th>
                  <th className="py-2 text-left">Unit</th>
                  <th className="py-2 text-right">Price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {selectedTests.map((test) => (
                  <tr key={test.id} className="border-b">
                    <td className="py-2">
                      <span className="font-mono text-xs text-teal-700">{test.code}</span>{' '}
                      {test.name}
                    </td>
                    <td>{test.sampleTypeName || '—'}</td>
                    <td>{test.unitSymbol || '—'}</td>
                    <td className="text-right">{formatCurrency(test.price)}</td>
                    <td className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove ${test.name}`}
                        onClick={() =>
                          setSelectedTests((items) =>
                            items.filter((item) => item.id !== test.id)
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Clinical Notes Section */}
      <Card title="Clinical Notes" subtitle="Optional: Enter any relevant clinical notes or diagnosis context (up to 2,000 characters).">
        <label>
          <span className="sr-only">Clinical notes</span>
          <textarea
            value={notes}
            maxLength={2000}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Relevant clinical notes or instructions for the laboratory..."
          />
          <span className="text-xs text-slate-500">{notes.length}/2000</span>
        </label>
      </Card>

      {/* Submit Sticky Footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-4 flex justify-end gap-3 shadow-xs">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/pathology/lab-orders')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Create Lab Order
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </form>
  );
};

export default PathologyLabOrderFormPage;
