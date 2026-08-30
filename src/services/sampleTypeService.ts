import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  SampleTypeDto,
  CreateSampleTypeRequest,
  UpdateSampleTypeRequest,
} from '../types/sampleType';

/**
 * Service for Pathology Sample Type (M4) master CRUD operations.
 * Connects directly to backend PathologySampleTypesController.
 */
export const sampleTypeService = {
  /**
   * Retrieves all active pathology sample types for current hospital.
   * GET /api/pathology/sample-types
   */
  async getAll(): Promise<SampleTypeDto[]> {
    const res = await apiClient.get<ApiResponse<SampleTypeDto[]>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific pathology sample type by Id.
   * GET /api/pathology/sample-types/{id}
   */
  async getById(id: number): Promise<SampleTypeDto> {
    const res = await apiClient.get<ApiResponse<SampleTypeDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Sample type not found');
  },

  /**
   * Creates a new pathology sample type.
   * POST /api/pathology/sample-types
   */
  async create(dto: CreateSampleTypeRequest): Promise<SampleTypeDto> {
    const res = await apiClient.post<ApiResponse<SampleTypeDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create sample type');
  },

  /**
   * Updates an existing pathology sample type.
   * PUT /api/pathology/sample-types/{id}
   */
  async update(
    id: number,
    dto: UpdateSampleTypeRequest
  ): Promise<SampleTypeDto> {
    const res = await apiClient.put<ApiResponse<SampleTypeDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update sample type');
  },

  /**
   * Soft-deactivates a pathology sample type.
   * DELETE /api/pathology/sample-types/{id}
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<SampleTypeDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLE_TYPES.BY_ID(id)
    );
  },
};
