/**
 * Type definitions for Hospital Department Master (M14.2 / F14.2).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Organization.
 */

export interface DepartmentDto {
  id: number;
  hospitalId: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type DepartmentStatusFilter = 'all' | 'active' | 'inactive';
