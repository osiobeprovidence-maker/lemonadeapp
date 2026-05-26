/**
 * Paystack Payment Integration
 * Handles payment processing through Paystack API
 */

export interface PaystackConfig {
  publicKey: string;
}

export interface PaymentInitialization {
  email: string;
  amount: number; // Amount in kobo (1/100th of naira)
  reference?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  plan?: string;
  callbackUrl?: string;
}

export interface PaymentVerification {
  reference: string;
}

export const getPaystackConfig = (): PaystackConfig => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error('Paystack public key is missing. Please set VITE_PAYSTACK_PUBLIC_KEY');
  }

  return { publicKey };
};

import { convex } from './convex';
import { api } from '../../convex/_generated/api';

const paymentSetupError =
  'Payments are not configured yet. Add PAYSTACK_SECRET_KEY to the Convex production environment.';

const normalizePaymentError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('PAYSTACK_SECRET_KEY') ||
    message.includes('Paystack public key is missing')
  ) {
    return new Error(paymentSetupError);
  }

  return error instanceof Error ? error : new Error('Payment request failed.');
};

/**
 * Initialize a Paystack payment via Convex Action
 */
export const initializePayment = async (paymentData: PaymentInitialization): Promise<any> => {
  try {
    const data = await convex.action(api.paystack.initialize, {
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference || generateReference(),
      plan: paymentData.plan,
      metadata: paymentData.metadata,
      callbackUrl: paymentData.callbackUrl || `${window.location.origin}/wallet`,
    });

    return { data };
  } catch (error) {
    console.error('Error initializing payment via Convex:', error);
    throw normalizePaymentError(error);
  }
};

/**
 * Verify a Paystack payment via Convex Action
 */
export const verifyPayment = async (reference: string): Promise<any> => {
  try {
    return await convex.action(api.paystack.verify, { reference });
  } catch (error) {
    console.error('Error verifying payment via Convex:', error);
    throw normalizePaymentError(error);
  }
};

/**
 * Generate a unique payment reference
 */
export const generateReference = (): string => {
  return `lemonade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert Naira to Kobo
 */
export const naiiraToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert Kobo to Naira
 */
export const koboToNaira = (amount: number): number => {
  return amount / 100;
};

export default {
  getPaystackConfig,
  initializePayment,
  verifyPayment,
  generateReference,
  naiiraToKobo,
  koboToNaira,
};
