import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { accountingService } from '../../services/accountingService';
import type { GeneralLedgerReportDto } from '../../types/accounting';

export const GeneralLedgerPage: React.FC = () => {
  const [ledgerReport, setLedgerReport] = useState<GeneralLedgerReportDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Expand / Collapse state per account in ledger
  const [collapsedAccounts, setCollapsedAccounts] = useState<Record<number, boolean>>({});

  const loadLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getGeneralLedger({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setLedgerReport(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to generate General Ledger report.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const toggleAccountCollapse = (accountId: number) => {
    setCollapsedAccounts((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  // Filtered Accounts
  const visibleAccounts = useMemo(() => {
    if (!ledgerReport) return [];

    return ledgerReport.accounts.filter((a) => {
      const matchesAccountSelect =
        selectedAccountId === 'ALL' || a.accountId === Number(selectedAccountId);

      const matchesSearch =
        searchTerm === '' ||
        a.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.transactions.some(
          (t) =>
            t.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesAccountSelect && matchesSearch;
    });
  }, [ledgerReport, selectedAccountId, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="General Ledger"
        subtitle="Chronological account statements with running balances and double-entry transaction histories."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ledger</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadLedger}
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

      {/* Filter and Date Range Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Account Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select GL Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All General Ledger Accounts</option>
              {ledgerReport?.accounts.map((a) => (
                <option key={a.accountId} value={a.accountId}>
                  [{a.accountCode}] {a.accountName} ({a.accountType})
                </option>
              ))}
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Search Description / Voucher
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entry #, memo..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              From Posting Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              To Posting Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Aggregate Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              General Ledger Activity Statement
            </h4>
            <p className="text-[11px] text-slate-500">
              {fromDate || toDate
                ? `Period: ${fromDate || 'Beginning'} through ${toDate || 'Present'}`
                : 'All cumulative transactions on record'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Period Total Debits
            </span>
            <span className="font-bold text-slate-900 text-sm">
              ${(ledgerReport?.totalDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Period Total Credits
            </span>
            <span className="font-bold text-slate-900 text-sm">
              ${(ledgerReport?.totalCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Accounts Accordions */}
      {loading && !ledgerReport ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Generating General Ledger statements...
        </div>
      ) : visibleAccounts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-400 text-sm">
          No accounts found matching filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAccounts.map((account) => {
            const isCollapsed = collapsedAccounts[account.accountId];
            return (
              <div
                key={account.accountId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Account Card Header */}
                <div
                  onClick={() => toggleAccountCollapse(account.accountId)}
                  className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {account.accountCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {account.accountName}
                        </h3>
                        <Badge variant="neutral" size="sm">
                          {account.accountType}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Opening Balance: <strong>${account.openingBalance.toFixed(2)}</strong> | Period Debit: <strong>${account.periodDebit.toFixed(2)}</strong> | Period Credit: <strong>${account.periodCredit.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Closing Balance
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 block">
                        ${account.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg hover:bg-slate-200 text-slate-400">
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Transactions Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    {account.transactions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No transactions recorded for this account during selected period.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Posting Date</th>
                            <th className="py-2.5 px-4">Journal Voucher</th>
                            <th className="py-2.5 px-4">Source</th>
                            <th className="py-2.5 px-4">Description / Memo</th>
                            <th className="py-2.5 px-4 text-right">Debit ($)</th>
                            <th className="py-2.5 px-4 text-right">Credit ($)</th>
                            <th className="py-2.5 px-4 text-right">Running Balance ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {account.transactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-600">
                                {new Date(tx.postingDate).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Link
                                  to={`/accounting/journals/${tx.journalEntryId}`}
                                  className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>{tx.entryNumber}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </Link>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {tx.sourceType} #{tx.sourceId}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                                {tx.description}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                                {Number(tx.debit) > 0 ? (
                                  `$${Number(tx.debit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                                {Number(tx.credit) > 0 ? (
                                  `$${Number(tx.credit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-blue-900">
                                ${Number(tx.runningBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GeneralLedgerPage;
