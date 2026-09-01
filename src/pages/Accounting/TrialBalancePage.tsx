import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Printer,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, type BadgeVariant } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { accountingService } from '../../services/accountingService';
import type { TrialBalanceDto } from '../../types/accounting';

export const TrialBalancePage: React.FC = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // As Of Date filter
  const [asOfDate, setAsOfDate] = useState<string>('');

  const loadTrialBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getTrialBalance(asOfDate || undefined);
      setTrialBalance(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to generate Trial Balance.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  useEffect(() => {
    void loadTrialBalance();
  }, [loadTrialBalance]);

  const isBalanced = trialBalance?.isBalanced ?? true;
  const discrepancy = trialBalance
    ? Math.abs(trialBalance.totalDebit - trialBalance.totalCredit)
    : 0;

  const getTypeBadgeVariant = (type: string): BadgeVariant => {
    switch (type.toLowerCase()) {
      case 'asset':
        return 'info';
      case 'liability':
        return 'warning';
      case 'equity':
        return 'purple';
      case 'revenue':
        return 'success';
      case 'expense':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="Trial Balance Statement"
        subtitle="Real-time financial verification verifying debit and credit equilibrium across all ledger accounts."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTrialBalance}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Prominent Equilibrium Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          isBalanced
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-100/40 border-emerald-300 text-emerald-950 shadow-xs'
            : 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-100 border-rose-300 text-rose-950 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isBalanced
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
            }`}
          >
            {isBalanced ? (
              <ShieldCheck className="w-7 h-7" />
            ) : (
              <AlertCircle className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold tracking-tight">
                {isBalanced
                  ? 'General Ledger is in Perfect Equilibrium'
                  : 'Out of Balance Warning: Discrepancy Detected'}
              </h3>
              <Badge variant={isBalanced ? 'success' : 'danger'} size="md">
                {isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {isBalanced
                ? 'Total Debits equal Total Credits. All automated postings are balanced.'
                : `Total Debits and Total Credits differ by $${discrepancy.toFixed(2)}. Immediate review required.`}
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200/80 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">As of:</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="text-xs bg-transparent border-0 p-0 focus:ring-0 text-slate-900 font-semibold"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Debits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Debit Balances
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            ${(trialBalance?.totalDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sum of positive asset and expense account balances
          </p>
        </div>

        {/* Total Credits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Credit Balances
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            ${(trialBalance?.totalCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sum of liability, equity, and revenue account balances
          </p>
        </div>

        {/* Balance Difference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Equilibrium Variance
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              isBalanced ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            ${discrepancy.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBalanced ? '0.00 difference (Balanced)' : 'Active variance detected'}
          </p>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Account Balance Worksheet ({trialBalance?.accounts.length || 0} Accounts)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Statement Date: {trialBalance ? new Date(trialBalance.asOfDate).toLocaleString() : '-'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Debit Balance ($)</th>
                <th className="py-3 px-4 text-right">Credit Balance ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !trialBalance ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Generating Trial Balance Statement...
                  </td>
                </tr>
              ) : !trialBalance || trialBalance.accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No active accounts in ledger.
                  </td>
                </tr>
              ) : (
                trialBalance.accounts.map((a) => (
                  <tr key={a.accountId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {a.accountCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {a.accountName}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getTypeBadgeVariant(a.accountType)} size="sm">
                        {a.accountType}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {Number(a.debitBalance) > 0 ? (
                        `$${Number(a.debitBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {Number(a.creditBalance) > 0 ? (
                        `$${Number(a.creditBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Grand Total Footer */}
            <tfoot className="bg-slate-50 font-semibold text-xs border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-4 px-4 text-right uppercase tracking-wider text-slate-700 font-bold">
                  Grand Totals:
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ${(trialBalance?.totalDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ${(trialBalance?.totalCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Guidance */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Balanced verification confirms mathematical equality of debits and credits across the ledger.
          </span>
          <span className="font-semibold text-slate-700">
            {isBalanced ? '✓ Zero Variance' : `⚠ Variance: $${discrepancy.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrialBalancePage;
