import { useContext } from 'react';
import { TenantContext } from '../context/TenantContext';
import type { TenantContextType } from '../types/tenant';

/**
 * Custom hook to access the active Tenant / Hospital context.
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
