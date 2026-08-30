import type { BaseEntity } from './api';

export interface TestCategoryInfo {
  id: number;
  name: string;
  code: string;
}

export interface SampleTypeInfo {
  id: number;
  name: string;
  code: string;
}

export interface UnitInfo {
  id: number;
  name: string;
  symbol: string;
}

/**
 * Response DTO for a pathology test matching backend PathologyTestDto.
 */
export interface PathologyTestDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  price: number;
  category: TestCategoryInfo;
  sampleType: SampleTypeInfo;
  unit?: UnitInfo;
}

/**
 * Request payload for creating a new pathology test (CreatePathologyTestDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface CreatePathologyTestRequest {
  testCategoryId: number;
  sampleTypeId: number;
  unitId?: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  price: number;
}

/**
 * Request payload for updating an existing pathology test (UpdatePathologyTestDto).
 * HospitalId is server-managed and must never be sent in client requests.
 */
export interface UpdatePathologyTestRequest {
  testCategoryId: number;
  sampleTypeId: number;
  unitId?: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  price: number;
  isActive: boolean;
}

// Aliases for compatibility
export type CreatePathologyTestDto = CreatePathologyTestRequest;
export type UpdatePathologyTestDto = UpdatePathologyTestRequest;
