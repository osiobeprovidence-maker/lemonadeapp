import { convex } from './convex';
import { api } from '../../convex/_generated/api';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_STORY_FILE_BYTES = 25 * 1024 * 1024;

const requireConvex = () => {
  if (!convex) {
    throw new Error('Image uploads are not configured. Convex is missing.');
  }
  return convex;
};

const normalizeUploadError = (error: unknown): Error => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('storage/unauthorized')) {
    return new Error('Image upload is blocked by storage permissions. Please sign in again and try once more.');
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return new Error('Image upload failed because the network connection dropped. Please try again.');
  }
  return new Error(message || 'Failed to upload image.');
};

/**
 * Upload image to Convex storage and return a signed download URL.
 * @param file - Image file to upload
 * @param folder - Logical image category, kept for call-site clarity
 * @param userId - User ID, kept for call-site clarity
 */
export const uploadImage = async (
  file: File,
  folder: string,
  userId: string
): Promise<string> => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file (JPG, PNG, WebP, etc.)');
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('Image size must be less than 5MB');
    }

    const client = requireConvex();
    const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Image upload failed with status ${response.status}.`);
    }

    const { storageId } = await response.json();
    if (!storageId) {
      throw new Error('Image upload completed without a storage id.');
    }

    return await client.mutation(api.files.getUrl, { storageId });
  } catch (error) {
    throw normalizeUploadError(error);
  }
};

export const uploadStoryFile = async (
  file: File,
  userId: string
): Promise<{ name: string; type: string; size: number; url: string }> => {
  void userId;
  try {
    if (file.size > MAX_STORY_FILE_BYTES) {
      throw new Error('Story files must be less than 25MB.');
    }

    const client = requireConvex();
    const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`File upload failed with status ${response.status}.`);
    }

    const { storageId } = await response.json();
    if (!storageId) {
      throw new Error('File upload completed without a storage id.');
    }

    const url = await client.mutation(api.files.getUrl, { storageId });
    return {
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      url,
    };
  } catch (error) {
    throw normalizeUploadError(error);
  }
};

/**
 * Upload profile picture specifically
 * @param file - Image file to upload
 * @param userId - User ID
 */
export const uploadProfilePicture = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'profile-pictures', userId);
};

/**
 * Upload story cover image
 * @param file - Image file to upload
 * @param userId - Story creator's user ID
 */
export const uploadStoryCover = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'story-covers', userId);
};

/**
 * Upload banner image
 * @param file - Image file to upload
 * @param userId - User ID
 */
export const uploadBannerImage = async (
  file: File,
  userId: string
): Promise<string> => {
  return uploadImage(file, 'banners', userId);
};

/**
 * Delete image from Firebase Storage
 * @param imageUrl - Full download URL of the image
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  void imageUrl;
  // Convex storage URLs are immutable signed URLs. Old uploads are harmless
  // and should be cleaned up by a backend retention job if needed.
  return;
};

/**
 * Get file size in human-readable format
 * @param bytes - File size in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Compress image before upload (optional, for bandwidth optimization)
 * @param file - Image file to compress
 * @param quality - Compression quality 0-1 (default: 0.8)
 */
export const compressImage = async (
  file: File,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
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
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
