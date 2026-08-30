import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Printer,
  FileCheck2,
  AlertCircle,
  Clock,
  RefreshCw,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

import { pathologyReportService } from '../../services/pathologyReportService';
import type { PathologyLabReportDto } from '../../types/pathologyReport';

import { useApiError } from '../../hooks/useApiError';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ResultFlagBadge } from '../../components/common/ResultFlagBadge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const PathologyLabReportPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { error, clearError, handleError } = useApiError();
  const [report, setReport] = useState<PathologyLabReportDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReport = useCallback(async () => {
    if (!orderId) return;
    clearError();
    setIsLoading(true);
    try {
      let data: PathologyLabReportDto;
      if (/^\d+$/.test(orderId)) {
        data = await pathologyReportService.getByOrderId(Number(orderId));
      } else {
        data = await pathologyReportService.getByOrderNumber(orderId);
      }
      setReport(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, clearError, handleError]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Final Pathology Lab Report"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Reports', path: '/pathology/reports' },
            { label: 'Loading Report...' },
          ]}
        />
        <LoadingState message="Generating consolidated laboratory report from released results..." />
      </div>
    );
  }

  if (!report) {
    const isUnreadyError =
      error?.message?.includes('not ready') ||
      error?.message?.includes('released') ||
      error?.message?.includes('cancelled');

    return (
      <div className="space-y-6">
        <PageHeader
          title="Final Pathology Lab Report"
          breadcrumbs={[
            { label: 'Pathology', path: '/pathology' },
            { label: 'Reports', path: '/pathology/reports' },
            { label: 'Report Unavailable' },
          ]}
        />

        <div className="max-w-2xl mx-auto my-8">
          {error && <ErrorAlert error={error} onDismiss={clearError} />}

          <Card className="mt-4 text-center p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isUnreadyError
                  ? 'Report Readiness Gate Enforced'
                  : 'Report Could Not Be Loaded'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {isUnreadyError
                  ? 'Final pathology laboratory reports are generated only when all tests in the order have specimens collected, results entered, verified, and formally released.'
                  : 'The requested order could not be found or belongs to another hospital tenant.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => navigate('/pathology/reports')}
              >
                Back to Reports
              </Button>
              {orderId && /^\d+$/.test(orderId) && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/pathology/lab-orders/${orderId}`)}
                >
                  Open Lab Order
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Check if any test in the report contains interpretation notes
  const hasInterpretations = report.tests.some(
    (t) => t.interpretation && t.interpretation.trim().length > 0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ─── Screen Control Bar (Hidden when Printing) ────────────────────────── */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={`Lab Report — ${report.orderNumber}`}
          subtitle="Official laboratory diagnostic report with released test measurements and reference ranges."
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Pathology', path: '/pathology' },
            { label: 'Reports', path: '/pathology/reports' },
            { label: report.orderNumber },
          ]}
        />

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => void loadReport()}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="md"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate('/pathology/reports')}
          >
            Back
          </Button>

          <Button
            variant="primary"
            size="md"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* ─── Professional Clinical Lab Report Sheet (A4-Optimized) ─────────────── */}
      <div
        id="printable-lab-report"
        className="bg-white rounded-lg border border-slate-200/90 shadow-sm p-8 md:p-10 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:rounded-none"
      >
        {/* 1. Clinical Laboratory Header */}
        <div className="border-b-2 border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
                  CS
                </div>
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                  CareSync Diagnostic Laboratories
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Department of Pathology & Laboratory Medicine
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-slate-400 inline" />
                Accredited Clinical Reference Laboratory · Demo Hospital Facility
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 tracking-wider uppercase">
                <FileCheck2 className="w-3 h-3 text-emerald-700" />
                FINAL REPORT
              </span>
              <div className="mt-1 text-xs text-slate-600 font-mono">
                Report Ref: <strong className="text-slate-900">{report.orderNumber}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Order Date: <span className="font-medium text-slate-700">{formatDate(report.orderDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Structured Patient Information Matrix */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Patient & Clinical Information
          </div>
          <div className="border border-slate-300 rounded overflow-hidden text-xs bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
              {/* Left Column */}
              <div className="divide-y divide-slate-200">
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">Patient Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{report.patient.fullName}</span>
                </div>
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">UHID / Patient #:</span>
                  <span className="font-mono font-semibold text-slate-800">{report.patient.patientNumber}</span>
                </div>
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">Date of Birth:</span>
                  <span className="font-medium text-slate-800">
                    {report.patient.dateOfBirth ? formatDate(report.patient.dateOfBirth) : '—'}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-slate-200">
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">Age / Gender:</span>
                  <span className="font-semibold text-slate-900">
                    {report.patient.age !== null && report.patient.age !== undefined
                      ? `${report.patient.age} Yrs`
                      : '—'}{' '}
                    / {report.patient.gender}
                  </span>
                </div>
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">Order Reference:</span>
                  <span className="font-mono font-semibold text-slate-900">{report.orderNumber}</span>
                </div>
                <div className="flex items-center px-3.5 py-2">
                  <span className="w-32 font-semibold text-slate-500 shrink-0">Report Date & Time:</span>
                  <span className="font-medium text-slate-800">{formatDateTime(report.orderDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Laboratory Investigations & Results Table (The Visual Centerpiece) */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Pathological Investigations & Measurements
          </div>

          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-[32%]">Investigation / Test</th>
                  <th className="py-2.5 px-3 w-[18%]">Specimen (Sample #)</th>
                  <th className="py-2.5 px-3 w-[14%] text-right">Observed Value</th>
                  <th className="py-2.5 px-3 w-[10%]">Unit</th>
                  <th className="py-2.5 px-3 w-[14%]">Reference Range</th>
                  <th className="py-2.5 px-3 w-[12%] text-center">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {report.tests.map((test) => (
                  <tr key={test.orderItemId} className="hover:bg-slate-50/50">
                    {/* Test Name & Code */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 text-sm block leading-tight">
                        {test.testName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                        Code: {test.testCode}
                      </span>
                    </td>

                    {/* Specimen / Accession */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">
                        {test.sampleType || '—'}
                      </span>
                      {test.sampleNumber && (
                        <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                          Acc: {test.sampleNumber}
                        </span>
                      )}
                    </td>

                    {/* Observed Value - Highest Clinical Emphasis */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono text-base font-extrabold text-slate-900 tracking-tight">
                        {test.resultValue || '—'}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {test.unit || '—'}
                    </td>

                    {/* Biological Reference Range */}
                    <td className="py-3 px-3 font-mono text-xs text-slate-800 whitespace-nowrap">
                      {test.referenceRange || '—'}
                    </td>

                    {/* Result Flag */}
                    <td className="py-3 px-3 text-center">
                      {test.resultFlag ? (
                        <ResultFlagBadge flag={test.resultFlag} size="sm" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Clinical Interpretation & Remarks (Rendered only when present) */}
        {hasInterpretations && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Clinical Interpretation Notes
            </div>
            <div className="border border-slate-300 rounded p-3.5 bg-slate-50/50 text-xs text-slate-800 space-y-1.5">
              {report.tests
                .filter((t) => t.interpretation && t.interpretation.trim().length > 0)
                .map((t) => (
                  <div key={`interp-${t.orderItemId}`}>
                    <strong className="text-slate-900">{t.testName}:</strong>{' '}
                    <span>{t.interpretation}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 5. Laboratory Audit & Sign-off Footer */}
        <div className="pt-4 border-t border-slate-300 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Entry / Processing */}
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50/30">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Result Entry
              </span>
              <div className="mt-1 text-slate-800 font-medium flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  {report.tests[0]?.resultEnteredAt
                    ? formatDateTime(report.tests[0].resultEnteredAt)
                    : 'Entered in LIS'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Medical Lab Technologist
              </span>
            </div>

            {/* Pathologist Verification */}
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50/30">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Verified By
              </span>
              <div className="mt-1 text-slate-800 font-medium flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                <span>
                  {report.tests[0]?.verifiedAt
                    ? formatDateTime(report.tests[0].verifiedAt)
                    : 'Consultant Pathologist'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Consultant Pathologist / Lab Supervisor
              </span>
            </div>

            {/* Final Release */}
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50/30">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Final Report Release
              </span>
              <div className="mt-1 text-emerald-800 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>
                  {report.tests[0]?.releasedAt
                    ? formatDateTime(report.tests[0].releasedAt)
                    : 'Released'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Officially Released Document
              </span>
            </div>
          </div>

          {/* End of Report Marker & Formal Disclaimer */}
          <div className="text-center pt-2 space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              *** End of Examination Report ***
            </div>
            <p className="text-[10px] text-slate-500">
              This is a computer-generated final diagnostic report issued by CareSync Diagnostic Laboratories.
              Results relate only to the items tested. No physical signature is required.
            </p>
          </div>
        </div>

        {/* 6. Document Footer Bar */}
        <div className="border-t border-slate-200 pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
          <span>CareSync LIS · Pathology Laboratory Management System</span>
          <span className="font-mono">Ref: {report.orderNumber} · Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
