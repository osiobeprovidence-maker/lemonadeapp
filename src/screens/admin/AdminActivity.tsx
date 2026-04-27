import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  User, 
  Clock, 
  FileText, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MOCK_ACTIVITY = [
  { 
    id: '1', 
    admin: 'admin@lemonade.com', 
    action: 'Suspended User', 
    target: 'riderezzy', 
    targetType: 'user',
    targetPath: '/admin/users/riderezzy',
    date: '2 minutes ago',
    ip: '192.168.1.1'
  },
  { 
    id: '2', 
    admin: 'mod_sarah@lemonade.com', 
    action: 'Approved Story', 
    target: 'Midnight Chronicles', 
    targetType: 'story',
    targetPath: '/admin/stories/story-1',
    date: '15 minutes ago',
    ip: '192.168.1.45'
  },
  { 
    id: '3', 
    admin: 'admin@lemonade.com', 
    action: 'Removed Report', 
    target: 'Report #4293', 
    targetType: 'report',
    targetPath: '/admin/reports/4293',
    date: '1 hour ago',
    ip: '192.168.1.1'
  },
  { 
    id: '4', 
    admin: 'superadmin@lemonade.com', 
    action: 'Changed Featured Content', 
    target: 'Hero Section', 
    targetType: 'featured',
    targetPath: '/admin/featured',
    date: '3 hours ago',
    ip: '10.0.0.8'
  },
  { 
    id: '5', 
    admin: 'mod_sarah@lemonade.com', 
    action: 'Rejected Application', 
    target: 'John Doe', 
    targetType: 'application',
    targetPath: '/admin/applications/app-123',
    date: 'Yesterday',
    ip: '192.168.2.12'
  }
];

export default function AdminActivity() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = () => {
    alert('Mock Activity Log Exported as CSV');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase italic">Activity Log</h1>
          <p className="text-white/40 font-bold">Track all administrative actions on the platform.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
        >
          <Download size={20} />
          Export Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search activity, admins, or targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <select className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors appearance-none">
            <option>All Actions</option>
            <option>User Actions</option>
            <option>Story Actions</option>
            <option>Content Changes</option>
            <option>Moderation</option>
          </select>
        </div>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <select className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors appearance-none">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div className="bg-ink-deep border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Admin</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Action</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Target</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">IP Address</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Date</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Details</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACTIVITY.filter(item => 
                item.admin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.action.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={14} className="text-white/40" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.admin}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-medium">{item.action}</span>
                  </td>
                  <td className="p-6">
                    <Link to={item.targetPath} className="flex items-center gap-2 text-lemon-muted hover:underline group">
                      <span className="text-sm font-bold truncate max-w-[120px]">{item.target}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="p-6 text-sm text-white/40 font-mono italic">{item.ip}</td>
                  <td className="p-6 text-sm text-white/60">{item.date}</td>
                  <td className="p-6 text-right">
                    <Link 
                      to={item.targetPath}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-lemon-muted hover:text-black flex items-center justify-center transition-all group ml-auto"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Activity Cards (Alternative for small screens) */}
      <div className="md:hidden space-y-4">
        {MOCK_ACTIVITY.filter(item => 
          item.admin.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.action.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((item) => (
          <Link 
            key={item.id}
            to={item.targetPath}
            className="block p-5 bg-ink-deep border border-white/5 rounded-2xl hover:bg-white/5 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.date}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/10 px-2 py-0.5 rounded">{item.targetType}</span>
            </div>
            <p className="font-bold mb-1">{item.admin}</p>
            <p className="text-sm text-white/60 mb-3">{item.action} <span className="text-lemon-muted">"{item.target}"</span></p>
            <div className="flex items-center justify-between text-xs text-white/30">
               <span className="font-mono">{item.ip}</span>
               <div className="flex items-center gap-1 text-lemon-muted">
                 View detail <ChevronRight size={12} />
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
