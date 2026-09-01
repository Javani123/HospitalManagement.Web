import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Eye,
  Receipt,
  CreditCard,
  Ban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { accountingService } from '../../services/accountingService';
import type { JournalEntryDto } from '../../types/accounting';

export const JournalRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [journals, setJournals] = useState<JournalEntryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 50;

  const loadJournals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getJournalEntries({
        sourceType: sourceTypeFilter !== 'ALL' ? sourceTypeFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        pageSize,
      });
      setJournals(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load journal entries.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sourceTypeFilter, fromDate, toDate, page]);

  useEffect(() => {
    void loadJournals();
  }, [loadJournals]);

  // Client-side search and status filtering
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const matchesSearch =
        searchTerm === '' ||
        j.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.createdByName && j.createdByName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        j.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [journals, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = journals.length;
    const posted = journals.filter((j) => j.status === 'Posted').length;
    const reversed = journals.filter((j) => j.status === 'Reversed').length;
    const totalVolume = journals.reduce((sum, j) => sum + Number(j.totalAmount || 0), 0);

    return { total, posted, reversed, totalVolume };
  }, [journals]);

  const getSourceTypeBadge = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'invoice':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <Receipt className="w-3 h-3 text-blue-600" />
            Invoice
          </span>
        );
      case 'payment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <CreditCard className="w-3 h-3 text-emerald-600" />
            Payment
          </span>
        );
      case 'paymentvoid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
            <Ban className="w-3 h-3 text-rose-600" />
            Payment Void
          </span>
        );
      case 'invoicecancellation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            <Ban className="w-3 h-3 text-amber-600" />
            Invoice Cancel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {sourceType}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="General Journal Register"
        subtitle="Chronological audit log of double-entry financial transactions generated from operations."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadJournals}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Journal Entries
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active audit records on file
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Posted Entries
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics.posted}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active settled ledger postings
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Reversals & Voids
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metrics.reversed}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Compensating reversal entries
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Total Journalized Volume
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ${metrics.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cumulative financial debit flow
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entry #, description, staff..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Source Type Filter */}
          <div>
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Source Types</option>
              <option value="Invoice">Invoices</option>
              <option value="Payment">Payments</option>
              <option value="PaymentVoid">Payment Voids</option>
              <option value="InvoiceCancellation">Invoice Cancellations</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Posted">Posted</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 focus:bg-white"
              title="From Posting Date"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 focus:bg-white"
              title="To Posting Date"
            />
          </div>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Entry Number</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Source Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading Journal Entries...
                  </td>
                </tr>
              ) : filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No journal entries matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJournals.map((j) => (
                  <tr
                    key={j.id}
                    onClick={() => navigate(`/accounting/journals/${j.id}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 group-hover:underline">
                      {j.entryNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {new Date(j.postingDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {getSourceTypeBadge(j.sourceType)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate">
                      {j.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={j.status === 'Posted' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {j.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${j.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {j.createdByName || 'System Actor'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/accounting/journals/${j.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Double-Entry Lines"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredJournals.length}</strong> journal entries (Page {page})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredJournals.length < pageSize || loading}
              className="flex items-center gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalRegisterPage;
