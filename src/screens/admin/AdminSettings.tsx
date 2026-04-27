import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Shield, Bell, User, Lock, Save, Globe, Smartphone, HelpCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminSettings() {
  const { adminSession } = useApp();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [moderationMode, setModerationMode] = useState('adaptive');
  const [settings, setSettings] = useState([
    { id: 'duplicates', label: 'Auto-Reject duplicates', desc: 'Prevent identical story submissions within 24 hours.', active: true },
    { id: 'flagging', label: 'Keyword Flagging', desc: 'Scan content for prohibited terms instantly.', active: true },
    { id: 'chat', label: 'Member-to-Member Chat', desc: 'Allow direct messaging between users.', active: false },
    { id: 'pii', label: 'Strict PII Filter', desc: 'Anonymize emails and phone numbers in stories.', active: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Admin settings updated successfully! (Mock)');
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Admin Settings</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Configure platform rules and profile preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "h-12 px-8 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl",
            isSaving ? "bg-white/10 text-white/40 cursor-wait" : "bg-lemon-muted text-black shadow-lemon-muted/20 hover:scale-105 active:scale-95"
          )}
        >
           {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
           {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[2.5rem]">
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-[2rem] bg-lemon-muted flex items-center justify-center text-black font-black text-4xl mb-6 shadow-2xl shadow-lemon-muted/20 rotate-3">
                    {adminSession?.email.charAt(0).toUpperCase()}
                 </div>
                 <h3 className="text-xl font-display font-black tracking-tight">{adminSession?.email}</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lemon-muted mt-2">Super Admin Access</p>
                 <div className="w-full h-[1px] bg-white/5 my-8" />
                 <div className="space-y-4 w-full">
                    <button 
                      onClick={() => alert('Editing profile is disabled for super admins. (Mock)')}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-white/60 hover:text-white transition-all"
                    >
                       <User size={18} />
                       <span className="text-sm font-bold">Edit Profile</span>
                    </button>
                    <button 
                      onClick={() => alert('Security settings redirected to Auth0/Firebase console. (Mock)')}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-white/60 hover:text-white transition-all"
                    >
                       <Lock size={18} />
                       <span className="text-sm font-bold">Security & 2FA</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <h3 className="text-lg font-bold flex items-center gap-3"><Shield size={20} className="text-lemon-muted" /> Moderation Modes</h3>
                 <button 
                  onClick={() => navigate('/admin/moderation-presets')}
                  className="text-[10px] font-black uppercase tracking-widest text-lemon-muted hover:underline flex items-center gap-1"
                 >
                  View All Presets <ChevronRight size={12} />
                 </button>
              </div>
              <div className="p-8">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setModerationMode('strict')}
                    className={cn("flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", moderationMode === 'strict' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/30 hover:text-white")}
                  >Strict</button>
                  <button 
                    onClick={() => setModerationMode('adaptive')}
                    className={cn("flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", moderationMode === 'adaptive' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/30 hover:text-white")}
                  >Adaptive</button>
                  <button 
                    onClick={() => setModerationMode('permissive')}
                    className={cn("flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", moderationMode === 'permissive' ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-white/30 hover:text-white")}
                  >Permissive</button>
                </div>
                <p className="mt-4 text-[10px] font-bold text-white/30 italic text-center">
                  Changes to moderation mode propagate system-wide in ~30 seconds.
                </p>
              </div>
           </div>

           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                 <h3 className="text-lg font-bold flex items-center gap-3"><Shield size={20} className="text-lemon-muted" /> Global Moderation Rules</h3>
              </div>
              <div className="p-8 space-y-8">
                 {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between group">
                       <div className="space-y-1">
                          <p className="font-bold text-white group-hover:text-lemon-muted transition-colors">{setting.label}</p>
                          <p className="text-xs text-white/30 font-medium">{setting.desc}</p>
                       </div>
                       <button 
                        onClick={() => toggleSetting(setting.id)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          setting.active ? "bg-lemon-muted" : "bg-white/10"
                        )}
                       >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300",
                            setting.active ? "right-1" : "left-1"
                          )} />
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                 <h3 className="text-lg font-bold flex items-center gap-3"><Globe size={20} className="text-blue-400" /> API & Infrastructure</h3>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Admin API Endpoint</label>
                       <input readOnly value="https://api.lemons.com/v2/admin" className="w-full h-12 bg-black border border-white/5 rounded-xl px-4 text-xs font-mono text-white/60" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Socket Port</label>
                       <input readOnly value="3000" className="w-full h-12 bg-black border border-white/5 rounded-xl px-4 text-xs font-mono text-white/60" />
                    </div>
                 </div>
                 <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                    <Smartphone size={20} className="text-blue-400 mt-0.5" />
                    <div>
                       <p className="text-sm font-bold text-blue-400/80 mb-1">Mirror Status</p>
                       <p className="text-[10px] font-medium text-blue-400/50 leading-relaxed">System is syncing with mobile core server. Last heartbeat received 22 seconds ago from Lagos-NGR-1.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
