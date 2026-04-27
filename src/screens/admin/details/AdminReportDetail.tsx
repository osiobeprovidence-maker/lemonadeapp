import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Flag, 
  User, 
  Calendar, 
  MessageSquare, 
  Shield, 
  ChevronLeft,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  ExternalLink,
  MoreVertical,
  Scale,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');

  // Mock data
  const report = {
    id: reportId || '4293',
    type: 'Inappropriate Content',
    targetType: 'story',
    targetId: 'story-123',
    targetTitle: 'Dark Desires Vol. 2',
    reportedBy: 'user_99',
    reporterEmail: 'user99@gmail.com',
    reason: 'Explicit depictions of violence without proper warning tags.',
    message: 'Hey, I think this story breaks the community guidelines regarding graphic violence in chapter 4. There was no sensitive content warning provided.',
    date: 'Apr 25, 2026',
    status: status,
    targetCreator: 'creator_x'
  };

  const handleAction = (newStatus: string) => {
    setStatus(newStatus);
    // In a real app, this would call an API
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Reports</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleAction('reviewing')}
            disabled={status !== 'pending'}
            className="flex items-center justify-center px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 disabled:opacity-30"
          >
            Mark Reviewing
          </button>
          <button 
            onClick={() => handleAction('resolved')}
            className="flex items-center gap-2 px-6 h-12 bg-green-400 text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-400/20"
          >
            <CheckCircle size={18} />
            Resolve
          </button>
          <button 
            onClick={() => handleAction('dismissed')}
            className="flex items-center gap-2 px-6 h-12 bg-white/5 hover:bg-red-400 hover:text-white rounded-xl font-black uppercase tracking-widest transition-all border border-white/5"
          >
            <XCircle size={18} />
            Dismiss
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Report Detail Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400">
                       <Flag size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-display font-black tracking-tight uppercase italic">{report.type}</h2>
                       <p className="text-xs font-black uppercase tracking-widest text-white/30">Report #{report.id}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      status === 'pending' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                      status === 'reviewing' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                      status === 'resolved' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                      'bg-white/5 text-white/40 border-white/5'
                    }`}>
                      {status}
                    </span>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Reason Provided</h3>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 font-bold italic text-white/80">
                       "{report.reason}"
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Detailed Message</h3>
                    <p className="text-white/60 font-medium leading-relaxed">
                       {report.message}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 mt-8 border-t border-white/5 border-dashed">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Date Submitted</p>
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                       <Calendar size={14} className="text-lemon-muted" />
                       {report.date}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Severity</p>
                    <p className="font-bold text-orange-400 text-sm">Medium</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Target Type</p>
                    <p className="font-bold text-sm uppercase">{report.targetType}</p>
                 </div>
              </div>
           </div>

           {/* Content Context */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Shield size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Reported Content</h3>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden shrink-0">
                       <img src="https://picsum.photos/seed/report/100/150" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="font-black text-lg">{report.targetTitle}</p>
                       <p className="text-sm font-bold text-white/40">Creator: <span className="text-lemon-muted">@{report.targetCreator}</span></p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Link to={`/admin/stories/${report.targetId}`} className="w-12 h-12 bg-white/5 hover:bg-white text-black rounded-2xl flex items-center justify-center transition-all">
                       <ExternalLink size={20} className="group-hover:text-black text-white/40" />
                    </Link>
                 </div>
              </div>

              <div className="mt-8 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Moderation Actions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-5 bg-white/5 hover:bg-red-400/10 rounded-2xl border border-white/5 transition-all text-left">
                       <Trash2 size={24} className="text-red-400" />
                       <div>
                          <p className="font-bold text-sm">Remove Content</p>
                          <p className="text-[10px] font-black uppercase text-white/30">Delete chapter or story</p>
                       </div>
                    </button>
                    <button className="flex items-center gap-3 p-5 bg-white/5 hover:bg-orange-400/10 rounded-2xl border border-white/5 transition-all text-left">
                       <AlertTriangle size={24} className="text-orange-400" />
                       <div>
                          <p className="font-bold text-sm">Warn User</p>
                          <p className="text-[10px] font-black uppercase text-white/30">Send official warning mail</p>
                       </div>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* reporter Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">Reported By</h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 rounded-full bg-lemon-muted flex items-center justify-center text-black font-black text-xl">
                    {report.reportedBy[0].toUpperCase()}
                 </div>
                 <div>
                    <h4 className="font-black text-lg">@{report.reportedBy}</h4>
                    <p className="text-xs font-bold text-white/40 tracking-tight">{report.reporterEmail}</p>
                 </div>
              </div>
              <Link to={`/admin/users/user_99`} className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                 View User Detail
              </Link>
           </div>

           {/* Admin Internal History */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <Scale size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Admin Log</h3>
                 </div>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                 <div className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-lemon-muted" />
                    <p className="text-xs font-black uppercase text-white/40 mb-1">Today, 2:45 PM</p>
                    <p className="text-sm font-bold">Opened by mod_sarah</p>
                    <p className="text-[10px] text-white/30 mt-1">Status changed: PENDING → REVIEWING</p>
                 </div>
                 <div className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-xs font-black uppercase text-white/40 mb-1">Apr 25, 11:20 PM</p>
                    <p className="text-sm font-bold">Report Received</p>
                    <p className="text-[10px] text-white/30 mt-1">Automated system check: OK</p>
                 </div>
              </div>
              <textarea 
                placeholder="Add internal note..."
                className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-medium mb-4 focus:outline-none resize-none"
              />
              <button className="w-full py-3 bg-lemon-muted text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                 Add Internal Note
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
