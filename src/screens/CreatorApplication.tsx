import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { PenTool, CheckCircle, Globe, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ["Manga Artist", "Writer", "Illustrator", "Studio", "Animator"];
const GENRES = ["Action", "Romance", "Horror", "Sci-Fi & Cyberpunk", "African Fantasy", "Drama", "Mystery"];

export default function CreatorApplication() {
  const navigate = useNavigate();
  const { user, isGuest, submitCreatorApplication } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    creatorName: '',
    category: 'Artist',
    location: '',
    bio: '',
    portfolioLink: '',
    socialLinks: {
      instagram: '',
      tiktok: '',
      x: '',
      sampleWork: '',
    },
    dropsomethingUrl: '',
    storyIntent: '',
    mainGenre: 'Action',
    hasStoryReady: false,
    whyLemonade: '',
    agreeOriginal: false,
    agreeReview: false,
  });

  if (isGuest) {
    navigate('/auth?mode=signup&intent=studio');
    return null;
  }

  if (user?.creatorAccessStatus !== 'none') {
    navigate('/creator-application/status');
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeOriginal || !formData.agreeReview) return;
    
    submitCreatorApplication({
      creatorName: formData.creatorName,
      category: formData.category as any,
      location: formData.location,
      bio: formData.bio,
      portfolioLink: formData.portfolioLink,
      socialLinks: formData.socialLinks,
      dropsomethingUrl: formData.dropsomethingUrl,
      storyIntent: formData.storyIntent,
      mainGenre: formData.mainGenre,
      hasStoryReady: formData.hasStoryReady,
      whyLemonade: formData.whyLemonade,
    });
    
    navigate('/creator-application/status');
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="flex flex-col w-full min-h-screen bg-black-core p-6 md:p-12 max-w-3xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-display font-black text-3xl md:text-5xl">Creator Application</h1>
          <p className="text-white/50 text-sm md:text-base mt-2">Apply to join Lemonade's premium creator network.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-500",
              step >= i ? "bg-lemon-muted" : "bg-white/10"
            )} 
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-ink-deep border border-white/5 p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <PenTool size={20} className="text-lemon-muted" /> Basic Information
              </h2>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Creator or Studio Name</label>
                  <input 
                    required
                    value={formData.creatorName}
                    onChange={(e) => handleInputChange('creatorName', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleInputChange('category', cat)}
                        className={cn(
                          "px-4 py-2 rounded-full border text-sm font-bold transition-all",
                          formData.category === cat ? "bg-lemon-muted text-black border-lemon-muted" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Location</label>
                  <input 
                    required
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Short Bio</label>
                  <textarea 
                    required
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full h-32 bg-black-core border border-white/10 rounded-xl p-4 text-white focus:border-lemon-muted outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
            <Button size="lg" type="button" className="w-full h-14" onClick={nextStep}>
              Continue <ChevronRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-ink-deep border border-white/5 p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <Globe size={20} className="text-lemon-muted" /> Online Presence
              </h2>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Portfolio Link</label>
                  <input 
                    required
                    placeholder="https://..."
                    value={formData.portfolioLink}
                    onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Instagram</label>
                    <input 
                      placeholder="@username"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                      className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">TikTok</label>
                    <input 
                      placeholder="@username"
                      value={formData.socialLinks.tiktok}
                      onChange={(e) => handleInputChange('socialLinks.tiktok', e.target.value)}
                      className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Sample Work Link (G-Drive, Dropbox, etc.)</label>
                  <input 
                    placeholder="https://..."
                    value={formData.socialLinks.sampleWork}
                    onChange={(e) => handleInputChange('socialLinks.sampleWork', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">DropSomething Username or URL</label>
                  <input 
                    placeholder="dropsomething.sbs/yourname"
                    value={formData.dropsomethingUrl}
                    onChange={(e) => handleInputChange('dropsomethingUrl', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" type="button" className="flex-1 h-14" onClick={prevStep}>
                Back
              </Button>
              <Button size="lg" type="button" className="flex-[2] h-14" onClick={nextStep}>
                Continue <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-ink-deep border border-white/5 p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-bold text-xl mb-6">Story Intent</h2>
              <div className="grid gap-6">
                 <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Main Genre</label>
                  <select 
                    value={formData.mainGenre}
                    onChange={(e) => handleInputChange('mainGenre', e.target.value)}
                    className="w-full h-14 bg-black-core border border-white/10 rounded-xl px-4 text-white focus:border-lemon-muted outline-none transition-colors"
                  >
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">What type of stories do you create?</label>
                  <textarea 
                    required
                    value={formData.storyIntent}
                    onChange={(e) => handleInputChange('storyIntent', e.target.value)}
                    className="w-full h-24 bg-black-core border border-white/10 rounded-xl p-4 text-white focus:border-lemon-muted outline-none transition-colors resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Why do you want to publish on Lemonade?</label>
                  <textarea 
                    required
                    value={formData.whyLemonade}
                    onChange={(e) => handleInputChange('whyLemonade', e.target.value)}
                    className="w-full h-24 bg-black-core border border-white/10 rounded-xl p-4 text-white focus:border-lemon-muted outline-none transition-colors resize-none"
                  />
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black-core rounded-xl border border-white/5">
                  <input 
                    type="checkbox" 
                    id="ready"
                    checked={formData.hasStoryReady}
                    onChange={(e) => handleInputChange('hasStoryReady', e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 accent-lemon-muted"
                  />
                  <label htmlFor="ready" className="text-sm text-white/70">I already have a story ready to publish.</label>
                </div>

                <div className="grid gap-4 mt-4 border-t border-white/5 pt-6">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="opt1" 
                      required
                      checked={formData.agreeOriginal}
                      onChange={(e) => handleInputChange('agreeOriginal', e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-white/20 accent-lemon-muted"
                    />
                    <label htmlFor="opt1" className="text-sm text-white/50 leading-relaxed">I confirm that all work I publish will be my original intellectual property.</label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="opt2" 
                      required
                      checked={formData.agreeReview}
                      onChange={(e) => handleInputChange('agreeReview', e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-white/20 accent-lemon-muted"
                    />
                    <label htmlFor="opt2" className="text-sm text-white/50 leading-relaxed">I agree to Lemonade's content review and approval process.</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" type="button" className="flex-1 h-14" onClick={prevStep}>
                Back
              </Button>
              <Button size="lg" type="submit" className="flex-[2] h-14">
                <CheckCircle size={18} className="mr-2" /> Submit Application
              </Button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
