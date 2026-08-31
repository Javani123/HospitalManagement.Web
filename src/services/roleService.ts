import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserRoleDto,
  AssignRoleRequest,
} from '../types/role';

/**
 * Service for Roles and User-Role Management (F14.4).
 * Connects directly to backend RolesController and UserRolesController.
 */
export const roleService = {
  /**
   * Retrieves all roles for the current hospital tenant.
   * GET /api/roles
   */
  async getAll(): Promise<RoleDto[]> {
    const res = await apiClient.get<ApiResponse<RoleDto[]>>(
      API_ENDPOINTS.ROLES.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a single role by database ID.
   * GET /api/roles/{id}
   */
  async getById(id: number): Promise<RoleDto> {
    const res = await apiClient.get<ApiResponse<RoleDto>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Role not found');
  },

  /**
   * Creates a new custom role.
   * POST /api/roles
   */
  async create(dto: CreateRoleRequest): Promise<RoleDto> {
    const res = await apiClient.post<ApiResponse<RoleDto>>(
      API_ENDPOINTS.ROLES.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create role');
  },

  /**
   * Updates an existing custom role.
   * PUT /api/roles/{id}
   */
  async update(id: number, dto: UpdateRoleRequest): Promise<RoleDto> {
    const res = await apiClient.put<ApiResponse<RoleDto>>(
      API_ENDPOINTS.ROLES.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update role');
  },

  /**
   * Soft-deactivates a custom role (built-in system roles are blocked by backend).
   * DELETE /api/roles/{id}
   */
  async deactivate(id: number): Promise<RoleDto> {
    const res = await apiClient.delete<ApiResponse<RoleDto>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    return { id } as RoleDto;
  },

  /**
   * Reactivates a custom role.
   * PUT /api/roles/{id} with isActive = true
   */
  async reactivate(role: RoleDto): Promise<RoleDto> {
    const updateDto: UpdateRoleRequest = {
      name: role.name,
      description: role.description || undefined,
      isActive: true,
    };
    return this.update(role.id, updateDto);
  },

  /**
   * Retrieves all roles assigned to a specific user.
   * GET /api/users/{userId}/roles
   */
  async getUserRoles(userId: number): Promise<UserRoleDto[]> {
    const res = await apiClient.get<ApiResponse<UserRoleDto[]>>(
      API_ENDPOINTS.USER_ROLES.BY_USER_ID(userId)
    );
    return res.data.data || [];
  },

  /**
   * Assigns a role to a specific user.
   * POST /api/users/{userId}/roles
   */
  async assignRole(userId: number, roleId: number): Promise<UserRoleDto> {
    const payload: AssignRoleRequest = { roleId };
    const res = await apiClient.post<ApiResponse<UserRoleDto>>(
      API_ENDPOINTS.USER_ROLES.BY_USER_ID(userId),
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to assign role to user');
  },

  /**
   * Removes a role assignment from a specific user.
   * DELETE /api/users/{userId}/roles/{roleId}
   */
  async removeRole(userId: number, roleId: number): Promise<boolean> {
    const res = await apiClient.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.USER_ROLES.USER_ROLE_ITEM(userId, roleId)
    );
    return res.data.data ?? true;
  },
};

export default roleService;
