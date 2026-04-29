import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { Shield, FileText, Scale, ChevronRight } from 'lucide-react';

const LEGAL_ITEMS = [
  { id: 'terms', title: 'Terms of Service', icon: FileText, path: '/terms' },
  { id: 'privacy', title: 'Privacy Policy', icon: Shield, path: '/privacy' },
  { id: 'community', title: 'Community Guidelines', icon: Scale, path: '/terms#community' },
];

export default function SettingsLegal() {
  const navigate = useNavigate();

  return (
    <SettingsDetailLayout 
      title="Legal & Safety" 
      description="Important documents regarding your rights, our policies, and community safety."
    >
      <div className="space-y-6">
        <div className="bg-ink-deep/50 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
          {LEGAL_ITEMS.map((item, i) => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-10 hover:bg-white/5 transition-all group border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-white/40 group-hover:text-lemon-muted group-hover:bg-lemon-muted/10 group-hover:border-lemon-muted/20 border border-transparent transition-all">
                    <item.icon size={28} />
                 </div>
                 <div>
                   <h3 className="font-display font-black text-xl uppercase tracking-tight italic group-hover:text-lemon-muted transition-colors">{item.title}</h3>
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Review document</p>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all">
                <ChevronRight size={20} className="text-lemon-muted" />
              </div>
            </button>
          ))}
        </div>

        <div className="p-10 bg-white/5 border border-dashed border-white/10 rounded-[48px]">
           <h4 className="font-display font-black text-sm uppercase tracking-widest text-white/40 mb-4">Safety & Reporting</h4>
           <p className="text-sm text-white/50 leading-relaxed mb-6">
             Lemonade is committed to providing a safe environment for all creators and readers. 
             If you encounter content that violates our guidelines, please report it immediately.
           </p>
           <button onClick={() => navigate('/help/report-problem')} className="text-sm font-black text-lemon-muted hover:underline uppercase tracking-widest">
             Report a Violation &rarr;
           </button>
        </div>
      </div>

      <div className="mt-16 text-center">
         <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/5 mb-4">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Version 1.0.42 (Beta)</p>
         </div>
         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">© 2026 Lemonade Inc. All rights reserved.</p>
      </div>
    </SettingsDetailLayout>
  );
}
