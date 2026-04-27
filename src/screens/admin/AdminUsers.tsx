import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  UserMinus, 
  UserCheck, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Eye,
  Activity
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

export default function AdminUsers() {
  const { allUsers, updateUserStatus, updateUserRole } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'readers' | 'creators' | 'premium' | 'suspended'>('all');

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'readers') return u.role === 'reader';
    if (filter === 'creators') return u.role === 'creator';
    if (filter === 'premium') return u.premiumStatus === 'premium';
    if (filter === 'suspended') return (u as any).status === 'suspended';
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">User Management</h2>
           <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">Control and protect the community</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-ink-deep border border-white/5 rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{allUsers.length} Users Total</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lemon-muted transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-ink-deep border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-lemon-muted/50 transition-all"
          />
        </div>
        <div className="flex bg-ink-deep p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto scrollbar-hide">
          {(['all', 'readers', 'creators', 'premium', 'suspended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f ? "bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10" : "text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-ink-deep border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">User Profile</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Role</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Premium</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Wallet</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.01] transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                     <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-2xl object-cover bg-black-core border border-white/10" />
                     <div>
                        <p className="font-bold text-white group-hover:text-lemon-muted transition-colors">{u.name}</p>
                        <p className="text-xs text-white/30 font-medium">@{u.username}</p>
                     </div>
                  </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
                        u.role === 'creator' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {u.role}
                      </span>
                   </div>
                </td>
                <td className="p-6">
                   {u.premiumStatus === 'premium' ? (
                     <div className="flex items-center gap-2 text-lemon-muted">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                     </div>
                   ) : (
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Free</span>
                   )}
                </td>
                <td className="p-6">
                   <div className="text-sm font-bold text-white/80">₦{(u.walletBalance ?? 0).toLocaleString()}</div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        (u as any).status === 'suspended' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {(u as any).status || 'Active'}
                      </span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/users/${u.id || u.username}`)}
                        className="w-10 h-10 rounded-xl bg-lemon-muted/10 text-lemon-muted flex items-center justify-center hover:bg-lemon-muted hover:text-black transition-all shadow-lg shadow-lemon-muted/10"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {(u as any).status === 'suspended' ? (
                        <button 
                          onClick={() => updateUserStatus(u.id, 'active')}
                          className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                          title="Unsuspend"
                        >
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateUserStatus(u.id, 'suspended')}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                          title="Suspend"
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                      
                      <div className="relative group/menu">
                        <button className="w-10 h-10 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl z-50 py-2 opacity-0 scale-95 pointer-events-none group-focus-within/menu:opacity-100 group-focus-within/menu:scale-100 group-focus-within/menu:pointer-events-auto transition-all origin-top-right">
                           <button 
                            onClick={() => {
                              updateUserRole(u.id, u.role === 'creator' ? 'reader' : 'creator');
                              alert(`Role changed for ${u.name} (Mock)`);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                           >
                              <Shield size={16} className="text-purple-400" />
                              Change Role
                           </button>
                           <button 
                            onClick={() => navigate(`/admin/activity?userId=${u.id}`)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                           >
                              <Activity size={16} className="text-blue-400" />
                              View Activity
                           </button>
                        </div>
                      </div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredUsers.map((u) => (
          <div key={u.id} className="bg-ink-deep border border-white/5 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <img src={u.avatar} alt={u.name} className="w-14 h-14 rounded-2xl object-cover bg-black-core border border-white/10" />
                 <div onClick={() => navigate(`/admin/users/${u.id || u.username}`)}>
                    <p className="font-bold text-white group-hover:text-lemon-muted">{u.name}</p>
                    <p className="text-xs text-white/30 font-medium">@{u.username}</p>
                 </div>
              </div>
              <div className={cn(
                "w-3 h-3 rounded-full border-2 border-black",
                (u as any).status === 'suspended' ? "bg-red-500" : "bg-green-500"
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Role</p>
                  <p className={cn(
                    "text-xs font-black uppercase text-purple-500",
                    u.role === 'reader' && "text-blue-500"
                  )}>{u.role}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Wallet</p>
                  <p className="text-xs font-black text-white">₦{(u.walletBalance ?? 0).toLocaleString()}</p>
               </div>
            </div>

            <div className="flex gap-2">
               <button 
                onClick={() => navigate(`/admin/users/${u.id || u.username}`)}
                className="flex-1 h-12 bg-lemon-muted text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Eye size={16} /> View
               </button>
               {(u as any).status === 'suspended' ? (
                  <button 
                    onClick={() => updateUserStatus(u.id, 'active')}
                    className="flex-1 h-12 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <UserCheck size={16} /> Active
                  </button>
               ) : (
                  <button 
                    onClick={() => updateUserStatus(u.id, 'suspended')}
                    className="flex-1 h-12 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <UserMinus size={16} /> Suspend
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
