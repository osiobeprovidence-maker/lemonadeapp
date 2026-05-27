import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  MousePointer2,
  Calendar,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';

type AnalyticsStats = {
  userGrowth: number;
  storyReads: number;
  premiumSubscribers: number;
  totalRevenueNaira: number;
  monthlyReads: Array<{ month: string; reads: number }>;
  topStories: Array<{ id: string; title: string; reads: number; saves: number }>;
  revenueSummary: { premium: number; wallet: number; support: number };
  supportClicks: number;
  conversionRate: number;
};

const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value);

const numberFormat = new Intl.NumberFormat('en-US');

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    if (!convex) return;

    const loadAnalytics = async () => {
      const result = await convex.query(api.admin.analytics, {});
      setStats(result);
    };

    loadAnalytics().catch((error) => {
      console.error('Failed to load analytics', error);
    });
  }, []);

  const cards = [
    { label: 'User Growth', value: numberFormat.format(stats?.userGrowth || 0), caption: 'registered users', icon: Users },
    { label: 'Story Reads', value: numberFormat.format(stats?.storyReads || 0), caption: 'chapter reads tracked', icon: BookOpen },
    { label: 'Premium Subs', value: numberFormat.format(stats?.premiumSubscribers || 0), caption: `${(stats?.conversionRate || 0).toFixed(1)}% conversion`, icon: TrendingUp },
    { label: 'Total Revenue', value: formatNaira(stats?.totalRevenueNaira || 0), caption: 'successful payments', icon: DollarSign },
  ];

  const maxReads = Math.max(...(stats?.monthlyReads || []).map((item) => item.reads), 1);
  const revenueTotal = Math.max(
    (stats?.revenueSummary.premium || 0) + (stats?.revenueSummary.wallet || 0) + (stats?.revenueSummary.support || 0),
    1,
  );

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['User Growth', stats?.userGrowth || 0],
      ['Story Reads', stats?.storyReads || 0],
      ['Premium Subscribers', stats?.premiumSubscribers || 0],
      ['Total Revenue NGN', stats?.totalRevenueNaira || 0],
      ['Support Clicks', stats?.supportClicks || 0],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lemonade-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Analytics</h1>
          <p className="text-white/40 font-bold">Live platform performance from Convex.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center h-12 bg-white/5 rounded-xl border border-white/5 px-4 font-bold text-sm">
            <Calendar size={18} className="mr-2 text-white/40" />
            Last 12 Months
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-ink-deep border border-white/5 rounded-3xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <stat.icon size={24} className="text-lemon-muted" />
              </div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-black italic">{stat.value}</p>
            <p className="mt-2 text-xs font-bold text-white/35">{stat.caption}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic">Monthly Reading Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lemon-muted" />
                <span className="text-xs font-bold text-white/40">Chapters read</span>
              </div>
            </div>

            <div className="h-64 flex items-end gap-2 px-2">
              {(stats?.monthlyReads || []).map((item) => (
                <div key={item.month} className="flex-1 space-y-1 group relative">
                  <div
                    className="w-full bg-lemon-muted/20 hover:bg-lemon-muted rounded-t-lg transition-all cursor-pointer"
                    style={{ height: `${Math.max(6, (item.reads / maxReads) * 150)}px` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.reads}
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase text-white/20 text-center">{item.month[0]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Revenue Summary</h3>
              <div className="space-y-6">
                {[
                  { label: 'Premium', value: stats?.revenueSummary.premium || 0 },
                  { label: 'Wallet Top-up', value: stats?.revenueSummary.wallet || 0 },
                  { label: 'Creator Support', value: stats?.revenueSummary.support || 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-white/60">{item.label}</span>
                      <span className="text-sm font-black">{formatNaira(item.value)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-lemon-muted" style={{ width: `${(item.value / revenueTotal) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Creator Support</h3>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-3xl font-display font-black italic">{numberFormat.format(stats?.supportClicks || 0)}</p>
                  <p className="text-xs font-bold text-white/35 mt-1">support transactions</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-lemon-muted/60 flex items-center justify-center">
                  <MousePointer2 size={24} className="text-lemon-muted" />
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                This is based on successful creator support records stored in Convex.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Top Stories</h3>
            <div className="space-y-4">
              {(stats?.topStories || []).map((story) => (
                <div key={story.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold truncate text-sm">{story.title}</p>
                    <p className="text-xs text-white/40 font-bold">{numberFormat.format(story.reads)} reads</p>
                  </div>
                  <div className="text-lemon-muted text-xs font-black">{numberFormat.format(story.saves)} saves</div>
                </div>
              ))}
              {(stats?.topStories.length || 0) === 0 && (
                <div className="p-6 text-center text-sm font-bold text-white/30">No story data yet.</div>
              )}
            </div>
          </div>

          <div className="p-8 bg-lemon-muted rounded-[40px] text-black">
            <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-4">Premium Conversion</h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-display font-black italic mb-2">{(stats?.conversionRate || 0).toFixed(1)}%</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Conversion Rate</p>
              </div>
              <p className="text-xs font-bold leading-relaxed opacity-80">
                Calculated from real premium users divided by registered users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
