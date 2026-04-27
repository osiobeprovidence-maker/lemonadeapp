import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Star, 
  TrendingUp, 
  Shield, 
  ExternalLink, 
  ChevronLeft,
  Ban,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Layers,
  Clock,
  Heart,
  MessageSquare,
  DollarSign,
  FileText,
  BadgeCheck,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminStoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('published');
  const [isFeatured, setIsFeatured] = useState(false);

  // Mock data
  const story = {
    id: storyId || 'story-123',
    title: 'Midnight Chronicles',
    creator: 'artistic_soul',
    format: 'Comic',
    genre: 'Psychological Thriller',
    status: status,
    reads: '12.4k',
    saves: '842',
    rating: '4.8',
    uploadDate: 'Mar 15, 2026',
    monetization: 'Premium',
    totalChapters: 24,
    cover: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=300&h=450&fit=crop',
    description: 'When the clock strikes twelve, the shadows in the city come alive. No one is safe from the secrets hidden in the dark.'
  };

  const handleToggleStatus = () => {
    setStatus(status === 'published' ? 'rejected' : 'published');
  };

  const handleToggleFeatured = () => {
    setIsFeatured(!isFeatured);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/stories')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Stories</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleFeatured}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${
              isFeatured 
                ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <BadgeCheck size={18} />
            {isFeatured ? 'Featured Content' : 'Feature this Story'}
          </button>
          <button 
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-6 h-12 rounded-xl font-bold transition-all ${
              status === 'published' 
                ? 'bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white' 
                : 'bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-white'
            }`}
          >
            {status === 'published' ? <Ban size={18} /> : <CheckCircle size={18} />}
            {status === 'published' ? 'Reject Story' : 'Approve Story'}
          </button>
          <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          {/* Story Cover Card */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] text-center">
             <div className="relative w-48 h-64 mx-auto mb-6 shadow-2xl group overflow-hidden rounded-[24px]">
               <img 
                 src={story.cover} 
                 alt={story.title}
                 className="w-full h-full object-cover transition-transform group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                     <ExternalLink size={24} />
                  </button>
               </div>
             </div>
             <h2 className="text-2xl font-display font-black tracking-tight uppercase italic mb-2 leading-tight">{story.title}</h2>
             <Link 
               to={`/creator/${story.creator}`}
               className="text-lemon-muted font-bold mb-6 block hover:underline"
             >
               @{story.creator}
             </Link>
             
             <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Format</p>
                   <p className="text-sm font-bold">{story.format}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Monetization</p>
                   <p className="text-sm font-bold text-lemon-muted">{story.monetization}</p>
                </div>
             </div>

             <Link 
               to={`/story/${story.id}`}
               className="flex items-center justify-center gap-2 w-full mt-6 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
             >
               View Public Page
               <ExternalLink size={16} />
             </Link>
          </div>

          {/* Engagement Stats */}
          <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
             <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-6 italic">Performance Metrics</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-lemon-muted/10 flex items-center justify-center text-lemon-muted">
                      <BookOpen size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Total Reads</p>
                      <p className="text-lg font-black italic">{story.reads}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                      <Heart size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Saves</p>
                      <p className="text-lg font-black italic">{story.saves}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                      <Star size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">Rating</p>
                      <p className="text-lg font-black italic">{story.rating}/5.0</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           {/* Detailed Info Card */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <FileText size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Content Summary</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/5">{story.genre}</span>
                 </div>
              </div>
              
              <div className="mb-8">
                 <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Description</p>
                 <p className="text-white/80 leading-relaxed font-medium">
                    {story.description}
                 </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5 border-dashed">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Chapters</p>
                    <p className="text-lg font-black">{story.totalChapters}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Uploaded</p>
                    <p className="text-lg font-black">{story.uploadDate}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Reports</p>
                    <p className="text-lg font-black text-red-400">0</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Earnings</p>
                    <p className="text-lg font-black text-green-400">$420</p>
                 </div>
              </div>
           </div>

           {/* Chapter List Card */}
           <div className="bg-ink-deep border border-white/5 rounded-[40px] overflow-hidden">
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-2">
                    <Layers size={20} className="text-lemon-muted" />
                    <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Chapter Management</h3>
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                    Reorder Chapters
                 </button>
              </div>
              <div className="p-0 overflow-y-auto max-h-[500px]">
                 {[...Array(10)].map((_, i) => (
                   <div key={i} className="flex items-center justify-between p-6 hover:bg-white/2 border-b border-white/5 last:border-0 transition-colors group">
                      <div className="flex items-center gap-6">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-lemon-muted group-hover:text-black transition-colors">
                            {i + 1}
                         </div>
                         <div>
                            <p className="font-bold text-sm">The Awakening of Shadows Part {i+1}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <p className="text-[10px] font-black uppercase text-white/30">{i < 3 ? 'Free' : 'Premium'}</p>
                               <div className="w-1 h-1 rounded-full bg-white/10" />
                               <p className="text-[10px] font-black uppercase text-white/30">1.2k reads</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                            <FileText size={18} className="text-white/40" />
                         </button>
                         <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-400/10 hover:text-red-400 flex items-center justify-center transition-all">
                            <MoreVertical size={18} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-6 bg-white/5 border-t border-white/5 text-center">
                 <button className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Load more chapters</button>
              </div>
           </div>

           {/* Final Admin Action Panel */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Monetization Settings</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                       <span className="font-bold text-sm">Premium Lock</span>
                       <button className="w-12 h-6 bg-lemon-muted rounded-full relative px-1">
                          <div className="w-4 h-4 bg-black rounded-full absolute right-1 top-1" />
                       </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                       <span className="font-bold text-sm">Ad Revenue Share</span>
                       <span className="font-black text-lemon-muted">70%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl opacity-50">
                       <span className="font-bold text-sm">Exclusive Content</span>
                       <button className="w-12 h-6 bg-white/10 rounded-full relative px-1">
                          <div className="w-4 h-4 bg-white/40 rounded-full absolute left-1 top-1" />
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex flex-col">
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic mb-6">Admin Logs</h3>
                 <div className="flex-1 space-y-4 mb-6">
                    <div className="text-[10px] space-y-2">
                       <p className="text-white/60"><span className="text-lemon-muted">Apr 24:</span> Story featured by superadmin</p>
                       <p className="text-white/60"><span className="text-lemon-muted">Apr 20:</span> Chapter 24 approved by mod_sarah</p>
                       <p className="text-white/60"><span className="text-lemon-muted">Mar 15:</span> Story created by artistic_soul</p>
                    </div>
                 </div>
                 <button className="w-full py-4 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Add Admin Note</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
