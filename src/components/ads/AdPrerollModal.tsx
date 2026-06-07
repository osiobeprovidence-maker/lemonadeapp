import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Play, ShieldCheck, Timer, X } from 'lucide-react';
import { Button } from '../ui/Button';

export type OwuuuAd = {
  _id: string;
  title: string;
  type: 'video' | 'image' | 'banner';
  mediaUrl: string;
  clickUrl?: string;
  brandName: string;
  headline: string;
  description?: string;
};

interface AdPrerollModalProps {
  ad: OwuuuAd | null;
  countdownSeconds?: number;
  open: boolean;
  onComplete: (watchTimeMs: number) => void;
  onSkip: (watchTimeMs: number) => void;
  onClickThrough: (watchTimeMs: number) => void;
}

export default function AdPrerollModal({
  ad,
  countdownSeconds = 5,
  open,
  onComplete,
  onSkip,
  onClickThrough,
}: AdPrerollModalProps) {
  const [remaining, setRemaining] = useState(countdownSeconds);
  const [hasCompleted, setHasCompleted] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const canSkip = remaining <= 0;
  const isVideo = ad?.type === 'video';

  const watchTimeMs = () => Math.max(0, Date.now() - startedAtRef.current);

  useEffect(() => {
    if (!open) return;

    setRemaining(countdownSeconds);
    setHasCompleted(false);
    startedAtRef.current = Date.now();

    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [countdownSeconds, open, ad?._id]);

  useEffect(() => {
    if (!open || isVideo || hasCompleted) return;

    const timeout = window.setTimeout(() => {
      setHasCompleted(true);
      onComplete(watchTimeMs());
    }, Math.max(1, countdownSeconds + 2) * 1000);

    return () => window.clearTimeout(timeout);
  }, [countdownSeconds, hasCompleted, isVideo, onComplete, open]);

  const progress = useMemo(() => {
    if (!countdownSeconds) return 100;
    return ((countdownSeconds - remaining) / countdownSeconds) * 100;
  }, [countdownSeconds, remaining]);

  if (!ad) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/88 px-4 py-6 text-white backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25 }}
            className="relative flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-2xl shadow-black"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-white/10">
              <div className="h-full bg-lemon-muted transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="relative aspect-[16/10] overflow-hidden bg-black">
              {isVideo ? (
                <video
                  src={ad.mediaUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  onEnded={() => {
                    if (hasCompleted) return;
                    setHasCompleted(true);
                    onComplete(watchTimeMs());
                  }}
                />
              ) : (
                <img src={ad.mediaUrl} alt={ad.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/72 backdrop-blur">
                Sponsored
              </div>

              <button
                type="button"
                disabled={!canSkip}
                onClick={() => onSkip(watchTimeMs())}
                className="absolute right-4 top-4 inline-flex h-9 items-center gap-2 rounded-full bg-black/65 px-3 text-xs font-black text-white backdrop-blur transition-colors disabled:cursor-not-allowed disabled:text-white/45"
              >
                {canSkip ? <X size={14} /> : <Timer size={14} />}
                {canSkip ? 'Skip' : `${remaining}s`}
              </button>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-lemon-muted">
                <ShieldCheck size={13} />
                Ad supports free reading
              </div>
              <h2 className="font-display text-2xl font-black leading-tight">{ad.headline}</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">{ad.description || `A message from ${ad.brandName}.`}</p>

              <div className="mt-5 flex items-center gap-3">
                {ad.clickUrl && (
                  <a
                    href={ad.clickUrl}
                    target={ad.clickUrl.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    onClick={() => onClickThrough(watchTimeMs())}
                    className="flex-1"
                  >
                    <Button fullWidth className="gap-2 rounded-2xl">
                      Learn more <ExternalLink size={15} />
                    </Button>
                  </a>
                )}
                <Button
                  variant="glass"
                  className="gap-2 rounded-2xl"
                  disabled={!canSkip}
                  onClick={() => onSkip(watchTimeMs())}
                >
                  <Play size={15} />
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
