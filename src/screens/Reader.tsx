import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, MessageCircle, Heart, Share, Settings2, Lock, ChevronRight, Flag, ArrowLeft, MoreVertical, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';

export default function Reader() {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  const { stories, user, trackReading, unlockChapter } = useApp();
  const story = stories.find(s => s.id === id) || stories[0];

  const chapterId = `c${chapterNum}`;
  const isPaid = parseInt(chapterNum || '1') > 3;
  const isUnlocked = !isPaid || user?.unlockedChapters.includes(`${id}-${chapterId}`) || user?.isPremium;
  const price = 10; // Default price

  const [showUI, setShowUI] = useState(true);
  const [fontSize, setFontSize] = useState<number>(user?.settings.readerFontSize || 18);
  const [theme, setTheme] = useState<'dark' | 'cream'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Wrong content');
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const isNovel = story.format === 'Novel';

  // Track reading
  useEffect(() => {
    if (isUnlocked && id && chapterNum) {
      trackReading(id, chapterId);
    }
  }, [id, chapterNum, isUnlocked]);

  // Auto-hide UI when scrolling
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY && showUI) {
        setShowUI(false);
        setShowSettings(false);
      } else if (currentScrollY < lastScrollY - 20 && !showUI) {
        setShowUI(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showUI]);

  if (!isUnlocked) {
    return <LockedReaderScreen story={story} chapterNum={chapterNum || '1'} price={price} />;
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300", theme === 'dark' ? "bg-black-core text-cream-soft" : "bg-[#f5f5f0] text-black")}>
      
      {/* Top Header */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black-core/90 text-white backdrop-blur-xl border-b border-white/10"
          >
             <div className="flex items-center justify-between px-4 h-16 pt-safe pb-safe">
               <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                 <ChevronLeft size={24} />
               </button>
               <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
                 <h3 className="font-display font-medium text-sm truncate w-full text-center">{story.title}</h3>
                 <span className="text-[10px] text-white/50 uppercase tracking-widest font-black truncate w-full text-center">Chapter {chapterNum}</span>
               </div>
               <div className="flex items-center gap-1">
                 {isNovel && (
                   <button onClick={() => { setShowSettings(!showSettings); setShowMoreMenu(false); }} className={cn("p-2 rounded-full hover:bg-white/10 transition-colors", showSettings && "bg-white/10")}>
                     <Settings2 size={20} />
                   </button>
                 )}
                 <button onClick={() => { setShowMoreMenu(!showMoreMenu); setShowSettings(false); }} className={cn("p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors", showMoreMenu && "bg-white/10")}>
                   <MoreHorizontal size={20} />
                 </button>
               </div>
             </div>

             {/* Novel Settings Dropdown */}
             {isNovel && showSettings && (
               <div className="absolute top-[calc(100%+8px)] right-4 p-5 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl w-64">
                 <div className="mb-6">
                   <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">Theme</p>
                   <div className="flex gap-2">
                     <button onClick={() => setTheme('dark')} className={cn("flex-1 p-2 rounded-lg border text-sm font-bold transition-all", theme === 'dark' ? "border-lemon-muted bg-black-core text-lemon-muted" : "border-white/10 bg-black-core text-white/60")}>Dark</button>
                     <button onClick={() => setTheme('cream')} className={cn("flex-1 p-2 rounded-lg border text-sm font-bold transition-all", theme === 'cream' ? "border-lemon-muted bg-[#f5f5f0] text-black" : "border-white/10 bg-[#f5f5f0] text-black/60")}>Cream</button>
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">Text Size</p>
                   <div className="flex gap-3 items-center">
                     <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg">-</button>
                     <span className="flex-1 text-center text-sm font-bold">{fontSize}pt</span>
                     <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg">+</button>
                   </div>
                 </div>
               </div>
             )}

             {/* More Menu Dropdown */}
             {showMoreMenu && (
               <div className="absolute top-[calc(100%+8px)] right-4 p-2 bg-ink-deep border border-white/10 rounded-2xl shadow-2xl w-56 flex flex-col">
                  <button onClick={() => { setShowMoreMenu(false); alert('Link copied!'); }} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold">
                    <Share size={18} className="text-white/40" /> Share Chapter
                  </button>
                  <button onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold">
                    <Flag size={18} className="text-white/40" /> Report Chapter
                  </button>
                  <div className="h-px bg-white/5 my-1 mx-2" />
                  <button onClick={() => navigate(`/story/${id}`)} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl transition-colors text-left text-sm font-bold">
                    <ArrowLeft size={18} className="text-white/40" /> Back to Story
                  </button>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-ink-deep border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
               {reportSuccess ? (
                 <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-lemon-muted text-black rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-display font-black text-2xl mb-2">Report submitted.</h3>
                    <p className="text-white/50 text-sm mb-8">Thank you for helping us keep Lemonade safe.</p>
                    <Button fullWidth size="lg" onClick={() => setShowReportModal(false)}>Close</Button>
                 </div>
               ) : (
                 <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="font-display font-black text-2xl">Report Chapter</h3>
                       <button onClick={() => setShowReportModal(false)} className="text-white/30 hover:text-white transition-colors">
                         <X size={24} />
                       </button>
                    </div>
                    
                    <div className="grid gap-4">
                       <div className="grid gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Reason</label>
                          <select 
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full h-12 bg-black-core border border-white/10 rounded-xl px-4 text-white text-sm focus:border-lemon-muted outline-none"
                          >
                             <option>Wrong content</option>
                             <option>Copyright issue</option>
                             <option>Offensive content</option>
                             <option>Technical issue</option>
                             <option>Other</option>
                          </select>
                       </div>
                       
                       <div className="grid gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Message (Optional)</label>
                          <textarea 
                            value={reportMessage}
                            onChange={(e) => setReportMessage(e.target.value)}
                            className="w-full h-32 bg-black-core border border-white/10 rounded-xl p-4 text-white text-sm focus:border-lemon-muted outline-none resize-none"
                            placeholder="Provide more details..."
                          />
                       </div>
                       
                       <Button 
                         fullWidth 
                         size="lg" 
                         className="mt-4"
                         disabled={isReporting}
                         onClick={() => {
                           setIsReporting(true);
                           setTimeout(() => {
                             setIsReporting(false);
                             setReportSuccess(true);
                           }, 1000);
                         }}
                       >
                         {isReporting ? 'Submitting...' : 'Submit Report'}
                       </Button>
                    </div>
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="pt-24 pb-24" onClick={() => { setShowUI(!showUI); setShowSettings(false); setShowMoreMenu(false); }}>
        {isNovel ? (
          <div 
            className="max-w-2xl mx-auto px-6 py-8 font-sans leading-[1.8]"
            style={{ fontSize: `${fontSize}px` }}
          >
            <h2 className="font-display font-black text-3xl md:text-5xl mb-12">The Arrival</h2>
            {/* Novel Content */}
            <p className="mb-6">The sky above the sprawling metropolis of Lagos 2099 was chaotic...</p>
            <p className="mb-6">Kael checked his wrist-comm...</p>
            {/* (Repeated paragraphs omitted for brevity in thought, but included in actual update if needed) */}
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-[800px] mx-auto bg-black">
             {[1, 2, 3, 4, 5].map((i) => (
                <img 
                  key={i} 
                  src={`https://picsum.photos/seed/comic${story.id}${i}/800/1200`} 
                  className="w-full h-auto object-contain"
                  alt={`Panel ${i}`}
                  referrerPolicy="no-referrer"
                />
             ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Action Area */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none"
          >
            <div className="max-w-xl mx-auto flex justify-between items-center bg-black-core/90 backdrop-blur-xl text-cream-soft p-1 rounded-full border border-white/10 shadow-2xl pointer-events-auto">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white h-11 w-11"><Heart size={20} /></Button>
              <Button variant="ghost" className="text-white/60 px-4 h-11 w-auto flex gap-2 font-bold text-sm"><MessageCircle size={18} /> 124</Button>
              <div className="w-[1px] h-6 bg-white/10" />
              <Button variant="primary" className="flex-1 mr-1 h-11 font-black text-xs uppercase tracking-widest" onClick={() => navigate(`/read/${story.id}/${parseInt(chapterNum || '1') + 1}`)}>
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function LockedReaderScreen({ story, chapterNum, price }: { story: any, chapterNum: string, price: number }) {
  const { user, unlockChapter, isGuest } = useApp();
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (isGuest) {
      navigate('/auth?mode=signup&intent=read');
      return;
    }
    if (user && user.walletBalance >= price) {
      unlockChapter(story.id, `c${chapterNum}`, price);
    } else {
      navigate('/wallet');
    }
  };

  return (
    <div className="min-h-screen bg-black-core flex flex-col pt-16 px-4 md:px-0">
      <div className="flex items-center px-4 h-16 border-b border-white/10 max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <div className="ml-4 flex-1 truncate">
          <h3 className="font-bold text-sm truncate">{story.title}</h3>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Chapter {chapterNum}</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-lemon-muted/10 rounded-full flex items-center justify-center text-lemon-muted mb-8">
          <Lock size={32} />
        </div>
        <h2 className="font-display font-black text-3xl md:text-5xl mb-4">Chapter Locked</h2>
        <p className="text-white/60 text-sm md:text-base mb-10 max-w-xs mx-auto leading-relaxed">
          This is a premium chapter. Unlock it with coins or get a Lemonade Premium subscription to read.
        </p>
        
        <div className="grid gap-4 w-full max-w-sm">
          <Button size="lg" className="h-14" onClick={handleUnlock}>
            Unlock with {price} Coins
          </Button>
          <Link to="/premium">
            <Button size="lg" variant="glass" className="h-14" fullWidth>
              Get Premium Access
            </Button>
          </Link>
        </div>
        
        <button onClick={() => navigate(-1)} className="mt-10 text-sm font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );
}
