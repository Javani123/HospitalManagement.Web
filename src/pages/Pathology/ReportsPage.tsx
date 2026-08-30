import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderQuery, setOrderQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = orderQuery.trim();
    if (!trimmed) {
      setValidationError('Please enter a valid Order Number (e.g. LAB000001) or Order ID.');
      return;
    }
    setValidationError(null);
    navigate(`/pathology/reports/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Final Pathology Lab Reports"
        subtitle="Retrieve and generate verified, read-only diagnostic laboratory reports for released clinical orders."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Pathology', path: '/pathology' },
          { label: 'Reports' },
        ]}
        badge={<Badge variant="success" size="sm">M13 Final Reports</Badge>}
      />

      {/* Main Search / Lookup Card */}
      <Card className="max-w-2xl mx-auto p-6 md:p-8">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Pathology Report Lookup
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter the lab order number or order identifier to generate the consolidated clinical pathology report.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="order-search" className="text-xs font-semibold text-slate-700">
              Lab Order Reference
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="order-search"
                type="text"
                value={orderQuery}
                onChange={(e) => {
                  setOrderQuery(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. LAB000001, LAB000003, or Order ID (e.g. 1)"
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-colors ${
                  validationError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
            </div>
            {validationError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-0.5" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Final Lab Report
          </Button>
        </form>
      </Card>

      {/* Readiness Workflow Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">1. Order & Specimen</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All tests in the order must have specimens collected and received at the lab bench.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">2. Result Verification</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Measurements must be entered and evaluated against demographic reference ranges, then verified.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">3. Release & Finalize</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Once released, the consolidated pathology report becomes immutable and print-ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
