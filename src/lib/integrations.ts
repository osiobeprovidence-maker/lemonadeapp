/**
 * Integration Setup and Initialization
 * Centralizes all tech stack service initialization
 */

import { auth, db, storage } from './firebase';
import { convex } from './convex';
import { getPaystackConfig } from './paystack';
import { getMuxConfig } from './mux';
import { getVercelConfig } from './vercel';

export interface IntegrationStatus {
  firebase: boolean;
  convex: boolean;
  paystack: boolean;
  mux: boolean;
  vercel: boolean;
}

/**
 * Initialize all integrations and verify configuration
 */
export const initializeIntegrations = async (): Promise<IntegrationStatus> => {
  const status: IntegrationStatus = {
    firebase: false,
    convex: false,
    paystack: false,
    mux: false,
    vercel: false,
  };

  // Firebase
  try {
    // Test Firebase connection
    if (auth && db && storage) {
      status.firebase = true;
      console.log('✓ Firebase initialized');
    }
  } catch (error) {
    console.error('✗ Firebase initialization failed:', error);
  }

  // Convex
  try {
    if (convex) {
      status.convex = true;
      console.log('✓ Convex initialized');
    }
  } catch (error) {
    console.error('✗ Convex initialization failed:', error);
  }

  // Paystack
  try {
    getPaystackConfig();
    status.paystack = true;
    console.log('✓ Paystack configured');
  } catch (error) {
    console.warn('⚠ Paystack configuration incomplete:', error);
  }

  // Mux
  try {
    getMuxConfig();
    status.mux = true;
    console.log('✓ Mux configured');
  } catch (error) {
    console.warn('⚠ Mux configuration incomplete:', error);
  }

  // Vercel
  try {
    const vercelConfig = getVercelConfig();
    status.vercel = true;
    console.log('✓ Vercel configured:', vercelConfig.environment);
  } catch (error) {
    console.error('✗ Vercel configuration failed:', error);
  }

  return status;
};

/**
 * Export all services
 */
export { auth, db, storage };
export { convex };
export { default as paystack } from './paystack';
export { default as mux } from './mux';
export { default as vercel } from './vercel';
