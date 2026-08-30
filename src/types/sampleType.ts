import type { BaseEntity } from './api';

/**
 * Response DTO for a pathology sample type matching backend PathologySampleTypeDto.
 */
export interface SampleTypeDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  description?: string;
}

/**
 * Request payload for creating a new pathology sample type (CreatePathologySampleTypeDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface CreateSampleTypeRequest {
  name: string;
  code: string;
  description?: string;
}

/**
 * Request payload for updating an existing pathology sample type (UpdatePathologySampleTypeDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface UpdateSampleTypeRequest {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// Aliases for compatibility
export type PathologySampleTypeDto = SampleTypeDto;
export type CreatePathologySampleTypeDto = CreateSampleTypeRequest;
export type UpdatePathologySampleTypeDto = UpdateSampleTypeRequest;
