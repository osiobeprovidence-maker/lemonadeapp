import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, Check, Clock, MousePointerClick, Pause, PlayCircle, Plus, SkipForward, Tv } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';
import { Button } from '../../components/ui/Button';

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
  inventory: Array<{
    _id: string;
    title: string;
    brandName: string;
    type: string;
    placement: string;
    status: string;
    cpmNaira: number;
  }>;
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
            <div key={ad._id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="truncate font-bold">{ad.title}</h4>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white/45">{ad.type}</span>
                  <span className="rounded-full bg-lemon-muted/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-lemon-muted">{ad.status}</span>
                </div>
                <p className="text-sm text-white/45">{ad.brandName} / {ad.placement.replace('_', ' ')} / CPM {formatNaira(ad.cpmNaira)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(ad._id, 'approved')} className="rounded-xl bg-green-500/10 p-3 text-green-300 hover:bg-green-500 hover:text-white">
                  <Check size={16} />
                </button>
                <button onClick={() => updateStatus(ad._id, 'paused')} className="rounded-xl bg-white/5 p-3 text-white/55 hover:bg-white/10 hover:text-white">
                  <Pause size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-sm font-bold text-white/35">No ad campaigns yet. Approved seed campaigns are created automatically when the first free reader needs an ad.</div>
          )}
        </div>
      </section>
    </div>
  );
}
