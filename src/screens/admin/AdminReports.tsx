import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Flag, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  User,
  Eye,
  ShieldAlert,
  Clock,
  ExternalLink,
  ShieldX,
  Ban
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ContentReport } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminReports() {
  const { reports, resolveReport } = useApp();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);

  const openReports = reports.filter(r => r.status === 'open' || r.status === 'reviewing');
  const pastReports = reports.filter(r => r.status === 'resolved' || r.status === 'dismissed');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Moderation Queue</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Review user reports and safety alerts</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{openReports.length} Active Issues</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {openReports.map((report) => (
             <motion.div 
               layoutId={report.id}
               key={report.id}
               className="p-6 bg-ink-deep border border-white/5 rounded-[2rem] hover:border-red-500/30 transition-all cursor-pointer group"
               onClick={() => navigate(`/admin/reports/${report.id}`)}
             >
                <div className="flex items-start justify-between gap-4">
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400">
                         <Flag size={24} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold group-hover:text-red-400 transition-colors">{report.type.toUpperCase()}: {report.targetName}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/10">{report.reason}</span>
                         </div>
                         <p className="text-sm text-white/40 mb-4 line-clamp-1">{report.message}</p>
                         <div className="flex flex-wrap gap-4">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Reported by @{report.reportedBy}</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> {new Date(report.date).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="w-10 h-10 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                        title="Quick Preview"
                      >
                         <Eye size={18} />
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
           {openReports.length === 0 && (
             <div className="p-20 text-center bg-ink-deep border border-dashed border-white/10 rounded-[3rem]">
                <CheckCircle2 size={48} className="mx-auto mb-6 text-green-500/20" />
                <h4 className="text-xl font-display font-black uppercase italic mb-2">Maximum Safety Reached</h4>
                <p className="text-sm text-white/40 font-bold">No active reports found in the system queue.</p>
             </div>
           )}
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic">Moderation History</h3>
           <div className="bg-ink-deep border border-white/5 rounded-[2.5rem] divide-y divide-white/5 overflow-hidden">
              {pastReports.map((report) => (
                <div 
                  key={report.id} 
                  className="p-6 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  onClick={() => navigate(`/admin/reports/${report.id}`)}
                >
                   <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm truncate group-hover:text-lemon-muted">{report.targetName}</p>
                      <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                         report.status === 'resolved' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/30"
                       )}>{report.status}</span>
                   </div>
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{report.reason}</p>
                </div>
              ))}
              {pastReports.length === 0 && (
                <div className="p-10 text-center text-white/20 text-xs font-black uppercase tracking-widest italic">
                  No history recorded.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Report Summary Modal Overlay */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedReport(null)}
               className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-ink-deep border border-white/10 rounded-[3rem] shadow-2xl z-[110] overflow-hidden"
            >
               <div className="p-8 bg-red-500/10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-black">
                        <Flag size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-display font-black uppercase italic leading-none">Security Report #{selectedReport.id}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mt-1.5 focus:outline-none">Action required: Critical Review</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedReport(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                     <XCircle size={24} />
                  </button>
               </div>

               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Content</p>
                        <p className="text-sm font-bold text-white/80">{selectedReport.type.toUpperCase()}: {selectedReport.targetName}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Reporter Identity</p>
                        <p className="text-sm font-bold text-white/80">@{selectedReport.reportedBy}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Violation Detail</p>
                     <div className="p-6 bg-black rounded-2xl border border-white/5 text-sm font-medium leading-relaxed italic text-white/60">
                        "{selectedReport.message}"
                     </div>
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={() => navigate(`/admin/${selectedReport.type === 'story' ? 'stories' : 'users'}/${selectedReport.id}`)}
                        className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                      >
                        <Eye size={16} /> View Context
                      </button>
                      <button 
                        onClick={() => alert(`Warning issued to user of ${selectedReport.targetName} (Mock)`)}
                        className="flex-1 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all"
                      >
                        <ShieldAlert size={16} /> Issue Warning
                      </button>
                  </div>
               </div>

               <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
                  <button 
                     onClick={() => { resolveReport(selectedReport.id, 'dismissed'); setSelectedReport(null); alert('Report Dismissed (Mock)'); }}
                     className="flex-1 h-14 bg-white/5 border border-white/5 text-white/40 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                     Dismiss
                  </button>
                  <button 
                     onClick={() => { resolveReport(selectedReport.id, 'resolved'); setSelectedReport(null); alert('Report Resolved (Mock)'); }}
                     className="flex-1 h-14 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
                  >
                     Resolve Case
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
