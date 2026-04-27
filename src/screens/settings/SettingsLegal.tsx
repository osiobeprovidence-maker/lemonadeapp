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
      description="Important documents regarding your rights and our policies."
    >
      <div className="space-y-4">
        {LEGAL_ITEMS.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between p-8 bg-ink-deep border border-white/5 rounded-[40px] hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-lemon-muted transition-colors">
                  <item.icon size={24} />
               </div>
               <h3 className="font-black text-xl uppercase italic tracking-tight">{item.title}</h3>
            </div>
            <ChevronRight size={24} className="text-white/10 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Version 1.0.42 (Beta)</p>
         <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">© 2026 Lemonade Inc.</p>
      </div>
    </SettingsDetailLayout>
  );
}
