import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck,
  XCircle, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  MoreVertical,
  MessageSquare,
  AlertCircle,
  Eye,
  User,
  Image as ImageIcon,
  Zap,
  Target,
  Info
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CreatorApplication } from '../../data/mock';
import { cn } from '../../lib/utils';

export default function AdminApplications() {
  const { applications, approveCreatorApplication, rejectCreatorApplication } = useApp();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<CreatorApplication | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const pendingApps = applications.filter(a => a.status === 'pending');
  const pastApps = applications.filter(a => a.status !== 'pending');

  const handleApprove = (id: string) => {
    approveCreatorApplication(id);
    setSelectedApp(null);
    alert('Application Approved! (Mock)');
  };

  const handleReject = () => {
    if (selectedApp) {
      rejectCreatorApplication(selectedApp.id, rejectionFeedback);
      setShowFeedbackModal(false);
      setSelectedApp(null);
      setRejectionFeedback('');
      alert('Application Rejected (Mock)');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Creator Applications</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Review and welcome new platform talent</p>
        </div>
        <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1">
          <div className="px-6 h-11 flex items-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest bg-lemon-muted text-black">
             <Clock size={16} />
             {pendingApps.length} Pending
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending List */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic">Active Queue</h3>
           <div className="space-y-4">
              {pendingApps.length > 0 ? (
                pendingApps.map((app) => (
                  <motion.div 
                    layoutId={app.id}
                    key={app.id} 
                    className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 hover:border-lemon-muted/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                  >
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-lg font-bold group-hover:text-lemon-muted transition-colors">{app.fullName}</h4>
                           <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 text-white/40 rounded border border-white/5">{app.mainGenre}</span>
                        </div>
                        <p className="text-sm text-white/40 mb-4 line-clamp-1">{app.bio}</p>
                        <div className="flex flex-wrap gap-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                              <User size={12} /> @{app.socialUsername}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                              <Target size={12} /> {app.mainGenre}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                              <Clock size={12} /> {new Date(app.submittedAt).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="h-12 w-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"
                          title="Quick View"
                        >
                           <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                          className="h-12 px-6 bg-lemon-muted text-black rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lemon-muted/10"
                        >
                           Process
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 bg-ink-deep border border-dashed border-white/10 rounded-[2.5rem] text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white/20">
                      <CheckCircle2 size={32} />
                   </div>
                   <h4 className="text-xl font-display font-black uppercase italic mb-2">Queue Clear</h4>
                   <p className="text-sm text-white/40 font-bold max-w-xs mx-auto">All creator applications have been reviewed. check back later for new talent.</p>
                </div>
              )}
           </div>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
           <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic">Recent History</h3>
           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] divide-y divide-white/5 overflow-hidden">
              {pastApps.map((app) => (
                <div 
                  key={app.id} 
                  className="p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer group"
                  onClick={() => navigate(`/admin/applications/${app.id}`)}
                >
                   <div className="min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-lemon-muted">{app.fullName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">{app.mainGenre}</p>
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                     app.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                   )}>
                      {app.status}
                   </div>
                </div>
              ))}
              {pastApps.length === 0 && (
                <div className="p-10 text-center text-white/20 text-xs font-black uppercase tracking-widest italic">
                   No history yet.
                </div>
              )}
           </div>
           
           <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2rem]">
              <h4 className="font-black text-blue-400 uppercase tracking-tight text-lg mb-2">Onboarding Guide</h4>
              <p className="text-xs font-bold text-blue-400/60 leading-relaxed">Ensure creators have valid portfolio links and original work intent before approving access to the Studio.</p>
           </div>
        </div>
      </div>

      {/* Detail Modal (Quick View) */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedApp(null)}
               className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-ink-deep border border-white/10 rounded-[3rem] shadow-2xl z-[110] overflow-hidden flex flex-col"
            >
               <div className="p-8 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-lemon-muted rounded-2xl flex items-center justify-center text-black">
                        <FileText size={28} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-display font-black uppercase italic leading-none">{selectedApp.fullName}</h3>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-lemon-muted mt-1.5">@{selectedApp.socialUsername}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/admin/applications/${selectedApp.id}`)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-lemon-muted transition-all"
                      title="Full Details"
                    >
                       <ExternalLink size={20} />
                    </button>
                    <button onClick={() => setSelectedApp(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                       <XCircle size={24} />
                    </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Primary Email</p>
                        <p className="text-sm font-bold text-white/80">{selectedApp.email}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Genre</p>
                        <p className="text-sm font-bold text-white/80">{selectedApp.mainGenre}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Creator Bio / Pitch</p>
                     <div className="p-6 bg-black rounded-2xl border border-white/5 text-sm font-medium leading-relaxed italic text-white/60">
                        "{selectedApp.bio}"
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Resources & Proof</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a 
                           href={selectedApp.portfolioUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-lemon-muted transition-all"
                        >
                           <div className="flex items-center gap-3">
                              <ImageIcon size={20} className="text-white/40 group-hover:text-lemon-muted" />
                              <span className="text-xs font-black uppercase tracking-widest italic">Portfolio</span>
                           </div>
                           <ExternalLink size={14} className="text-white/20" />
                        </a>
                        <a 
                           href={selectedApp.sampleWorkUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-lemon-muted transition-all"
                        >
                           <div className="flex items-center gap-3">
                              <Zap size={20} className="text-white/40 group-hover:text-lemon-muted" />
                              <span className="text-xs font-black uppercase tracking-widest italic">Sample Work</span>
                           </div>
                           <ExternalLink size={14} className="text-white/20" />
                        </a>
                     </div>
                  </div>

                  <div className="p-8 bg-ink-deep border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Info size={18} />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white/60">More Info Required?</p>
                          <p className="text-[10px] font-bold text-white/30 italic">Send feedback without rejecting</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => alert('Info request sent to applicant (Mock)')}
                      className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                    >
                      Request
                    </button>
                  </div>
               </div>

               <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                  <button 
                     onClick={() => setShowFeedbackModal(true)}
                     className="flex-1 h-14 bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 flex items-center justify-center gap-2"
                  >
                     <XCircle size={18} /> Reject
                  </button>
                  <button 
                     onClick={() => handleApprove(selectedApp.id)}
                     className="flex-1 h-14 bg-lemon-muted text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-lemon-muted/20 flex items-center justify-center gap-2 italic"
                  >
                     <ShieldCheck size={18} /> Approve
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 10 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ink-deep border border-white/10 p-8 rounded-[2rem] shadow-2xl z-[160]"
            >
               <h3 className="text-xl font-display font-black uppercase italic mb-6">Rejection Feedback</h3>
               <textarea 
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  placeholder="Provide specific reasons for rejection..."
                  className="w-full h-40 bg-black border border-white/10 rounded-2xl p-6 text-white text-sm font-medium focus:outline-none focus:border-red-500/50 transition-all resize-none mb-6"
               />
               <div className="flex gap-4">
                  <button onClick={() => setShowFeedbackModal(false)} className="flex-1 h-12 bg-white/5 text-white/40 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10">Cancel</button>
                  <button 
                     onClick={handleReject}
                     disabled={!rejectionFeedback.trim()}
                     className="flex-1 h-12 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                     Confirm Rejection
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
