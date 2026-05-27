import { useCallback, useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { convex } from '../lib/convex';
import type { LemonadeAd } from '../components/ads/AdPrerollModal';

type AdGateArgs = {
  enabled: boolean;
  userId?: string;
  storyId?: string;
  creatorUsername?: string;
  format?: string;
  genre?: string;
  chapterNumber: number;
  isPremium: boolean;
};

const RECENT_ADS_KEY = 'lemonade_recent_ads';
const LAST_AD_KEY = 'lemonade_last_ad_at';

const readRecentAds = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_ADS_KEY) || '[]') as string[];
  } catch {
    return [];
  }
};

const rememberAd = (adId: string) => {
  const recent = [adId, ...readRecentAds().filter((id) => id !== adId)].slice(0, 6);
  localStorage.setItem(RECENT_ADS_KEY, JSON.stringify(recent));
  localStorage.setItem(LAST_AD_KEY, new Date().toISOString());
};

const normalizeContentType = (format?: string): 'manga' | 'manhwa' | 'novel' | 'movie' | 'unknown' => {
  const lower = (format || '').toLowerCase();
  if (lower.includes('movie')) return 'movie';
  if (lower.includes('novel')) return 'novel';
  if (lower.includes('manhwa')) return 'manhwa';
  if (lower.includes('manga') || lower.includes('comic')) return 'manga';
  return 'unknown';
};

export function useAdGate({
  enabled,
  userId,
  storyId,
  creatorUsername,
  format,
  genre,
  chapterNumber,
  isPremium,
}: AdGateArgs) {
  const [ad, setAd] = useState<LemonadeAd | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isContentUnlocked, setIsContentUnlocked] = useState(!enabled || isPremium);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const contentType = normalizeContentType(format);
  const chapterId = `c${chapterNumber || 1}`;

  const track = useCallback(async (eventType: 'impression' | 'completed' | 'skip' | 'click', watchTimeMs = 0) => {
    if (!convex || !ad) return;

    try {
      await convex.mutation(api.ads.trackEvent, {
        adId: ad._id as any,
        userId,
        storyId,
        creatorUsername,
        contentType,
        chapterId,
        eventType,
        watchTimeMs,
      });
    } catch (error) {
      console.error('Failed to track ad event', error);
    }
  }, [ad, chapterId, contentType, creatorUsername, storyId, userId]);

  const unlockAfterAd = useCallback((adId?: string) => {
    if (adId) rememberAd(adId);
    setIsAdOpen(false);
    setIsContentUnlocked(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDecision = async () => {
      setAd(null);
      setIsAdOpen(false);
      setIsContentUnlocked(!enabled || isPremium);

      if (!enabled || isPremium || !storyId || !convex) return;

      setDecisionLoading(true);
      try {
        const decision = await convex.mutation(api.ads.selectForContent, {
          userId,
          storyId,
          creatorUsername,
          format,
          genre,
          chapterNumber,
          isPremium,
          recentAdIds: readRecentAds(),
          lastAdShownAt: localStorage.getItem(LAST_AD_KEY) || undefined,
        });

        if (cancelled) return;

        if (decision?.shouldShow && decision.ad) {
          setAd(decision.ad as LemonadeAd);
          setCountdownSeconds(decision.countdownSeconds || 5);
          setIsAdOpen(true);
          setIsContentUnlocked(false);
        } else {
          setIsContentUnlocked(true);
        }
      } catch (error) {
        console.error('Failed to load ad decision', error);
        if (!cancelled) setIsContentUnlocked(true);
      } finally {
        if (!cancelled) setDecisionLoading(false);
      }
    };

    loadDecision();

    return () => {
      cancelled = true;
    };
  }, [chapterNumber, creatorUsername, enabled, format, genre, isPremium, storyId, userId]);

  useEffect(() => {
    if (!isAdOpen || !ad) return;
    void track('impression', 0);
  }, [ad, isAdOpen, track]);

  const completeAd = useCallback((watchTimeMs: number) => {
    if (!ad) {
      setIsContentUnlocked(true);
      return;
    }
    void track('completed', watchTimeMs);
    unlockAfterAd(ad._id);
  }, [ad, track, unlockAfterAd]);

  const skipAd = useCallback((watchTimeMs: number) => {
    if (!ad) {
      setIsContentUnlocked(true);
      return;
    }
    void track('skip', watchTimeMs);
    unlockAfterAd(ad._id);
  }, [ad, track, unlockAfterAd]);

  const clickAd = useCallback((watchTimeMs: number) => {
    void track('click', watchTimeMs);
  }, [track]);

  return {
    ad,
    countdownSeconds,
    isAdOpen,
    isContentUnlocked,
    decisionLoading,
    completeAd,
    skipAd,
    clickAd,
  };
}
