import { convex } from './convex';
import { api } from '../../convex/_generated/api';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_STORY_FILE_BYTES = 25 * 1024 * 1024;
const MAX_RETRIES = 2;
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const requireConvex = () => {
  if (!convex) {
    throw new Error('Uploads are not configured. Convex is missing.');
  }
  return convex;
};

function getFileReaderError(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotFoundError': return 'File not found';
      case 'SecurityError': return 'Permission denied';
      case 'NotReadableError': return 'File is too large or corrupted';
      case 'AbortError': return 'File read was cancelled';
    }
  }
  return error instanceof Error ? error.message : String(error);
}

function getUploadErrorMessage(cause: string): string {
  if (cause.includes('storage/unauthorized')) {
    return 'Upload is blocked by storage permissions. Please sign in again.';
  }
  if (cause.includes('Failed to fetch') || cause.includes('NetworkError')) {
    return 'Upload failed because the network connection dropped. Please try again.';
  }
  if (cause.includes('not found') || cause.includes('NotFound')) {
    return 'File not found';
  }
  if (cause.includes('permission') || cause.includes('denied') || cause.includes('Security')) {
    return 'Permission denied';
  }
  if (cause.includes('too large') || cause.includes('exceeds') || cause.includes('size')) {
    return 'File is too large';
  }
  return cause || 'Upload failed';
}

function validateImageFile(file: File): void {
  if (!file.type || !file.type.startsWith('image/')) {
    console.warn('[upload] Rejected file — unsupported type:', file.name, file.type);
    throw new Error('Unsupported file type');
  }
  if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
    console.warn('[upload] Rejected file — unlisted image mime:', file.name, file.type);
    throw new Error('Unsupported file type');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    console.warn('[upload] Rejected file — too large:', file.name, formatFileSize(file.size));
    throw new Error('File is too large');
  }
}

function validateStoryFile(file: File): void {
  if (file.size > MAX_STORY_FILE_BYTES) {
    console.warn('[upload] Rejected file — too large:', file.name, formatFileSize(file.size));
    throw new Error('File is too large');
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      console.warn(`[upload] fetch attempt ${attempt + 1}/${retries + 1} failed:`, err);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Upload failed');
}

async function readFileAsDataURL(file: File, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => {
          const err = e.target?.error || new Error('Failed to read file');
          reject(err);
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.warn(`[upload] FileReader attempt ${attempt + 1}/${retries + 1} failed:`, getFileReaderError(err));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        throw new Error(getFileReaderError(err));
      }
    }
  }
  throw new Error('Failed to read file');
}

async function uploadFileToConvex(
  file: File,
  contentType: string,
  logLabel: string,
): Promise<string> {
  const client = requireConvex();
  console.log(`[upload] ${logLabel} — generating upload URL`);
  const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
  console.log(`[upload] ${logLabel} — upload URL obtained`);

  const response = await fetchWithRetry(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[upload] ${logLabel} — HTTP ${response.status}:`, body);
    throw new Error('Upload failed');
  }

  const { storageId } = await response.json();
  if (!storageId) {
    console.error(`[upload] ${logLabel} — missing storageId in response`);
    throw new Error('Upload failed');
  }

  console.log(`[upload] ${logLabel} — storageId: ${storageId}`);
  return storageId;
}

export const uploadImage = async (
  file: File,
  folder: string,
  userId: string
): Promise<string> => {
  console.log('[upload] Image selected:', { name: file.name, type: file.type, size: file.size, folder });
  try {
    validateImageFile(file);
    const client = requireConvex();
    const storageId = await uploadFileToConvex(file, file.type, 'image');
    console.log('[upload] Image upload completed');
    const url = await client.mutation(api.files.getUrl, { storageId });
    if (!url) throw new Error('Upload failed');
    console.log('[upload] Image URL obtained');
    return url;
  } catch (error) {
    const message = getUploadErrorMessage(error instanceof Error ? error.message : String(error));
    console.error('[upload] Image upload failed:', message);
    throw new Error(message);
  }
};

export const uploadStoryFile = async (
  file: File,
  userId: string
): Promise<{ name: string; type: string; size: number; url: string }> => {
  void userId;
  console.log('[upload] Story file selected:', { name: file.name, type: file.type, size: file.size });
  try {
    validateStoryFile(file);
    const client = requireConvex();
    const contentType = file.type || 'application/octet-stream';
    const storageId = await uploadFileToConvex(file, contentType, 'story file');
    console.log('[upload] Story file upload completed');
    const url = await client.mutation(api.files.getUrl, { storageId });
    if (!url) throw new Error('Upload failed');
    console.log('[upload] Story file URL obtained');
    return {
      name: file.name,
      type: contentType,
      size: file.size,
      url,
    };
  } catch (error) {
    const message = getUploadErrorMessage(error instanceof Error ? error.message : String(error));
    console.error('[upload] Story file upload failed:', message);
    throw new Error(message);
  }
};

export const uploadProfilePicture = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'profile-pictures', userId);
};

export const uploadStoryCover = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'story-covers', userId);
};

export const uploadBannerImage = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'banners', userId);
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  void imageUrl;
  return;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const compressImage = async (
  file: File,
  quality: number = 0.8
): Promise<File> => {
  console.log('[upload] Compress image selected:', { name: file.name, type: file.type, size: file.size, quality });
  validateImageFile(file);

  const dataUrl = await readFileAsDataURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 1200;
      const maxHeight = 1200;

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log('[upload] Compressed:', { original: file.size, compressed: compressedFile.size });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};
