/**
 * Type definitions for Doctor Profile Master (M14.5 / F14.5).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Doctors.
 */

export interface DoctorProfileDto {
  id: number;
  hospitalId: number;
  staffId: number;
  employeeNumber: string;
  doctorName: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  phone: string | null;
  email: string | null;
  registrationNumber: string;
  specialization: string | null;
  qualification: string | null;
  consultationFee: number;
  defaultCommissionRate: number;
  isExternalReferrer: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorProfileRequest {
  staffId: number;
  registrationNumber: string;
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  defaultCommissionRate?: number;
  isExternalReferrer?: boolean;
}

export interface UpdateDoctorProfileRequest {
  registrationNumber: string;
  specialization?: string;
  qualification?: string;
  consultationFee?: number;
  defaultCommissionRate?: number;
  isExternalReferrer?: boolean;
  isActive?: boolean;
}

export interface DoctorQueryFilters {
  departmentId?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}
