/**
 * Application environment configuration helper.
 * Provides type-safe access to environment variables without hardcoded URLs.
 */

const getEnvVar = (key: keyof ImportMetaEnv, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

export const config = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api'),
    timeout: 30000,
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Hospital Management SaaS'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
  // Default Tenant for local development (aligns with DevTenantContext)
  defaultTenant: {
    hospitalId: 1,
    hospitalName: 'Demo Hospital',
    hospitalCode: 'HOSP-001',
  },
} as const;

export default config;
