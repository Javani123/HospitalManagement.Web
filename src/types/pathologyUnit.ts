import type { BaseEntity } from './api';

/**
 * Response DTO for a pathology test unit matching backend PathologyTestUnitDto.
 */
export interface PathologyUnitDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  symbol: string;
  description?: string;
}

/**
 * Request payload for creating a new pathology test unit (CreatePathologyTestUnitDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface CreatePathologyUnitRequest {
  name: string;
  code: string;
  symbol: string;
  description?: string;
}

/**
 * Request payload for updating an existing pathology test unit (UpdatePathologyTestUnitDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface UpdatePathologyUnitRequest {
  name: string;
  code: string;
  symbol: string;
  description?: string;
  isActive: boolean;
}

// Aliases for compatibility
export type PathologyTestUnitDto = PathologyUnitDto;
export type CreatePathologyTestUnitDto = CreatePathologyUnitRequest;
export type UpdatePathologyTestUnitDto = UpdatePathologyUnitRequest;
