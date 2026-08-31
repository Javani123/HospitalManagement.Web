import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { UserDto } from '../types/auth';
import type { LinkStaffRequest } from '../types/auditActor';

/**
 * Service for Audit Actor & User-Staff Linkage (F14.7).
 * Connects directly to backend AuthController endpoints.
 */
export const auditActorService = {
  /**
   * Retrieves the currently authenticated user's profile and staff linkage.
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<UserDto> {
    const res = await apiClient.get<ApiResponse<UserDto>>(API_ENDPOINTS.AUTH.ME);
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to fetch current user profile');
  },

  /**
   * Associates or disassociates a staff member with a user account.
   * POST /api/auth/users/{userId}/staff
   */
  async linkStaff(userId: number, staffId: number | null): Promise<UserDto> {
    const payload: LinkStaffRequest = { staffId };
    const res = await apiClient.post<ApiResponse<UserDto>>(
      API_ENDPOINTS.AUTH.LINK_STAFF(userId),
      payload
    );
    if (res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to update user staff association');
  },

  /**
   * Unlinks the staff member from a user account.
   * POST /api/auth/users/{userId}/staff with { staffId: null }
   */
  async unlinkStaff(userId: number): Promise<UserDto> {
    return this.linkStaff(userId, null);
  },
};

export default auditActorService;
