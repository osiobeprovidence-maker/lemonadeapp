import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, Check, Clock, MousePointerClick, Pause, PlayCircle, Plus, SkipForward, Trash2, Tv, Edit2, X } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';
import { Button } from '../../components/ui/Button';

type AdMetric = {
  impressions: number;
  completedViews: number;
  skips: number;
  clicks: number;
  revenueNaira: number;
};

type InventoryItem = {
  _id: string;
  title: string;
  brandName: string;
  type: string;
  placement: string;
  status: string;
  cpmNaira: number;
  headline: string;
  description?: string;
  mediaUrl: string;
  clickUrl?: string;
  targetGenres: string[];
  priority: number;
  metrics: AdMetric;
};

type AdminAdSummary = {
  impressions: number;
  completedViews: number;
  skips: number;
  clicks: number;
  grossRevenueNaira: number;
  creatorRevenueNaira: number;
  platformRevenueNaira: number;
  ctr: number;
  completionRate: number;
  activeAds: number;
  pendingApprovals: number;
  advertisers: number;
  inventory: InventoryItem[];
};

const emptySummary: AdminAdSummary = {
  impressions: 0,
  completedViews: 0,
  skips: 0,
  clicks: 0,
  grossRevenueNaira: 0,
  creatorRevenueNaira: 0,
  platformRevenueNaira: 0,
  ctr: 0,
  completionRate: 0,
  activeAds: 0,
  pendingApprovals: 0,
  advertisers: 0,
  inventory: [],
};

const formatNaira = (amount: number) => `NGN ${Math.round(amount || 0).toLocaleString()}`;

export default function AdminAds() {
  const [summary, setSummary] = useState<AdminAdSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadSummary = async () => {
    if (!convex) return;
    setLoading(true);
    try {
      const data = await convex.query(api.ads.adminSummary, {});
      setSummary(data as AdminAdSummary);
    } catch (error) {
      console.error('Failed to load ad admin summary', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const updateStatus = async (adId: string, status: 'approved' | 'paused' | 'rejected') => {
    if (!convex) return;
    await convex.mutation(api.ads.updateCampaignStatus, {
      adId: adId as any,
      status,
    });
    await loadSummary();
  };

  const deleteCampaign = async (adId: string) => {
    if (!convex) return;
    if (!confirm('Delete this campaign and all its event data? This cannot be undone.')) return;
    try {
      await convex.mutation(api.ads.deleteCampaign, { adId: adId as any });
      await loadSummary();
    } catch (error) {
      console.error('Failed to delete campaign', error);
      alert('Failed to delete campaign.');
    }
  };

  const startEdit = (ad: InventoryItem) => {
    setEditingId(ad._id);
    setEditForm({ ...ad });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!convex || !editForm || !editingId) return;
    setSavingEdit(true);
    try {
      await convex.mutation(api.ads.editCampaign, {
        adId: editingId as any,
        title: editForm.title,
        headline: editForm.headline,
        description: editForm.description,
        cpmNaira: editForm.cpmNaira,
        priority: editForm.priority,
        clickUrl: editForm.clickUrl,
        targetGenres: editForm.targetGenres,
      });
      setEditingId(null);
      setEditForm(null);
      await loadSummary();
    } catch (error) {
      console.error('Failed to edit campaign', error);
      alert('Failed to update campaign.');
    } finally {
      setSavingEdit(false);
    }
  };

  const metrics = [
    { label: 'Impressions', value: summary.impressions.toLocaleString(), icon: Tv },
    { label: 'Completed Views', value: summary.completedViews.toLocaleString(), icon: PlayCircle },
    { label: 'Skips', value: summary.skips.toLocaleString(), icon: SkipForward },
    { label: 'CTR', value: `${summary.ctr.toFixed(1)}%`, icon: MousePointerClick },
    { label: 'Completion', value: `${summary.completionRate.toFixed(1)}%`, icon: BadgeCheck },
    { label: 'Platform Share', value: formatNaira(summary.platformRevenueNaira), icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black uppercase italic tracking-tight">Ad Monetization</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">Inventory, advertisers, approvals, and payout analytics</p>
        </div>
        <Link to="/admin/ads/new">
          <Button className="gap-2">
            <Plus size={16} />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl border border-white/5 bg-ink-deep p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-lemon-muted/10 text-lemon-muted">
                <Icon size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{metric.label}</p>
              <p className="mt-2 font-display text-2xl font-black">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-ink-deep p-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Gross ad revenue</p>
          <p className="mt-2 font-display text-3xl font-black text-lemon-muted">{formatNaira(summary.grossRevenueNaira)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-ink-deep p-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Creator payouts</p>
          <p className="mt-2 font-display text-3xl font-black">{formatNaira(summary.creatorRevenueNaira)}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-ink-deep p-6">
          <p className="text-xs font-black uppercase tracking-widest text-white/35">Approval queue</p>
          <p className="mt-2 font-display text-3xl font-black">{summary.pendingApprovals}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-ink-deep">
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <div>
            <h3 className="font-display text-xl font-black">Ad Inventory</h3>
            <p className="text-sm text-white/40">Video, image, banner, pre-roll, and sponsored placements.</p>
          </div>
          {loading && <Clock size={18} className="animate-spin text-lemon-muted" />}
        </div>

        <div className="divide-y divide-white/5">
          {summary.inventory.length > 0 ? summary.inventory.map((ad) => (
            <div key={ad._id} className="p-5">
              {editingId === ad._id && editForm ? (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Title</label>
                      <input
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Headline</label>
                      <input
                        value={editForm.headline || ''}
                        onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">CPM (NGN)</label>
                      <input
                        type="number"
                        value={editForm.cpmNaira || 0}
                        onChange={(e) => setEditForm({ ...editForm, cpmNaira: Number(e.target.value) })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Priority</label>
                      <input
                        type="number"
                        value={editForm.priority || 5}
                        onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className="rounded-xl bg-lemon-muted px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white/60 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="truncate font-bold">{ad.title}</h4>
                        <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/45">{ad.type}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                          ad.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          ad.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          ad.status === 'paused' ? 'bg-white/10 text-white/50' :
                          'bg-red-500/10 text-red-400'
                        }`}>{ad.status}</span>
                      </div>
                      <p className="text-sm text-white/45">{ad.brandName} / {ad.placement.replace('_', ' ')} / CPM {formatNaira(ad.cpmNaira)}</p>

                      {/* Campaign Metrics */}
                      <div className="mt-3 flex flex-wrap gap-4">
                        <span className="text-[11px] text-white/40">
                          <strong className="text-white/70">{ad.metrics.impressions.toLocaleString()}</strong> impressions
                        </span>
                        <span className="text-[11px] text-white/40">
                          <strong className="text-white/70">{ad.metrics.completedViews.toLocaleString()}</strong> completed
                        </span>
                        <span className="text-[11px] text-white/40">
                          <strong className="text-white/70">{ad.metrics.clicks.toLocaleString()}</strong> clicks
                        </span>
                        <span className="text-[11px] text-white/40">
                          <strong className="text-lemon-muted">{formatNaira(ad.metrics.revenueNaira)}</strong> revenue
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(ad._id, 'approved')} className="rounded-xl bg-green-500/10 p-3 text-green-300 hover:bg-green-500 hover:text-white">
                        <Check size={16} />
                      </button>
                      <button onClick={() => updateStatus(ad._id, 'paused')} className="rounded-xl bg-white/5 p-3 text-white/55 hover:bg-white/10 hover:text-white">
                        <Pause size={16} />
                      </button>
                      <button onClick={() => startEdit(ad)} className="rounded-xl bg-blue-500/10 p-3 text-blue-300 hover:bg-blue-500 hover:text-white">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteCampaign(ad._id)} className="rounded-xl bg-red-500/10 p-3 text-red-300 hover:bg-red-500 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )) : (
            <div className="p-10 text-center text-sm font-bold text-white/35">No ad campaigns yet. Approved seed campaigns are created automatically when the first free reader needs an ad.</div>
          )}
        </div>
      </section>
    </div>
  );
}
