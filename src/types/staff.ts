/**
 * Type definitions for Hospital Staff Master (M14.3 / F14.3).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Organization.
 */

export interface StaffDto {
  id: number;
  hospitalId: number;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  fullName: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  joiningDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  firstName: string;
  middleName?: string;
  lastName?: string;
  departmentId: number;
  designation?: string;
  phone?: string;
  email?: string;
  joiningDate?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  middleName?: string;
  lastName?: string;
  departmentId: number;
  designation?: string;
  phone?: string;
  email?: string;
  joiningDate?: string;
  isActive?: boolean;
}

export interface StaffQueryFilters {
  departmentId?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}
