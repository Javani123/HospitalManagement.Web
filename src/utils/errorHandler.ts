import axios, { AxiosError } from 'axios';
import type { ApiResponse, AppError } from '../types/api';

/**
 * Normalizes any error (AxiosError, Backend ApiResponse error, Network error, JS Error)
 * into a standardized user-friendly AppError.
 */
export function normalizeApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown> | { errors?: Record<string, string[]>; title?: string; message?: string }>;
    
    // Network Error (server down or unreachable)
    if (!axiosError.response) {
      return {
        message: 'Unable to connect to the hospital server. Please check your network connection or server status.',
        isNetworkError: true,
      };
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // 1. Backend ApiResponse error ({ success: false, message: "...", errors: [...] })
    if (data && typeof data === 'object' && 'message' in data && data.message) {
      return {
        message: data.message,
        statusCode: status,
      };
    }

    // 2. ASP.NET Core Validation Problem Details ({ errors: { Field: ["error"] }, title: "..." })
    if (data && typeof data === 'object' && 'errors' in data && data.errors) {
      const validationErrors = data.errors as Record<string, string[]>;
      const firstKey = Object.keys(validationErrors)[0];
      const firstErrorMessage = firstKey && validationErrors[firstKey]?.[0]
        ? validationErrors[firstKey][0]
        : 'Validation failed on the submitted data.';

      return {
        message: firstErrorMessage,
        statusCode: status,
        validationErrors,
      };
    }

    // 3. Status code defaults
    switch (status) {
      case 400:
        return { message: 'Invalid request. Please verify the input values.', statusCode: 400 };
      case 401:
        return { message: 'Session expired or unauthorized. Please sign in.', statusCode: 401 };
      case 403:
        return { message: 'You do not have permission to perform this action.', statusCode: 403 };
      case 404:
        return { message: 'The requested resource was not found.', statusCode: 404 };
      case 409:
        return { message: 'A conflict occurred. The record or code may already exist.', statusCode: 409 };
      case 500:
      default:
        return { message: 'An unexpected server error occurred. Please contact support.', statusCode: status };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unknown error occurred.' };
}
