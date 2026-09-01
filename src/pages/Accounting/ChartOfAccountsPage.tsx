import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge, type BadgeVariant } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ToastContainer } from '../../components/common/Toast';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { accountingService } from '../../services/accountingService';
import { AccountModal } from './components/AccountModal';
import type { AccountDto } from '../../types/accounting';

export const ChartOfAccountsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { toasts, success, dismiss } = useToast();
  const canCreate = hasRole('Admin') || hasRole('Accountant');

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Classification Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getAccounts(
        selectedType !== 'ALL' ? selectedType : undefined
      );
      setAccounts(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to load Chart of Accounts.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleAccountCreated = (newAccount: AccountDto) => {
    setIsCreateModalOpen(false);
    success(`Account [${newAccount.code}] ${newAccount.name} created successfully.`);
    void loadAccounts();
  };

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const matchesSearch =
        searchTerm === '' ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType =
        selectedType === 'ALL' ||
        a.type.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, selectedType]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = accounts.length;
    const assets = accounts.filter((a) => a.type === 'Asset').length;
    const liabilities = accounts.filter((a) => a.type === 'Liability').length;
    const revenue = accounts.filter((a) => a.type === 'Revenue').length;
    const expense = accounts.filter((a) => a.type === 'Expense').length;

    return { total, assets, liabilities, revenue, expense };
  }, [accounts]);

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
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Top Header */}
      <PageHeader
        title="Chart of Accounts"
        subtitle="Master General Ledger account registry, natural balances, and system account protections."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAccounts}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Account</span>
              </Button>
            )}
          </div>
        }
      />

      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Account Type Classification KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setSelectedType('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedType === 'ALL'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            All Accounts
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('Asset')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedType === 'Asset'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            Assets (1xxx)
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.assets}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('Liability')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedType === 'Liability'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Liabilities (2xxx)
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.liabilities}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('Revenue')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedType === 'Revenue'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Revenue (4xxx)
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.revenue}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType('Expense')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedType === 'Expense'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Expenses (5xxx)
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {metrics.expense}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, name, description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 shrink-0">Type Filter:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Classifications</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Chart of Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Type / Scope</th>
                <th className="py-3 px-4 text-right">Total Debit</th>
                <th className="py-3 px-4 text-right">Total Credit</th>
                <th className="py-3 px-4 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading Chart of Accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No accounts matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {a.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {a.name}
                        </span>
                        {a.description && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {a.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getTypeBadgeVariant(a.type)} size="sm">
                        {a.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {a.isSystemAccount ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                          <Lock className="w-3 h-3 text-amber-600" />
                          System Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Custom Account
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      ${a.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      ${a.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${a.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredAccounts.length}</strong> of <strong>{accounts.length}</strong> active accounts
          </span>
          <span className="text-[11px] text-slate-400">
            System accounts cannot be renamed or deleted to ensure continuous automated posting integrity.
          </span>
        </div>
      </div>

      {/* Account Creation Modal */}
      <AccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAccountCreated}
      />
    </div>
  );
};

export default ChartOfAccountsPage;
