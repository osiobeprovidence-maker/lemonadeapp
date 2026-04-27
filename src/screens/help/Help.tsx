import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, BookOpen, MessageSquare, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HELP_TOPICS = [
  { 
    id: 'getting-started', 
    title: 'Getting Started', 
    icon: BookOpen, 
    items: ['What is Lemonade?', 'How to read a story', 'Navigating the library'] 
  },
  { 
    id: 'creators', 
    title: 'For Creators', 
    icon: HelpCircle, 
    items: ['How to apply to be a creator', 'Uploading your first story', 'Understanding analytics'] 
  },
  { 
    id: 'payments', 
    title: 'Payments & Premium', 
    icon: MessageSquare, 
    items: ['How Lemons work', 'Canceling your subscription', 'Payment methods'] 
  },
];

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <button 
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-10"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </div>
        <span className="font-bold">Settings</span>
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-display font-black tracking-tight mb-4 uppercase italic">Help Center</h1>
        <p className="text-white/40 font-bold mb-8">How can we help you today?</p>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search help articles..."
            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <button 
          onClick={() => navigate('/help/contact')}
          className="flex flex-col items-center justify-center p-8 bg-lemon-muted text-black rounded-[40px] hover:scale-105 transition-transform"
        >
          <MessageSquare size={32} className="mb-3" />
          <p className="font-black uppercase tracking-widest text-sm">Contact Support</p>
        </button>
        <button 
          onClick={() => navigate('/help/report-problem')}
          className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 text-white rounded-[40px] hover:bg-white/10 transition-colors"
        >
          <AlertCircle size={32} className="mb-3 text-red-400" />
          <p className="font-black uppercase tracking-widest text-sm">Report a Problem</p>
        </button>
      </div>

      <div className="space-y-8">
        {HELP_TOPICS.map((topic) => (
          <div key={topic.id} className="space-y-4">
             <div className="flex items-center gap-3 px-4">
                <topic.icon size={20} className="text-lemon-muted" />
                <h2 className="text-xl font-display font-black uppercase italic tracking-tight">{topic.title}</h2>
             </div>
             <div className="bg-ink-deep border border-white/5 rounded-[32px] overflow-hidden">
                {topic.items.map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <span className="font-bold">{item}</span>
                    <ChevronRight size={18} className="text-white/10" />
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
