import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  PathologySampleDto,
  CollectSampleRequest,
  RejectSampleRequest,
} from '../types/pathologySample';

/**
 * Service for Pathology Sample (M10) — collection, receive, and reject workflow.
 * All routes match backend PathologySamplesController exactly.
 */
export const pathologySampleService = {
  /**
   * Returns all active samples for the current hospital.
   * GET /api/pathology/samples
   */
  async getAll(): Promise<PathologySampleDto[]> {
    const res = await apiClient.get<ApiResponse<PathologySampleDto[]>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLES.BASE
    );
    return res.data.data ?? [];
  },

  /**
   * Returns a single sample by id (tenant-checked).
   * GET /api/pathology/samples/{id}
   */
  async getById(id: number): Promise<PathologySampleDto> {
    const res = await apiClient.get<ApiResponse<PathologySampleDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLES.BY_ID(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Sample not found');
  },

  /**
   * Returns all samples belonging to a specific lab order.
   * GET /api/pathology/lab-orders/{orderId}/samples
   */
  async getByOrder(orderId: number): Promise<PathologySampleDto[]> {
    const res = await apiClient.get<ApiResponse<PathologySampleDto[]>>(
      API_ENDPOINTS.PATHOLOGY.LAB_ORDERS.SAMPLES(orderId)
    );
    return res.data.data ?? [];
  },

  /**
   * Collects a specimen for the specified order item.
   * POST /api/pathology/samples/collect
   * Server resolves: HospitalId, SampleNumber, SampleTypeId, CollectedAt, Status.
   * Returns 409 if already collected for that order item.
   */
  async collect(dto: CollectSampleRequest): Promise<PathologySampleDto> {
    const res = await apiClient.post<ApiResponse<PathologySampleDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLES.COLLECT,
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to collect sample');
  },

  /**
   * Marks a Collected sample as Received.
   * POST /api/pathology/samples/{id}/receive
   * Returns 400 if sample is not in Collected status.
   */
  async receive(id: number): Promise<PathologySampleDto> {
    const res = await apiClient.post<ApiResponse<PathologySampleDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLES.RECEIVE(id)
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to receive sample');
  },

  /**
   * Rejects a Collected or Received sample with a mandatory reason.
   * POST /api/pathology/samples/{id}/reject
   * Returns 400 if sample is not in Collected or Received status.
   */
  async reject(id: number, dto: RejectSampleRequest): Promise<PathologySampleDto> {
    const res = await apiClient.post<ApiResponse<PathologySampleDto>>(
      API_ENDPOINTS.PATHOLOGY.SAMPLES.REJECT(id),
      dto
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to reject sample');
  },
};
