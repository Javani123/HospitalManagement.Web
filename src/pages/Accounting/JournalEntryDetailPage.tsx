import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Ban,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { accountingService } from '../../services/accountingService';
import type { JournalEntryDto } from '../../types/accounting';

export const JournalEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [journal, setJournal] = useState<JournalEntryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadJournal = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getJournalEntryById(Number(id));
      setJournal(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load journal entry details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  if (loading && !journal) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Loading journal entry #{id}...</p>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/accounting/journals')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal Register</span>
        </Button>
        <ErrorAlert
          error={error || 'Journal entry could not be found.'}
        />
      </div>
    );
  }

  const totalDebit = journal.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = journal.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.005;

  const renderSourceLink = () => {
    const st = journal.sourceType.toLowerCase();
    if (st === 'invoice' || st === 'invoicecancellation') {
      return (
        <Link
          to={`/invoices/${journal.sourceId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>Invoice ID #{journal.sourceId}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      );
    }
    if (st === 'payment' || st === 'paymentvoid') {
      return (
        <Link
          to={`/payments/${journal.sourceId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
        >
          <span>Payment ID #{journal.sourceId}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      );
    }
    return <span className="text-xs text-slate-700">Source #{journal.sourceId}</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Page Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/accounting/journals')}
          className="flex items-center gap-1.5 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal Register</span>
        </Button>

        <PageHeader
          title={`Journal Entry ${journal.entryNumber}`}
          subtitle="Detailed double-entry distribution and audit ledger posting verification."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadJournal}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* Journal Metadata Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {journal.entryNumber}
              </span>
              <Badge
                variant={journal.status === 'Posted' ? 'success' : 'danger'}
                size="md"
              >
                {journal.status}
              </Badge>
              {journal.reversalOfJournalEntryId && (
                <Link
                  to={`/accounting/journals/${journal.reversalOfJournalEntryId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reversal of Journal #{journal.reversalOfJournalEntryId}</span>
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {journal.description}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Entry Amount
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
              ${journal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">
              Posting Date
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block font-mono">
              {new Date(journal.postingDate).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">
              Source Document
            </span>
            <div className="mt-0.5 font-bold">
              {renderSourceLink()}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">
              Posted By
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block truncate">
              {journal.createdByName || 'System Actor'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-semibold">
              System Audit Timestamp
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block font-mono text-[11px]">
              {new Date(journal.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Double-Entry Lines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Ledger Distribution Lines ({journal.lines.length})
          </h3>
          <Badge variant={isBalanced ? 'success' : 'danger'} size="sm">
            {isBalanced ? 'BALANCED' : 'OUT OF BALANCE'}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Line Memo / Description</th>
                <th className="py-3 px-4 text-right">Debit ($)</th>
                <th className="py-3 px-4 text-right">Credit ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journal.lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {line.accountCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {line.accountName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {line.accountType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {line.description || journal.description}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {Number(line.debit) > 0 ? (
                      `$${Number(line.debit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {Number(line.credit) > 0 ? (
                      `$${Number(line.credit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Footer */}
            <tfoot className="bg-slate-50 font-semibold text-xs border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-slate-600 font-bold">
                  Total Ledger Distribution:
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Equilibrium Verification Bar */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isBalanced
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span className="font-bold">
              {isBalanced
                ? 'Entry Status: Double-entry lines are in balance (Debits = Credits).'
                : `Entry Status: Unbalanced! Discrepancy of $${Math.abs(totalDebit - totalCredit).toFixed(2)}.`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Immutable Historical Record • Cannot be modified directly
          </span>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetailPage;
