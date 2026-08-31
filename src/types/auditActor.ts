import type { UserDto } from './auth';
import type { StaffDto } from './staff';

/**
 * Type definitions for Audit Actor & User-Staff Linkage (M14.7 / F14.7).
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Authentication.
 */

export interface LinkStaffRequest {
  /** Staff primary key to link, or null to unlink. */
  staffId: number | null;
}

export interface UserStaffLinkDto {
  userId: number;
  username: string;
  email: string;
  fullName: string | null;
  staffId: number | null;
  staffName: string | null;
  isActive: boolean;
  roles: string[];
}

export interface AuditActorState {
  user: UserDto | null;
  linkedStaff: StaffDto | null;
  isLinked: boolean;
}
