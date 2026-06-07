import { useEffect, useState } from 'react';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export function useCreatorPremium(firebaseUid?: string) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!firebaseUid || !convex) return;
    let mounted = true;
    setLoading(true);
    convex.query(api.creatorPremium.getCreatorSubscription, { firebaseUid }).then((res: any) => {
      if (!mounted) return;
      setData(res);
      setLoading(false);
    }).catch((err: any) => {
      console.error('Failed to load creator subscription', err);
      if (!mounted) return;
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [firebaseUid]);

  async function createTrial() {
    if (!convex || !firebaseUid) throw new Error('Convex or firebaseUid missing');
    setLoading(true);
    const res = await convex.mutation(api.creatorPremium.createPremiumTrial, { firebaseUid });
    setLoading(false);
    return res;
  }

  async function connectPaymentMethod(subscriptionId: string, paystackCustomerId: string, authorizationCode: string) {
    if (!convex || !firebaseUid) throw new Error('Convex or firebaseUid missing');
    setLoading(true);
    const res = await convex.mutation(api.creatorPremium.connectPaymentMethod, { firebaseUid, subscriptionId, paystackCustomerId, paystackAuthorizationCode: authorizationCode });
    setLoading(false);
    return res;
  }

  return { loading, data, createTrial, connectPaymentMethod };
}
