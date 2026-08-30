import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TenantInfoDto, TenantContextType } from '../types/tenant';
import { tenantService } from '../services/tenantService';
import { config } from '../config/env';

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  // Initialize with development tenant configuration
  const [tenant, setTenant] = useState<TenantInfoDto | null>(config.defaultTenant);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tenantService.getCurrentTenant();
      setTenant(data);
    } catch {
      // In local dev without active backend, gracefully retain default dev tenant
      setTenant(config.defaultTenant);
      // Not treated as a fatal error for F1 foundation
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        error,
        refreshTenant: fetchTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
