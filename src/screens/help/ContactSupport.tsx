import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactSupport() {
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
        <h1 className="text-4xl font-display font-black tracking-tight mb-4 uppercase italic">Contact Support</h1>
        <p className="text-white/40 font-bold mb-8">Send us a message and we'll get back to you as soon as possible.</p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Subject</label>
              <select 
                required
                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors appearance-none"
              >
                <option>Account Inquiry</option>
                <option>Payment Issue</option>
                <option>Story Publishing</option>
                <option>Technical Bug</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Message</label>
              <textarea 
                required
                placeholder="How can we help?"
                className="w-full h-48 bg-white/5 border border-white/5 rounded-3xl p-6 font-medium focus:outline-none focus:border-lemon-muted/50 transition-colors resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-lemon-muted text-black rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Send Message
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
            <div className="w-24 h-24 rounded-full bg-lemon-muted flex items-center justify-center text-black mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight uppercase italic mb-4">Message Sent!</h2>
            <p className="text-white/40 font-bold max-w-sm mb-10">Thank you for reaching out. Our support team will review your message and reply via email within 24-48 hours.</p>
            <button 
              onClick={() => navigate('/home')}
              className="px-10 h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
