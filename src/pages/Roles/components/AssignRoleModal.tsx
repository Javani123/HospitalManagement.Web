import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type { RoleDto } from '../../../types/role';
import type { AppError } from '../../../types/api';

interface AssignRoleModalProps {
  isOpen: boolean;
  userId: number;
  username: string;
  availableRoles: RoleDto[];
  assignedRoleIds: number[];
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onAssign: (roleId: number) => Promise<void>;
  onClearError: () => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  userId,
  username,
  availableRoles,
  assignedRoleIds,
  isSubmitting,
  error,
  onClose,
  onAssign,
  onClearError,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter available roles: only active roles that are NOT already assigned to this user
  const unassignedRoles = availableRoles.filter(
    (role) => role.isActive && !assignedRoleIds.includes(role.id)
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId('');
      setValidationError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleIdNum = Number(selectedRoleId);
    if (!selectedRoleId || isNaN(roleIdNum) || roleIdNum <= 0) {
      setValidationError('Please select a role to assign.');
      return;
    }
    setValidationError(null);
    await onAssign(roleIdNum);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-role-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="assign-role-title" className="text-base font-bold text-slate-900 leading-snug">
                Assign Role to User
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign an authorization role to user <strong className="text-slate-800">{username}</strong> (ID: #{userId})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server / Validation Error Alert */}
        {error && <ErrorAlert error={error} onDismiss={onClearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="assign-role-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Select Role to Assign <span className="text-rose-500">*</span>
            </label>

            {unassignedRoles.length > 0 ? (
              <select
                id="assign-role-select"
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setValidationError(null);
                  if (error) onClearError();
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors ${
                  validationError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                <option value="">Choose a role...</option>
                {unassignedRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.isSystem ? 'System' : 'Custom'})
                    {role.description ? ` — ${role.description}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                All active hospital roles are already assigned to this user account.
              </div>
            )}

            {validationError && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {validationError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={unassignedRoles.length === 0}
              leftIcon={<Shield className="w-4 h-4" />}
            >
              Assign Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoleModal;
