import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Wallet, 
  Clock, 
  Ban, 
  CheckCircle, 
  History, 
  Heart, 
  BookOpen, 
  Bell, 
  StickyNote,
  ChevronLeft,
  ExternalLink,
  MoreVertical,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('active');

  // Mock data
  const user = {
    id: userId,
    username: 'riderezzy',
    email: 'riderezzy@gmail.com',
    role: 'super_admin',
    premium: true,
    walletBalance: 2450,
    joinedDate: 'Oct 12, 2025',
    status: status,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    bio: 'Avid reader and occasional critic. Love psychological thrillers.',
    location: 'Berlin, Germany'
  };

  const handleToggleStatus = () => {
    setStatus(status === 'active' ? 'suspended' : 'active');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Users</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${
              status === 'active' 
                ? 'bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white' 
                : 'bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-white'
            }`}
          >
            {status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
            {status === 'active' ? 'Suspend User' : 'Activate User'}
          </button>
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] text-center">
             <div className="relative w-32 h-32 mx-auto mb-6">
               <img 
                 src={user.avatar} 
                 alt={user.username}
                 className="w-full h-full rounded-[40px] object-cover ring-4 ring-white/5 shadow-2xl"
               />
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-lemon-muted rounded-2xl flex items-center justify-center text-black border-4 border-ink-deep">
                 <Shield size={20} />
               </div>
             </div>
             <h2 className="text-2xl font-display font-black tracking-tight uppercase italic">{user.username}</h2>
             <p className="text-white/40 font-bold mb-6 text-sm">{user.email}</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Status</p>
                   <p className={`text-sm font-bold capitalize ${status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{status}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Role</p>
                   <p className="text-sm font-bold text-lemon-muted capitalize">{user.role.replace('_', ' ')}</p>
                </div>
             </div>

             <Link 
               to={`/profile`}
               className="flex items-center justify-center gap-2 w-full mt-6 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
             >
               View Public Profile
               <ExternalLink size={16} />
             </Link>
          </div>

          {/* Quick Stats */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                      <Wallet size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Wallet Balance</p>
                      <p className="text-lg font-black italic">{user.walletBalance} Lemons</p>
                   </div>
                   <button className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all">Reset</button>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                      <Shield size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Premium Status</p>
                      <p className="text-lg font-black italic">{user.premium ? 'Active' : 'Free Tier'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                      <Calendar size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Joined Date</p>
                      <p className="text-lg font-black italic">{user.joinedDate}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Internal Notes */}
              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
                 <div className="flex items-center gap-2 mb-6">
                    <StickyNote size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Admin Notes</h3>
                 </div>
                 <textarea 
                   placeholder="Add a private note about this user..."
                   className="w-full flex-1 bg-white/5 border border-white/5 rounded-2xl p-6 font-medium text-sm focus:outline-none focus:border-lemon-muted/50 transition-all resize-none min-h-[150px]"
                 />
                 <button className="w-full mt-4 py-3 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Add Note
                 </button>
              </div>

              {/* Account History / Activity Preview */}
              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Clock size={20} className="text-lemon-muted" />
                       <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Recent Log</h3>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-lemon-muted transition-colors">View All</button>
                 </div>
                 <div className="space-y-4">
                    {[
                      { action: 'Unlocked Chapter 12', target: 'Neon Desires', date: '5h ago' },
                      { action: 'Bought 500 Lemons', target: 'Stripe Pay', date: '2d ago' },
                      { action: 'Reported Story', target: 'ID: 4293', date: '3d ago' },
                      { action: 'Changed Username', target: 'riderezzy', date: '1w ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 border-dashed">
                        <div>
                          <p className="text-sm font-bold">{activity.action}</p>
                          <p className="text-[10px] font-black uppercase text-white/30">{activity.target}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-white/30">{activity.date}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Tabs section for more detail */}
           <div className="bg-ink-deep border border-white/5 rounded-[40px] overflow-hidden">
              <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                 {['Saved Stories', 'Reading History', 'Support History', 'Unlock History', 'Followed Creators'].map((tab, i) => (
                   <button 
                     key={tab}
                     className={`px-8 py-6 text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                       i === 0 ? 'border-lemon-muted text-lemon-muted bg-lemon-muted/5' : 'border-transparent text-white/40 hover:text-white'
                     }`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
              <div className="p-8 min-h-[300px]">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-16 h-20 bg-white/10 rounded-lg overflow-hidden shrink-0">
                           <img src={`https://picsum.photos/seed/${item+20}/100/150`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold truncate text-sm">Story Title {item}</p>
                           <p className="text-xs text-white/40 font-bold mb-3">Chapter 12 of 24</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase text-lemon-muted bg-lemon-muted/10 px-2 py-0.5 rounded">Saved 2d ago</span>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
