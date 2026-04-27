import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, PenTool, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CreatorApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useApp();
  const status = user?.creatorAccessStatus || 'none';

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-24 h-24 bg-white/5 border border-lemon-muted/20 rounded-full flex items-center justify-center mb-8 relative">
              <Clock size={48} className="text-lemon-muted animate-pulse" />
              <div className="absolute inset-0 bg-lemon-muted/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl mb-4">Creator application under review</h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mb-12">
              Our team will review your creator request before giving you publishing access. This usually takes 24-48 hours.
            </p>
            
            <div className="w-full max-w-sm grid gap-4">
              <div className="flex items-center justify-between p-5 bg-ink-deep border border-white/5 rounded-2xl">
                <span className="text-sm font-medium text-white/40">Status</span>
                <span className="px-3 py-1 bg-lemon-muted/10 text-lemon-muted text-xs font-black uppercase tracking-widest rounded-full">Pending</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-ink-deep border border-white/5 rounded-2xl">
                <span className="text-sm font-medium text-white/40">Submitted</span>
                <span className="text-sm font-bold">Just now</span>
              </div>
            </div>

            <Button size="lg" variant="secondary" className="mt-12 h-14 w-full max-w-sm" onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          </div>
        );

      case 'approved':
        return (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-24 h-24 bg-lemon-muted text-black rounded-full flex items-center justify-center mb-8">
              <CheckCircle size={48} />
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl mb-4">You now have creator access</h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mb-12">
              Congratulations! Your application was approved. You can now access the Creator Studio to publish your work.
            </p>
            
            <Button size="lg" className="h-14 w-full max-w-sm" onClick={() => navigate('/studio')}>
              <LayoutDashboard size={18} className="mr-2" /> Open Creator Studio
            </Button>
          </div>
        );

      case 'rejected':
        return (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-24 h-24 bg-red-500/20 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center mb-8">
              <AlertCircle size={48} />
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl mb-4">Creator application needs more detail</h1>
            <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md mb-6">
              Our team reviewed your application and has some feedback before we can approve your access.
            </p>

            {user?.pendingAction?.payload?.feedback && (
              <div className="w-full max-w-sm p-6 bg-red-500/5 border border-red-500/10 rounded-2xl mb-8 text-left">
                <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">Admin Feedback</p>
                <p className="text-sm text-white/80 italic">"{user.pendingAction.payload.feedback}"</p>
              </div>
            )}
            
            <div className="w-full max-w-sm flex flex-col gap-4">
              <Button size="lg" className="h-14 w-full" onClick={() => navigate('/creator-application')}>
                <PenTool size={18} className="mr-2" /> Resubmit Application
              </Button>
              <Button size="lg" variant="secondary" className="h-14 w-full" onClick={() => navigate('/home')}>
                Back to Home
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center text-center py-12">
            <h1 className="font-display font-black text-3xl mb-4">No application found</h1>
            <Button onClick={() => navigate('/creator-application')}>Apply Now</Button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black-core p-6 md:p-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/home')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
