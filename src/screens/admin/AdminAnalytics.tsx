import React from 'react';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  MousePointer2, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

const STAT_CARDS = [
  { label: 'User Growth', value: '+1,284', trend: '+12.5%', isUp: true, icon: Users },
  { label: 'Story Reads', value: '45,293', trend: '+8.2%', isUp: true, icon: BookOpen },
  { label: 'Premium Subs', value: '248', trend: '-2.1%', isUp: false, icon: TrendingUp },
  { label: 'Total Revenue', value: '$12,492', trend: '+15.4%', isUp: true, icon: DollarSign },
];

const TOP_STORIES = [
  { id: '1', title: 'Midnight Chronicles', reads: '12.4k', growth: '+24%' },
  { id: '2', title: 'Lemonade Summer', reads: '8.2k', growth: '+12%' },
  { id: '3', title: 'The Silent Script', reads: '5.1k', growth: '+5%' },
  { id: '4', title: 'Neon Desires', reads: '4.8k', growth: '+18%' },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Analytics</h1>
          <p className="text-white/40 font-bold">Comprehensive platform performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center h-12 bg-white/5 rounded-xl border border-white/5 px-4 font-bold text-sm">
            <Calendar size={18} className="mr-2 text-white/40" />
            Last 30 Days
          </div>
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, i) => (
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
              <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${stat.isUp ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-black italic">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic">Monthly Reading Activity</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lemon-muted" />
                    <span className="text-xs font-bold text-white/40">Chapters read</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="text-xs font-bold text-white/40">Comments</span>
                 </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-2 px-2">
              {[45, 62, 54, 80, 72, 95, 88, 110, 95, 120, 105, 140].map((val, i) => (
                <div key={i} className="flex-1 space-y-1 group relative">
                  <div 
                    className="w-full bg-lemon-muted/20 hover:bg-lemon-muted rounded-t-lg transition-all cursor-pointer"
                    style={{ height: `${val}px` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}k
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase text-white/20 text-center">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Revenue Summary</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white/60">Subscription</span>
                    <span className="text-sm font-black">$8,492.00</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lemon-muted w-[68%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white/60">Wallet Top-up</span>
                    <span className="text-sm font-black">$3,120.00</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lemon-muted w-[25%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white/60">Ad Revenue</span>
                    <span className="text-sm font-black">$880.00</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lemon-muted w-[7%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Support Clicks</h3>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-3xl font-display font-black italic">14,293</p>
                  <p className="text-xs font-bold text-green-400 mt-1">+18.2% vs last month</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-lemon-muted border-t-transparent animate-spin-slow flex items-center justify-center">
                   <MousePointer2 size={24} className="text-lemon-muted" />
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                Total clicks on creator "DropSomething" links. 64% of readers interacted with support buttons this week.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Top Stories</h3>
            <div className="space-y-4">
              {TOP_STORIES.map((story) => (
                <div key={story.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold truncate text-sm">{story.title}</p>
                    <p className="text-xs text-white/40 font-bold">{story.reads} reads</p>
                  </div>
                  <div className="text-green-400 text-xs font-black">{story.growth}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 rounded-2xl border border-white/5 text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              View All Content Performance
            </button>
          </div>

          <div className="p-8 bg-lemon-muted rounded-[40px] text-black">
            <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-4">Premium Conversion</h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-display font-black italic mb-2">4.2%</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Conversion Rate</p>
              </div>
              <div className="flex items-center gap-4 py-4 border-y border-black/10">
                <div className="flex-1">
                  <p className="text-lg font-black leading-tight">24 new subs</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase">In the last 24h</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-black">
                  +3
                </div>
              </div>
              <p className="text-xs font-bold leading-relaxed opacity-80">
                Strong performance from "Midnight Chronicles" chapter 10 early access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
