import { useEffect, useRef } from 'react';
import { api } from '../../convex/_generated/api';
import { convex } from '../lib/convex';
import { auth } from '../lib/firebase';

export function useEngagement({ storyId, chapterId }: { storyId?: string; chapterId?: string }) {
  const sessionId = useRef(`sess_${Math.random().toString(36).slice(2, 9)}`);
  const startTs = useRef<number | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    startTs.current = Date.now();
    sentRef.current = false;

    const sendEvent = async (opts?: { force?: boolean }) => {
      if (!convex || !auth.currentUser) return;
      const now = Date.now();
      const durationMs = Math.max(0, now - (startTs.current || now));

      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const completionPct = Math.min(100, Math.round(((scrollY + winHeight) / Math.max(1, docHeight)) * 100));

      try {
        await convex.mutation(api.gamification.recordEngagement, {
          firebaseUid: auth.currentUser.uid,
          sessionId: sessionId.current,
          storyId,
          chapterId,
          durationMs,
          completionPct,
          scrollCompletionPct: completionPct,
          returningVisit: false,
          timestamp: new Date().toISOString(),
        });
        sentRef.current = true;
      } catch (error) {
        // ignore
      }
    };

    const interval = window.setInterval(() => {
      // periodically send lightweight pings
      void sendEvent();
    }, 30_000);

    const handleVisibility = () => {
      if (document.hidden) {
        void sendEvent({ force: true });
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      void sendEvent({ force: true });
    };
  }, [storyId, chapterId]);
}
