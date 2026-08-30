import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { TenantInfoDto } from '../types/tenant';

/**
 * Service for Tenant / Hospital context and System Health endpoints.
 */
export const tenantService = {
  /**
   * Retrieves the active tenant context from backend.
   */
  async getCurrentTenant(): Promise<TenantInfoDto> {
    const response = await apiClient.get<ApiResponse<TenantInfoDto>>(API_ENDPOINTS.TENANT.CURRENT);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to load tenant details');
  },

  /**
   * Checks backend system health and connectivity.
   */
  async checkHealth(): Promise<{ status: string }> {
    const response = await apiClient.get<{ status: string }>(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};
