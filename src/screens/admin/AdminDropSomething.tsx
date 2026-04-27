import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Target, AlertCircle, CheckCircle2, TrendingUp, Users, MousePointer2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminDropSomething() {
  const { creators } = useApp();
  const navigate = useNavigate();
  const creatorList = Object.values(creators) as any[];
  const connectedCreators = creatorList.filter(c => c.dropSomethingUrl);

  const handleDisableLink = (username: string) => {
    if (confirm(`Are you sure you want to disable the support link for @${username}? This will prevent them from receiving direct contributions. (Mock)`)) {
      alert(`Support link for @${username} disabled. (Mock)`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">DropSomething Admin</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Creator monetization and third-party support audit</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-lemon-muted/10 border border-lemon-muted/20 rounded-2xl px-6 py-3 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-lemon-muted">Total Clicks</span>
              <span className="text-xl font-display font-black text-white">12,482</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
           <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white">Connected Platforms</h3>
           </div>
           <div className="divide-y divide-white/5">
              {connectedCreators.map((c) => (
                <div key={c.username} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.01] transition-all group">
                   <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/admin/creators/${c.username}`)}>
                      <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-2xl border border-white/10 group-hover:border-lemon-muted transition-colors" />
                      <div>
                         <h4 className="font-bold text-white text-lg group-hover:text-lemon-muted transition-colors">{c.name}</h4>
                         <p className="text-xs text-white/30 truncate max-w-[200px]">{c.dropSomethingUrl}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-10">
                      <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Clicks</p>
                         <p className="text-sm font-bold">{Math.floor(Math.random() * 500) + 100}</p>
                      </div>
                      <div className="flex gap-2">
                         <a 
                           href={c.dropSomethingUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="w-11 h-11 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                         >
                            <ExternalLink size={20} />
                         </a>
                         <button 
                          onClick={() => handleDisableLink(c.username)}
                          className="h-11 px-6 bg-red-400/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-400/20 hover:bg-red-500 hover:text-white transition-all"
                         >
                            Disable Link
                         </button>
                      </div>
                   </div>
                </div>
              ))}
              {connectedCreators.length === 0 && (
                <div className="p-20 text-center text-white/20 italic">No creators connected yet.</div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-lemon-muted flex items-center justify-center text-black">
                    <MousePointer2 size={20} />
                 </div>
                 <h4 className="font-black italic uppercase text-lg">Real-time Clicks</h4>
              </div>
              <div className="space-y-6">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/30 group-hover:bg-lemon-muted group-hover:text-black transition-all">
                        {i}
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white/80">Support clicked for @ovo_studios</p>
                         <p className="text-[9px] font-black uppercase text-white/20 mt-1">{i * 2} minutes ago</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-ink-deep border border-white/5 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={20} />
                 </div>
                 <h4 className="font-black italic uppercase text-lg text-blue-400/80">Integration Rules</h4>
              </div>
              <ul className="space-y-4">
                 {[
                   'Valid HTTPS URL required',
                   'No prohibited service links',
                   'Support modal must be enabled',
                   'One-click tracking active',
                 ].map((rule, i) => (
                   <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/40">
                      <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                      {rule}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
