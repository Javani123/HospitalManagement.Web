import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { AccountType, type CreateAccountRequest, type AccountDto } from '../../../types/accounting';
import { accountingService } from '../../../services/accountingService';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: AccountDto) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>(AccountType.Asset);
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCode('');
    setName('');
    setType(AccountType.Asset);
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setError('Account Code is required (e.g., 6050, 1060).');
      return;
    }

    if (!trimmedName) {
      setError('Account Name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateAccountRequest = {
        code: trimmedCode,
        name: trimmedName,
        type,
        description: description.trim() || null,
      };

      const created = await accountingService.createAccount(payload);
      resetForm();
      onSuccess(created);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to create account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create General Ledger Account"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        {/* Account Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Account Code <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 6050, 1060, 5020"
              maxLength={20}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Must be unique within the hospital Chart of Accounts.
          </p>
        </div>

        {/* Account Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Account Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Laboratory Equipment Maintenance"
            maxLength={150}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Account Classification Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Account Classification <span className="text-rose-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(Number(e.target.value) as AccountType)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={AccountType.Asset}>Asset (Debit Normal)</option>
            <option value={AccountType.Liability}>Liability (Credit Normal)</option>
            <option value={AccountType.Equity}>Equity (Credit Normal)</option>
            <option value={AccountType.Revenue}>Revenue (Credit Normal)</option>
            <option value={AccountType.Expense}>Expense (Debit Normal)</option>
          </select>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description / Purpose
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional accounting guidance for this account..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Informational Guidance Alert */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Custom accounts inherit double-entry tracking and will appear in the Chart of Accounts, General Ledger statements, and Trial Balance reports.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
