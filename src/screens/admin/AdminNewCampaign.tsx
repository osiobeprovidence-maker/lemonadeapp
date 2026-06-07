import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clapperboard, FileVideo, Image, Loader, Megaphone, MonitorPlay, Sparkles, Trash2, Upload } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { convex } from '../../lib/convex';
import { Button } from '../../components/ui/Button';
import { formatFileSize, uploadStoryFile } from '../../lib/imageUpload';

type CampaignType = 'video' | 'image' | 'banner';
type CampaignPlacement = 'chapter_preroll' | 'movie_preroll' | 'novel_midroll' | 'sponsored_banner';

const genreOptions = ['Action', 'Adventure', 'Fantasy', 'Romance', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Mystery', 'Thriller', 'Slice of Life', 'Historical', 'Supernatural'];

const typeOptions: Array<{ value: CampaignType; label: string; icon: React.ElementType; helper: string }> = [
  { value: 'video', label: 'Video', icon: MonitorPlay, helper: 'Best for pre-roll and movie playback.' },
  { value: 'image', label: 'Image', icon: Image, helper: 'Fast cinematic static creative.' },
  { value: 'banner', label: 'Banner', icon: Megaphone, helper: 'Lightweight sponsored message.' },
];

const placementOptions: Array<{ value: CampaignPlacement; label: string; helper: string }> = [
  { value: 'chapter_preroll', label: 'Chapter Pre-roll', helper: 'Before manga, manhwa, or comic chapters.' },
  { value: 'movie_preroll', label: 'Movie Pre-roll', helper: 'Before movie playback starts.' },
  { value: 'novel_midroll', label: 'Novel Mid-roll', helper: 'Periodic ads during long reading sessions.' },
  { value: 'sponsored_banner', label: 'Sponsored Banner', helper: 'Native banner placement for discovery surfaces.' },
];

const defaultCreative = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80';

export default function AdminNewCampaign() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    brandName: '',
    headline: '',
    description: '',
    type: 'image' as CampaignType,
    placement: 'chapter_preroll' as CampaignPlacement,
    mediaUrl: defaultCreative,
    clickUrl: '',
    cpmNaira: 1800,
    targetGenres: ['Action', 'Sci-Fi'] as string[],
  });

  const estimatedCreatorShare = useMemo(() => Math.round((form.cpmNaira || 0) * 0.7), [form.cpmNaira]);
  const estimatedPlatformShare = useMemo(() => Math.round((form.cpmNaira || 0) * 0.3), [form.cpmNaira]);
  const previewUrl = mediaPreviewUrl || form.mediaUrl || defaultCreative;

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [mediaFile]);

  const setField = <Key extends keyof typeof form>(key: Key, value: typeof form[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleGenre = (genre: string) => {
    setForm((current) => {
      const exists = current.targetGenres.includes(genre);
      return {
        ...current,
        targetGenres: exists
          ? current.targetGenres.filter((item) => item !== genre)
          : [...current.targetGenres, genre],
      };
    });
  };

  const selectMediaFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      setError('Please upload an image or video creative.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Ad media must be 25MB or smaller.');
      return;
    }

    setError(null);
    setMediaFile(file);
    setField('type', isVideo ? 'video' : form.type === 'video' ? 'image' : form.type);
  };

  const clearMediaFile = () => {
    setMediaFile(null);
    setMediaPreviewUrl('');
  };

  const submitCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!convex) return;

    const title = form.title.trim();
    const brandName = form.brandName.trim();
    const headline = form.headline.trim();
    let mediaUrl = form.mediaUrl.trim();

    if (!title || !brandName || !headline || (!mediaUrl && !mediaFile)) {
      setError('Campaign title, brand, headline, and media creative are required.');
      return;
    }

    setSaving(true);
    setUploadingMedia(!!mediaFile);
    setError(null);
    setSuccess(false);

    try {
      if (mediaFile) {
        const uploaded = await uploadStoryFile(mediaFile, 'admin-ad-campaign');
        mediaUrl = uploaded.url;
        setField('mediaUrl', uploaded.url);
      }
      setUploadingMedia(false);

      await convex.mutation(api.ads.createCampaign, {
        title,
        brandName,
        headline,
        description: form.description.trim() || undefined,
        type: form.type,
        placement: form.placement,
        mediaUrl,
        clickUrl: form.clickUrl.trim() || undefined,
        cpmNaira: Number(form.cpmNaira) || 0,
        targetGenres: form.targetGenres,
      });
      setSuccess(true);
      window.setTimeout(() => navigate('/admin/ads'), 800);
    } catch (err) {
      console.error('Failed to create ad campaign', err);
      setError('Unable to create campaign. Please check the form and try again.');
    } finally {
      setUploadingMedia(false);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submitCampaign} className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/admin/ads" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/45 hover:text-lemon-muted">
            <ArrowLeft size={16} />
            Back to ad center
          </Link>
          <h2 className="font-display text-3xl font-black uppercase italic tracking-tight">New Campaign</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">Build inventory for pre-roll, mid-roll, and sponsored placements</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/ads')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
            Submit for Approval
          </Button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</div>}
      {success && <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-bold text-green-100">Campaign created and queued for approval.</div>}

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/5 bg-ink-deep p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lemon-muted/10 text-lemon-muted">
                <Clapperboard size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl font-black">Campaign Details</h3>
                <p className="text-sm text-white/40">Name the campaign and define the advertiser-facing creative.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Campaign title">
                <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="OWUUU Premium Launch" className="field-input" />
              </Field>
              <Field label="Brand name">
                <input value={form.brandName} onChange={(event) => setField('brandName', event.target.value)} placeholder="OWUUU" className="field-input" />
              </Field>
              <Field label="Headline" className="md:col-span-2">
                <input value={form.headline} onChange={(event) => setField('headline', event.target.value)} placeholder="Read without interruptions" className="field-input" />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={4} placeholder="Short message shown inside the ad modal." className="field-input resize-none" />
              </Field>
              <Field label="Media URL" className="md:col-span-2">
                <input value={form.mediaUrl} onChange={(event) => setField('mediaUrl', event.target.value)} placeholder="https://..." className="field-input" />
              </Field>
              <div className="md:col-span-2">
                <p className="mb-2 block text-xs font-black uppercase tracking-widest text-white/35">Upload media creative</p>
                <input
                  id="ad-media-file"
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={selectMediaFile}
                />
                <label
                  htmlFor="ad-media-file"
                  className="group flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/25 p-5 text-center transition-colors hover:border-lemon-muted hover:bg-lemon-muted/5"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/45 transition-colors group-hover:bg-lemon-muted group-hover:text-black">
                    <Upload size={18} />
                  </div>
                  <p className="text-sm font-bold text-white/75">Upload image or video ad creative</p>
                  <p className="mt-1 text-xs text-white/35">MP4, WebM, JPG, PNG, or WebP up to 25MB. Uploaded media overrides the URL on submit.</p>
                </label>
                {mediaFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/30 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lemon-muted">
                        {mediaFile.type.startsWith('video/') ? <FileVideo size={18} /> : <Image size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{mediaFile.name}</p>
                        <p className="text-xs text-white/35">{formatFileSize(mediaFile.size)} / ready to upload</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearMediaFile}
                      className="rounded-xl bg-red-500/10 p-2 text-red-300 transition-colors hover:bg-red-500 hover:text-white"
                      aria-label="Remove uploaded media"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <Field label="Click URL" className="md:col-span-2">
                <input value={form.clickUrl} onChange={(event) => setField('clickUrl', event.target.value)} placeholder="/premium or https://advertiser.com" className="field-input" />
              </Field>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/5 bg-ink-deep p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lemon-muted/10 text-lemon-muted">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl font-black">Delivery Rules</h3>
                <p className="text-sm text-white/40">Choose placement, creative type, CPM, and genre targeting.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/35">Creative type</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    const active = form.type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setField('type', option.value)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${active ? 'border-lemon-muted bg-lemon-muted/10 text-white' : 'border-white/8 bg-black/20 text-white/55 hover:border-white/20'}`}
                      >
                        <Icon size={18} className={active ? 'text-lemon-muted' : 'text-white/40'} />
                        <p className="mt-3 font-bold">{option.label}</p>
                        <p className="mt-1 text-xs leading-5 text-white/40">{option.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/35">Placement</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {placementOptions.map((option) => {
                    const active = form.placement === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setField('placement', option.value)}
                        className={`rounded-2xl border p-4 text-left transition-colors ${active ? 'border-lemon-muted bg-lemon-muted/10 text-white' : 'border-white/8 bg-black/20 text-white/55 hover:border-white/20'}`}
                      >
                        <p className="font-bold">{option.label}</p>
                        <p className="mt-1 text-xs leading-5 text-white/40">{option.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
                <Field label="CPM (NGN)">
                  <input type="number" min={0} value={form.cpmNaira} onChange={(event) => setField('cpmNaira', Number(event.target.value))} className="field-input" />
                </Field>
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/35">Target genres</p>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map((genre) => {
                      const active = form.targetGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`rounded-full px-3 py-2 text-xs font-black transition-colors ${active ? 'bg-lemon-muted text-black' : 'bg-white/5 text-white/45 hover:text-white'}`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-[2rem] border border-white/5 bg-ink-deep p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-lemon-muted">Live Preview</p>
              <h3 className="mt-1 font-display text-xl font-black">{form.headline || 'Campaign headline'}</h3>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            {form.type === 'video' ? (
                previewUrl ? (
                  <video src={previewUrl} className="aspect-video w-full object-cover" muted controls playsInline />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-lemon-muted/20 to-black">
                    <MonitorPlay size={42} className="text-lemon-muted" />
                  </div>
                )
              ) : (
                <img src={previewUrl} alt="Campaign preview" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
              )}
              <div className="p-5">
                <div className="mb-3 inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Sponsored by {form.brandName || 'Brand'}
                </div>
                <p className="font-display text-2xl font-black leading-tight">{form.headline || 'Your ad headline appears here'}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{form.description || 'Write a short, high-signal description for readers.'}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Creator CPM</p>
                    <p className="mt-1 font-bold">NGN {estimatedCreatorShare.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Platform CPM</p>
                    <p className="mt-1 font-bold">NGN {estimatedPlatformShare.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/35">Approval status</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {uploadingMedia ? 'Uploading media creative before campaign creation...' : 'New campaigns enter the approval queue before delivery. Admins can approve or pause them from the ad inventory page.'}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-white/35">{label}</span>
      {children}
    </label>
  );
}
