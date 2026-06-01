import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, FileText, Image as ImageIcon, Loader, Save, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { convex } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import { compressImage, uploadBannerImage, uploadStoryCover, uploadStoryFile } from '../lib/imageUpload';

type StoryAttachment = {
  name: string;
  type: string;
  size: number;
  url: string;
};

const INLINE_TEXT_LIMIT = 180_000;

type DraftStory = {
  externalId?: string;
  title: string;
  format: string;
  genre: string;
  synopsis: string;
  coverImage?: string;
  bannerImage?: string;
  tags?: string[];
  media?: {
    chapterText?: string;
    attachments?: StoryAttachment[];
    monetization?: string;
    chapters?: Array<{ title?: string; text?: string; attachments?: StoryAttachment[] }>;
  };
};

export default function UploadFlow() {
  const { user } = useApp();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [panelFiles, setPanelFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<StoryAttachment[]>([]);
  const [chapters, setChapters] = useState<Array<{ title: string; text: string; files: File[]; attachments?: StoryAttachment[] }>>([]);
  const [chapterForm, setChapterForm] = useState<{ title: string; text: string; files: File[] }>({ title: '', text: '', files: [] });
  const [drafts, setDrafts] = useState<DraftStory[]>([]);
  const [storyExternalId, setStoryExternalId] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    format: 'Manga',
    genre: 'Action',
    synopsis: '',
    tags: ['Original'],
    chapterText: '',
    monetization: 'free',
  });

  const steps = ['Story Info', 'Visuals', 'Story Panels', 'Publish'];

  useEffect(() => {
    if (!convex || !user?.username) return;

    const loadDrafts = async () => {
      try {
        const stories = await convex.query(api.stories.listByCreator, {
          creatorUsername: user.username,
        });
        setDrafts(stories.filter((story: any) => story.status === 'draft'));
      } catch (error) {
        console.error('Failed to load story drafts', error);
      }
    };

    loadDrafts();
  }, [user?.username]);

  const selectImage = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB.');
      return;
    }

    setUploadError(null);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const selectPanelFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];
    const oversized = files.find((file) => file.size > 25 * 1024 * 1024);
    if (oversized) {
      setUploadError(`${oversized.name} is too large. Story files must be less than 25MB.`);
      return;
    }
    setUploadError(null);
    setPanelFiles((current) => [...current, ...files]);
    if (panelInputRef.current) panelInputRef.current.value = '';
  };

  const selectChapterFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];
    const oversized = files.find((file) => file.size > 25 * 1024 * 1024);
    if (oversized) {
      setUploadError(`${oversized.name} is too large. Story files must be less than 25MB.`);
      return;
    }
    setUploadError(null);
    setChapterForm((c) => ({ ...c, files: [...c.files, ...files] }));
    if (chapterInputRef.current) chapterInputRef.current.value = '';
  };

  const loadDraft = (draft: DraftStory) => {
    setStoryExternalId(draft.externalId || '');
    setFormData({
      title: draft.title || '',
      format: draft.format || 'Manga',
      genre: draft.genre || 'Action',
      synopsis: draft.synopsis || '',
      tags: draft.tags?.length ? draft.tags : ['Original'],
      chapterText: draft.media?.chapterText || '',
      monetization: draft.media?.monetization || 'free',
    });
    setCoverFile(null);
    setBannerFile(null);
    setPanelFiles([]);
    setCoverPreview(draft.coverImage || '');
    setBannerPreview(draft.bannerImage || '');
    setExistingAttachments(draft.media?.attachments || []);
    setChapters(
      (draft.media?.chapters || []).map((ch: any) => ({
        title: ch.title || '',
        text: ch.text || '',
        files: [],
        attachments: ch.attachments || [],
      })),
    );
    setUploadError(null);
    setStep(1);
  };

  const uploadAssets = async () => {
    if (!user) throw new Error('Please sign in before uploading.');

    const coverImage = coverFile
      ? await uploadStoryCover(await compressImage(coverFile, 0.82), user.id)
      : coverPreview;
    const bannerImage = bannerFile
      ? await uploadBannerImage(await compressImage(bannerFile, 0.86), user.id)
      : bannerPreview;
    const newAttachments = await Promise.all(panelFiles.map((file) => uploadStoryFile(file, user.id)));

    // Upload chapter files per chapter
    const uploadedChapters = await Promise.all(chapters.map(async (ch) => {
      const uploaded = await Promise.all((ch.files || []).map((f) => uploadStoryFile(f, user.id)));
      return {
        title: ch.title,
        text: ch.text,
        attachments: uploaded,
      };
    }));

    return {
      coverImage,
      bannerImage,
      attachments: [...existingAttachments, ...newAttachments],
      chapters: uploadedChapters,
    };
  };

  const uploadLargeText = async (text: string, name: string) => {
    if (!user || text.length <= INLINE_TEXT_LIMIT) {
      return { text, attachment: null as StoryAttachment | null };
    }

    const file = new File([text], name, { type: 'text/plain' });
    const attachment = await uploadStoryFile(file, user.id);
    return {
      text: text.slice(0, INLINE_TEXT_LIMIT),
      attachment,
    };
  };

  const saveStory = async (status: 'draft' | 'published') => {
    if (!user || user.isGuest) {
      navigate('/auth');
      return;
    }
    if (!convex) {
      setUploadError('Convex is not configured. Set VITE_CONVEX_URL before saving stories.');
      return;
    }
    if (status === 'published' && !formData.title.trim()) {
      setUploadError('Add a story title before publishing.');
      setStep(1);
      return;
    }

    setIsUploading(true);
    try {
      const externalId = storyExternalId || `story_${Date.now()}`;
      const assets = await uploadAssets();
      const topLevelText = await uploadLargeText(
        formData.chapterText,
        `${externalId}-chapter-1.txt`,
      );
      if (topLevelText.attachment) {
        assets.attachments.push(topLevelText.attachment);
      }

      const normalizedChapters = [];
      for (const [index, chapter] of (assets.chapters || []).entries()) {
        const chapterText = await uploadLargeText(
          chapter.text || '',
          `${externalId}-chapter-${index + 1}.txt`,
        );
        normalizedChapters.push({
          ...chapter,
          text: chapterText.text,
          attachments: [
            ...(chapter.attachments || []),
            ...(chapterText.attachment ? [chapterText.attachment] : []),
          ],
        });
      }

      if (status === 'published' && (!assets.coverImage || !assets.bannerImage)) {
        throw new Error('Please upload both a cover image and a banner image before publishing.');
      }
      if (status === 'published') {
        const hasTopLevelContent = topLevelText.text.trim() || assets.attachments.length > 0;
        const hasChapters = normalizedChapters.length > 0 || chapters.length > 0;
        if (!hasTopLevelContent && !hasChapters) {
          throw new Error('Add story text, chapters, or upload at least one PDF/image/file before publishing.');
        }
      }

      await convex.mutation(api.creators.upsert, {
        userId: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio || 'Creator on Lemonade.',
        category: [formData.genre],
        supportEnabled: true,
      });

      const storyPayload: any = {
        externalId,
        title: formData.title.trim() || 'Untitled Draft',
        genre: formData.genre,
        format: formData.format,
        synopsis: formData.synopsis.trim() || 'No synopsis provided.',
        coverImage: assets.coverImage || '',
        bannerImage: assets.bannerImage || '',
        tags: formData.tags,
        isOriginal: true,
        episodes: Math.max(
          1,
          assets.chapters?.length || chapters.length || (formData.chapterText.trim() || assets.attachments.length > 0 ? 1 : 0),
        ),
        status,
        media: {
          chapterText: topLevelText.text,
          attachments: assets.attachments,
          monetization: formData.monetization,
          reviewStatus: status === 'published' ? 'approved' : 'draft',
          publishedInstantly: status === 'published',
        },
      };

      // attach chapters if any
      if (normalizedChapters.length > 0) {
        storyPayload.media.chapters = normalizedChapters;
      } else if (chapters.length > 0) {
        // If user added chapters but uploadAssets didn't return (shouldn't happen), attach local chapter metadata without uploaded urls
        storyPayload.media.chapters = chapters.map(ch => ({ title: ch.title, text: ch.text, attachments: [] }));
      }

      if (storyExternalId) {
        await convex.mutation(api.stories.update, storyPayload);
      } else {
        await convex.mutation(api.stories.create, {
          ...storyPayload,
          creatorId: user.id,
          creatorUsername: user.username,
        });
        setStoryExternalId(externalId);
      }

      if (status === 'draft') {
        setExistingAttachments(assets.attachments);
        setPanelFiles([]);
        setUploadError('Draft saved. You can come back and continue editing.');
        setIsUploading(false);
        return;
      }

      window.location.assign('/home');
    } catch (error) {
      console.error(`Failed to ${status === 'draft' ? 'save draft' : 'publish story'}`, error);
      setUploadError(error instanceof Error ? error.message : `Failed to ${status === 'draft' ? 'save draft' : 'publish story'}.`);
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length) setStep((current) => current + 1);
    else saveStory('published');
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/studio')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl">Publish New Story</h1>
            <p className="text-sm text-white/40 font-bold mt-1">Publish instantly. Your content is approved automatically.</p>
          </div>
        </div>
        <Button variant="glass" onClick={() => saveStory('draft')} disabled={isUploading}>
          <Save size={16} className="mr-2" /> Save Draft
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="mb-8 bg-ink-deep/70 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Continue Draft</p>
          <div className="flex flex-wrap gap-2">
            {drafts.map((draft) => (
              <button
                key={draft.externalId || draft.title}
                onClick={() => loadDraft(draft)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:border-lemon-muted/60 transition-colors"
              >
                {draft.title || 'Untitled Draft'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -z-10" />
        <div className="absolute top-1/2 left-0 h-[1px] bg-lemon-muted -z-10 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
        {steps.map((label, idx) => {
          const isPast = idx + 1 < step;
          const isCurrent = idx + 1 === step;
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isPast ? 'bg-lemon-muted text-black' : isCurrent ? 'bg-black border-2 border-lemon-muted text-lemon-muted' : 'bg-ink-deep border border-white/20 text-white/40'
              }`}>
                {isPast ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 bg-ink-deep/50 border border-white/5 rounded-3xl p-6 md:p-10">
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Story Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Your Story Title"
                className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:border-lemon-muted outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Format</label>
                <select value={formData.format} onChange={(e) => setFormData({ ...formData, format: e.target.value })} className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white outline-none appearance-none font-medium">
                  <option>Manga</option>
                  <option>Manhwa</option>
                  <option>Webcomic</option>
                  <option>Novel</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Genre</label>
                <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 text-white outline-none appearance-none font-medium">
                  <option>Action</option>
                  <option>African Fantasy</option>
                  <option>Sci-Fi & Cyberpunk</option>
                  <option>Romance</option>
                  <option>Drama</option>
                  <option>Mystery</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Synopsis</label>
              <textarea value={formData.synopsis} onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })} placeholder="What is your story about?" rows={4} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-lemon-muted outline-none resize-none" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Cover Art (3:4)</label>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => selectImage(event, setCoverFile, setCoverPreview)} />
              <div onClick={() => coverInputRef.current?.click()} className="w-40 aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-lemon-muted hover:bg-white/5 transition-colors cursor-pointer text-white/40 hover:text-white overflow-hidden">
                {coverPreview ? <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" /> : <><ImageIcon size={32} /><span className="text-xs font-bold uppercase">Upload</span></>}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Banner Art (16:9)</label>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => selectImage(event, setBannerFile, setBannerPreview)} />
              <div onClick={() => bannerInputRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-lemon-muted hover:bg-white/5 transition-colors cursor-pointer text-white/40 hover:text-white overflow-hidden">
                {bannerPreview ? <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" /> : <><Upload size={32} /><span className="text-xs font-bold uppercase">Upload Banner</span></>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Write Story Text</label>
              <textarea
                value={formData.chapterText}
                onChange={(e) => setFormData({ ...formData, chapterText: e.target.value })}
                placeholder="Type or paste your first chapter here..."
                className="w-full min-h-[220px] bg-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-lemon-muted outline-none resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Upload PDF, Images, or Story Files</label>
              <input ref={panelInputRef} type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx,.epub" className="hidden" onChange={selectPanelFiles} />
              <button type="button" onClick={() => panelInputRef.current?.click()} className="w-full min-h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center gap-3 text-white/45 hover:text-white hover:border-lemon-muted transition-colors">
                <FileText size={24} /> Add files as story panels
              </button>
            </div>
            <div>
              <label className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2 block">Chapters (optional)</label>
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Chapter title" value={chapterForm.title} onChange={(e) => setChapterForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white" />
                <textarea placeholder="Chapter text (optional)" value={chapterForm.text} onChange={(e) => setChapterForm(f => ({ ...f, text: e.target.value }))} className="w-full min-h-[120px] bg-black border border-white/10 rounded-xl p-3 text-white" />
                <input ref={chapterInputRef} type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx,.epub" className="hidden" onChange={selectChapterFiles} />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => chapterInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">Add attachments</button>
                  <div className="flex-1 text-xs text-white/40">{chapterForm.files.length} files attached</div>
                  <button type="button" onClick={() => {
                    if (!chapterForm.title && !chapterForm.text && chapterForm.files.length === 0) return setUploadError('Add a title, text, or files before adding a chapter.');
                    setChapters(prev => [...prev, { title: chapterForm.title || `Chapter ${prev.length+1}`, text: chapterForm.text, files: chapterForm.files }]);
                    setChapterForm({ title: '', text: '', files: [] });
                    setUploadError(null);
                  }} className="px-4 py-2 bg-lemon-muted rounded-xl text-black font-bold">Add Chapter</button>
                </div>

                {chapters.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {chapters.map((ch, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
                        <div>
                          <p className="font-semibold">{ch.title}</p>
                          <p className="text-xs text-white/40">{(ch.text || '').slice(0, 120)}{ch.text && ch.text.length > 120 ? '...' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">{ch.files.length} files</span>
                          <button type="button" onClick={() => setChapters(prev => prev.filter((_, i) => i !== idx))} className="w-9 h-9 rounded-lg bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {[...existingAttachments, ...panelFiles.map((file) => ({ name: file.name, type: file.type, size: file.size, url: '' }))].length > 0 && (
              <div className="space-y-2">
                {[...existingAttachments.map((file, index) => ({ ...file, persisted: true, index })), ...panelFiles.map((file, index) => ({ name: file.name, type: file.type, size: file.size, url: '', persisted: false, index }))].map((file) => (
                  <div key={`${file.name}-${file.index}-${file.persisted}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-xs text-white/35">{Math.round(file.size / 1024)} KB {file.persisted ? 'saved' : 'ready to upload'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => file.persisted
                        ? setExistingAttachments((current) => current.filter((_, idx) => idx !== file.index))
                        : setPanelFiles((current) => current.filter((_, idx) => idx !== file.index))}
                      className="w-9 h-9 rounded-lg bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <h3 className="font-display text-2xl font-bold mb-2">Publish Instantly</h3>
            <div className="flex items-center justify-between p-4 bg-black border border-lemon-muted rounded-xl">
              <div>
                <h4 className="font-bold">Free to Read</h4>
                <p className="text-xs text-white/50">Publish live now. Admins can review after it is already visible.</p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-lemon-muted flex items-center justify-center bg-lemon-muted">
                <Check size={14} className="text-black" />
              </div>
            </div>
            <p className="text-xs text-white/40 text-center mt-6">You can save as draft anytime and continue editing later.</p>
          </div>
        )}

        {uploadError && <p className={`mt-6 text-sm font-bold ${uploadError.includes('saved') ? 'text-green-300' : 'text-red-300'}`}>{uploadError}</p>}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
        <Button variant="outline" size="lg" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isUploading}>
          Back
        </Button>
        <div className="flex gap-3 justify-end">
          <Button variant="glass" size="lg" onClick={() => saveStory('draft')} disabled={isUploading}>
            <Save size={18} className="mr-2" /> Draft
          </Button>
          <Button size="lg" onClick={handleNext} className="min-w-[150px]" disabled={isUploading}>
            {isUploading ? <Loader size={18} className="animate-spin" /> : step === steps.length ? 'Publish Live' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
