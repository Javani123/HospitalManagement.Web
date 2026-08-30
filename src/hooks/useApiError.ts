import { useState, useCallback } from 'react';
import type { AppError } from '../types/api';
import { normalizeApiError } from '../utils/errorHandler';

/**
 * Hook to manage API error states and validation error handling in components.
 */
export function useApiError() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown) => {
    const normalized = normalizeApiError(err);
    setError(normalized);
    return normalized;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    errorMessage: error?.message || null,
    validationErrors: error?.validationErrors || null,
  };
}
