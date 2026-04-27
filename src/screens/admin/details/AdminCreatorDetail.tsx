import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  PenTool, 
  BookOpen, 
  TrendingUp, 
  ExternalLink, 
  ChevronLeft,
  Ban,
  CheckCircle,
  Shield,
  Star,
  Users,
  MessageSquare,
  FileText,
  MousePointer2,
  AlertCircle,
  MoreVertical,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCreatorDetail() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('active');

  // Mock data
  const creator = {
    username: username || 'artistic_soul',
    name: 'Sarah Parker',
    email: 'sarah@example.com',
    category: 'Manga / Webtoon',
    followers: '12.4k',
    totalReads: '450k',
    totalStories: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    joinedDate: 'Jan 5, 2025',
    status: status,
    creatorAccessStatus: 'verified',
    dropSomethingUrl: 'https://dropsomething.com/artistic_soul',
    portfolioUrl: 'https://behance.net/artistic_soul',
    isFeatured: true
  };

  const handleToggleStatus = () => {
    setStatus(status === 'active' ? 'suspended' : 'active');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/creators')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Creators</span>
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
            {status === 'active' ? 'Suspend Creator' : 'Activate Creator'}
          </button>
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          {/* Creator Profile Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] text-center">
             <div className="relative w-32 h-32 mx-auto mb-6">
               <img 
                 src={creator.avatar} 
                 alt={creator.username}
                 className="w-full h-full rounded-[40px] object-cover ring-4 ring-white/5 shadow-2xl"
               />
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-lemon-muted rounded-2xl flex items-center justify-center text-black border-4 border-ink-deep">
                 <PenTool size={20} />
               </div>
             </div>
             <h2 className="text-2xl font-display font-black tracking-tight uppercase italic">{creator.username}</h2>
             <p className="text-white/40 font-bold mb-3 text-sm">{creator.name}</p>
             <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">{creator.category}</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Status</p>
                   <p className={`text-sm font-bold capitalize ${status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{status}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Badge</p>
                   <p className="text-sm font-bold text-lemon-muted capitalize">{creator.creatorAccessStatus}</p>
                </div>
             </div>

             <div className="flex flex-col gap-3 mt-6">
                <Link 
                  to={`/creator/${creator.username}`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                >
                  View Public Page
                  <ExternalLink size={16} />
                </Link>
                <Link 
                  to={`/creator/${creator.username}/portfolio`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                >
                  View Portfolio
                  <Briefcase size={16} />
                </Link>
             </div>
          </div>

          {/* Quick Stats */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                      <Users size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Followers</p>
                      <p className="text-lg font-black italic">{creator.followers}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                      <BookOpen size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Total Reads</p>
                      <p className="text-lg font-black italic">{creator.totalReads}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                      <TrendingUp size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Ranking</p>
                      <p className="text-lg font-black italic">Top 5%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* DropSomething Link Status */}
              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <MousePointer2 size={20} className="text-lemon-muted" />
                       <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Support Link</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-green-400/10 text-green-400 px-2 py-0.5 rounded border border-green-400/20">Verified</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                    <p className="text-sm font-bold truncate text-white/60 mb-2">{creator.dropSomethingUrl}</p>
                    <div className="flex items-center gap-4">
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white/30">Clicks</p>
                          <p className="text-lg font-black">1,284</p>
                       </div>
                       <div className="w-[1px] h-8 bg-white/10" />
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white/30">Last Click</p>
                          <p className="text-xs font-bold text-white/60 italic">2 mins ago</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Re-Verify</button>
                    <button className="flex-1 py-3 bg-red-400/10 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all">Disable</button>
                 </div>
              </div>

              {/* Reports / Governance */}
              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <AlertCircle size={20} className="text-orange-400" />
                       <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Governance</h3>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-orange-400/5 rounded-2xl border border-orange-400/20 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-orange-400">2 Active Reports</p>
                          <p className="text-[10px] font-bold text-white/40">Potential copyright infringement</p>
                       </div>
                       <button className="p-2 rounded-lg bg-orange-400/10 text-orange-400 hover:bg-orange-400 hover:text-black transition-all">
                          <ExternalLink size={16} />
                       </button>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between opacity-50">
                       <div>
                          <p className="text-sm font-bold">Closed Reports</p>
                          <p className="text-[10px] font-bold text-white/40">15 resolved satisfactorily</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Creator Works Section */}
           <div className="bg-ink-deep border border-white/5 rounded-[40px] overflow-hidden">
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                 <h3 className="text-xl font-display font-black tracking-tight uppercase italic">Published Stories ({creator.totalStories})</h3>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Add Legacy Work
                 </button>
              </div>
              <div className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-lemon-muted/5 transition-colors">
                        <div className="w-24 h-32 bg-white/10 rounded-2xl overflow-hidden shrink-0 shadow-xl group-hover:scale-105 transition-transform">
                           <img src={`https://picsum.photos/seed/${item+50}/200/300`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 py-2">
                           <h4 className="font-bold truncate text-lg group-hover:text-lemon-muted transition-colors">Digital Mirage {item}</h4>
                           <p className="text-xs text-white/40 font-bold mb-4 italic">Updated 3 days ago</p>
                           <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                 <BookOpen size={12} className="text-lemon-muted" />
                                 <span className="text-[10px] font-black uppercase text-white/60">4.2k reads</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-white/10" />
                              <div className="flex items-center gap-1">
                                 <Star size={12} className="text-yellow-400" />
                                 <span className="text-[10px] font-black uppercase text-white/60">4.9/5</span>
                              </div>
                           </div>
                           <Link 
                             to={`/admin/stories/story-${item}`}
                             className="mt-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-lemon-muted hover:underline"
                           >
                             Manage Story <ExternalLink size={10} />
                           </Link>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Admin Internal History Tab */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Internal Audit Log</h3>
                 <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Filter Logs</button>
              </div>
              <div className="space-y-4">
                 {[
                   { date: 'Apr 25, 2026', admin: 'superadmin@lemonade.com', action: 'Verified DropSomething Link', note: 'Checked and confirmed valid' },
                   { date: 'Mar 12, 2026', admin: 'mod_sarah@lemonade.com', action: 'Approved New Story', note: '"Digital Mirage" meets standards' },
                   { date: 'Jan 10, 2026', admin: 'superadmin@lemonade.com', action: 'Granted Creator Access', note: 'Portfolio review complete' },
                 ].map((log, i) => (
                   <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 relative group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                         <p className="text-sm font-bold text-lemon-muted">{log.action}</p>
                         <span className="text-[10px] font-black uppercase text-white/30">{log.date}</span>
                      </div>
                      <p className="text-xs text-white/60 mb-2 italic">"{log.note}"</p>
                      <p className="text-[10px] font-black uppercase text-white/20">Admin: <span className="text-white/40">{log.admin}</span></p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
