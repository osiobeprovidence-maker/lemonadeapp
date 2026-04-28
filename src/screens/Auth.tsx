import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, PenTool, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AppContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, continueAsGuest, executePendingAction } = useAuth();
  
  const defaultMode = searchParams.get('mode') || 'signin';
  const intent = searchParams.get('intent');
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'role'>(defaultMode as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAuthSuccess = async (role: 'reader' | 'creator') => {
    // Execute any pending action that was intercepted
    executePendingAction();

    // Store selected role in sessionStorage for reference
    sessionStorage.setItem('selectedRole', role);

    if (role === 'creator') {
      navigate('/creator-application');
    } else if (intent === 'studio') {
      navigate('/creator-application');
    } else if (intent) {
      // Navigate back to where they came from if it was an intent
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const name = String(formData.get('name') || '');
    const username = String(formData.get('username') || '');

    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setNotice('Password reset email sent. Check your inbox.');
      } else if (mode === 'signup') {
        await signUp({ name, username, email, password });
        setMode('role');
      } else {
        // Firebase signin
        await signIn(email, password);
        handleAuthSuccess('reader');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: 'reader' | 'creator') => {
    handleAuthSuccess(role);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      if (mode === 'signup') {
        setMode('role');
      } else {
        handleAuthSuccess('reader');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-black-core flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-md flex flex-col h-full mt-8">
        
        {mode !== 'role' && (
          <div className="flex items-center justify-between mb-8 w-full">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <button onClick={handleGuest} className="text-sm font-bold text-white/40 hover:text-lemon-muted transition-colors">
              Continue as Guest
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              
              {mode === 'role' ? (
                <>
                  <div>
                    <h1 className="font-display text-3xl md:text-5xl font-black mb-2">Welcome to Lemonade.</h1>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">How do you want to use the platform?</p>
                  </div>
                  <div className="grid gap-4 mt-6">
                    <button onClick={() => handleRoleSelect('reader')} className="text-left flex items-start gap-4 p-5 md:p-6 rounded-2xl border border-white/10 bg-ink-deep hover:border-lemon-muted transition-all active:scale-[0.98] group">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-lemon-muted/20 transition-colors">
                        <User className="text-white group-hover:text-lemon-muted transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base md:text-lg mb-1">Continue as Reader</h3>
                        <p className="text-xs md:text-sm text-white/50 leading-relaxed">Discover stories, follow creators, and build your digital library.</p>
                      </div>
                    </button>
                    
                    <button onClick={() => handleRoleSelect('creator')} className="text-left flex items-start gap-4 p-5 md:p-6 rounded-2xl border border-white/10 bg-ink-deep hover:border-lemon-muted transition-all active:scale-[0.98] group">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-lemon-muted/20 transition-colors">
                        <PenTool className="text-white group-hover:text-lemon-muted transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base md:text-lg mb-1">Apply as Creator</h3>
                        <p className="text-xs md:text-sm text-white/50 leading-relaxed">Publish your stories, build an audience, and monetize your world.</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    {intent && (
                      <div className="mb-4 inline-block px-3 py-1 bg-lemon-muted/10 rounded-full">
                        <p className="text-lemon-muted text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <Globe size={12} /> Create an account to {intent}
                        </p>
                      </div>
                    )}
                    <h1 className="font-display text-4xl font-bold mb-2">
                      {mode === 'signin' ? 'Welcome back.' : mode === 'signup' ? 'Create Account.' : 'Reset Password.'}
                    </h1>
                    <p className="text-white/60">
                      {mode === 'signin' ? 'Sign in to jump back into your stories.' : 
                       mode === 'signup' ? (intent ? 'Join to support your favorite creators.' : 'Join the next generation of storytelling.') : 
                       'We will send you instructions to reset.'}
                    </p>
                  </div>

                  {mode !== 'forgot' && (
                    <div className="flex flex-col gap-3 mt-4">
                      <GoogleAuthButton onClick={handleGoogleAuth} mode={mode === 'signin' ? 'signin' : 'signup'} />
                      <div className="flex items-center gap-4 my-2">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">or email</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                    </div>
                  )}

                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Input name="name" placeholder="Full Name" required />
                        <Input name="username" placeholder="Username" required />
                      </div>
                    )}
                    
                    <Input name="email" type="email" placeholder="Email address" required />
                    
                    {mode !== 'forgot' && (
                      <Input name="password" type="password" placeholder="Password" required minLength={6} />
                    )}

                    {mode === 'signin' && (
                      <div className="flex justify-end my-1">
                        <button type="button" onClick={() => setMode('forgot')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button type="submit" size="lg" className="mt-4" disabled={loading}>
                      {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Continue' : 'Send Link'}
                    </Button>
                  </form>

                  {error && (
                    <p className="text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      {error}
                    </p>
                  )}

                  {notice && (
                    <p className="text-sm font-bold text-lemon-muted bg-lemon-muted/10 border border-lemon-muted/20 rounded-xl p-4">
                      {notice}
                    </p>
                  )}

                  <div className="mt-6 text-center text-sm text-white/50">
                    {mode === 'signin' ? (
                      <p>New to Lemonade? <button onClick={() => setMode('signup')} className="text-lemon-muted font-medium hover:underline">Sign up</button></p>
                    ) : (
                       <p>Already have an account? <button onClick={() => setMode('signin')} className="text-lemon-muted font-medium hover:underline">Sign in</button></p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GoogleAuthButton({ onClick, mode }: { onClick: () => void, mode: 'signin' | 'signup' }) {
  return (
    <button 
      onClick={onClick}
      className="w-full h-14 bg-white rounded-xl flex items-center justify-center gap-3 px-6 hover:bg-white/90 transition-all active:scale-[0.98] group"
    >
      <div className="w-5 h-5 relative flex items-center justify-center">
        {/* Simple SVG for Google 'G' since lucide doesn't have it */}
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </div>
      <span className="text-black font-bold">
        {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
      </span>
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className="w-full h-14 bg-ink-deep border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-lemon-muted transition-colors font-medium border-box"
    />
  )
}
