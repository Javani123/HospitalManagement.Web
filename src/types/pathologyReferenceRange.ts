import type { BaseEntity } from './api';

export type ReferenceRangeGender = 'Any' | 'Male' | 'Female';
export type ReferenceRangeAgeUnit = 'Days' | 'Months' | 'Years';

/**
 * Response DTO for a pathology reference range matching backend PathologyReferenceRangeDto.
 */
export interface PathologyReferenceRangeDto extends BaseEntity {
  hospitalId: number;
  pathologyTestId: number;
  testName: string;
  testCode: string;
  gender: string;
  minAge?: number;
  maxAge?: number;
  ageUnit?: string;
  lowValue?: number;
  highValue?: number;
  textValue?: string;
  description?: string;
}

/**
 * Request payload for creating a new pathology reference range (CreatePathologyReferenceRangeDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface CreatePathologyReferenceRangeRequest {
  pathologyTestId: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  ageUnit?: string;
  lowValue?: number;
  highValue?: number;
  textValue?: string;
  description?: string;
}

/**
 * Request payload for updating an existing pathology reference range (UpdatePathologyReferenceRangeDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface UpdatePathologyReferenceRangeRequest {
  pathologyTestId: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  ageUnit?: string;
  lowValue?: number;
  highValue?: number;
  textValue?: string;
  description?: string;
  isActive: boolean;
}

// Aliases for compatibility
export type CreatePathologyReferenceRangeDto = CreatePathologyReferenceRangeRequest;
export type UpdatePathologyReferenceRangeDto = UpdatePathologyReferenceRangeRequest;
