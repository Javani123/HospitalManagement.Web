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

// Request Interceptor: Attach tenant / auth context
apiClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    // In local dev, backend resolves tenant from DevTenantContext (HospitalId: 1).
    // Future SaaS versions can attach 'X-Hospital-Id' or Authorization tokens here.
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
    return Promise.reject(normalizedError);
  }
);

export default apiClient;
