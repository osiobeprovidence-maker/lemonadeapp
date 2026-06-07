import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Send,
  Shield,
  Star,
  BookOpen,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../convex/_generated/api';
import { convex } from '../../../lib/convex';
import { useApp } from '../../../contexts/AppContext';
import type { CreatorApplication } from '../../../data/types';

export default function AdminApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { applications, adminSession, user, approveCreatorApplication, rejectCreatorApplication } = useApp();
  const [remoteApplication, setRemoteApplication] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const localApplication = applications.find((app) => app.id === applicationId);

  useEffect(() => {
    const loadApplication = async () => {
      if (!applicationId || !convex) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await convex.query(api.applications.getById, {
          applicationId: applicationId as any,
        });
        setRemoteApplication(result);
        setFeedback(result?.adminFeedback || '');
      } catch (error) {
        console.error('Failed to load application', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  const application = useMemo(() => {
    const source: any = remoteApplication || localApplication;
    if (!source) return null;

    return {
      id: source._id || source.id,
      applicant: source.creatorName || source.fullName || source.applicantName || 'Unknown creator',
      email: source.email || 'No email on file',
      category: Array.isArray(source.category) ? source.category.join(', ') : source.category || 'Creator',
      location: source.location || 'Not provided',
      bio: source.bio || 'No bio provided.',
      portfolioUrl: source.portfolioLink || source.portfolioUrl,
      sampleWorkUrl: source.socialLinks?.sampleWork || source.sampleWorkUrl,
      dropSomethingUrl: source.dropsomethingUrl,
      genre: source.mainGenre || 'Not provided',
      storyIntent: source.storyIntent || 'Not provided',
      whyLemonade: source.whyLemonade || 'Not provided',
      isOriginal: !!source.hasStoryReady,
      submittedDate: source.submittedAt ? new Date(source.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available',
      status: source.status || 'pending',
      adminFeedback: source.adminFeedback || '',
    };
  }, [remoteApplication, localApplication]);

  const handleAction = async (newStatus: 'approved' | 'rejected' | 'needs_info') => {
    if (!applicationId || !application) return;
    if ((newStatus === 'rejected' || newStatus === 'needs_info') && !feedback.trim()) {
      alert('Please add feedback before sending this decision.');
      return;
    }

    try {
      setIsSaving(true);
      if (newStatus === 'approved') {
        await approveCreatorApplication(applicationId);
      } else if (newStatus === 'rejected') {
        await rejectCreatorApplication(applicationId, feedback.trim());
      } else {
        if (!convex) throw new Error('Convex is not configured.');
        await convex.mutation(api.applications.review, {
          applicationId: applicationId as any,
          status: 'needs_info',
          adminEmail: adminSession?.email || user?.email || 'admin@owuuu.app',
          adminFeedback: feedback.trim(),
        });
      }

      setRemoteApplication((prev: any) => prev ? {
        ...prev,
        status: newStatus,
        adminFeedback: feedback.trim() || prev.adminFeedback,
      } : prev);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save application decision.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-sm font-black uppercase tracking-widest text-white/40">Loading application...</div>;
  }

  if (!application) {
    return (
      <div className="p-10 space-y-6">
        <button onClick={() => navigate('/admin/applications')} className="text-white/50 hover:text-white font-bold">Back to Applications</button>
        <div className="rounded-3xl border border-white/10 bg-ink-deep p-10">
          <h2 className="font-display text-2xl font-black uppercase italic">Application not found</h2>
          <p className="mt-2 text-sm font-bold text-white/40">This application does not exist in Convex or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/applications')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Applications</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            disabled={isSaving}
            onClick={() => handleAction('needs_info')}
            className="flex items-center justify-center px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
          >
            Request More Info
          </button>
          <button 
            disabled={isSaving}
            onClick={() => handleAction('approved')}
            className="flex items-center gap-2 px-6 h-12 bg-green-400 text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-400/20"
          >
            <CheckCircle size={18} />
            Approve
          </button>
          <button 
            disabled={isSaving}
            onClick={() => handleAction('rejected')}
            className="flex items-center gap-2 px-6 h-12 bg-white/5 hover:bg-red-400 hover:text-white rounded-xl font-black uppercase tracking-widest transition-all border border-white/5"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Application Main Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                       <Briefcase size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-display font-black tracking-tight uppercase italic">{application.applicant}</h2>
                       <p className="text-sm font-bold text-white/40">{application.category}</p>
                    </div>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    application.status === 'pending' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                    application.status === 'approved' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                    application.status === 'needs_info' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                    'bg-red-400/10 text-red-400 border-red-400/20'
                 }`}>
                    {application.status.replace('_', ' ')}
                 </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Mail size={18} className="text-white/20" />
                       <span className="text-sm font-bold">{application.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <MapPin size={18} className="text-white/20" />
                       <span className="text-sm font-bold">{application.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Calendar size={18} className="text-white/20" />
                       <span className="text-sm font-bold">Applied: {application.submittedDate}</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-white/30">Confirmation</p>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <CheckCircle size={20} className="text-green-400" />
                       <span className="text-xs font-bold">Original work owner confirmed</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Writer Bio</h3>
                    <p className="text-white/80 leading-relaxed font-medium bg-white/2 p-6 rounded-3xl border border-white/5 italic">
                       "{application.bio}"
                    </p>
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Story Intent & Genre</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Intent</p>
                          <p className="text-sm font-bold italic">"{application.storyIntent}"</p>
                       </div>
                       <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Genre Focus</p>
                          <p className="text-sm font-bold">{application.genre}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Feedback / Communication */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Admin Decision & Feedback</h3>
              <div className="space-y-6">
                 <textarea 
                   placeholder="Provide constructive feedback for the applicant..."
                   value={feedback}
                   onChange={(event) => setFeedback(event.target.value)}
                   className="w-full h-40 bg-white/5 border border-white/5 rounded-3xl p-6 font-medium text-sm focus:outline-none focus:border-lemon-muted/50 transition-all resize-none"
                 />
                 <div className="flex items-center gap-4">
                    <button
                      disabled={isSaving}
                      onClick={() => handleAction(application.status === 'pending' ? 'needs_info' : application.status)}
                      className="flex-1 py-4 bg-lemon-muted text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                    >
                       {isSaving ? 'Saving...' : 'Save Decision'}
                    </button>
                    <button className="flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5">
                       <Send size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* Portfolio Links */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center gap-2 mb-8">
                 <Layers size={20} className="text-lemon-muted" />
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Portfolio</h3>
              </div>
              <div className="space-y-4">
                 {application.portfolioUrl ? (
                 <a 
                   href={application.portfolioUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                 >
                    <div>
                       <p className="text-xs font-black uppercase text-white/40 mb-1">Portfolio Link</p>
                       <p className="text-sm font-bold truncate max-w-[150px]">{application.portfolioUrl}</p>
                    </div>
                    <ExternalLink size={18} className="text-white/20 group-hover:text-lemon-muted" />
                 </a>
                 ) : null}
                 {application.sampleWorkUrl ? (
                 <a 
                   href={application.sampleWorkUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                 >
                    <div>
                       <p className="text-xs font-black uppercase text-white/40 mb-1">Sample Work</p>
                       <p className="text-sm font-bold truncate max-w-[150px]">View Google Doc</p>
                    </div>
                    <ExternalLink size={18} className="text-white/20 group-hover:text-lemon-muted" />
                 </a>
                 ) : null}
                 {application.dropSomethingUrl ? (
                 <a 
                   href={application.dropSomethingUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                 >
                    <div>
                       <p className="text-xs font-black uppercase text-white/40 mb-1">DropSomething</p>
                       <p className="text-sm font-bold truncate max-w-[150px]">Link Status: Active</p>
                    </div>
                    <ExternalLink size={18} className="text-white/20 group-hover:text-lemon-muted" />
                 </a>
                 ) : null}
                 {!application.portfolioUrl && !application.sampleWorkUrl && !application.dropSomethingUrl && (
                   <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-sm font-bold text-white/40">
                     No portfolio links were provided.
                   </div>
                 )}
              </div>
           </div>

           {/* Admin Logs */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                 <Clock size={20} className="text-lemon-muted" />
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Audit Trail</h3>
              </div>
              <div className="space-y-6">
                 {application.adminFeedback && (
                 <div className="relative pl-6 pb-6 border-l border-white/10">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-lemon-muted" />
                    <p className="text-xs font-black uppercase text-white/40 mb-1">Latest Decision</p>
                    <p className="text-sm font-bold italic text-white/80">"{application.adminFeedback}"</p>
                    <p className="text-[10px] font-black uppercase text-lemon-muted mt-2">Status: {application.status.replace('_', ' ')}</p>
                 </div>
                 )}
                 <div className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-lemon-muted" />
                    <p className="text-xs font-black uppercase text-white/40 mb-1">{application.submittedDate}</p>
                    <p className="text-sm font-bold">Application Received</p>
                    <p className="text-[10px] text-white/30 mt-1">Pending validation of portfolio links</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
