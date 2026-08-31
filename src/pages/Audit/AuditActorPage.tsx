import React, { useState, useEffect, useCallback } from 'react';
import {
  Fingerprint,
  UserCheck,
  Building2,
  Shield,
  Link,
  Unlink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';
import { staffService } from '../../services/staffService';
import { auditActorService } from '../../services/auditActorService';
import type { StaffDto } from '../../types/staff';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';

export const AuditActorPage: React.FC = () => {
  const { user, refreshUser, hasRole } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Staff directory state
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);

  // Linkage Management state
  const [targetUserId, setTargetUserId] = useState<string>(user?.id ? String(user.id) : '1');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Unlink Dialog state
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState<boolean>(false);
  const [isUnlinking, setIsUnlinking] = useState<boolean>(false);

  // Load active staff members
  const loadStaff = useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const allStaff = await staffService.getAll();
      setStaffList(allStaff.filter((s) => s.isActive));
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoadingStaff(false);
    }
  }, [handleError]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  // Keep targetUserId in sync with current user if initially unassigned
  useEffect(() => {
    if (user?.id && !targetUserId) {
      setTargetUserId(String(user.id));
    }
  }, [user, targetUserId]);

  // Find linked staff details for current authenticated user
  const currentLinkedStaff = user?.staffId
    ? staffList.find((s) => s.id === user.staffId)
    : null;

  // Selected staff in dropdown preview
  const selectedStaffPreview = selectedStaffId
    ? staffList.find((s) => String(s.id) === selectedStaffId)
    : null;

  // Handle Link / Change Staff
  const handleLinkStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const parsedUserId = Number(targetUserId);
    const parsedStaffId = Number(selectedStaffId);

    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      setFormError('Please enter a valid User ID.');
      return;
    }

    if (!selectedStaffId || isNaN(parsedStaffId) || parsedStaffId <= 0) {
      setFormError('Please select a hospital staff member to link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await auditActorService.linkStaff(parsedUserId, parsedStaffId);
      toastSuccess(
        `User "${updatedUser.username}" successfully linked to Staff: ${updatedUser.staffName || `ID #${parsedStaffId}`}.`
      );

      // If linking the current authenticated user, refresh AuthContext
      if (user && updatedUser.id === user.id) {
        await refreshUser();
      }
      setSelectedStaffId('');
    } catch (err) {
      const normalized = handleError(err);
      setFormError(normalized.message || 'Failed to link staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unlink Staff
  const handleConfirmUnlink = async () => {
    const parsedUserId = Number(targetUserId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) return;

    setIsUnlinking(true);
    try {
      const updatedUser = await auditActorService.unlinkStaff(parsedUserId);
      toastSuccess(`Staff association removed for user "${updatedUser.username}".`);

      // If unlinking current user, refresh AuthContext
      if (user && updatedUser.id === user.id) {
        await refreshUser();
      }
      setIsUnlinkDialogOpen(false);
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to unlink staff member.');
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <PageHeader
        title="Audit Actor"
        subtitle="Manage user-to-staff identity mapping used for clinical audit trails and attribution."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Administration' },
          { label: 'Audit Actor' },
        ]}
        badge={
          <Badge variant={user?.staffId ? 'success' : 'neutral'} size="sm">
            <span className="flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5" />
              {user?.staffId ? 'Actor Linked' : 'Actor Unlinked'}
            </span>
          </Badge>
        }
      />

      {/* Global Error Banner */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      {/* Grid: Current Actor Profile Card & Attribution Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Authenticated Audit Actor Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg shadow-xs">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Current Authenticated Actor
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your active session identity used by the server to sign clinical actions.
                  </p>
                </div>
              </div>

              <Badge variant={user?.staffId ? 'success' : 'warning'} size="sm" dot>
                {user?.staffId ? 'Identity Linked' : 'Unlinked Identity'}
              </Badge>
            </div>

            {/* User Profile Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  User Account
                </span>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{user?.username}</span>
                  <span className="text-xs text-slate-400 font-mono font-normal">
                    (ID: #{user?.id})
                  </span>
                </p>
                <p className="text-xs text-slate-500">{user?.email || 'No email registered'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Roles
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No roles assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Staff Identity Banner */}
            <div className="mt-5">
              {user?.staffId ? (
                <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                        Attributed Clinical Staff
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {user.staffName || currentLinkedStaff?.fullName || `Staff #${user.staffId}`}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-teal-700 font-semibold">
                          {currentLinkedStaff?.employeeNumber || 'STF-LINKED'}
                        </span>
                        {currentLinkedStaff?.departmentName && (
                          <>
                            <span>•</span>
                            <span>{currentLinkedStaff.departmentName}</span>
                          </>
                        )}
                        {currentLinkedStaff?.designation && (
                          <>
                            <span>•</span>
                            <span className="italic">{currentLinkedStaff.designation}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Attribution
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-950">No Hospital Staff Identity Linked</p>
                    <p className="text-amber-800 leading-relaxed">
                      Your login account is not linked to an employee record in Staff Master.
                      Clinical workflow actions (Sample Collection, Result Entry, Verification) will
                      fall back to legacy unlinked audit attribution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Actions Attribution Preview */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Automated Clinical Trail Attribution:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Sample Collection</span>
                <span className="font-medium text-slate-800">
                  {user?.staffName || 'Legacy Actor'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Sample Receipt</span>
                <span className="font-medium text-slate-800">
                  {user?.staffName || 'Legacy Actor'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Result Entry</span>
                <span className="font-medium text-slate-800">
                  {user?.staffName || 'Legacy Actor'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Verification & Release</span>
                <span className="font-medium text-slate-800">
                  {user?.staffName || 'Legacy Actor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security Architecture Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identity Architecture</h3>
                <p className="text-[11px] text-slate-500">3-Tier Attribution Model</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                  User Account (Auth)
                </p>
                <p className="text-[11px] text-slate-500">
                  Holds login credentials, JWT tokens, and authorization roles.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                  Staff Member (Physical)
                </p>
                <p className="text-[11px] text-slate-500">
                  Master record with Employee Number, Department, and Designation.
                </p>
              </div>

              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 space-y-1">
                <p className="font-bold text-teal-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">3</span>
                  Audit Actor (Attribution)
                </p>
                <p className="text-[11px] text-teal-800">
                  Derived automatically by the server during lab workflows. Impersonation is prevented.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Historical diagnostic records created before linkage or legacy imports display safely
              as <strong>Legacy / Unlinked Actor</strong> without errors.
            </p>
          </div>
        </div>
      </div>

      {/* Admin User-Staff Linkage Management Section */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Link className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  User ↔ Staff Linkage Management
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Associate or change the Staff identity linked to a user account.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg">
              Admin Exclusive
            </span>
          </div>

          {/* Form Error Alert */}
          {formError && <ErrorAlert error={formError} onDismiss={() => setFormError(null)} />}

          <form onSubmit={handleLinkStaff} noValidate className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* User ID Input */}
              <div className="flex flex-col gap-1 sm:col-span-1">
                <label
                  htmlFor="link-userId"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  Target User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  id="link-userId"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  {user && Number(targetUserId) === user.id ? '(Your Current Account)' : 'Hospital User Account'}
                </span>
              </div>

              {/* Staff Member Picker */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label
                  htmlFor="link-staffId"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Select Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  id="link-staffId"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  disabled={isSubmitting || isLoadingStaff}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400"
                >
                  <option value="">
                    {isLoadingStaff ? 'Loading hospital staff...' : 'Choose a staff member to link...'}
                  </option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.employeeNumber}) — {staff.departmentName}
                      {staff.designation ? ` [${staff.designation}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Staff Info Card */}
            {selectedStaffPreview && (
              <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-xl flex items-center justify-between text-xs text-slate-700 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="font-bold text-slate-900">{selectedStaffPreview.fullName}</p>
                    <p className="text-slate-500">
                      Dept: {selectedStaffPreview.departmentName} ({selectedStaffPreview.departmentCode})
                      {selectedStaffPreview.designation && ` • ${selectedStaffPreview.designation}`}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                  {selectedStaffPreview.employeeNumber}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Link className="w-4 h-4" />}
                disabled={!selectedStaffId}
              >
                Link Staff Identity
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                leftIcon={<Unlink className="w-4 h-4" />}
                onClick={() => setIsUnlinkDialogOpen(true)}
                disabled={isSubmitting}
              >
                Unlink Staff
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Unlink Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isUnlinkDialogOpen}
        title="Unlink Staff Identity"
        message={`Are you sure you want to remove the staff linkage for User ID #${targetUserId}?`}
        detail="Future clinical workflow actions performed by this user will be attributed as unlinked / legacy until a new staff member is assigned."
        confirmLabel="Unlink Staff"
        confirmVariant="danger"
        isLoading={isUnlinking}
        onConfirm={handleConfirmUnlink}
        onCancel={() => !isUnlinking && setIsUnlinkDialogOpen(false)}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default AuditActorPage;
