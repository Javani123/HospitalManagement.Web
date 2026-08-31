/**
 * Type definitions for Roles and User-Role Management (M14.4 / F14.4).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Authentication.
 */

export interface RoleDto {
  id: number;
  hospitalId: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UserRoleDto {
  id: number;
  userId: number;
  username: string;
  roleId: number;
  roleName: string;
  assignedAt: string;
}

export interface AssignRoleRequest {
  roleId: number;
}

export type RoleTypeFilter = 'all' | 'system' | 'custom';
export type RoleStatusFilter = 'all' | 'active' | 'inactive';
