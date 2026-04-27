/**
 * Vercel Configuration
 * Handles deployment and environment-specific configuration
 */

export interface VercelConfig {
  url: string;
  environment: 'production' | 'preview' | 'development';
  isProduction: boolean;
}

export const getVercelConfig = (): VercelConfig => {
  const url = import.meta.env.VITE_VERCEL_URL || 'http://localhost:3001';
  const environment = (import.meta.env.VITE_ENVIRONMENT || 'development') as 'production' | 'preview' | 'development';

  return {
    url,
    environment,
    isProduction: environment === 'production',
  };
};

/**
 * Get the base API URL based on environment
 */
export const getApiBaseUrl = (): string => {
  const config = getVercelConfig();
  const baseUrl = config.isProduction ? `https://${config.url}` : config.url;
  return baseUrl;
};

/**
 * Get the callback URL for OAuth and webhooks
 */
export const getCallbackUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};

export default {
  getVercelConfig,
  getApiBaseUrl,
  getCallbackUrl,
};
