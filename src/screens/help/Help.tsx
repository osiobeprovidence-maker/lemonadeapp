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
    <div className="flex flex-col w-full min-h-screen relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lemon-muted/10 via-black-core to-black-core pointer-events-none" />

      <div className="relative z-10 p-6 md:p-12 max-w-4xl mx-auto w-full pb-32 md:pb-12">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-12"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm uppercase tracking-widest">Settings</span>
        </button>

        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lemon-muted/10 text-lemon-muted text-xs font-black uppercase tracking-widest mb-6 border border-lemon-muted/20">
            <HelpCircle size={14} /> Support Center
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 leading-none">
            How can we <br /><span className="text-lemon-muted text-glow">help?</span>
          </h1>
          
          <div className="relative group max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search help articles, guides, and more..."
              className="w-full h-16 bg-white/5 border border-white/5 rounded-[24px] pl-14 pr-6 font-bold text-lg focus:outline-none focus:border-lemon-muted/50 focus:bg-white/10 transition-all shadow-2xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <button 
            onClick={() => navigate('/help/contact')}
            className="group relative flex flex-col items-center justify-center p-10 bg-lemon-muted text-black rounded-[48px] overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-lemon-muted/20"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare size={40} className="mb-4 transform group-hover:-translate-y-1 transition-transform" />
            <p className="font-black uppercase tracking-[0.2em] text-sm">Contact Support</p>
            <p className="text-[10px] font-bold opacity-60 mt-1">Average response: 2 hours</p>
          </button>
          <button 
            onClick={() => navigate('/help/report-problem')}
            className="group relative flex flex-col items-center justify-center p-10 bg-white/5 border border-white/10 text-white rounded-[48px] overflow-hidden hover:bg-white/10 transition-all duration-500"
          >
            <AlertCircle size={40} className="mb-4 text-red-400 transform group-hover:rotate-12 transition-transform" />
            <p className="font-black uppercase tracking-[0.2em] text-sm">Report a Problem</p>
            <p className="text-[10px] font-bold text-white/30 mt-1">Found a bug? Let us know.</p>
          </button>
        </div>

        <div className="space-y-12">
          {HELP_TOPICS.map((topic) => (
            <div key={topic.id} className="space-y-6">
               <div className="flex items-center gap-4 px-2">
                  <div className="w-10 h-10 rounded-2xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted border border-lemon-muted/10">
                    <topic.icon size={20} />
                  </div>
                  <h2 className="text-2xl font-display font-black uppercase tracking-tight italic">{topic.title}</h2>
               </div>
               <div className="bg-ink-deep/50 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  {topic.items.map((item, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group"
                    >
                      <span className="font-bold text-lg group-hover:text-lemon-muted transition-colors">{item}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all">
                        <ChevronRight size={18} className="text-lemon-muted" />
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-gradient-to-br from-indigo-900/20 to-black-core border border-white/10 rounded-[56px] text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl" />
           <h3 className="font-display font-black text-2xl mb-4">Join our Community</h3>
           <p className="text-white/40 mb-8 max-w-sm mx-auto">Get help from other readers and creators on our official Discord server.</p>
           <Button variant="glass" className="bg-white/5 px-8">Join Discord</Button>
        </div>
      </div>
    </div>
  );
}
