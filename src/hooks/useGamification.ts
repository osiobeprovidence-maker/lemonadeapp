import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { convex } from "../lib/convex";
import { auth } from "../lib/firebase";

export function useGamification() {
  const [hub, setHub] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [currencies, setCurrencies] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!convex || !auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const rewardHub = await convex.query(api.gamification.getRewardHub, {
        firebaseUid: auth.currentUser.uid,
      });
      const inv = await convex.query(api.gamification.getSpinInventory, {});
      const s = await convex.query(api.gamification.getUserStreak, {
        firebaseUid: auth.currentUser.uid,
      });
      const c = await convex.query(api.gamification.getUserCurrencies, {
        firebaseUid: auth.currentUser.uid,
      });
      setHub(rewardHub);
      setInventory(inv || null);
      setStreak(s);
      setCurrencies(c);
    } catch (err) {
      console.error("Failed to load gamification data", err);
      setError(err instanceof Error ? err.message : "Failed to load rewards data");
      setHub(null);
      setStreak(null);
      setCurrencies(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const checkEligibility = useCallback(async (weekStartIso: string) => {
    if (!convex || !auth.currentUser) return { eligible: false };
    return await convex.query(api.gamification.eligibleForWeeklySpin, {
      firebaseUid: auth.currentUser.uid,
      weekStart: weekStartIso,
    });
  }, []);

  const redeemMysteryBox = useCallback(async (rewardId?: string) => {
    if (!convex || !auth.currentUser) throw new Error("Not authenticated");
    return await convex.mutation(api.gamification.openMysteryBox, {
      firebaseUid: auth.currentUser.uid,
      rewardId,
      quantity: 1,
    });
  }, []);

  const claimMission = useCallback(async (missionId: string) => {
    if (!convex || !auth.currentUser) throw new Error("Not authenticated");
    return await convex.mutation(api.gamification.claimMission, {
      firebaseUid: auth.currentUser.uid,
      missionId,
    });
  }, []);

  const redeemReward = useCallback(async (rewardId: string, quantity = 1) => {
    if (!convex || !auth.currentUser) throw new Error("Not authenticated");
    return await convex.mutation(api.gamification.redeemMarketplaceReward, {
      firebaseUid: auth.currentUser.uid,
      rewardId,
      quantity,
    });
  }, []);

  const openMysteryBox = useCallback(
    async (rewardId?: string) => {
      return await redeemMysteryBox(rewardId);
    },
    [redeemMysteryBox],
  );

  const spin = useCallback(async (weekStartIso: string) => {
    if (!convex || !auth.currentUser) throw new Error("Not authenticated");
    return await convex.mutation(api.gamification.performWeeklySpin, {
      firebaseUid: auth.currentUser.uid,
      weekStart: weekStartIso,
    });
  }, []);

  const buyStreakProtection = useCallback(async (days: number) => {
    if (!convex || !auth.currentUser) throw new Error("Not authenticated");
    return await convex.mutation(api.gamification.useStreakInsurance, {
      firebaseUid: auth.currentUser.uid,
      days,
    });
  }, []);

  return {
    hub,
    inventory,
    loading,
    error,
    streak,
    currencies,
    marketplace: hub?.marketplace || [],
    mysteryPool: hub?.mysteryPool || [],
    missions: hub?.missions || [],
    achievements: hub?.achievements || [],
    recentRedemptions: hub?.recentRedemptions || [],
    balance: hub?.balance ?? currencies?.lemonCoins ?? 0,
    load,
    checkEligibility,
    redeemMysteryBox,
    openMysteryBox,
    claimMission,
    redeemReward,
    spin,
    buyStreakProtection,
  };
}
