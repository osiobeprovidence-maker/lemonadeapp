import React, { useState, useEffect } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Sun, Moon, Monitor, Palette, Layout } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function SettingsAppearance() {
  const { user, updateSettings } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(user?.settings.themeMode || 'dark');
  const [accent, setAccent] = useState(user?.settings.accentColor || 'lemon');
  const [density, setDensity] = useState(user?.settings.displayDensity || 'default');

  useEffect(() => {
    if (!user?.settings) return;
    setTheme(user.settings.themeMode || 'dark');
    setAccent(user.settings.accentColor || 'lemon');
    setDensity(user.settings.displayDensity || 'default');
  }, [user?.settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        themeMode: theme as any,
        accentColor: accent as any,
        displayDensity: density as any,
      });
      // Simulate slight delay for UX
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Failed to save appearance settings', error);
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailLayout 
      title="Appearance" 
      description="Customize how Lemonade looks on your device."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6 px-4">
             <Layout size={20} className="text-lemon-muted" />
             <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Theme Mode</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { id: 'light', label: 'Light', icon: Sun },
               { id: 'dark', label: 'Dark', icon: Moon },
               { id: 'system', label: 'System', icon: Monitor },
             ].map((mode) => (
               <button 
                 key={mode.id}
                 onClick={() => setTheme(mode.id as typeof theme)}
                 type="button"
                 className={`flex flex-col items-center justify-center p-8 rounded-[32px] border-2 transition-all gap-3 ${
                   theme === mode.id 
                    ? 'bg-lemon-muted text-black border-lemon-muted shadow-xl shadow-lemon-muted/10' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                 }`}
               >
                 <mode.icon size={32} />
                 <span className="font-black uppercase tracking-widest text-xs">{mode.label}</span>
               </button>
             ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 px-4">
             <Palette size={20} className="text-lemon-muted" />
             <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Accent Color</h3>
          </div>
          <div className="flex flex-wrap gap-4 px-4">
             {[
               { id: 'lemon', color: 'bg-[#B4F72D]' },
               { id: 'purple', color: 'bg-purple-400' },
               { id: 'blue', color: 'bg-blue-400' },
               { id: 'orange', color: 'bg-orange-400' },
               { id: 'white', color: 'bg-white' },
             ].map((item) => (
               <button 
                 key={item.id}
                 onClick={() => setAccent(item.id as typeof accent)}
                 type="button"
                 className={`w-14 h-14 rounded-2xl p-1 border-4 transition-all ${
                   accent === item.id ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-100'
                 }`}
               >
                 <div className={`w-full h-full rounded-xl ${item.color}`} />
               </button>
             ))}
          </div>
        </section>

        <section>
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="font-black text-lg">Display Density</h4>
                 <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'default', label: 'Default' },
                      { id: 'relaxed', label: 'Relaxed' },
                    ].map(d => (
                       <button
                         key={d.id}
                         type="button"
                         onClick={() => setDensity(d.id as typeof density)}
                         className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${density === d.id ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                       >
                          {d.label}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-4 opacity-40 select-none pointer-events-none">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2">
                       <div className="h-2 w-3/4 bg-white/10 rounded" />
                       <div className="h-2 w-1/2 bg-white/10 rounded" />
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2">
                       <div className="h-2 w-3/4 bg-white/10 rounded" />
                       <div className="h-2 w-1/2 bg-white/10 rounded" />
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </SettingsDetailLayout>
  );
}
