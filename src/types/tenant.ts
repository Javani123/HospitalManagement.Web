import type { BaseEntity } from './api';

/**
 * Tenant / Hospital information returned from `GET /api/tenant/current`.
 */
export interface TenantInfoDto {
  hospitalId: number;
  hospitalName: string;
  hospitalCode: string;
}

/**
 * Detailed Hospital tenant entity model.
 */
export interface Hospital extends BaseEntity {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * State representation for the global Tenant context.
 */
export interface TenantContextType {
  tenant: TenantInfoDto | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}
