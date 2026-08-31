import { apiClient, AUTH_TOKEN_STORAGE_KEY } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type { LoginRequest, LoginResponse, AuthUser } from '../types/auth';

/**
 * Authentication and user session service.
 * Connects directly to backend ASP.NET Core auth endpoints.
 */
export const authService = {
  /**
   * Authenticates user with username or email and password.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed.');
    }

    return response.data.data;
  },

  /**
   * Fetches the current authenticated user's profile and roles.
   * Requires valid Bearer JWT.
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiResponse<AuthUser>>(
      API_ENDPOINTS.AUTH.ME
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to retrieve user profile.');
    }

    return response.data.data;
  },

  /**
   * Verifies Admin authorization against the backend.
   */
  async checkAdmin(): Promise<string> {
    const response = await apiClient.get<ApiResponse<string>>(
      API_ENDPOINTS.AUTH.ADMIN_CHECK
    );

    return response.data.data || response.data.message;
  },

  /**
   * Clears stored authentication credentials.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  },
};

export default authService;
