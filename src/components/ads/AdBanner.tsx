import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { convex } from '../../lib/convex';
import { api } from '../../../convex/_generated/api';

type BannerAd = {
  _id: string;
  brandName: string;
  headline: string;
  description?: string;
  mediaUrl?: string;
  clickUrl?: string;
  type?: string;
};

export default function AdBanner({ className }: { className?: string }) {
  const [ad, setAd] = useState<BannerAd | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!convex) return;
    convex.query(api.ads.getSitewideAd, {}).then((result) => {
      if (result) setAd(result as any);
    }).catch((err) => console.error('[AdBanner] Failed to fetch ad', err));
  }, []);

  if (!ad || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-r from-ink-deep via-ink-deep to-black-core border border-white/5 rounded-2xl overflow-hidden ${className || ''}`}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
        aria-label="Dismiss ad"
      >
        <X size={14} className="text-white/40" />
      </button>
      <div className="flex items-center gap-4 p-4 pr-12">
        <div className="shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-lemon-muted/60 bg-lemon-muted/10 px-2 py-1 rounded">Sponsored</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{ad.headline}</p>
          {ad.description && <p className="text-xs text-white/40 truncate">{ad.description}</p>}
          <p className="text-[10px] text-white/20 font-medium mt-0.5">{ad.brandName}</p>
        </div>
        {ad.clickUrl && (
          <a
            href={ad.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center hover:bg-lemon-muted/20 transition-colors"
          >
            <ExternalLink size={16} className="text-lemon-muted" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
