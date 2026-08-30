import type { BaseEntity } from './api';

/**
 * Response DTO for a pathology test category matching backend PathologyTestCategoryDto.
 */
export interface PathologyTestCategoryDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  description?: string;
}

/**
 * Request payload for creating a new pathology test category (CreatePathologyTestCategoryDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface CreatePathologyTestCategoryRequest {
  name: string;
  code: string;
  description?: string;
}

/**
 * Request payload for updating an existing pathology test category (UpdatePathologyTestCategoryDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface UpdatePathologyTestCategoryRequest {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// Aliases for compatibility
export type CreatePathologyTestCategoryDto = CreatePathologyTestCategoryRequest;
export type UpdatePathologyTestCategoryDto = UpdatePathologyTestCategoryRequest;
