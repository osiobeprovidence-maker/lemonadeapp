import { useCallback } from 'react';
import { initializePayment, verifyPayment, generateReference, naiiraToKobo } from '../lib/paystack';
import { auth } from '../lib/firebase';

export function usePaystackCheckout() {
  const startCheckout = useCallback(async (opts: { email: string; amountNaira: number; metadata?: any; callbackUrl?: string }) => {
    const reference = generateReference();
    const init = await initializePayment({
      email: opts.email,
      amount: naiiraToKobo(opts.amountNaira),
      reference,
      metadata: opts.metadata,
      callbackUrl: opts.callbackUrl,
    });
    const authorizationUrl = init?.data?.authorization_url;
    if (!authorizationUrl) throw new Error('Failed to initialize Paystack checkout.');
    // Redirect to Paystack checkout page
    window.location.href = authorizationUrl;
    return reference;
  }, []);

  const handleReturn = useCallback(async (reference: string, subscriptionId?: string) => {
    const result = await verifyPayment(reference);
    const tx = result?.data;
    if (!tx || tx.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    // If we received an authorization code for recurring charges, send to server
    const authCode = tx.authorization?.authorization_code || tx.authorization_code || null;
    const customerId = tx.customer?.customer_code || tx.customer?.id || null;

    if (authCode && subscriptionId && auth.currentUser) {
      // send to server endpoint which forwards to Convex
      await fetch('/api/paystack-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: auth.currentUser.uid, subscriptionId, paystackCustomerId: customerId, authorizationCode: authCode }),
      });
    }

    return { tx, authCode, customerId };
  }, []);

  return { startCheckout, handleReturn };
}
