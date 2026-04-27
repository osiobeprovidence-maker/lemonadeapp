import React, { useState } from 'react';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Type, Scroll, Layers, Sun, Moon } from 'lucide-react';

export default function SettingsReading() {
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [mode, setMode] = useState('scroll');
  const [theme, setTheme] = useState('sepia');

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Reading preferences saved! (Mock)');
    }, 1000);
  };

  return (
    <SettingsDetailLayout 
      title="Reading Experience" 
      description="Optimize the reader for your comfort."
      onSave={handleSave}
      isLoading={isLoading}
    >
      <div className="space-y-12">
        {/* Preview Box */}
        <div className={`p-8 rounded-[40px] border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${
          theme === 'dark' ? 'bg-black text-white/80' : 
          theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 
          'bg-white text-black/80'
        }`}>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-6 text-center italic">Live Preview</p>
           <h3 className={`font-display font-black text-2xl uppercase italic mb-4 ${
             theme === 'dark' ? 'text-white' : 
             theme === 'sepia' ? 'text-[#5b4636]' : 
             'text-black'
           }`}>Chapter 1: The First Sip</h3>
           <p style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }} className="font-medium italic">
             Lemonade is best served cold, with a hint of mystery. The shadows lengthened as she entered the room, the scent of fresh ink and citrus filling the air. "I've been waiting for you," he whispered, his voice like the rustle of turning pages...
           </p>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-6 px-4">
             <Type size={20} className="text-lemon-muted" />
             <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Text Settings</h3>
          </div>
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] space-y-10">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-sm font-black uppercase tracking-widest text-white/40">Font Size</p>
                   <p className="text-lg font-black italic text-lemon-muted">{fontSize}px</p>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-full appearance-none accent-lemon-muted cursor-pointer"
                />
             </div>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-sm font-black uppercase tracking-widest text-white/40">Line Spacing</p>
                   <p className="text-lg font-black italic text-lemon-muted">{lineHeight}x</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                   {[1.2, 1.4, 1.6, 1.8].map((lh) => (
                     <button 
                       key={lh}
                       onClick={() => setLineHeight(lh)}
                       className={`h-12 rounded-xl text-xs font-black transition-all ${
                         lineHeight === lh ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10' : 'bg-white/5 text-white/40 hover:bg-white/10'
                       }`}
                     >
                       {lh}x
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </section>

        <section>
           <div className="flex items-center gap-3 mb-6 px-4">
              <Scroll size={20} className="text-lemon-muted" />
              <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Reading Mode</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'scroll', label: 'Vertical Scroll', desc: 'Continuous flow like a webtoon.' },
                { id: 'paged', label: 'Paged Mode', desc: 'Turn pages like a classic novel.' },
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-8 rounded-[40px] border-2 transition-all text-left ${
                    mode === m.id 
                     ? 'bg-lemon-muted text-black border-lemon-muted' 
                     : 'bg-white/5 text-white border-white/5 hover:border-white/20'
                  }`}
                >
                  <h4 className="font-black text-xl uppercase italic mb-1 leading-tight">{m.label}</h4>
                  <p className={`text-sm font-bold italic ${mode === m.id ? 'opacity-60' : 'text-white/30'}`}>{m.desc}</p>
                </button>
              ))}
           </div>
        </section>

        <section>
           <div className="flex items-center gap-3 mb-6 px-4">
              <Layers size={20} className="text-lemon-muted" />
              <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Reader Theme</h3>
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'white', label: 'Day', color: 'bg-white' },
                { id: 'sepia', label: 'Sepia', color: 'bg-[#f4ecd8]' },
                { id: 'dark', label: 'Night', color: 'bg-black border border-white/20' },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-[32px] transition-all border-4 ${
                    theme === t.id ? 'border-lemon-muted bg-white/5' : 'border-transparent bg-white/2 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${t.color}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === t.id ? 'text-lemon-muted' : 'text-white/40'}`}>{t.label}</span>
                </button>
              ))}
           </div>
        </section>
      </div>
    </SettingsDetailLayout>
  );
}
