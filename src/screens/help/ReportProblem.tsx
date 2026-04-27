import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportProblem() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-4xl mx-auto pb-32 md:pb-12">
      <button 
        onClick={() => navigate('/help')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-10"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </div>
        <span className="font-bold">Help Center</span>
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-display font-black tracking-tight mb-4 uppercase italic">Report a Problem</h1>
        <p className="text-white/40 font-bold mb-8 text-lg">Found a bug or something isn't working? Let us know the details.</p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit} 
            className="space-y-8"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">What's the issue?</label>
              <select 
                required
                className="w-full h-16 bg-white/5 border border-white/5 rounded-[24px] px-8 font-bold focus:outline-none focus:border-red-400/50 transition-colors appearance-none"
              >
                <option>App Crashing</option>
                <option>Story Loading Issue</option>
                <option>Payment failed but charged</option>
                <option>UI Formatting Bug</option>
                <option>Notification issues</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Describe what happened</label>
              <textarea 
                required
                placeholder="Steps to reproduce the problem..."
                className="w-full h-48 bg-white/5 border border-white/5 rounded-[32px] p-8 font-medium focus:outline-none focus:border-red-400/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Attachment (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button type="button" className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/20 hover:border-lemon-muted hover:text-lemon-muted transition-all">
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase mt-2">Add Photo</span>
                 </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-red-400 text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-400/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <AlertCircle size={20} />
                  Submit Report
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-[40px] bg-red-400 flex items-center justify-center text-white mb-8 shadow-2xl shadow-red-400/20">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight uppercase italic mb-4">Report Received</h2>
            <p className="text-white/40 font-bold max-w-sm mb-12">We've logged the problem and our engineering team will look into it. Thanks for helping us improve Lemonade!</p>
            <button 
              onClick={() => navigate('/home')}
              className="px-12 h-16 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
