import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologyResultDto,
  CreatePathologyResultRequest,
  EnterResultRequest,
  VerifyResultRequest,
} from '../types/pathologyResult';

/**
 * Service for Pathology Result (M11 result entry/verification & M12 evaluation) workflow.
 * Connects directly to backend PathologyResultsController.
 */
export const pathologyResultService = {
  /**
   * Returns all active results for the current hospital.
   * GET /api/pathology/results
   */
  async getAll(): Promise<PathologyResultDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyResultDto[]>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BASE
    );
    return res.data.data ?? [];
  },

  /**
   * Returns a single result by id (tenant-checked).
   * GET /api/pathology/results/{id}
   */
  async getById(id: number): Promise<PathologyResultDto> {
    const res = await apiClient.get<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Result not found');
  },

  /**
   * Returns the result associated with a specific sample.
   * GET /api/pathology/samples/{sampleId}/result
   */
  async getBySampleId(sampleId: number): Promise<PathologyResultDto> {
    const res = await apiClient.get<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BY_SAMPLE(sampleId)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Result for sample not found');
  },

  /**
   * Returns all results belonging to a specific lab order.
   * GET /api/pathology/lab-orders/{orderId}/results
   */
  async getByOrder(orderId: number): Promise<PathologyResultDto[]> {
    const res = await apiClient.get<ApiResponse<PathologyResultDto[]>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BY_ORDER(orderId)
    );
    return res.data.data ?? [];
  },

  /**
   * Creates a Pending result for a Received specimen.
   * POST /api/pathology/results
   * Returns 409 if a result already exists for the sample.
   */
  async create(dto: CreatePathologyResultRequest): Promise<PathologyResultDto> {
    const res = await apiClient.post<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BASE,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to create result entry');
  },

  /**
   * Moves a result from Pending to Processing.
   * POST /api/pathology/results/{id}/process
   */
  async startProcessing(id: number): Promise<PathologyResultDto> {
    const res = await apiClient.post<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.PROCESS(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to start processing result');
  },

  /**
   * Enters or updates result values.
   * Transitions Processing → ResultEntered.
   * Automatically triggers M12 reference range evaluation server-side.
   * PUT /api/pathology/results/{id}
   */
  async enterResult(
    id: number,
    dto: EnterResultRequest
  ): Promise<PathologyResultDto> {
    const res = await apiClient.put<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.BY_ID(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to enter result values');
  },

  /**
   * Evaluates an entered result against configured reference ranges (M12).
   * PUT /api/pathology/results/{id}/evaluate
   */
  async evaluate(id: number): Promise<PathologyResultDto> {
    const res = await apiClient.put<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.EVALUATE(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to evaluate result');
  },

  /**
   * Verifies an entered result.
   * Transitions ResultEntered → Verified.
   * POST /api/pathology/results/{id}/verify
   */
  async verify(
    id: number,
    dto: VerifyResultRequest
  ): Promise<PathologyResultDto> {
    const res = await apiClient.post<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.VERIFY(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to verify result');
  },

  /**
   * Releases a verified result for reporting (M13).
   * Transitions Verified → Released. Result becomes read-only.
   * POST /api/pathology/results/{id}/release
   */
  async release(id: number): Promise<PathologyResultDto> {
    const res = await apiClient.post<ApiResponse<PathologyResultDto>>(
      API_ENDPOINTS.PATHOLOGY.RESULTS.RELEASE(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to release result');
  },
};
