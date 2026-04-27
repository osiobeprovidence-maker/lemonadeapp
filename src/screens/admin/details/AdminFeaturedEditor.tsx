import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Search, 
  Plus, 
  X, 
  GripVertical, 
  Eye, 
  Layout, 
  TrendingUp, 
  Star, 
  Clock, 
  BadgeCheck,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const MOCK_SECTIONS = [
  { id: 'hero', label: 'Hero Featured Story', icon: Star },
  { id: 'trending', label: 'Trending Now', icon: TrendingUp },
  { id: 'new_drops', label: 'New Drops', icon: Clock },
  { id: 'originals', label: 'Lemonade Originals', icon: BadgeCheck },
  { id: 'creators', label: 'Featured Creators', icon: BadgeCheck },
];

const MOCK_STORIES = [
  { id: '1', title: 'Midnight Chronicles', creator: 'artistic_soul', cover: 'https://picsum.photos/seed/1/200/300' },
  { id: '2', title: 'Neon Desires', creator: 'cyberpunk_queen', cover: 'https://picsum.photos/seed/2/200/300' },
  { id: '3', title: 'The Silent Script', creator: 'ink_master', cover: 'https://picsum.photos/seed/3/200/300' },
  { id: '4', title: 'Lemonade Summer', creator: 'fresh_vibes', cover: 'https://picsum.photos/seed/4/200/300' },
];

export default function AdminFeaturedEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  const [activeSection, setActiveSection] = useState('hero');
  const [items, setItems] = useState(MOCK_STORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');

  const handleSave = () => {
    alert('Featured content configuration saved (Mock)');
    navigate('/admin/featured');
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/featured')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold">Back to Featured</span>
        </button>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 h-12 bg-lemon-muted text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lemon-muted/20"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           {/* Section Selector */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic text-center">Featured Sections</h3>
              <div className="space-y-2">
                 {MOCK_SECTIONS.map((section) => (
                   <button 
                     key={section.id}
                     onClick={() => setActiveSection(section.id)}
                     className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                       activeSection === section.id 
                        ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/10' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                     }`}
                   >
                     <section.icon size={18} />
                     <span className="font-bold text-sm tracking-tight">{section.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Add Items Search */}
           <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 italic text-center">Add Content</h3>
              <div className="relative mb-6">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search stories..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-lemon-muted/50"
                 />
              </div>
              <div className="space-y-3">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden">
                            <img src={`https://picsum.photos/seed/${i+100}/100/150`} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs truncate">Future Echoes {i+1}</p>
                            <p className="text-[10px] font-black uppercase text-white/30 truncate">by @writer_x</p>
                         </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-lemon-muted text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                         <Plus size={16} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           {/* Editor View */}
           <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <div>
                    <h2 className="text-3xl font-display font-black tracking-tight uppercase italic mb-2">
                       {MOCK_SECTIONS.find(s => s.id === activeSection)?.label}
                    </h2>
                    <p className="text-white/40 font-bold">Drag and drop to reorder items in this section.</p>
                 </div>
                 <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20' : 'text-white/40 hover:text-white'}`}
                    >
                       <Smartphone size={20} />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('tablet')}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === 'tablet' ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20' : 'text-white/40 hover:text-white'}`}
                    >
                       <Tablet size={20} />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-lemon-muted text-black shadow-lg shadow-lemon-muted/20' : 'text-white/40 hover:text-white'}`}
                    >
                       <Monitor size={20} />
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
                    {items.map((item) => (
                      <Reorder.Item 
                        key={item.id} 
                        value={item}
                        className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors group"
                      >
                         <GripVertical size={20} className="text-white/10 group-hover:text-white/30" />
                         <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden shrink-0 shadow-lg">
                            <img src={item.cover} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-black">{item.title}</h4>
                            <p className="text-sm font-bold text-lemon-muted">@{item.creator}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                               <Eye size={20} />
                            </button>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-400 hover:text-white flex items-center justify-center transition-all"
                            >
                               <X size={20} />
                            </button>
                         </div>
                      </Reorder.Item>
                    ))}
                 </Reorder.Group>
                 
                 {items.length === 0 && (
                   <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[40px]">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                         <Layout size={40} className="text-white/20" />
                      </div>
                      <p className="text-xl font-display font-black text-white/30 tracking-tight uppercase italic mb-2">Section is empty</p>
                      <p className="text-white/20 font-bold text-center max-w-sm">Use the search panel on the left to add items to the {activeSection} section.</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Live Preview / Metadata */}
           <div className="p-10 bg-ink-deep border border-white/5 rounded-[40px]">
              <div className="flex items-center gap-2 mb-8">
                 <Eye size={20} className="text-lemon-muted" />
                 <h3 className="text-lg font-display font-black tracking-tight uppercase italic">Live Section Metadata</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Display Title (Optional)</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Explosive Trending"
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Max Display Count</label>
                       <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none appearance-none">
                          <option>5 Items</option>
                          <option>10 Items</option>
                          <option>Unlimited</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Section Background</label>
                       <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                          <div className="w-14 h-14 rounded-2xl bg-lemon-muted/10 border border-lemon-muted/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                          <div className="w-14 h-14 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center font-bold text-xs text-white/40">Custom</div>
                       </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Animation Style</label>
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                           {['Stagger', 'Fade', 'Slide', 'None'].map(anim => (
                             <button key={anim} className="px-4 py-3 h-14 whitespace-nowrap bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:border-lemon-muted transition-colors">
                               {anim}
                             </button>
                           ))}
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
