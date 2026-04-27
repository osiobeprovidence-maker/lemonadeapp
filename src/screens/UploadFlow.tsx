import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function UploadFlow() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const steps = ["Story Info", "Visuals", "First Chapter", "Monetization"];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(s => s + 1);
    } else {
      setTimeout(() => navigate('/studio'), 1000);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/studio')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-black text-2xl">Publish New Story</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -z-10" />
        <div className="absolute top-1/2 left-0 h-[1px] bg-lemon-muted -z-10 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
        
        {steps.map((label, idx) => {
          const isPast = idx + 1 < step;
          const isCurrent = idx + 1 === step;
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isPast ? "bg-lemon-muted text-black" : isCurrent ? "bg-black border-2 border-lemon-muted text-lemon-muted" : "bg-ink-deep border border-white/20 text-white/40"
              }`}>
                {isPast ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="flex-1 bg-ink-deep/50 border border-white/5 rounded-3xl p-6 md:p-10">
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
             <div>
               <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Story Title</label>
               <input type="text" placeholder="e.g. Lagos 2099" className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:border-lemon-muted outline-none" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Format</label>
                 <select className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white outline-none appearance-none font-medium">
                   <option>Manga</option>
                   <option>Manhwa</option>
                   <option>Webcomic</option>
                   <option>Novel</option>
                 </select>
               </div>
               <div>
                 <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Genre</label>
                 <select className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white outline-none appearance-none font-medium">
                   <option>Action</option>
                   <option>African Fantasy</option>
                   <option>Sci-Fi & Cyberpunk</option>
                   <option>Romance</option>
                 </select>
               </div>
             </div>

             <div>
               <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Synopsis</label>
               <textarea placeholder="What is your story about?" rows={4} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-lemon-muted outline-none resize-none" />
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-8 animate-fade-in">
             <div>
               <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Cover Art (3:4)</label>
               <div className="w-40 aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-lemon-muted hover:bg-white/5 transition-colors cursor-pointer text-white/40 hover:text-white">
                 <ImageIcon size={32} />
                 <span className="text-xs font-bold uppercase">Upload</span>
               </div>
             </div>
             <div>
               <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Banner Art (16:9)</label>
               <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-lemon-muted hover:bg-white/5 transition-colors cursor-pointer text-white/40 hover:text-white">
                 <Upload size={32} />
                 <span className="text-xs font-bold uppercase">Drag & Drop Banner</span>
               </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in text-center items-center justify-center py-10">
             <div className="w-20 h-20 bg-white/5 rounded-full mb-4 flex items-center justify-center text-white/40">
               <Upload size={32} />
             </div>
             <h3 className="font-display text-2xl font-bold">Upload Chapter Files</h3>
             <p className="text-white/50 mb-6 max-w-sm">Upload your comic panels as JPG/PNG, or paste your novel text. You can add more chapters later.</p>
             <Button variant="outline">Browse Files</Button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <h3 className="font-display text-2xl font-bold mb-2">Publishing & Monetization</h3>
            
            <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl cursor-pointer hover:border-lemon-muted group">
               <div>
                 <h4 className="font-bold">Free to Read</h4>
                 <p className="text-xs text-white/50">Allow anyone to read this chapter.</p>
               </div>
               <div className="w-6 h-6 rounded-full border-2 border-lemon-muted flex items-center justify-center bg-lemon-muted">
                 <Check size={14} className="text-black" />
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl cursor-pointer hover:border-lemon-muted">
               <div>
                 <div className="flex items-center gap-2">
                   <h4 className="font-bold text-white/50">Early Access (Locked)</h4>
                   <span className="px-2 py-0.5 rounded-sm bg-white/10 text-[10px] font-bold text-white/50 uppercase">Pro</span>
                 </div>
                 <p className="text-xs text-white/50">Require coins to unlock before public release.</p>
               </div>
               <div className="w-6 h-6 rounded-full border-2 border-white/20" />
            </div>

            <p className="text-xs text-white/40 text-center mt-6">By publishing, you agree to the Lemonade Creator Terms.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <Button size="lg" onClick={handleNext} className="min-w-[150px]">
          {step === steps.length ? "Publish Story" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
