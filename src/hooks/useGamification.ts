import { useCallback, useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { convex } from '../lib/convex';
import { auth } from '../lib/firebase';

export function useGamification() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [currencies, setCurrencies] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!convex || !auth.currentUser) return;
    setLoading(true);
    try {
      const inv = await convex.query(api.gamification.getSpinInventory, {});
      const s = await convex.query(api.gamification.getUserStreak, { firebaseUid: auth.currentUser.uid });
      const c = await convex.query(api.gamification.getUserCurrencies, { firebaseUid: auth.currentUser.uid });
      setInventory(inv || []);
      setStreak(s);
      setCurrencies(c);
    } catch (error) {
      console.error('Failed to load gamification data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const checkEligibility = useCallback(async (weekStartIso: string) => {
    if (!convex || !auth.currentUser) return { eligible: false };
    return await convex.query(api.gamification.eligibleForWeeklySpin, { firebaseUid: auth.currentUser.uid, weekStart: weekStartIso });
  }, []);

  const spin = useCallback(async (weekStartIso: string) => {
    if (!convex || !auth.currentUser) throw new Error('Not authenticated');
    return await convex.mutation(api.gamification.performWeeklySpin, { firebaseUid: auth.currentUser.uid, weekStart: weekStartIso });
  }, []);

  const buyStreakProtection = useCallback(async (days: number) => {
    if (!convex || !auth.currentUser) throw new Error('Not authenticated');
    return await convex.mutation(api.gamification.useStreakInsurance, { firebaseUid: auth.currentUser.uid, days });
  }, []);

  return { inventory, loading, streak, currencies, load, checkEligibility, spin, buyStreakProtection };
}
