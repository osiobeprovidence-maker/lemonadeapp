import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Flame,
  Gift,
  Loader,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { useGamification } from "../hooks/useGamification";
import { Button } from "../components/ui/Button";

export default function Rewards() {
  const {
    hub,
    missions,
    marketplace,
    mysteryPool,
    achievements,
    recentRedemptions,
    streak,
    currencies,
    loading,
    error,
    claimMission,
    redeemReward,
    openMysteryBox,
  } = useGamification();

  const currentStreak = streak?.currentStreak ?? 0;
  const balance = hub?.balance ?? currencies?.lemonCoins ?? 0;
  const claimedMissions = missions.filter(
    (mission: any) => mission.claimed,
  ).length;
  const progressSummary = `Read → Earn Coins → Engage → Complete Missions → Unlock Achievements → Redeem Rewards`;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black">
              Lemon Coins
            </h1>
            <p className="text-sm text-white/40 max-w-2xl">
              Turn reading, commenting, streaks, and community participation
              into rewards that feel built into the journey.
            </p>
          </div>
          <Link
            to="/profile"
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Back to profile
          </Link>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-12 text-white/40">
            <Loader className="animate-spin mr-2" size={20} />
            <span className="text-sm font-medium">
              Loading your reward hub...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-200 font-bold mb-2">Unable to load rewards</p>
            <p className="text-sm text-red-300/70 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-bold text-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard
                icon={<Wallet size={18} />}
                label="Lemon Coins"
                value={balance.toLocaleString()}
              />
              <StatCard
                icon={<Flame size={18} />}
                label="Reading Streak"
                value={`${currentStreak} days`}
              />
              <StatCard
                icon={<Trophy size={18} />}
                label="Missions Claimed"
                value={`${claimedMissions}/${missions.length || 0}`}
              />
              <StatCard
                icon={<Sparkles size={18} />}
                label="Redemptions"
                value={`${recentRedemptions.length || 0}`}
              />
            </section>

            <section className="rounded-3xl border border-white/5 bg-ink-deep p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-lemon-muted" />
                <h2 className="font-black text-xl">The Reading Journey</h2>
              </div>
              <p className="text-sm text-white/45 mb-6">{progressSummary}</p>
              <div className="grid gap-3 md:grid-cols-6 text-xs font-bold uppercase tracking-widest text-white/50">
                {[
                  "Read",
                  "Earn Coins",
                  "Engage",
                  "Complete Missions",
                  "Unlock Achievements",
                  "Redeem",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center"
                  >
                    <div className="mb-2 text-lemon-muted">0{index + 1}</div>
                    <div>{step}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/5 bg-ink-deep p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gift size={18} className="text-lemon-muted" />
                  <h2 className="font-black text-xl">Weekly Missions</h2>
                </div>
                <div className="space-y-3">
                  {missions.length > 0 ? (
                    missions.map((mission: any) => {
                      const progress = Number(mission.progress || 0);
                      const target = Number(mission.criteria?.target || 0);
                      const canClaim = progress >= target && !mission.claimed;
                      return (
                        <div
                          key={mission.achievementId || mission.missionId}
                          className="rounded-2xl border border-white/5 bg-white/5 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-white">
                                {mission.name}
                              </p>
                              <p className="text-xs text-white/40 mt-1">
                                {mission.description}
                              </p>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-lemon-muted">
                              +{mission.coinReward || 0} coins
                            </span>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-white/40 mb-2">
                            <span>
                              {progress}/{target}
                            </span>
                            <span>
                              {mission.claimed
                                ? "Claimed"
                                : canClaim
                                  ? "Ready to claim"
                                  : "In progress"}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-lemon-muted rounded-full transition-all"
                              style={{
                                width: `${target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0}%`,
                              }}
                            />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              disabled={!canClaim}
                              onClick={async () => {
                                await claimMission(
                                  mission.missionId || mission.achievementId,
                                );
                                await Promise.resolve();
                              }}
                            >
                              Claim
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/40">
                      No missions configured yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/5 bg-ink-deep p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-lemon-muted" />
                  <h2 className="font-black text-xl">Mystery Boxes</h2>
                </div>
                <div className="space-y-3">
                  {mysteryPool.length > 0 ? (
                    mysteryPool.map((box: any) => (
                      <div
                        key={box.rewardId}
                        className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {box.metadata?.label || box.rewardId}
                          </p>
                          <p className="text-xs text-white/40">
                            Possible reward: {box.type}
                            {box.amount ? ` • ${box.amount}` : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            await openMysteryBox(box.rewardId);
                          }}
                        >
                          Open
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/40">
                      No mystery boxes configured yet.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/5 bg-ink-deep p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet size={18} className="text-lemon-muted" />
                  <h2 className="font-black text-xl">Marketplace</h2>
                </div>
                <div className="grid gap-3">
                  {marketplace.length > 0 ? (
                    marketplace.map((reward: any) => (
                      <div
                        key={reward.rewardId}
                        className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {reward.metadata?.title || reward.rewardId}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {reward.type} •{" "}
                            {reward.priceCoins?.toLocaleString()} coins •{" "}
                            {reward.fulfillmentMode}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            await redeemReward(reward.rewardId, 1);
                          }}
                        >
                          Redeem
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/40">
                      No marketplace rewards configured yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/5 bg-ink-deep p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-lemon-muted" />
                  <h2 className="font-black text-xl">Achievements & Badges</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {achievements.length > 0 ? (
                    achievements.map((achievement: any) => (
                      <div
                        key={achievement.achievementId}
                        className="rounded-2xl border border-white/5 bg-white/5 p-4"
                      >
                        <p className="font-bold text-white">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {achievement.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                          <span>
                            {achievement.unlocked ? "Unlocked" : "Locked"}
                          </span>
                          <span>{achievement.coinReward || 0} coins</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-sm text-white/40 md:col-span-2">
                      No achievements configured yet.
                    </div>
                  )}
                </div>
              </section>
            </section>

            {currencies && (
              <section className="rounded-3xl border border-white/5 bg-ink-deep p-6">
                <h3 className="font-black mb-4">Your Balance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(currencies)
                    .filter(
                      ([key]) =>
                        !["_id", "_creationTime", "userId", "updatedat", "creationtime", "id", "userid"].includes(
                          key.toLowerCase(),
                        ),
                    )
                    .map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 text-center"
                      >
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 font-display font-bold text-xl">
                          {typeof value === "number"
                            ? value.toLocaleString()
                            : String(value)}
                        </p>
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-ink-deep p-5">
      <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest font-black mb-3">
        {icon}
        {label}
      </div>
      <div className="font-display text-3xl font-black">{value}</div>
    </div>
  );
}
