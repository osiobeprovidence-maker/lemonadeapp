import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, TrendingUp, Shield, Star, HeadphonesIcon, ChevronDown, Upload, CheckCircle, AlertCircle, BookOpen, Palette, Zap, ArrowRight, Loader2, Sparkles, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { api } from '../../convex/_generated/api';
import { convex } from '../lib/convex';
import { shareLink } from '../lib/share';
import AdBanner from '../components/ads/AdBanner';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: 'easeOut' } }),
};

const benefits = [
  { icon: Zap, title: 'Upfront Compensation', desc: 'Get paid for selected works with fair licensing terms.' },
  { icon: Shield, title: 'Keep Your IP', desc: 'You retain full ownership of your intellectual property.' },
  { icon: TrendingUp, title: 'Growing Audience', desc: 'Reach thousands of manga readers on a rising platform.' },
  { icon: Star, title: 'Featured Placement', desc: 'Opportunities for homepage features and promotions.' },
  { icon: BookOpen, title: 'Originals Selection', desc: 'Potential to be chosen for Owuuu Originals program.' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Work with a team that values your creative vision.' },
];

const genres = ['Action', 'Fantasy', 'Romance', 'Drama', 'BL', 'Sci-Fi', 'Horror', 'Comedy', 'Slice of Life', 'Adventure'];

const formats = ['One-Shots', 'Ongoing Series', 'Completed Series'];

const faqs = [
  { q: 'Do I keep ownership of my manga?', a: 'Yes. Owuuu primarily licenses content, allowing creators to retain ownership of their intellectual property.' },
  { q: 'How much do you pay?', a: 'Compensation varies depending on quality, length, and exclusivity requirements.' },
  { q: 'Can ongoing series apply?', a: 'Yes.' },
  { q: 'Can I submit multiple works?', a: 'Absolutely.' },
  { q: 'How long does review take?', a: 'Most submissions are reviewed within 2\u20134 weeks.' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.zip', '.png', '.jpg', '.jpeg', '.webp'];

export default function Creators() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    mangaTitle: '',
    genre: '',
    synopsis: '',
    social: '',
    portfolio: '',
    chapterCount: '',
    rightsConfirmed: false,
    understood: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.mangaTitle.trim()) errs.mangaTitle = 'Manga title is required';
    if (!form.genre) errs.genre = 'Please select a genre';
    if (!form.synopsis.trim()) errs.synopsis = 'Synopsis is required';
    else if (form.synopsis.trim().length < 20) errs.synopsis = 'Synopsis must be at least 20 characters';
    if (!form.rightsConfirmed) errs.rightsConfirmed = 'You must confirm you own the rights';
    if (!form.understood) errs.understood = 'You must acknowledge the submission terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const invalid = selected.find(
      (f) => !ALLOWED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    if (invalid) {
      setError(`Invalid file: ${invalid.name}. Accepted: PDF, ZIP, PNG, JPG, WEBP`);
      return;
    }
    if (selected.length + files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploading(true);
    try {
      if (!convex) {
        throw new Error('Uploads are not configured. Convex is missing.');
      }
      const storageIds: string[] = [];
      for (const file of files) {
        console.log('[creators-upload] File selected:', { name: file.name, type: file.type, size: file.size });
        const ext = file.name.toLowerCase().split('.').pop();
        if (!ALLOWED_EXTENSIONS.some((e) => e === `.${ext}`) || ext === 'pdf' && file.type && !file.type.includes('pdf')) {
          console.warn('[creators-upload] Unsupported file type:', file.name, file.type);
          throw new Error('Unsupported file type');
        }
        if (file.size > 25 * 1024 * 1024) {
          console.warn('[creators-upload] File too large:', file.name, file.size);
          throw new Error('File is too large');
        }
        console.log('[creators-upload] Generating upload URL');
        const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {});
        console.log('[creators-upload] Upload URL obtained, starting upload');
        let lastError: unknown;
        for (let attempt = 0; attempt <= 2; attempt++) {
          try {
            const result = await fetch(uploadUrl, {
              method: 'POST',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file,
            });
            if (!result.ok) {
              const body = await result.text().catch(() => '');
              console.error(`[creators-upload] HTTP ${result.status}:`, body);
              throw new Error('Upload failed');
            }
            const { storageId } = await result.json();
            if (!storageId) {
              console.error('[creators-upload] missing storageId in response');
              throw new Error('Upload failed');
            }
            console.log('[creators-upload] Upload completed, storageId:', storageId);
            storageIds.push(storageId);
            lastError = undefined;
            break;
          } catch (err) {
            lastError = err;
            console.warn(`[creators-upload] Attempt ${attempt + 1}/3 failed:`, err);
            if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
        if (lastError) throw lastError;
      }
      console.log('[creators-upload] All files uploaded successfully');
      return storageIds;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const sampleFiles = await uploadFiles();
      await convex.mutation(api.creatorSubmissions.submit, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        mangaTitle: form.mangaTitle.trim(),
        genre: form.genre,
        synopsis: form.synopsis.trim(),
        social: form.social.trim() || undefined,
        portfolio: form.portfolio.trim() || undefined,
        chapterCount: form.chapterCount ? parseInt(form.chapterCount, 10) : undefined,
        sampleFiles: sampleFiles.length > 0 ? sampleFiles : undefined,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[creators-upload] Submission failed:', msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black-core flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-ink-deep border border-white/5 rounded-[40px] p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-display font-black italic mb-4">Submission Received!</h2>
          <p className="text-white/60 font-medium mb-2">Thank you for submitting your work.</p>
          <p className="text-white/40 text-sm mb-8">Our team will review your submission and get back to you within 2\u20134 weeks.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', mangaTitle: '', genre: '', synopsis: '', social: '', portfolio: '', chapterCount: '', rightsConfirmed: false, understood: false }); setFiles([]); }}>
              Submit Another
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-core">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        <AdBanner className="mb-6" />

        {/* HERO */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 w-72 h-72 bg-lemon-muted/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.span variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-4 py-2 bg-lemon-muted/10 text-lemon-muted text-xs font-black uppercase tracking-widest rounded-full mb-6">
                <Sparkles size={14} /> Creator Program
              </motion.span>
              <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="text-4xl sm:text-5xl md:text-6xl font-display font-black italic leading-[1.1] mb-6">
                Publish Your Manga on<br />
                <span className="text-lemon-muted">Owuuu</span>
              </motion.h1>
              <motion.p variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="text-lg text-white/70 font-medium mb-8 max-w-xl">
                Submit your manga, manhwa, webtoon, or comic for review by the Owuuu publishing team.
              </motion.p>
              <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="primary" onClick={scrollToForm}>
                  Submit Your Manga <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More
                </Button>
                <button
                  onClick={async () => {
                    try {
                      await shareLink({ title: 'Publish Your Manga on Owuuu', url: window.location.href });
                    } catch {}
                  }}
                  className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-lemon-muted/30 transition-all shrink-0"
                  aria-label="Share this page"
                >
                  <Share2 size={20} className="text-white/50" />
                </button>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden md:block">
              <div className="aspect-[4/3] bg-ink-deep border border-white/10 rounded-[40px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-lemon-muted/10 via-purple-500/5 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-lemon-muted to-yellow-500 flex items-center justify-center">
                      <PenTool size={40} className="text-black" />
                    </div>
                    <p className="text-xl font-display font-black italic text-white/80">Showcase Your</p>
                    <p className="text-3xl font-display font-black italic text-lemon-muted">Masterpiece</p>
                    <div className="mt-6 flex gap-3 justify-center">
                      {['Action', 'Fantasy', 'Drama'].map((g) => (
                        <span key={g} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SUBMISSION FORM - Immediately visible below hero */}
        <section id="submit" ref={formRef} className="py-10 md:py-16">
          <motion.div initial="show" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-display font-black italic mb-3">Submit Your Work</h2>
              <p className="text-white/50 font-medium max-w-2xl mx-auto">Fill out the form below and our team will review your submission.</p>
            </motion.div>

            <motion.form variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={cn("w-full h-12 bg-ink-deep border rounded-xl px-4 text-white text-sm font-bold focus:outline-none transition-colors", errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-lemon-muted/50')} placeholder="Your full name or pen name" />
                  {errors.name && <p className="text-xs text-red-400 mt-1 font-medium">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Email Address <span className="text-red-400">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={cn("w-full h-12 bg-ink-deep border rounded-xl px-4 text-white text-sm font-bold focus:outline-none transition-colors", errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-lemon-muted/50')} placeholder="creator@example.com" />
                  {errors.email && <p className="text-xs text-red-400 mt-1 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full h-12 bg-ink-deep border border-white/10 rounded-xl px-4 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors" placeholder="+234..." />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Manga Title <span className="text-red-400">*</span></label>
                  <input type="text" value={form.mangaTitle} onChange={(e) => handleChange('mangaTitle', e.target.value)} className={cn("w-full h-12 bg-ink-deep border rounded-xl px-4 text-white text-sm font-bold focus:outline-none transition-colors", errors.mangaTitle ? 'border-red-500/50' : 'border-white/10 focus:border-lemon-muted/50')} placeholder="Title of your manga" />
                  {errors.mangaTitle && <p className="text-xs text-red-400 mt-1 font-medium">{errors.mangaTitle}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Genre <span className="text-red-400">*</span></label>
                  <select value={form.genre} onChange={(e) => handleChange('genre', e.target.value)} className={cn("w-full h-12 bg-ink-deep border rounded-xl px-4 text-sm font-bold focus:outline-none transition-colors appearance-none cursor-pointer", errors.genre ? 'border-red-500/50' : 'border-white/10 focus:border-lemon-muted/50', form.genre ? 'text-white' : 'text-white/30')}>
                    <option value="" disabled>Select genre</option>
                    {genres.map((g) => (<option key={g} value={g} className="bg-ink-deep text-white">{g}</option>))}
                  </select>
                  {errors.genre && <p className="text-xs text-red-400 mt-1 font-medium">{errors.genre}</p>}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Number of Chapters</label>
                  <input type="number" min="1" value={form.chapterCount} onChange={(e) => handleChange('chapterCount', e.target.value)} className="w-full h-12 bg-ink-deep border border-white/10 rounded-xl px-4 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors" placeholder="e.g. 12" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Synopsis <span className="text-red-400">*</span></label>
                <textarea value={form.synopsis} onChange={(e) => handleChange('synopsis', e.target.value)} rows={4} className={cn("w-full bg-ink-deep border rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none transition-colors resize-none", errors.synopsis ? 'border-red-500/50' : 'border-white/10 focus:border-lemon-muted/50')} placeholder="Describe your manga in a few sentences..." />
                {errors.synopsis && <p className="text-xs text-red-400 mt-1 font-medium">{errors.synopsis}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Social Media Link</label>
                  <input type="url" value={form.social} onChange={(e) => handleChange('social', e.target.value)} className="w-full h-12 bg-ink-deep border border-white/10 rounded-xl px-4 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors" placeholder="Instagram, Twitter, etc." />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Portfolio URL</label>
                  <input type="url" value={form.portfolio} onChange={(e) => handleChange('portfolio', e.target.value)} className="w-full h-12 bg-ink-deep border border-white/10 rounded-xl px-4 text-white text-sm font-bold focus:outline-none focus:border-lemon-muted/50 transition-colors" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Upload Sample Pages</label>
                <div className="relative">
                  <input type="file" multiple accept=".pdf,.zip,.png,.jpg,.jpeg,.webp" onChange={handleFileChange} className="sr-only" id="file-upload" />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 bg-ink-deep border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-lemon-muted/30 transition-colors">
                    <Upload size={24} className="text-white/30 mb-2" />
                    <span className="text-xs font-bold text-white/30">Click to upload PDF, ZIP, PNG, JPG, or WEBP</span>
                    <span className="text-[10px] text-white/20 mt-1">Max 5 files</span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-ink-deep border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <Palette size={16} className="text-lemon-muted shrink-0" />
                          <span className="text-sm font-medium text-white/70 truncate">{f.name}</span>
                          <span className="text-[10px] text-white/30">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-widest shrink-0 ml-3">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.rightsConfirmed} onChange={(e) => handleChange('rightsConfirmed', e.target.checked)} className="mt-0.5 w-5 h-5 rounded-lg bg-ink-deep border border-white/20 accent-lemon-muted" />
                  <span className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">I confirm that I own or have the rights to submit this work. <span className="text-red-400">*</span></span>
                </label>
                {errors.rightsConfirmed && <p className="text-xs text-red-400 font-medium ml-8">{errors.rightsConfirmed}</p>}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.understood} onChange={(e) => handleChange('understood', e.target.checked)} className="mt-0.5 w-5 h-5 rounded-lg bg-ink-deep border border-white/20 accent-lemon-muted" />
                  <span className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">I understand that submission does not guarantee acceptance or licensing. <span className="text-red-400">*</span></span>
                </label>
                {errors.understood && <p className="text-xs text-red-400 font-medium ml-8">{errors.understood}</p>}
              </div>

              <Button type="submit" size="lg" fullWidth disabled={submitting || uploading} className="mt-2">
                {submitting || uploading ? (
                  <><Loader2 size={18} className="mr-2 animate-spin" /> {uploading ? 'Uploading...' : 'Submitting...'}</>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </motion.form>
          </motion.div>
        </section>

        {/* BENEFITS */}
        <section id="benefits" className="py-16 md:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black italic mb-4">Why Publish with Owuuu?</h2>
              <p className="text-white/50 font-medium max-w-2xl mx-auto">We believe in empowering creators with fair terms and real opportunities.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {benefits.map((b, i) => (
                <motion.div key={b.title} custom={i} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.05 } } }} className="group p-6 md:p-8 bg-ink-deep border border-white/5 rounded-3xl hover:border-lemon-muted/20 transition-all duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-lemon-muted/10 flex items-center justify-center mb-5 group-hover:bg-lemon-muted/20 transition-colors">
                    <b.icon size={24} className="text-lemon-muted" />
                  </div>
                  <h3 className="text-lg font-display font-black italic mb-2">{b.title}</h3>
                  <p className="text-sm text-white/50 font-medium leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* WHAT WE'RE LOOKING FOR */}
        <section className="py-16 md:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black italic mb-4">What We're Looking For</h2>
              <p className="text-white/50 font-medium max-w-2xl mx-auto">We accept original manga across all genres and formats.</p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4 text-center">Genres</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {genres.map((g) => (
                  <span key={g} className="px-5 py-2.5 bg-ink-deep border border-white/5 rounded-full text-sm font-bold text-white/70 hover:border-lemon-muted/30 hover:text-lemon-muted transition-all cursor-default">{g}</span>
                ))}
              </div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4 text-center">Accepted Formats</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {formats.map((f) => (
                  <span key={f} className="px-6 py-3 bg-lemon-muted/10 border border-lemon-muted/20 rounded-2xl text-sm font-black text-lemon-muted">{f}</span>
                ))}
              </div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white/40">
                <AlertCircle size={14} /> Original works only
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black italic mb-4">Frequently Asked Questions</h2>
            </motion.div>
            <div className="max-w-2xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} custom={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="bg-ink-deep border border-white/5 rounded-2xl overflow-hidden">
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-bold text-sm hover:text-lemon-muted transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={cn("shrink-0 ml-4 transition-transform duration-300", openFaq === i && "rotate-180")} />
                  </button>
                  <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-white/50 font-medium leading-relaxed">{faq.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 md:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: {} }}>
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="relative bg-gradient-to-br from-lemon-muted/10 via-ink-deep to-purple-500/10 border border-white/5 rounded-[40px] p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-lemon-muted/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <PenTool size={40} className="mx-auto mb-6 text-lemon-muted" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black italic mb-4">Ready to Share Your Story?</h2>
                <p className="text-white/60 font-medium mb-8 max-w-lg mx-auto">Join the next generation of African manga creators.</p>
                <Button size="lg" variant="primary" onClick={scrollToForm}>
                  Submit Your Manga <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
