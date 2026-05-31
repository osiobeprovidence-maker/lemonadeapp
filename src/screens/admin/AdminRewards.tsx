import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { convex } from "../../lib/convex";
import { Button } from "../../components/ui/Button";
import {
  Plus,
  Trash,
  Edit,
  Check,
  X,
  Gift,
  Sparkles,
  Trophy,
  BarChart3,
} from "lucide-react";

const emptyMarketplaceForm = {
  rewardId: "",
  type: "airtime",
  quantity: 1,
  reserved: 0,
  metadata: {
    title: "",
    imageUrl: "",
    priceCoins: 0,
    fulfillmentMode: "manual",
    provider: "",
  },
};

const emptyMysteryForm = {
  rewardId: "",
  type: "lemon_coins",
  amount: 0,
  weight: 1,
  active: true,
  metadata: {
    label: "",
    imageUrl: "",
    fulfillmentMode: "automatic",
    durationDays: 30,
    badgeId: "",
  },
};

const emptyMissionForm = {
  achievementId: "",
  name: "",
  description: "",
  metric: "countedReads",
  target: 5,
  window: "week",
  coinReward: 25,
  xpReward: 50,
  badgeId: "",
  icon: "",
  active: true,
};

export default function AdminRewards() {
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [mysteryPool, setMysteryPool] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [editingMarketplace, setEditingMarketplace] = useState<any | null>(
    null,
  );
  const [editingMystery, setEditingMystery] = useState<any | null>(null);
  const [editingMission, setEditingMission] = useState<any | null>(null);

  const [marketForm, setMarketForm] = useState<any>(emptyMarketplaceForm);
  const [mysteryForm, setMysteryForm] = useState<any>(emptyMysteryForm);
  const [missionForm, setMissionForm] = useState<any>(emptyMissionForm);

  const load = async () => {
    if (!convex) return;
    setLoading(true);
    try {
      const [
        marketData,
        mysteryData,
        missionData,
        redemptionData,
        analyticsData,
      ] = await Promise.all([
        convex.query(api.admin.listMarketplaceRewards, {}),
        convex.query(api.admin.listSpinRewards, {}),
        convex.query(api.admin.listMissionCatalog, {}),
        convex.query(api.admin.listRedemptions, {}),
        convex.query(api.admin.analytics, {}),
      ]);
      setMarketplace(marketData || []);
      setMysteryPool(mysteryData || []);
      setMissions(missionData || []);
      setRedemptions(redemptionData || []);
      setAnalytics(analyticsData || null);
    } catch (error) {
      console.error("Failed to load reward admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveMarketplace = async () => {
    if (!convex) return;
    const payload = {
      rewardId:
        marketForm.rewardId ||
        `reward_${Math.random().toString(36).slice(2, 7)}`,
      type: marketForm.type,
      quantity: Number(marketForm.quantity || 0),
      reserved: Number(marketForm.reserved || 0),
      metadata: marketForm.metadata,
    };
    try {
      if (editingMarketplace) {
        await convex.mutation(api.admin.updateMarketplaceReward, {
          id: editingMarketplace._id as any,
          updates: payload,
        });
      } else {
        await convex.mutation(api.admin.createMarketplaceReward, payload);
      }
      setEditingMarketplace(null);
      setMarketForm(emptyMarketplaceForm);
      await load();
    } catch (error) {
      console.error("Failed to save marketplace reward", error);
    }
  };

  const removeMarketplace = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.deleteMarketplaceReward, { id: id as any });
    await load();
  };

  const saveMystery = async () => {
    if (!convex) return;
    const payload = {
      rewardId:
        mysteryForm.rewardId || `box_${Math.random().toString(36).slice(2, 7)}`,
      type: mysteryForm.type,
      amount: Number(mysteryForm.amount || 0),
      weight: Number(mysteryForm.weight || 1),
      active: !!mysteryForm.active,
      metadata: mysteryForm.metadata,
    };
    try {
      if (editingMystery) {
        await convex.mutation(api.admin.updateSpinReward, {
          id: editingMystery._id as any,
          updates: payload,
        });
      } else {
        await convex.mutation(api.admin.createSpinReward, payload);
      }
      setEditingMystery(null);
      setMysteryForm(emptyMysteryForm);
      await load();
    } catch (error) {
      console.error("Failed to save mystery pool reward", error);
    }
  };

  const removeMystery = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.deleteSpinReward, { id: id as any });
    await load();
  };

  const saveMission = async () => {
    if (!convex) return;
    const payload = {
      achievementId:
        missionForm.achievementId ||
        `mission_${Math.random().toString(36).slice(2, 7)}`,
      name: missionForm.name,
      description: missionForm.description,
      criteria: {
        kind: "mission",
        metric: missionForm.metric,
        target: Number(missionForm.target || 0),
        window: missionForm.window,
      },
      xpReward: Number(missionForm.xpReward || 0),
      coinReward: Number(missionForm.coinReward || 0),
      badgeId: missionForm.badgeId || undefined,
      icon: missionForm.icon || undefined,
      active: !!missionForm.active,
    };
    try {
      await convex.mutation(api.admin.upsertMission, {
        id: editingMission?._id as any,
        ...payload,
      });
      setEditingMission(null);
      setMissionForm(emptyMissionForm);
      await load();
    } catch (error) {
      console.error("Failed to save mission", error);
    }
  };

  const removeMission = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.deleteMission, { id: id as any });
    await load();
  };

  const approve = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.approveRedemption, {
      redemptionId: id as any,
    });
    await load();
  };

  const reject = async (id: string) => {
    if (!convex) return;
    await convex.mutation(api.admin.rejectRedemption, {
      redemptionId: id as any,
      reason: "Rejected by admin",
    });
    await load();
  };

  const activeInventoryCount = useMemo(
    () => marketplace.filter((item) => (item.quantity || 0) > 0).length,
    [marketplace],
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black">
            Reward Management
          </h2>
          <p className="text-sm text-white/40">
            Manage Lemon Coins rewards, missions, mystery boxes, and redemption
            approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => void load()}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {analytics && (
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard
            icon={<BarChart3 size={18} />}
            label="Coins Earned"
            value={(analytics.totalCoinsEarned || 0).toLocaleString()}
          />
          <MetricCard
            icon={<Sparkles size={18} />}
            label="Coins Spent"
            value={(analytics.totalCoinsSpent || 0).toLocaleString()}
          />
          <MetricCard
            icon={<Gift size={18} />}
            label="Marketplace Items"
            value={String(activeInventoryCount)}
          />
          <MetricCard
            icon={<Trophy size={18} />}
            label="Active Users"
            value={String(analytics.activeUsers || 0)}
          />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-xl">Marketplace Rewards</h3>
              <p className="text-xs text-white/40">
                Airtime, data, gift cards, cash, premium, merchandise, and other
                admin-configured rewards.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingMarketplace(null);
                setMarketForm(emptyMarketplaceForm);
              }}
            >
              <Plus size={14} /> New Reward
            </Button>
          </div>

          <div className="grid gap-3 mb-4">
            <input
              value={marketForm.rewardId}
              onChange={(e) =>
                setMarketForm((f: any) => ({ ...f, rewardId: e.target.value }))
              }
              placeholder="Reward ID"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <input
              value={marketForm.metadata.title}
              onChange={(e) =>
                setMarketForm((f: any) => ({
                  ...f,
                  metadata: { ...f.metadata, title: e.target.value },
                }))
              }
              placeholder="Title"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <input
              value={marketForm.metadata.imageUrl}
              onChange={(e) =>
                setMarketForm((f: any) => ({
                  ...f,
                  metadata: { ...f.metadata, imageUrl: e.target.value },
                }))
              }
              placeholder="Image URL"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={marketForm.type}
                onChange={(e) =>
                  setMarketForm((f: any) => ({ ...f, type: e.target.value }))
                }
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              >
                <option value="airtime">Airtime</option>
                <option value="data">Data</option>
                <option value="cash">Cash</option>
                <option value="gift_card">Gift Card</option>
                <option value="premium">Premium</option>
                <option value="mystery_box">Mystery Box</option>
                <option value="merchandise">Merchandise</option>
                <option value="subscription">Subscription</option>
                <option value="bonus_coins">Bonus Coins</option>
                <option value="badge">Badge</option>
              </select>
              <select
                value={marketForm.metadata.fulfillmentMode}
                onChange={(e) =>
                  setMarketForm((f: any) => ({
                    ...f,
                    metadata: {
                      ...f.metadata,
                      fulfillmentMode: e.target.value,
                    },
                  }))
                }
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual Approval</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                value={marketForm.metadata.priceCoins}
                onChange={(e) =>
                  setMarketForm((f: any) => ({
                    ...f,
                    metadata: {
                      ...f.metadata,
                      priceCoins: Number(e.target.value),
                    },
                  }))
                }
                placeholder="Price"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                type="number"
                value={marketForm.quantity}
                onChange={(e) =>
                  setMarketForm((f: any) => ({
                    ...f,
                    quantity: Number(e.target.value),
                  }))
                }
                placeholder="Stock"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                type="number"
                value={marketForm.reserved}
                onChange={(e) =>
                  setMarketForm((f: any) => ({
                    ...f,
                    reserved: Number(e.target.value),
                  }))
                }
                placeholder="Reserved"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
            </div>
            <input
              value={marketForm.metadata.provider}
              onChange={(e) =>
                setMarketForm((f: any) => ({
                  ...f,
                  metadata: { ...f.metadata, provider: e.target.value },
                }))
              }
              placeholder="Provider / fulfillment note"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <div className="flex gap-2">
              <Button onClick={saveMarketplace}>Save</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingMarketplace(null);
                  setMarketForm(emptyMarketplaceForm);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {marketplace.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-black">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold">
                      {item.metadata?.title || item.rewardId}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    Price:{" "}
                    {(
                      (item.metadata?.priceCoins || 0) as number
                    ).toLocaleString()}{" "}
                    • Stock: {item.quantity} • Reserved: {item.reserved || 0} •{" "}
                    {item.metadata?.fulfillmentMode || "automatic"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingMarketplace(item);
                      setMarketForm({
                        rewardId: item.rewardId,
                        type: item.type,
                        quantity: item.quantity,
                        reserved: item.reserved || 0,
                        metadata: {
                          title: item.metadata?.title || "",
                          imageUrl: item.metadata?.imageUrl || "",
                          priceCoins: item.metadata?.priceCoins || 0,
                          fulfillmentMode:
                            item.metadata?.fulfillmentMode || "manual",
                          provider: item.metadata?.provider || "",
                        },
                      });
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => removeMarketplace(item._id)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {marketplace.length === 0 && (
              <div className="p-6 text-center text-sm text-white/40">
                No marketplace rewards configured yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-xl">Mystery Box Prize Pool</h3>
              <p className="text-xs text-white/40">
                Randomized prize pool for mystery boxes and surprise rewards.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingMystery(null);
                setMysteryForm(emptyMysteryForm);
              }}
            >
              <Plus size={14} /> New Prize
            </Button>
          </div>

          <div className="grid gap-3 mb-4">
            <input
              value={mysteryForm.rewardId}
              onChange={(e) =>
                setMysteryForm((f: any) => ({ ...f, rewardId: e.target.value }))
              }
              placeholder="Prize ID"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <input
              value={mysteryForm.metadata.label}
              onChange={(e) =>
                setMysteryForm((f: any) => ({
                  ...f,
                  metadata: { ...f.metadata, label: e.target.value },
                }))
              }
              placeholder="Label"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <input
              value={mysteryForm.metadata.imageUrl}
              onChange={(e) =>
                setMysteryForm((f: any) => ({
                  ...f,
                  metadata: { ...f.metadata, imageUrl: e.target.value },
                }))
              }
              placeholder="Image URL"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={mysteryForm.type}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({ ...f, type: e.target.value }))
                }
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              >
                <option value="airtime">Airtime</option>
                <option value="data">Data</option>
                <option value="gift_card">Gift Card</option>
                <option value="premium">Premium Access</option>
                <option value="merchandise">Merchandise</option>
                <option value="badge">Special Badge</option>
                <option value="lemon_coins">Bonus Lemon Coins</option>
                <option value="gift_card">Physical Gift (manual)</option>
              </select>
              <input
                type="number"
                value={mysteryForm.weight}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({
                    ...f,
                    weight: Number(e.target.value),
                  }))
                }
                placeholder="Weight"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                value={mysteryForm.amount}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({
                    ...f,
                    amount: Number(e.target.value),
                  }))
                }
                placeholder="Amount"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                type="number"
                value={mysteryForm.metadata.durationDays}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({
                    ...f,
                    metadata: {
                      ...f.metadata,
                      durationDays: Number(e.target.value),
                    },
                  }))
                }
                placeholder="Duration Days"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                value={mysteryForm.metadata.badgeId}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({
                    ...f,
                    metadata: { ...f.metadata, badgeId: e.target.value },
                  }))
                }
                placeholder="Badge ID"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={mysteryForm.active}
                onChange={(e) =>
                  setMysteryForm((f: any) => ({
                    ...f,
                    active: e.target.checked,
                  }))
                }
              />{" "}
              Active
            </label>
            <div className="flex gap-2">
              <Button onClick={saveMystery}>Save</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingMystery(null);
                  setMysteryForm(emptyMysteryForm);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {mysteryPool.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-black">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold">
                      {item.metadata?.label || item.rewardId}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    Amount: {item.amount ?? "-"} • Weight: {item.weight} •
                    Active: {String(item.active)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingMystery(item);
                      setMysteryForm({
                        rewardId: item.rewardId,
                        type: item.type,
                        amount: item.amount || 0,
                        weight: item.weight || 1,
                        active: !!item.active,
                        metadata: {
                          label: item.metadata?.label || "",
                          imageUrl: item.metadata?.imageUrl || "",
                          fulfillmentMode:
                            item.metadata?.fulfillmentMode || "automatic",
                          durationDays: item.metadata?.durationDays || 30,
                          badgeId: item.metadata?.badgeId || "",
                        },
                      });
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => removeMystery(item._id)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {mysteryPool.length === 0 && (
              <div className="p-6 text-center text-sm text-white/40">
                No mystery prizes configured yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-xl">Weekly Missions</h3>
              <p className="text-xs text-white/40">
                Reading, commenting, and loyalty missions that award Lemon
                Coins.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingMission(null);
                setMissionForm(emptyMissionForm);
              }}
            >
              <Plus size={14} /> New Mission
            </Button>
          </div>

          <div className="grid gap-3 mb-4">
            <input
              value={missionForm.achievementId}
              onChange={(e) =>
                setMissionForm((f: any) => ({
                  ...f,
                  achievementId: e.target.value,
                }))
              }
              placeholder="Mission ID"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <input
              value={missionForm.name}
              onChange={(e) =>
                setMissionForm((f: any) => ({ ...f, name: e.target.value }))
              }
              placeholder="Mission name"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <textarea
              value={missionForm.description}
              onChange={(e) =>
                setMissionForm((f: any) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10 min-h-24"
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                value={missionForm.metric}
                onChange={(e) =>
                  setMissionForm((f: any) => ({ ...f, metric: e.target.value }))
                }
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              >
                <option value="countedReads">Read Chapters</option>
                <option value="readMinutes">Read Minutes</option>
                <option value="completedStories">Complete Story</option>
                <option value="meaningfulComments">Meaningful Comments</option>
                <option value="commentLikes">Likes on Comments</option>
              </select>
              <input
                type="number"
                value={missionForm.target}
                onChange={(e) =>
                  setMissionForm((f: any) => ({
                    ...f,
                    target: Number(e.target.value),
                  }))
                }
                placeholder="Target"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <select
                value={missionForm.window}
                onChange={(e) =>
                  setMissionForm((f: any) => ({ ...f, window: e.target.value }))
                }
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              >
                <option value="week">Weekly</option>
                <option value="day">Daily</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                value={missionForm.coinReward}
                onChange={(e) =>
                  setMissionForm((f: any) => ({
                    ...f,
                    coinReward: Number(e.target.value),
                  }))
                }
                placeholder="Coin reward"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                type="number"
                value={missionForm.xpReward}
                onChange={(e) =>
                  setMissionForm((f: any) => ({
                    ...f,
                    xpReward: Number(e.target.value),
                  }))
                }
                placeholder="XP reward"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
              <input
                value={missionForm.badgeId}
                onChange={(e) =>
                  setMissionForm((f: any) => ({
                    ...f,
                    badgeId: e.target.value,
                  }))
                }
                placeholder="Badge ID"
                className="w-full p-3 rounded-lg bg-black-core border border-white/10"
              />
            </div>
            <input
              value={missionForm.icon}
              onChange={(e) =>
                setMissionForm((f: any) => ({ ...f, icon: e.target.value }))
              }
              placeholder="Icon URL / Emoji"
              className="w-full p-3 rounded-lg bg-black-core border border-white/10"
            />
            <label className="flex items-center gap-3 text-sm text-white/60">
              <input
                type="checkbox"
                checked={missionForm.active}
                onChange={(e) =>
                  setMissionForm((f: any) => ({
                    ...f,
                    active: e.target.checked,
                  }))
                }
              />{" "}
              Active
            </label>
            <div className="flex gap-2">
              <Button onClick={saveMission}>Save</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingMission(null);
                  setMissionForm(emptyMissionForm);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {missions.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-black">
                      {item.criteria?.metric}
                    </span>
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  <div className="text-xs text-white/40">
                    Target: {item.criteria?.target || 0} •{" "}
                    {item.criteria?.window || "week"} • +{item.coinReward || 0}{" "}
                    coins
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingMission(item);
                      setMissionForm({
                        achievementId: item.achievementId,
                        name: item.name,
                        description: item.description,
                        metric: item.criteria?.metric || "countedReads",
                        target: item.criteria?.target || 5,
                        window: item.criteria?.window || "week",
                        coinReward: item.coinReward || 0,
                        xpReward: item.xpReward || 0,
                        badgeId: item.badgeId || "",
                        icon: item.icon || "",
                        active: !!item.active,
                      });
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => removeMission(item._id)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {missions.length === 0 && (
              <div className="p-6 text-center text-sm text-white/40">
                No missions configured yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 p-6 bg-ink-deep">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-xl">Redemption Requests</h3>
              <p className="text-xs text-white/40">
                Approve or reject manual fulfillment requests here.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {redemptions.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-black">
                      {item.rewardType}
                    </span>
                    <span className="text-sm font-bold">{item.rewardId}</span>
                  </div>
                  <div className="text-xs text-white/40">
                    Status: {item.status} • User: {item.userId} •{" "}
                    {item.metadata?.fulfillmentMode || "manual"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => approve(item._id)}>
                    <Check size={14} />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => reject(item._id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {redemptions.length === 0 && (
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-sm text-white/40">
                No redemption requests yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 p-5 bg-ink-deep">
      <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-black mb-2">
        {icon}
        {label}
      </div>
      <div className="font-display text-3xl font-black">{value}</div>
    </div>
  );
}
