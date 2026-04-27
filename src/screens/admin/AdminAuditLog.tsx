import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  Shield, 
  User, 
  Database,
  Calendar,
  MoreVertical,
  Activity,
  CheckCircle
} from 'lucide-react';

const MOCK_AUDIT = [
  { id: '1', admin: 'admin@lemonade.com', event: 'Changed DB Policy', type: 'system', date: '2h ago', level: 'high' },
  { id: '2', admin: 'mod_sarah@lemonade.com', event: 'Deleted Report #293', type: 'moderation', date: '4h ago', level: 'medium' },
  { id: '3', admin: 'superadmin@lemonade.com', event: 'Added Moderator: riderezzy', type: 'access', date: 'Yesterday', level: 'critical' },
  { id: '4', admin: 'admin@lemonade.com', event: 'Cleaned Temp Assets', type: 'system', date: 'Yesterday', level: 'low' },
  { id: '5', admin: 'mod_sarah@lemonade.com', event: 'Modified Story: Midnight', type: 'content', date: '2 days ago', level: 'medium' },
];

export default function AdminAuditLog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const handleExport = () => {
    alert('Preparing audit log data for export... (Mock Download)');
  };

  const viewLogDetail = (id: string) => {
    alert(`Viewing cryptographic trace for event #${id}. (Mock)`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Settings</span>
        </button>

        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
        >
          <Download size={20} />
          Export All Logs
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Audit Log</h1>
          <p className="text-white/40 font-bold">Immutable record of all system-level and sensitive admin events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search events, admin emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <select className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none appearance-none">
            <option>All Event Types</option>
            <option>System</option>
            <option>Access Control</option>
            <option>Moderation</option>
            <option>Content</option>
          </select>
        </div>
        <div className="relative">
          <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <select className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none appearance-none">
            <option>All Severity</option>
            <option>Critical Only</option>
            <option>High/Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-ink-deep border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                 <span className="text-xs font-black uppercase tracking-widest text-white/40">Live Logging Active</span>
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="text-xs font-bold text-white/20 italic">548 events in the last 24h</div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Timestamp</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Admin</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Event Detail</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Event Type</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Severity</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AUDIT.filter(log => 
                log.event.toLowerCase().includes(searchTerm.toLowerCase()) || 
                log.admin.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-white/40 font-bold text-sm">
                       <Clock size={14} />
                       {log.date}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-bold text-lemon-muted cursor-pointer" onClick={() => alert(`Navigating to profile of ${log.admin} (Mock)`)}>@{log.admin.split('@')[0]}</span>
                  </td>
                  <td className="p-6 font-bold text-sm tracking-tight">{log.event}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                       {log.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${
                      log.level === 'critical' ? 'text-red-400' :
                      log.level === 'high' ? 'text-orange-400' :
                      log.level === 'medium' ? 'text-blue-400' :
                      'text-white/30'
                    }`}>
                      <Shield size={12} />
                      {log.level}
                    </div>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => viewLogDetail(log.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition-all"
                    >
                       <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
               <Database size={32} />
            </div>
            <h4 className="font-black text-xl mb-1 italic uppercase">Database Sync</h4>
            <p className="text-xs font-bold text-green-400 mb-6 flex items-center gap-1">
               <CheckCircle size={12} /> Connected & Secure
            </p>
            <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Manage Data Policies</button>
         </div>
         <div className="md:col-span-2 p-8 bg-ink-deep border border-white/5 rounded-[40px]">
            <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Security Overview</h3>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Failed Auth Attempts</p>
                  <p className="text-3xl font-display font-black italic">14</p>
                  <p className="text-[10px] font-bold text-red-400 mt-1 italic">Blocked by IP security</p>
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Active Admin Sessions</p>
                  <p className="text-3xl font-display font-black italic text-lemon-muted">3</p>
                  <p className="text-[10px] font-bold text-white/20 mt-1 italic">All within the last 15 mins</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
