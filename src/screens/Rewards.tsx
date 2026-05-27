import React from 'react';
import SpinWheel from '../components/ui/SpinWheel';
import StreakBadge from '../components/ui/StreakBadge';
import { Link } from 'react-router-dom';

export default function Rewards() {
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

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
            <h3 className="font-black mb-4">Daily Streak</h3>
            <StreakBadge />
            <p className="mt-4 text-sm text-white/40">Maintain daily reading/viewing to grow streaks and unlock milestone rewards (Day 7, 30, 100).</p>
          </div>

          <div className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
            <h3 className="font-black mb-4">Weekly Spin</h3>
            <div className="flex items-center justify-center">
              <SpinWheel />
            </div>
            <p className="mt-4 text-sm text-white/40">Earn spins by meeting weekly engagement goals.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <h3 className="font-black mb-4">Quests</h3>
          <p className="text-sm text-white/40">Creator quests and special events will appear here.</p>
        </section>
      </div>
    </div>
  );
}
