import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileText, Image as ImageIcon, Loader, Plus, Trash2, Upload, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../../convex/_generated/api';
import { convex } from '../lib/convex';
import { useCurrentUser } from '../hooks/useConvex';
import { compressImage, uploadBannerImage, uploadStoryCover, uploadStoryFile } from '../lib/imageUpload';

interface StoryDocument {
  _id: string;
  externalId?: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  genre: string;
  format: string;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  tags: string[];
  isOriginal: boolean;
  status: string;
  episodes: number;
  media?: {
    chapterText?: string;
    attachments?: Array<{ name: string; url: string; type?: string; size?: number }>;
    chapters?: ManagedChapter[];
    monetization?: string;
    credits?: string;
  };
}

type StoryAttachment = {
  name: string;
  url: string;
  type?: string;
  size?: number;
};

type ManagedChapter = {
  title: string;
  text: string;
  attachments: StoryAttachment[];
  monetization?: string;
  price?: number;
};

export default function CreatorStoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    format: 'Manga',
    synopsis: '',
    tags: ['Original'],
    chapterText: '',
    monetization: 'free',
    credits: '',
  });
  const [episodes, setEpisodes] = useState(1);
  const [coverPreview, setCoverPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [panelFiles, setPanelFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<StoryAttachment[]>([]);
  const [managedChapters, setManagedChapters] = useState<ManagedChapter[]>([]);
  const [newChapterText, setNewChapterText] = useState('');

  const isCreator = Boolean(user && story && user.username === story.creatorUsername);

  useEffect(() => {
    if (!convex || !id) return;

    const loadStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const storyDoc = await convex.query(api.stories.getByExternalId, { externalId: id });
        if (!storyDoc) {
          setError('Story not found.');
          setStory(null);
          return;
        }

        setStory(storyDoc as StoryDocument);
        setFormData({
          title: storyDoc.title,
          genre: storyDoc.genre,
          format: storyDoc.format,
          synopsis: storyDoc.synopsis,
          tags: storyDoc.tags || ['Original'],
          chapterText: storyDoc.media?.chapterText || '',
          monetization: storyDoc.media?.monetization || 'free',
          credits: storyDoc.media?.credits || '',
        });
        setEpisodes(storyDoc.episodes || 1);
        setCoverPreview(storyDoc.coverImage || '');
        setBannerPreview(storyDoc.bannerImage || '');
        setExistingAttachments(storyDoc.media?.attachments || []);
        const sourceChapters = Array.isArray(storyDoc.media?.chapters) ? storyDoc.media.chapters : [];
        const hydratedChapters = sourceChapters.length > 0
          ? sourceChapters.map((chapter: any, index: number) => ({
            title: chapter.title || `Episode ${index + 1}`,
            text: chapter.text || '',
            attachments: Array.isArray(chapter.attachments) ? chapter.attachments : [],
            monetization: chapter.monetization,
            price: chapter.price,
          }))
          : storyDoc.media?.chapterText
            ? [{ title: 'Episode 1', text: storyDoc.media.chapterText, attachments: [] }]
            : [];
        setManagedChapters(hydratedChapters);
        setEpisodes(Math.max(1, hydratedChapters.length || storyDoc.episodes || 1));
      } catch (err) {
        console.error('Failed to load story', err);
        setError('Unable to load story. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id]);

  const selectImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError(null);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const selectPanelFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];
    const oversized = files.find((file) => file.size > 25 * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name} is too large. Files must be under 25MB.`);
      return;
    }
    setError(null);
    setPanelFiles((current) => [...current, ...files]);
    event.target.value = '';
  };

  const uploadAssets = async () => {
    if (!story || !user) return { coverImage: coverPreview, bannerImage: bannerPreview, attachments: existingAttachments };
    const coverImage = coverFile
      ? await uploadStoryCover(await compressImage(coverFile, 0.82), user.id)
      : coverPreview;
    const bannerImage = bannerFile
      ? await uploadBannerImage(await compressImage(bannerFile, 0.86), user.id)
      : bannerPreview;
    const newAttachments = await Promise.all(panelFiles.map((file) => uploadStoryFile(file, user.id)));
    return {
      coverImage,
      bannerImage,
      attachments: [...existingAttachments, ...newAttachments],
    };
  };

  const setChaptersAndEpisodeCount = (updater: (current: ManagedChapter[]) => ManagedChapter[]) => {
    setManagedChapters((current) => {
      const next = updater(current);
      setEpisodes(Math.max(1, next.length || 1));
      return next;
    });
  };

  const updateChapter = (index: number, updates: Partial<ManagedChapter>) => {
    setChaptersAndEpisodeCount((current) => current.map((chapter, chapterIndex) => (
      chapterIndex === index ? { ...chapter, ...updates } : chapter
    )));
  };

  const deleteChapter = (index: number) => {
    const chapter = managedChapters[index];
    const confirmed = window.confirm(`Delete ${chapter?.title || `Episode ${index + 1}`}? This removes it after you save changes.`);
    if (!confirmed) return;

    setChaptersAndEpisodeCount((current) => current.filter((_, chapterIndex) => chapterIndex !== index));
    setSuccess('Episode removed locally. Save changes to sync it.');
  };

  const normalizedChapters = () => managedChapters
    .map((chapter, index) => ({
      title: chapter.title.trim() || `Episode ${index + 1}`,
      text: chapter.text,
      attachments: chapter.attachments || [],
      monetization: chapter.monetization,
      price: chapter.price,
    }))
    .filter((chapter) => chapter.title.trim() || chapter.text.trim() || chapter.attachments.length > 0);

  const saveChanges = async () => {
    if (!story || !convex) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const assets = await uploadAssets();
      const chaptersForSave = normalizedChapters();
      const firstChapterText = chaptersForSave[0]?.text ?? formData.chapterText;
      const episodeCount = Math.max(1, chaptersForSave.length || episodes);
      const payload = {
        externalId: story.externalId || story._id,
        title: formData.title.trim() || story.title,
        genre: formData.genre,
        format: formData.format,
        synopsis: formData.synopsis.trim() || story.synopsis,
        coverImage: assets.coverImage,
        bannerImage: assets.bannerImage,
        tags: formData.tags,
        isOriginal: story.isOriginal,
        episodes: episodeCount,
        media: {
          chapterText: firstChapterText,
          attachments: assets.attachments,
          chapters: chaptersForSave,
          monetization: formData.monetization,
          credits: formData.credits,
        },
      };

      await convex.mutation(api.stories.update, payload);
      setSuccess('Story changes saved successfully.');
      setPanelFiles([]);
      setExistingAttachments(assets.attachments);
      setEpisodes(episodeCount);
      setManagedChapters(chaptersForSave);
      if (story.externalId) {
        setStory({ ...story, ...payload, media: payload.media } as StoryDocument);
      }
    } catch (err) {
      console.error('Failed to save story', err);
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addChapter = () => {
    if (!story) return;
    const nextIndex = managedChapters.length + 1;
    setChaptersAndEpisodeCount((current) => ([
      ...current,
      {
        title: `Episode ${nextIndex}`,
        text: newChapterText.trim(),
        attachments: [],
      },
    ]));
    setNewChapterText('');
    setSuccess('Episode added locally. Save changes to sync it.');
  };

  const archiveStory = async () => {
    if (!story || !convex) return;
    const confirmed = window.confirm('Archive this story? It will be removed from active listings.');
    if (!confirmed) return;
    setSaving(true);
    setError(null);
    try {
      await convex.mutation(api.stories.update, {
        externalId: story.externalId || story._id,
        status: 'archived',
      });
      navigate('/studio');
    } catch (err) {
      console.error('Failed to archive story', err);
      setError('Unable to archive story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const publishStory = async () => {
    if (!story || !convex) return;
    if (story.status === 'published') {
      setError('This story is already published.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await convex.mutation(api.stories.update, {
        externalId: story.externalId || story._id,
        status: 'published',
      });
      setSuccess('Story published successfully!');
      setStory({ ...story, status: 'published' });
    } catch (err) {
      console.error('Failed to publish story', err);
      setError('Unable to publish story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const existingStoryLink = `/story/${story?.externalId || story?._id}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Loader size={28} className="animate-spin text-lemon-muted" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center text-white/70">
        <p className="text-xl font-bold">Unable to load story.</p>
        <p className="max-w-md mt-3">{error || 'This story may no longer exist or you do not have permission to edit it.'}</p>
        <Link to="/studio">
          <Button className="mt-6">Back to Studio</Button>
        </Link>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center text-white/70">
        <p className="text-xl font-bold">Access denied.</p>
        <p className="max-w-md mt-3">Only the creator who owns this story can edit it.</p>
        <Link to="/studio">
          <Button className="mt-6">Back to Studio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display font-black text-4xl mb-2">Edit Story</h1>
          <p className="text-white/50">Manage your story, add chapters, update credits, and archive content.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/studio">
            <Button variant="outline">Back to Studio</Button>
          </Link>
          <a href={existingStoryLink} target="_blank" rel="noreferrer">
            <Button variant="glass">View Live Story</Button>
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          <section className="bg-ink-deep border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-2xl">Story details</h2>
                <p className="text-sm text-white/40">Update title, synopsis, cover, and credits.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.28em] text-white/40">{story.status}</span>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lemon-muted"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white/50 mb-2 block">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData((current) => ({ ...current, format: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                  >
                    <option>Manga</option>
                    <option>Manhwa</option>
                    <option>Webcomic</option>
                    <option>Novel</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/50 mb-2 block">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData((current) => ({ ...current, genre: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                  >
                    <option>Action</option>
                    <option>Adventure</option>
                    <option>Fantasy</option>
                    <option>Romance</option>
                    <option>Drama</option>
                    <option>Comedy</option>
                    <option>Sci-Fi</option>
                    <option>Horror</option>
                    <option>Mystery</option>
                    <option>Thriller</option>
                    <option>Slice of Life</option>
                    <option>Historical</option>
                    <option>Supernatural</option>
                    <option>Sports</option>
                    <option>School Life</option>
                    <option>Psychological</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Synopsis</label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData((current) => ({ ...current, synopsis: e.target.value }))}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none resize-none focus:border-lemon-muted"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Credits</label>
                <textarea
                  value={formData.credits}
                  onChange={(e) => setFormData((current) => ({ ...current, credits: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none resize-none focus:border-lemon-muted"
                  placeholder="Add author, editor, illustrator credits or thank-you notes."
                />
              </div>
            </div>
          </section>

          <section className="bg-ink-deep border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bold text-2xl">Chapter manager</h2>
                <p className="text-sm text-white/40">Add, edit, and delete story episodes before publishing updates.</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold text-white/80">{managedChapters.length || episodes} episodes</div>
            </div>

            <div className="space-y-6">
              {managedChapters.length > 0 ? (
                <div className="space-y-4">
                  {managedChapters.map((chapter, index) => (
                    <article key={`${chapter.title}-${index}`} className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.28em] text-lemon-muted">Episode {index + 1}</p>
                          <p className="mt-1 text-sm text-white/40">{chapter.text.trim() ? `${chapter.text.trim().split(/\s+/).length} words` : 'No story text yet'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteChapter(index)}
                          className="rounded-xl bg-red-500/10 p-2 text-red-300 transition-colors hover:bg-red-500 hover:text-white"
                          aria-label={`Delete ${chapter.title || `Episode ${index + 1}`}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/50">Episode title</label>
                          <input
                            value={chapter.title}
                            onChange={(e) => updateChapter(index, { title: e.target.value })}
                            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-lemon-muted"
                            placeholder={`Episode ${index + 1}`}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/50">Episode text</label>
                          <textarea
                            value={chapter.text}
                            onChange={(e) => updateChapter(index, { text: e.target.value })}
                            rows={7}
                            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none resize-none focus:border-lemon-muted"
                            placeholder="Write or paste the episode text here."
                          />
                        </div>
                        {chapter.attachments.length > 0 && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="mb-2 text-xs font-black uppercase tracking-widest text-white/35">Episode files</p>
                            <div className="space-y-2">
                              {chapter.attachments.map((attachment, attachmentIndex) => (
                                <div key={`${attachment.name}-${attachmentIndex}`} className="flex items-center gap-2 text-sm text-white/60">
                                  <FileText size={14} className="text-lemon-muted" />
                                  <span className="truncate">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-black/25 p-6 text-center">
                  <FileText size={24} className="mx-auto mb-3 text-lemon-muted" />
                  <p className="font-bold">No episodes yet</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">Create the first episode, add text, then save changes to publish the new structure.</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-white/50 mb-2 block">New episode starter text</label>
                <textarea
                  value={newChapterText}
                  onChange={(e) => setNewChapterText(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none resize-none focus:border-lemon-muted"
                  placeholder="Optional: paste the first draft of the next episode here."
                />
                <Button variant="outline" onClick={addChapter} disabled={saving}>
                  <Plus size={16} className="mr-2" /> Add episode
                </Button>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Upload chapter files</label>
                <input type="file" multiple hidden id="chapter-files" onChange={selectPanelFiles} accept="image/*,.pdf,.txt,.doc,.docx,.epub" />
                <label htmlFor="chapter-files" className="group flex min-h-[112px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-6 text-center text-white/55 transition-colors hover:border-lemon-muted hover:bg-lemon-muted/5 hover:text-white">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/55 transition-colors group-hover:bg-lemon-muted group-hover:text-black">
                    <Upload size={18} />
                  </div>
                  <span className="text-sm font-bold">Add or replace chapter attachments</span>
                  <span className="mt-1 text-xs text-white/35">Images, PDFs, docs, EPUB, or text files up to 25MB.</span>
                </label>
                {existingAttachments.length + panelFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {[...existingAttachments.map((attachment, index) => ({ ...attachment, persisted: true, index })), ...panelFiles.map((file, index) => ({ name: file.name, url: '', type: file.type, size: file.size, persisted: false, index }))].map((item) => (
                      <div key={`${item.name}-${item.index}-${item.persisted}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{item.name}</p>
                          <p className="text-xs text-white/40">{item.persisted ? 'Saved attachment' : 'New file'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.persisted) {
                              setExistingAttachments((current) => current.filter((_, idx) => idx !== item.index));
                            } else {
                              setPanelFiles((current) => current.filter((_, idx) => idx !== item.index));
                            }
                          }}
                          className="rounded-lg bg-red-500/10 p-2 text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-ink-deep border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="font-bold text-xl">Visuals</h2>
              <p className="text-sm text-white/40">Update story cover and banner artwork.</p>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Cover image</label>
                <input type="file" hidden id="story-cover" accept="image/*" onChange={(event) => selectImage(event, setCoverFile, setCoverPreview)} />
                <label htmlFor="story-cover" className="group block cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-lemon-muted">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="h-48 w-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex min-h-[200px] items-center justify-center text-white/40">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </label>
              </div>
              <div>
                <label className="text-sm font-semibold text-white/50 mb-2 block">Banner image</label>
                <input type="file" hidden id="story-banner" accept="image/*" onChange={(event) => selectImage(event, setBannerFile, setBannerPreview)} />
                <label htmlFor="story-banner" className="group block cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-lemon-muted">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" className="h-40 w-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex min-h-[120px] items-center justify-center text-white/40">
                      <Upload size={24} />
                    </div>
                  )}
                </label>
              </div>
            </div>
          </section>

          <section className="bg-ink-deep border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="font-bold text-xl">Actions</h2>
              <p className="text-sm text-white/40">Save your updates or archive the story when you're done.</p>
            </div>
            {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
            {success && <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100">{success}</div>}
            <div className="flex flex-col gap-3">
              <Button onClick={saveChanges} disabled={saving}>
                {saving ? <Loader size={16} className="mr-2 animate-spin" /> : <Check size={16} className="mr-2" />} Save changes
              </Button>
              {story.status === 'draft' && (
                <Button onClick={publishStory} disabled={saving} className="bg-lemon-muted text-black hover:bg-lemon-muted/90">
                  {saving ? <Loader size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />} Publish story
                </Button>
              )}
              <Button variant="outline" className="text-red-300 border-red-500/20 hover:border-red-400 hover:text-red-100" onClick={archiveStory} disabled={saving}>
                <Trash2 size={16} className="mr-2" /> Archive story
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
