/**
 * Doctor Commission types and DTO contracts (F14.9).
 * Aligns with HospitalManagement.Api DTOs and models.
 */

export type CommissionType = 'Percentage' | 'FixedAmount';

export interface DoctorCommissionRuleDto {
  id: number;
  doctorStaffId: number;
  doctorName: string;
  doctorRegistrationNumber: string;
  doctorSpecialization: string;
  commissionType: string;
  commissionValue: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorCommissionRuleRequest {
  doctorStaffId: number;
  commissionType: CommissionType | number;
  commissionValue: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  description?: string | null;
}

export interface UpdateDoctorCommissionRuleRequest {
  commissionType: CommissionType | number;
  commissionValue: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface CommissionRuleFilters {
  doctorStaffId?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  commissionType?: 'all' | 'Percentage' | 'FixedAmount';
}

/**
 * Immutable Historical Commission Snapshot on Pathology Lab Order (M14.9).
 */
export interface OrderCommissionDto {
  type: string;
  rate: number;
  commissionableAmount: number;
  commissionAmount: number;
  calculatedAt: string;
  ruleId?: number | null;
}
