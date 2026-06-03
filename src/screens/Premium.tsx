import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { usePaystackCheckout } from '../hooks/usePaystackCheckout';
import { auth } from '../lib/firebase';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

const DEFAULT_MONTHLY_PRICE = 1200; // NGN

export default function Premium() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const { startCheckout, handleReturn } = usePaystackCheckout();

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;

    const finalize = async () => {
      setStatus('Verifying payment...');
      try {
        const result = await handleReturn(reference);
        const tx = result.tx;
        if (tx && tx.status === 'success') {
          // activate premium via Convex
          if (auth.currentUser) {
            await convex.mutation(api.payments.activatePremiumAfterPaystack, {
              firebaseUid: auth.currentUser.uid,
              reference,
              planType: 'premium',
              billingCycle: 'monthly',
              amount: Number(tx.amount) / 100,
              providerPayload: tx,
            });
          }
          setStatus('Payment confirmed. Premium activated.');
          setSearchParams({});
        } else {
          setStatus('Payment verification failed.');
        }
      } catch (err: any) {
        setStatus(err?.message || 'Unable to verify payment.');
      }
    };

    finalize();
  }, [searchParams, setSearchParams, handleReturn]);

  const startTrial = async () => {
    if (!auth.currentUser) return navigate('/auth?mode=signin&intent=trial');
    setStatus('Starting 90-day free trial...');
    try {
      const res = await convex.mutation(api.creatorPremium.createPremiumTrial, { firebaseUid: auth.currentUser.uid });
      setStatus(`Trial started until ${new Date(res.trialEnd).toLocaleDateString()}`);
    } catch (err: any) {
      setStatus(err?.message || 'Unable to start trial.');
    }
  };

  const subscribeMonthly = async () => {
    if (!auth.currentUser) return navigate('/auth?mode=signin&intent=subscribe');
    setStatus('Redirecting to payment...');
    try {
      await startCheckout({
        email: auth.currentUser.email || '',
        amountNaira: DEFAULT_MONTHLY_PRICE,
        metadata: { product: 'premium', planType: 'premium', billingCycle: 'monthly', firebaseUid: auth.currentUser.uid },
        callbackUrl: `${window.location.origin}/premium`,
      });
    } catch (err: any) {
      setStatus(err?.message || 'Unable to start checkout.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="font-display font-black text-4xl mb-3">Premium</h1>
      <p className="text-sm text-white/60 mb-6">Unlock unlimited reading, support creators, and enjoy an ad-free experience. Try 90 days free or subscribe monthly.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-6 border rounded-lg bg-ink-deep">
          <h2 className="font-bold text-xl">90-Day Free Trial</h2>
          <p className="text-sm text-white/50 mt-2">Enjoy full Premium access for 90 days. No charge now.</p>
          <div className="mt-4">
            <Button onClick={startTrial}>Start 90-Day Free Trial</Button>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-ink-deep">
          <h2 className="font-bold text-xl">Monthly Subscription</h2>
          <p className="text-sm text-white/50 mt-2">{`NGN ${DEFAULT_MONTHLY_PRICE.toLocaleString()} / month`}</p>
          <div className="mt-4">
            <Button onClick={subscribeMonthly}>Subscribe Monthly</Button>
          </div>
        </div>
      </div>

      {status && <p className="text-sm font-bold text-lemon-muted">{status}</p>}
    </div>
  );
}
