import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  Users,
  UserCheck,
  Search,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Lock,
  Plus,
} from 'lucide-react';

import { roleService } from '../../services/roleService';
import type {
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserRoleDto,
  RoleTypeFilter,
  RoleStatusFilter,
} from '../../types/role';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { ColumnDef } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';
import { RoleModal } from './components/RoleModal';
import { AssignRoleModal } from './components/AssignRoleModal';

export const RolesPage: React.FC = () => {
  const { user, hasRole, refreshUser } = useAuth();
  const { error, handleError, clearError } = useApiError();
  const { toasts, success: toastSuccess, error: toastError, dismiss } = useToast();

  // Role permissions
  const isAdmin = hasRole('Admin') || !user?.roles || user.roles.length === 0;

  // Active view tab: 'roles' | 'assignments'
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');

  // ─── Roles Data State ───────────────────────────────────────────────────────
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true);
  const [hasLoadedRoles, setHasLoadedRoles] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<RoleStatusFilter>('all');

  // Role Modal state (Create / Edit)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [isSubmittingRole, setIsSubmittingRole] = useState<boolean>(false);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);

  // Role Deactivate / Reactivate state
  const [deactivateRoleTarget, setDeactivateRoleTarget] = useState<RoleDto | null>(null);
  const [isDeactivatingRole, setIsDeactivatingRole] = useState<boolean>(false);
  const [reactivateRoleTarget, setReactivateRoleTarget] = useState<RoleDto | null>(null);
  const [isReactivatingRole, setIsReactivatingRole] = useState<boolean>(false);

  // ─── User-Role Assignment State ────────────────────────────────────────────
  const [targetUserIdInput, setTargetUserIdInput] = useState<string>(
    user?.id ? String(user.id) : '1'
  );
  const [inspectedUserId, setInspectedUserId] = useState<number>(
    user?.id || 1
  );
  const [userRoles, setUserRoles] = useState<UserRoleDto[]>([]);
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState<boolean>(false);
  const [userRolesError, setUserRolesError] = useState<string | null>(null);

  // Assign Role Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState<boolean>(false);
  const [assignModalError, setAssignModalError] = useState<string | null>(null);

  // Remove Role Assignment state
  const [removeTarget, setRemoveTarget] = useState<UserRoleDto | null>(null);
  const [isRemovingRole, setIsRemovingRole] = useState<boolean>(false);

  // ─── Load Roles ─────────────────────────────────────────────────────────────

  const loadRoles = useCallback(async () => {
    clearError();
    setIsLoadingRoles(true);
    try {
      const data = await roleService.getAll();
      setRoles(data);
      setHasLoadedRoles(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoadingRoles(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  // ─── Load User Roles ───────────────────────────────────────────────────────

  const loadUserRoles = useCallback(async (userId: number) => {
    if (userId <= 0) return;
    setIsLoadingUserRoles(true);
    setUserRolesError(null);
    try {
      const data = await roleService.getUserRoles(userId);
      setUserRoles(data);
      setInspectedUserId(userId);
    } catch (err) {
      const normalized = handleError(err);
      setUserRolesError(normalized.message || `Failed to load roles for user ID ${userId}`);
      setUserRoles([]);
    } finally {
      setIsLoadingUserRoles(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (activeTab === 'assignments') {
      void loadUserRoles(inspectedUserId);
    }
  }, [activeTab, inspectedUserId, loadUserRoles]);

  const handleInspectUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedId = Number(targetUserIdInput);
    if (!targetUserIdInput || isNaN(parsedId) || parsedId <= 0) {
      setUserRolesError('Please enter a valid positive integer User ID.');
      return;
    }
    void loadUserRoles(parsedId);
  };

  // ─── Filtered Roles ─────────────────────────────────────────────────────────

  const filteredRoles = useMemo(() => {
    let list = roles;

    // 1. Type filter
    if (typeFilter === 'system') {
      list = list.filter((r) => r.isSystem);
    } else if (typeFilter === 'custom') {
      list = list.filter((r) => !r.isSystem);
    }

    // 2. Status filter
    if (statusFilter === 'active') {
      list = list.filter((r) => r.isActive);
    } else if (statusFilter === 'inactive') {
      list = list.filter((r) => !r.isActive);
    }

    // 3. Search query
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query))
    );
  }, [roles, typeFilter, statusFilter, searchQuery]);

  // ─── Role CRUD Handlers ─────────────────────────────────────────────────────

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleModalError(null);
    setIsRoleModalOpen(true);
  };

  const handleCreateRoleSubmit = async (dto: CreateRoleRequest) => {
    setRoleModalError(null);
    setIsSubmittingRole(true);
    try {
      const created = await roleService.create(dto);
      toastSuccess(`Custom role "${created.name}" created successfully.`);
      setIsRoleModalOpen(false);
      await loadRoles();
    } catch (err) {
      const normalized = handleError(err);
      setRoleModalError(normalized.message);
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleOpenEditRole = (role: RoleDto) => {
    setEditingRole(role);
    setRoleModalError(null);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRoleSubmit = async (id: number, dto: UpdateRoleRequest) => {
    setRoleModalError(null);
    setIsSubmittingRole(true);
    try {
      const updated = await roleService.update(id, dto);
      toastSuccess(`Role "${updated.name}" updated successfully.`);
      setIsRoleModalOpen(false);
      await loadRoles();
    } catch (err) {
      const normalized = handleError(err);
      setRoleModalError(normalized.message);
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleDeactivateRoleConfirm = async () => {
    if (!deactivateRoleTarget) return;
    setIsDeactivatingRole(true);
    try {
      await roleService.deactivate(deactivateRoleTarget.id);
      toastSuccess(`Custom role "${deactivateRoleTarget.name}" deactivated.`);
      setDeactivateRoleTarget(null);
      await loadRoles();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to deactivate role.');
      setDeactivateRoleTarget(null);
    } finally {
      setIsDeactivatingRole(false);
    }
  };

  const handleReactivateRoleConfirm = async () => {
    if (!reactivateRoleTarget) return;
    setIsReactivatingRole(true);
    try {
      await roleService.reactivate(reactivateRoleTarget);
      toastSuccess(`Custom role "${reactivateRoleTarget.name}" reactivated.`);
      setReactivateRoleTarget(null);
      await loadRoles();
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to reactivate role.');
      setReactivateRoleTarget(null);
    } finally {
      setIsReactivatingRole(false);
    }
  };

  // ─── User-Role Assignment Handlers ─────────────────────────────────────────

  const handleOpenAssignModal = () => {
    setAssignModalError(null);
    setIsAssignModalOpen(true);
  };

  const handleAssignRoleSubmit = async (roleId: number) => {
    setAssignModalError(null);
    setIsSubmittingAssign(true);
    try {
      const assigned = await roleService.assignRole(inspectedUserId, roleId);
      toastSuccess(`Role "${assigned.roleName}" assigned to user "${assigned.username}".`);
      setIsAssignModalOpen(false);
      await loadUserRoles(inspectedUserId);

      // If modifying currently logged in user, refresh session context
      if (user && user.id === inspectedUserId) {
        await refreshUser();
      }
    } catch (err) {
      const normalized = handleError(err);
      setAssignModalError(normalized.message);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleRemoveRoleConfirm = async () => {
    if (!removeTarget) return;
    setIsRemovingRole(true);
    try {
      await roleService.removeRole(removeTarget.userId, removeTarget.roleId);
      toastSuccess(`Role "${removeTarget.roleName}" removed from user "${removeTarget.username}".`);
      setRemoveTarget(null);
      await loadUserRoles(inspectedUserId);

      // If modifying currently logged in user, refresh session context
      if (user && user.id === inspectedUserId) {
        await refreshUser();
      }
    } catch (err) {
      const normalized = handleError(err);
      toastError(normalized.message || 'Failed to remove role assignment.');
      setRemoveTarget(null);
    } finally {
      setIsRemovingRole(false);
    }
  };

  // ─── Table Columns: Roles ───────────────────────────────────────────────────

  const roleColumns: ColumnDef<RoleDto>[] = [
    {
      key: 'name',
      header: 'Role Name',
      width: '200px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-sm block">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: #{row.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'isSystem',
      header: 'Type',
      width: '130px',
      render: (row) => (
        <Badge variant={row.isSystem ? 'neutral' : 'info'} size="sm">
          {row.isSystem ? 'System' : 'Custom'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      width: '110px',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm" dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.description || <span className="text-slate-400 italic">No description provided</span>}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created On',
      width: '130px',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: 'Actions',
            align: 'right' as const,
            width: '180px',
            render: (row: RoleDto) => {
              if (row.isSystem) {
                return (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-50 border border-slate-200/60 rounded">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Protected
                  </span>
                );
              }
              return (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenEditRole(row)}
                    aria-label={`Edit role ${row.name}`}
                  >
                    Edit
                  </Button>
                  {row.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeactivateRoleTarget(row)}
                      aria-label={`Deactivate role ${row.name}`}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => setReactivateRoleTarget(row)}
                      aria-label={`Reactivate role ${row.name}`}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  // ─── Table Columns: User Roles ──────────────────────────────────────────────

  const userRoleColumns: ColumnDef<UserRoleDto>[] = [
    {
      key: 'roleName',
      header: 'Assigned Role',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-md">
            {row.roleName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Role ID: #{row.roleId}
          </span>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'User Account',
      render: (row) => (
        <div>
          <span className="text-sm font-semibold text-slate-900 block">
            {row.username}
          </span>
          <span className="text-[11px] text-slate-400">
            User ID: #{row.userId}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedAt',
      header: 'Assigned At',
      width: '160px',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {formatDate(row.assignedAt)}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: '_actions',
            header: 'Actions',
            align: 'right' as const,
            width: '140px',
            render: (row: UserRoleDto) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setRemoveTarget(row)}
                aria-label={`Remove role ${row.roleName} from user`}
              >
                Remove
              </Button>
            ),
          },
        ]
      : []),
  ];

  // ─── Render Page ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage application authorization roles and user role assignments."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Administration' },
          { label: 'Roles' },
        ]}
        badge={
          <Badge variant="info" size="sm">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {roles.filter((r) => r.isActive).length} Active Roles
            </span>
          </Badge>
        }
        actions={
          isAdmin && activeTab === 'roles' ? (
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShieldPlus className="w-4 h-4" />}
              onClick={handleOpenCreateRole}
            >
              Create Custom Role
            </Button>
          ) : undefined
        }
      />

      {/* Global Error Banner */}
      {error && !isRoleModalOpen && !isAssignModalOpen && (
        <ErrorAlert error={error} onDismiss={clearError} />
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6" aria-label="Role Sections">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'roles'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Roles Directory ({roles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'assignments'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            User Role Assignments
          </button>
        </nav>
      </div>

      {/* ─── TAB 1: Roles Directory ────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Active Roles */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Roles</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {roles.length}
                </p>
              </div>
            </div>

            {/* System Roles */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">System Roles</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {roles.filter((r) => r.isSystem).length}
                </p>
              </div>
            </div>

            {/* Custom Roles */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <ShieldPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Custom Roles</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {roles.filter((r) => !r.isSystem).length}
                </p>
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-colors"
                aria-label="Search roles"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['all', 'system', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                      typeFilter === type
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roles Table */}
          <Table
            columns={roleColumns}
            data={filteredRoles}
            keyExtractor={(r) => r.id}
            isLoading={isLoadingRoles}
            loadingMessage="Loading authorization roles..."
            emptyTitle={searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'No matching roles found' : hasLoadedRoles ? 'No custom roles created yet' : 'No roles available'}
            emptyDescription="Try clearing your search filters or create a new custom role to extend permission sets."
            emptyIcon={<Shield className="w-6 h-6" />}
            emptyActionLabel={!searchQuery && isAdmin ? 'Create Custom Role' : undefined}
            onEmptyAction={!searchQuery && isAdmin ? handleOpenCreateRole : undefined}
            striped
          />
        </div>
      )}

      {/* ─── TAB 2: User Role Assignments ──────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* User Lookup Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  User Account Role Inspection
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect and manage assigned authorization roles for any user ID in this hospital tenant.
                </p>
              </div>

              {/* Quick switch to currently logged in user */}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetUserIdInput(String(user.id));
                    void loadUserRoles(user.id);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium underline flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Inspect My Account ({user.username} - #{user.id})
                </button>
              )}
            </div>

            <form onSubmit={handleInspectUserSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  min="1"
                  placeholder="Enter User ID (e.g. 1)"
                  value={targetUserIdInput}
                  onChange={(e) => setTargetUserIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white transition-colors"
                  aria-label="User ID to inspect"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoadingUserRoles}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Inspect User Roles
              </Button>
            </form>

            {userRolesError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-700">
                <span>{userRolesError}</span>
                <button
                  type="button"
                  onClick={() => setUserRolesError(null)}
                  className="text-rose-500 hover:text-rose-800 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Current Inspected User Details Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {userRoles.length > 0 ? userRoles[0].username : `User #${inspectedUserId}`}
                  </h4>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    User ID: {inspectedUserId}
                  </span>
                  {user && user.id === inspectedUserId && (
                    <Badge variant="info" size="sm">
                      Current Session User
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Assigned Roles: <strong>{userRoles.length}</strong> active role assignment{userRoles.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAssignModal}
                disabled={isLoadingUserRoles}
              >
                Assign Role to User
              </Button>
            )}
          </div>

          {/* User Roles Table */}
          <Table
            columns={userRoleColumns}
            data={userRoles}
            keyExtractor={(ur) => ur.id}
            isLoading={isLoadingUserRoles}
            loadingMessage={`Loading roles for User ID #${inspectedUserId}...`}
            emptyTitle={`No roles assigned to User ID #${inspectedUserId}`}
            emptyDescription="Assign an authorization role (such as Admin, Doctor, Technician, or a Custom role) to grant permissions to this user."
            emptyIcon={<ShieldCheck className="w-6 h-6" />}
            emptyActionLabel={isAdmin ? 'Assign Role' : undefined}
            onEmptyAction={isAdmin ? handleOpenAssignModal : undefined}
            striped
          />
        </div>
      )}

      {/* ─── Modals & Dialogs ────────────────────────────────────────────────── */}

      {/* Create / Edit Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        role={editingRole}
        isSubmitting={isSubmittingRole}
        error={roleModalError}
        onClose={() => setIsRoleModalOpen(false)}
        onSubmitCreate={handleCreateRoleSubmit}
        onSubmitUpdate={handleUpdateRoleSubmit}
        onClearError={() => setRoleModalError(null)}
      />

      {/* Assign Role Modal */}
      <AssignRoleModal
        isOpen={isAssignModalOpen}
        userId={inspectedUserId}
        username={userRoles.length > 0 ? userRoles[0].username : `User #${inspectedUserId}`}
        availableRoles={roles}
        assignedRoleIds={userRoles.map((ur) => ur.roleId)}
        isSubmitting={isSubmittingAssign}
        error={assignModalError}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignRoleSubmit}
        onClearError={() => setAssignModalError(null)}
      />

      {/* Deactivate Custom Role Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateRoleTarget)}
        title="Deactivate Custom Role"
        message={`Are you sure you want to deactivate custom role "${deactivateRoleTarget?.name}"?`}
        detail="Deactivated roles cannot be assigned to new users. Existing user assignments will be impacted according to system policy."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={isDeactivatingRole}
        onConfirm={handleDeactivateRoleConfirm}
        onCancel={() => !isDeactivatingRole && setDeactivateRoleTarget(null)}
      />

      {/* Reactivate Custom Role Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reactivateRoleTarget)}
        title="Reactivate Custom Role"
        message={`Are you sure you want to reactivate custom role "${reactivateRoleTarget?.name}"?`}
        detail="This role will be restored to active status and made available for user role assignments."
        confirmLabel="Reactivate"
        confirmVariant="primary"
        icon="info"
        isLoading={isReactivatingRole}
        onConfirm={handleReactivateRoleConfirm}
        onCancel={() => !isReactivatingRole && setReactivateRoleTarget(null)}
      />

      {/* Remove Role Assignment Dialog */}
      <ConfirmDialog
        isOpen={Boolean(removeTarget)}
        title="Remove Role Assignment"
        message={`Are you sure you want to remove role "${removeTarget?.roleName}" from user "${removeTarget?.username}"?`}
        detail="The user will immediately lose authorization permissions associated with this role upon next session verification."
        confirmLabel="Remove Role"
        confirmVariant="danger"
        isLoading={isRemovingRole}
        onConfirm={handleRemoveRoleConfirm}
        onCancel={() => !isRemovingRole && setRemoveTarget(null)}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default RolesPage;
