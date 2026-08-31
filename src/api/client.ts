import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';
import { normalizeApiError } from '../utils/errorHandler';

/**
 * Central Axios HTTP client instance.
 * Automatically configured with environment base URL and standard headers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const AUTH_TOKEN_STORAGE_KEY = 'caresync_auth_token';

// Request Interceptor: Attach tenant / auth context
apiClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    // Attach JWT Authorization header if present in storage
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    return reqConfig;
  },
  (error: unknown) => {
    return Promise.reject(normalizeApiError(error));
  }
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: unknown) => {
    const normalizedError = normalizeApiError(error);

    // If 401 Unauthorized occurs on an authenticated route, clear storage and notify app
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          window.dispatchEvent(new CustomEvent('caresync:unauthorized'));
        }
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;

