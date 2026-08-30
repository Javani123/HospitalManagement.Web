import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyReferenceRangeDto,
  CreatePathologyReferenceRangeRequest,
  UpdatePathologyReferenceRangeRequest,
} from '../types/pathologyReferenceRange';

/**
 * Service for Pathology Reference Range (M7) master CRUD operations.
 * Connects directly to backend PathologyReferenceRangesController.
 */
export const pathologyReferenceRangeService = {
  /**
   * Retrieves all active pathology reference ranges for current hospital.
   * GET /api/pathology/reference-ranges
   */
  async getAll(): Promise<PathologyReferenceRangeDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto[]>>(
      API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BASE
    );
    return res.data.data || [];
  },

  /**
   * Retrieves a specific pathology reference range by Id.
   * GET /api/pathology/reference-ranges/{id}
   */
  async getById(id: number): Promise<PathologyReferenceRangeDto> {
    const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto>>(
      API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Reference range not found');
  },

  /**
   * Retrieves all active reference ranges for a specific test.
   * GET /api/pathology/tests/{testId}/reference-ranges
   */
  async getByTestId(testId: number): Promise<PathologyReferenceRangeDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyReferenceRangeDto[]>>(
      `/pathology/tests/${testId}/reference-ranges`
    );
    return res.data.data || [];
  },

  /**
   * Creates a new pathology reference range.
   * POST /api/pathology/reference-ranges
   */
  async create(
    dto: CreatePathologyReferenceRangeRequest
  ): Promise<PathologyReferenceRangeDto> {
    const res = await apiClient.post<ApiResponse<PathologyReferenceRangeDto>>(
      API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create reference range');
  },

  /**
   * Updates an existing pathology reference range.
   * PUT /api/pathology/reference-ranges/{id}
   */
  async update(
    id: number,
    dto: UpdatePathologyReferenceRangeRequest
  ): Promise<PathologyReferenceRangeDto> {
    const res = await apiClient.put<ApiResponse<PathologyReferenceRangeDto>>(
      API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update reference range');
  },

  /**
   * Soft-deactivates a pathology reference range.
   * DELETE /api/pathology/reference-ranges/{id}
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<PathologyReferenceRangeDto>>(
      API_ENDPOINTS.PATHOLOGY.REFERENCE_RANGES.BY_ID(id)
    );
  },
};
