import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ChevronLeft, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PRESETS = [
  {
    id: 'strict',
    name: 'Strict Lockdown',
    desc: 'Maximum safety. AI-flagged content is hidden instantly. Manual approval required for all new creators.',
    icon: ShieldAlert,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
    rules: [
      'All AI flags trigger immediate shadowban',
      'No external links allowed in bios',
      'Manual verification for all payouts',
      'Strict keyword filter enabled'
    ]
  },
  {
    id: 'adaptive',
    name: 'Adaptive Balance',
    desc: 'Platform default. Blends AI auto-moderation with community reporting. Focuses on high-impact violations.',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    rules: [
      'AI flags high confidence violations',
      'Community reports prioritized by history',
      'Creator reputation affects visibility',
      'Standard anti-spam filters'
    ]
  },
  {
    id: 'permissive',
    name: 'Safe Growth',
    desc: 'Minimum friction. Trusted creators can publish without delay. Low-confidence flags are ignored.',
    icon: ShieldCheck,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    rules: [
      'Auto-approve long-standing creators',
      'Flags only for critical violations',
      'Community self-policing encouraged',
      'Global keyword filter relaxed'
    ]
  }
];

export default function AdminModerationPresets() {
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState('adaptive');
  const [saving, setSaving] = useState(false);

  const handleApplyPreset = (id: string) => {
    if (confirm(`Are you sure you want to apply the "${id}" moderation preset? This will change the behavior of the platform instantly. (Mock)`)) {
      setSaving(true);
      setTimeout(() => {
        setActivePreset(id);
        setSaving(false);
        alert(`Moderation preset "${id}" applied successfully! (Mock)`);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Settings</span>
        </button>

        <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/5">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Current preset: <span className="text-white">{activePreset}</span></span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Moderation Presets</h1>
          <p className="text-white/40 font-bold">Fast-swap global safety and integrity configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.id;
          
          return (
            <div 
              key={preset.id} 
              className={cn(
                "p-8 rounded-[40px] border transition-all flex flex-col h-full",
                isActive 
                  ? `${preset.bgColor} ${preset.borderColor} ring-2 ring-${preset.color.split('-')[1]}-500/20` 
                  : "bg-ink-deep border-white/5 hover:bg-white/2"
              )}
            >
               <div className="flex items-center justify-between mb-8">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", isActive ? "bg-white/10" : "bg-white/5")}>
                     <Icon size={32} className={preset.color} />
                  </div>
                  {isActive && (
                    <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2", preset.bgColor, preset.color, "border border-current/20")}>
                       <CheckCircle size={12} /> Active
                    </div>
                  )}
               </div>

               <h3 className="text-2xl font-display font-black tracking-tight uppercase italic mb-4">{preset.name}</h3>
               <p className="text-white/40 font-bold mb-8 italic leading-relaxed">"{preset.desc}"</p>

               <div className="space-y-3 mb-10 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 border-b border-white/5 pb-2">Enabled Rules</p>
                  {preset.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <Zap size={14} className={isActive ? preset.color : "text-white/20"} />
                       <span className="text-sm font-medium text-white/70">{rule}</span>
                    </div>
                  ))}
               </div>

               <button 
                  disabled={isActive || saving}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                    isActive 
                      ? "bg-white/5 text-white/20 cursor-default" 
                      : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
               >
                  {saving && isActive ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : isActive ? (
                    "Enabled"
                  ) : (
                    "Apply Preset"
                  )}
               </button>
            </div>
          );
        })}
      </div>

      <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 text-white/5 transition-colors group-hover:text-lemon-muted/10">
            <Info size={120} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-display font-black uppercase italic tracking-tight mb-4">How Presets Work</h3>
            <p className="text-white/40 font-bold leading-relaxed mb-6 italic">
              Moderation presets are global switch hooks that modify the weights of our AI models and the visibility thresholds for community reporting. Applying a preset takes effect within 30 seconds across all edge nodes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-lemon-muted" />
                      <p className="text-xs font-black uppercase tracking-widest">Latency Period</p>
                   </div>
                   <p className="text-[10px] font-bold text-white/30 italic">30s propagation delay across global regions.</p>
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-lemon-muted" />
                      <p className="text-xs font-black uppercase tracking-widest">Audit Trail</p>
                   </div>
                   <p className="text-[10px] font-bold text-white/30 italic">All preset swaps are recorded in the system audit log.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
