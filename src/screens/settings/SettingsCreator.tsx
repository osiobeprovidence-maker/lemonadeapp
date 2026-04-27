import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { MousePointer2, Briefcase, ExternalLink, ShieldCheck, AlertCircle, PenTool, CheckCircle } from 'lucide-react';

export default function SettingsCreator() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock state
  const isCreator = true; // Set to false to see applicant view
  const applicationStatus = 'verified'; // none, pending, verified

  const [formData, setFormData] = useState({
    dropSomething: 'https://dropsomething.com/riderezzy',
    portfolio: 'https://behance.net/riderezzy',
    collaboration: true
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Creator settings updated! (Mock)');
    }, 1000);
  };

  return (
    <SettingsDetailLayout 
      title="Creator Settings" 
      description="Manage your creator identity and monetization."
      onSave={isCreator ? handleSave : undefined}
      isLoading={isLoading}
    >
      {!isCreator ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
           <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center text-white/20 mb-8">
              <PenTool size={48} />
           </div>
           <h3 className="text-3xl font-display font-black tracking-tight uppercase italic mb-4">Start your Journey</h3>
           <p className="text-white/40 font-bold max-w-sm mb-12 italic">Join our community of original storytellers. Apply for creator access to unlock publishing and monetization.</p>
           <button 
             onClick={() => navigate('/creator-application')}
             className="px-12 h-16 bg-lemon-muted text-black rounded-[24px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lemon-muted/20"
           >
             Apply for Creator Access
           </button>
        </div>
      ) : (
        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 px-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-lemon-muted" />
                  <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Status</h3>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-full">
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">Verified Creator</span>
               </div>
            </div>
            
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-lemon-muted transition-colors">
                     <Briefcase size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-lg">Manage Portfolio</h4>
                     <p className="text-sm font-bold text-white/30 italic">Update your public works and professional biography.</p>
                  </div>
               </div>
               <ExternalLink size={20} className="text-white/10 group-hover:text-white transition-colors" />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 px-4">
               <MousePointer2 size={20} className="text-lemon-muted" />
               <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Support Link</h3>
            </div>
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">DropSomething URL</label>
                 <input 
                  type="url" 
                  value={formData.dropSomething}
                  onChange={(e) => setFormData({...formData, dropSomething: e.target.value})}
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                  placeholder="https://dropsomething.com/yourname"
                />
                <p className="text-[10px] font-bold text-white/20 ml-4 italic">This link appears on all your stories for direct reader support.</p>
               </div>
               <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                     <h4 className="font-bold">Portfolio Visibility</h4>
                     <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Link portfolio to public creator page</p>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, collaboration: !formData.collaboration})}
                    className={`w-14 h-8 rounded-full transition-all relative ${formData.collaboration ? 'bg-lemon-muted' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${formData.collaboration ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </section>

          <section>
             <div className="p-8 bg-orange-400/5 rounded-[40px] border border-orange-400/10">
                <div className="flex items-center gap-3 mb-4">
                   <AlertCircle size={24} className="text-orange-400" />
                   <h4 className="text-lg font-display font-black uppercase italic tracking-tight text-orange-400">Content Warning</h4>
                </div>
                <p className="text-sm font-bold text-white/60 leading-relaxed italic mb-6">
                   Remember that all content must adhere to the Lemonade Creator Guidelines. Failure to properly tag explicit content or copyright violations may result in account suspension.
                </p>
                <button className="text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors underline underline-offset-4">Read Creator Guidelines</button>
             </div>
          </section>
        </div>
      )}
    </SettingsDetailLayout>
  );
}
