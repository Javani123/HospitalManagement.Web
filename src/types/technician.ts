/**
 * Type definitions for Technician Profile Master (M14.6 / F14.6).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Technicians.
 */

export interface TechnicianProfileDto {
  id: number;
  hospitalId: number;
  staffId: number;
  employeeNumber: string;
  technicianName: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  licenseNumber: string;
  certification: string | null;
  primaryBench: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianProfileRequest {
  staffId: number;
  licenseNumber: string;
  certification?: string;
  primaryBench?: string;
}

export interface UpdateTechnicianProfileRequest {
  licenseNumber: string;
  certification?: string;
  primaryBench?: string;
  isActive?: boolean;
}

export interface TechnicianQueryFilters {
  departmentId?: number;
  primaryBench?: string;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}
