import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsDetailLayout from '../../components/SettingsDetailLayout';
import { MousePointer2, Briefcase, ExternalLink, ShieldCheck, AlertCircle, PenTool, CheckCircle, Image as ImageIcon, Loader } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useUpdateCreatorProfile } from '../../hooks/useConvex';
import { compressImage, uploadBannerImage } from '../../lib/imageUpload';

export default function SettingsCreator() {
  const navigate = useNavigate();
  const { user, creators } = useApp();
  const updateCreatorProfile = useUpdateCreatorProfile();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCreator = user?.role === 'creator';
  const creatorData = user ? Object.values(creators as Record<string, any>).find(c => c.username === user.username) : null;

  const [formData, setFormData] = useState({
    dropSomething: '',
    portfolio: '',
    banner: '',
    collaboration: true,
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    if (creatorData) {
      setFormData({
        dropSomething: creatorData.dropsomethingUrl || '',
        portfolio: creatorData.portfolioLink || '',
        banner: creatorData.banner || '',
        collaboration: creatorData.supportEnabled ?? true,
        bankName: creatorData.profile?.payoutAccount?.bankName || '',
        accountNumber: creatorData.profile?.payoutAccount?.accountNumber || '',
        accountName: creatorData.profile?.payoutAccount?.accountName || '',
      });
    }
  }, [creatorData]);

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setError(null);
      setIsUploadingBanner(true);
      const bannerUrl = await uploadBannerImage(await compressImage(file, 0.86), user.id);
      setFormData(prev => ({ ...prev, banner: bannerUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload banner.');
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user || !creatorData) return;
    setIsLoading(true);
    try {
      await updateCreatorProfile({
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio || '',
        category: creatorData.category as any,
        dropsomethingUrl: formData.dropSomething,
        supportEnabled: formData.collaboration,
        userId: user.id,
        profile: {
          ...(creatorData.profile || {}),
          banner: formData.banner,
          portfolioLink: formData.portfolio,
          payoutAccount: {
            bankName: formData.bankName.trim(),
            accountNumber: formData.accountNumber.trim(),
            accountName: formData.accountName.trim(),
          },
        },
      });
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Failed to save creator settings', error);
      setIsLoading(false);
    }
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
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm font-bold text-red-200">
              {error}
            </div>
          )}
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
               <ImageIcon size={20} className="text-lemon-muted" />
               <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Profile Banner</h3>
            </div>
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] space-y-4">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <button
                type="button"
                onClick={() => !isUploadingBanner && bannerInputRef.current?.click()}
                className="w-full aspect-[16/7] rounded-2xl border-2 border-dashed border-white/15 bg-black/30 overflow-hidden flex items-center justify-center text-white/40 hover:border-lemon-muted/60 hover:text-white transition-colors"
              >
                {isUploadingBanner ? (
                  <Loader size={24} className="animate-spin" />
                ) : formData.banner ? (
                  <img src={formData.banner} alt="Creator banner preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <ImageIcon size={18} /> Upload Banner
                  </span>
                )}
              </button>
              <p className="text-[10px] font-bold text-white/20 ml-4 italic">Click Save after uploading to publish this banner to your creator page.</p>
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
            <div className="flex items-center gap-3 mb-6 px-4">
               <Briefcase size={20} className="text-lemon-muted" />
               <h3 className="text-xl font-display font-black uppercase italic tracking-tight">Payout Account</h3>
            </div>
            <div className="p-8 bg-ink-deep border border-white/5 rounded-[40px] grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Bank Name</label>
                <input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Account Number</label>
                <input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                  placeholder="0000000000"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Account Name</label>
                <input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors"
                  placeholder="Account holder"
                />
              </div>
              <p className="md:col-span-3 text-[10px] font-bold text-white/20 ml-4 italic">
                Save these details before requesting a creator payout. Withdrawals remain locked until all payout fields are filled.
              </p>
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
