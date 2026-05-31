import React from "react";
import { motion } from "framer-motion";
import { useGamification } from "../../hooks/useGamification";
import { Button } from "./Button";

export default function SpinWheel() {
  const { marketplace, mysteryPool, balance, redeemMysteryBox } =
    useGamification();
  const featuredBox = mysteryPool?.[0];
  const featuredReward = marketplace?.[0];

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-white/5 bg-ink-deep p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">
            Reward Preview
          </p>
          <h3 className="font-black text-xl">Lemon Coins Hub</h3>
        </div>
        <div className="rounded-full bg-lemon-muted/15 px-3 py-1 text-sm font-black text-lemon-muted">
          {balance.toLocaleString()} coins
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-3"
      >
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/40 font-black mb-1">
            Featured Marketplace Reward
          </p>
          <p className="font-bold text-white">
            {featuredReward?.metadata?.title ||
              featuredReward?.rewardId ||
              "No rewards yet"}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {featuredReward
              ? `${featuredReward.type} • ${featuredReward.priceCoins || 0} coins`
              : "Configure rewards in the admin panel."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-white/40 font-black mb-1">
            Mystery Box
          </p>
          <p className="font-bold text-white">
            {featuredBox?.metadata?.label ||
              featuredBox?.rewardId ||
              "No mystery box configured"}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {featuredBox
              ? `${featuredBox.type} • ${featuredBox.amount ?? 0} coins`
              : "Add prize pool entries in admin."}
          </p>
        </div>
      </motion.div>

      <div className="mt-4 flex gap-2">
        <Button
          fullWidth
          onClick={async () => {
            if (!featuredBox) return;
            await redeemMysteryBox(featuredBox.rewardId);
          }}
          disabled={!featuredBox}
        >
          Open Mystery Box
        </Button>
      </div>
    </div>
  );
}
