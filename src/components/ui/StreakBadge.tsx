import React from 'react';
import { useGamification } from '../../hooks/useGamification';

export default function StreakBadge() {
  const { streak, loading } = useGamification();

  if (loading || !streak) {
    return <div className="flex items-center gap-2 text-white/50">Streak: —</div>;
  }

  return (
    <div className="flex items-center gap-3 bg-black-core/60 p-2 rounded-xl border border-white/10">
      <div className="w-12 h-12 bg-lemon-muted rounded-xl flex items-center justify-center font-black text-black">{streak.currentStreak || 0}</div>
      <div className="text-sm">
        <div className="font-black">{streak.currentStreak || 0} day streak</div>
        <div className="text-xs text-white/50">Longest {streak.longestStreak || 0} days</div>
      </div>
    </div>
  );
}
