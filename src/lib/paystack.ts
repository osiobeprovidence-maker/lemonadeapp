/**
 * Paystack Payment Integration
 * Handles payment processing through Paystack API
 */

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
}

export interface PaymentInitialization {
  email: string;
  amount: number; // Amount in kobo (1/100th of naira)
  reference?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export interface PaymentVerification {
  reference: string;
}

export const getPaystackConfig = (): PaystackConfig => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error('Paystack configuration is missing. Please set VITE_PAYSTACK_PUBLIC_KEY and VITE_PAYSTACK_SECRET_KEY');
  }

  return { publicKey, secretKey };
};

/**
 * Initialize a Paystack payment
 */
export const initializePayment = async (paymentData: PaymentInitialization): Promise<any> => {
  const config = getPaystackConfig();

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference || generateReference(),
        metadata: paymentData.metadata,
        channels: paymentData.channels || ['card', 'bank', 'ussd'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize payment: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

/**
 * Verify a Paystack payment
 */
export const verifyPayment = async (reference: string): Promise<any> => {
  const config = getPaystackConfig();

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to verify payment: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
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
