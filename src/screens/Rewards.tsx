import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Gift, Zap, Trophy, Loader } from 'lucide-react';
import SpinWheel from '../components/ui/SpinWheel';
import StreakBadge from '../components/ui/StreakBadge';
import { useGamification } from '../hooks/useGamification';
import { useApp } from '../contexts/AppContext';

export default function Rewards() {
  const { user } = useApp();
  const { streak, currencies, loading } = useGamification();

  const milestones = [7, 30, 100];
  const currentStreak = streak?.currentStreak ?? 0;
  const nextMilestone = milestones.find((m) => m > currentStreak) ?? 100;
  const progress = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black">Rewards</h1>
            <p className="text-sm text-white/40">Your streaks, spins, quests and rewards.</p>
          </div>
          <Link to="/profile" className="text-sm text-white/40">Back to profile</Link>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-12 text-white/40">
            <Loader className="animate-spin mr-2" size={20} />
            <span className="text-sm font-medium">Loading your rewards...</span>
          </div>
        )}

        {!loading && (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={18} className="text-orange-500" />
                  <h3 className="font-black">Daily Streak</h3>
                </div>
                <StreakBadge />
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>{currentStreak} days</span>
                    <span>Next: {nextMilestone} days</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/40">Maintain daily reading to grow streaks and unlock milestone rewards.</p>
              </div>

              <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
                <div className="flex items-center gap-2 mb-4">
                  <Gift size={18} className="text-lemon-muted" />
                  <h3 className="font-black">Weekly Spin</h3>
                </div>
                <div className="flex items-center justify-center">
                  <SpinWheel />
                </div>
                <p className="mt-4 text-sm text-white/40">Earn spins by meeting weekly engagement goals.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-yellow-400" />
                <h3 className="font-black">Quests</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-lemon-muted" />
                    <div>
                      <p className="text-sm font-bold">Read 5 Chapters This Week</p>
                      <p className="text-xs text-white/40">Progress: 0/5</p>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-lemon-muted">+50 coins</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Flame size={18} className="text-orange-500" />
                    <div>
                      <p className="text-sm font-bold">7-Day Streak</p>
                      <p className="text-xs text-white/40">Keep reading daily</p>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-lemon-muted">+100 coins</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/30">More creator quests and special events coming soon.</p>
            </section>

            {currencies && (
              <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
                <h3 className="font-black mb-4">Your Currencies</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(currencies).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{key.replace(/_/g, ' ')}</p>
                      <p className="mt-1 font-display font-bold text-xl">{typeof value === 'number' ? value.toLocaleString() : String(value)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
