import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileSpreadsheet,
  Scale,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Percent,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Badge } from '../../components/common/Badge';
import { accountingService } from '../../services/accountingService';
import type {
  AccountingSummaryDto,
  TrialBalanceDto,
  JournalEntryDto,
} from '../../types/accounting';

export const AccountingDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<AccountingSummaryDto | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceDto | null>(null);
  const [recentJournals, setRecentJournals] = useState<JournalEntryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, tbData, journalsData] = await Promise.all([
        accountingService.getSummary(),
        accountingService.getTrialBalance(),
        accountingService.getJournalEntries({ page: 1, pageSize: 5 }),
      ]);
      setSummary(sumData);
      setTrialBalance(tbData);
      setRecentJournals(journalsData);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load accounting dashboard metrics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const isBalanced = trialBalance?.isBalanced ?? true;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="Accounting & Financial Control"
        subtitle="Executive double-entry ledger oversight, revenue recognition, and financial health monitoring."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/accounting/journals')}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Journal Register</span>
            </Button>
          </div>
        }
      />

      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Trial Balance Health Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          isBalanced
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200/80 text-emerald-900'
            : 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isBalanced
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
            }`}
          >
            {isBalanced ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">
                {isBalanced
                  ? 'Double-Entry Ledger in Perfect Equilibrium'
                  : 'Ledger Out of Balance Discrepancy Detected'}
              </h3>
              <Badge variant={isBalanced ? 'success' : 'danger'} size="sm">
                {isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {trialBalance
                ? `Total Debits: $${trialBalance.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Total Credits: $${trialBalance.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'Evaluating ledger balance equilibrium...'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/accounting/trial-balance')}
          className="bg-white/80 shrink-0 text-xs flex items-center gap-1.5"
        >
          <span>View Trial Balance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${(summary?.netRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Gross: ${(summary?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-600 font-medium">Disc: -${(summary?.totalDiscounts || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accounts Receivable
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${(summary?.accountsReceivableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Unsettled patient billing claims (Asset 1200)
            </p>
          </div>
        </div>

        {/* Cash & Bank Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cash & Bank Assets
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">
              ${(summary?.totalCashAndBank || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Liquid funds across Cash, Bank, UPI & Cheque
            </p>
          </div>
        </div>

        {/* Doctor Commission Payable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Commission Payable
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-900">
              ${(summary?.doctorCommissionPayable || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Expense accrued: ${(summary?.doctorCommissionExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Accounting Modules Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart of Accounts */}
        <button
          type="button"
          onClick={() => navigate('/accounting/accounts')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
            Chart of Accounts
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Inspect master account classifications, system accounts, and live computed balances.
          </p>
        </button>

        {/* Journal Register */}
        <button
          type="button"
          onClick={() => navigate('/accounting/journals')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
            Journal Register
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Audit automated double-entry postings for Invoices, Receipts, and Void reversals.
          </p>
        </button>

        {/* General Ledger */}
        <button
          type="button"
          onClick={() => navigate('/accounting/ledger')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-teal-600 transition-colors">
            General Ledger
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Examine chronological debits, credits, and running balance statements per GL account.
          </p>
        </button>

        {/* Trial Balance */}
        <button
          type="button"
          onClick={() => navigate('/accounting/trial-balance')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Scale className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-4 group-hover:text-amber-600 transition-colors">
            Trial Balance
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Verify real-time equilibrium across all account debit and credit balances.
          </p>
        </button>
      </div>

      {/* Flow Visualization & Recent Journal Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accounting Flow Visualization */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Automated Double-Entry Accounting Flow
              </h3>
              <p className="text-xs text-slate-500">
                How clinical operations seamlessly post to financial ledgers in real time.
              </p>
            </div>
            <Badge variant="info" size="sm">
              Real-Time Automated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Flow 1: Billing */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Receipt className="w-4 h-4" />
                <span>1. Billing Issuance</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">DR</span>
                  <span>1200 Accounts Rec.</span>
                </div>
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">DR</span>
                  <span>4100 Discounts Allow.</span>
                </div>
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">CR</span>
                  <span>4000 Lab Revenue</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-snug">
                Recognizes revenue and establishes patient receivable claim upon invoice creation.
              </p>
            </div>

            {/* Flow 2: Payments */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CreditCard className="w-4 h-4" />
                <span>2. Payment Receipt</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">DR</span>
                  <span>Asset (Cash/Bank/UPI)</span>
                </div>
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">CR</span>
                  <span>1200 Accounts Rec.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-snug">
                Increases liquid cash/bank assets and relieves outstanding receivable balance.
              </p>
            </div>

            {/* Flow 3: Doctor Commission */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                <Percent className="w-4 h-4" />
                <span>3. Commission Accrual</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-blue-700 font-bold">DR</span>
                  <span>5000 Commission Exp.</span>
                </div>
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-emerald-700 font-bold">CR</span>
                  <span>2100 Commission Pay.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-snug">
                Accrues doctor incentive as an operating expense without diminishing gross lab revenue.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Journal Entries Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Journal Entries
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/accounting/journals')}
                className="text-xs p-1 h-auto"
              >
                View All
              </Button>
            </div>

            {loading && recentJournals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading recent journals...
              </div>
            ) : recentJournals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No journal entries recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentJournals.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => navigate(`/accounting/journals/${j.id}`)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {j.entryNumber}
                        </span>
                        <Badge
                          variant={j.status === 'Posted' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {j.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {j.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ${j.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(j.postingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Journal Entries:</span>
            <span className="font-bold text-slate-800">
              {summary?.totalJournalEntriesCount || recentJournals.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboardPage;
