import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Artificial delay for "security check" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === 'riderezzy@lemons.com' && password === 'lemons12345') {
      adminLogin(email, 'super_admin');
      navigate(from, { replace: true });
    } else {
      setError('Invalid admin credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-core flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lemon-muted/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lemon-muted rounded-[2rem] shadow-2xl shadow-lemon-muted/20 rotate-12 mb-6">
            <ShieldCheck size={40} className="text-black -rotate-12" />
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-white mb-2 uppercase italic">Lemonade Admin</h1>
          <p className="text-white/40 font-bold tracking-widest text-xs uppercase">Secure Infrastructure Access</p>
        </div>

        <div className="bg-ink-deep border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-lemon-muted transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lemons.com"
                  className="w-full h-14 bg-black border border-white/5 rounded-2xl pl-14 pr-6 text-white placeholder:text-white/10 font-bold focus:outline-none focus:border-lemon-muted/50 focus:ring-4 focus:ring-lemon-muted/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Security Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-lemon-muted transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-black border border-white/5 rounded-2xl pl-14 pr-6 text-white placeholder:text-white/10 font-bold focus:outline-none focus:border-lemon-muted/50 focus:ring-4 focus:ring-lemon-muted/5 transition-all"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-lemon-muted text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-lemon-muted/10 hover:shadow-lemon-muted/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Powered by AntiGravity Core v2.4.0
        </p>
      </motion.div>
    </div>
  );
}
