import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload image to Firebase Storage and return download URL
 * @param file - Image file to upload
 * @param folder - Storage folder path (e.g., 'profile-pictures', 'story-covers')
 * @param userId - User ID to organize uploads
 */
export const uploadImage = async (
  file: File,
  folder: string,
  userId: string
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file (JPG, PNG, WebP, etc.)');
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error('Image size must be less than 5MB');
    }

    // Create storage path: folder/userId/filename-timestamp
    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}`;
    const storagePath = `${folder}/${userId}/${filename}`;
    const storageRef = ref(storage, storagePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        userId,
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image'
    );
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
 * Delete image from Firebase Storage
 * @param imageUrl - Full download URL of the image
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;

    // Extract storage path from URL
    // URL format: https://firebasestorage.googleapis.com/v0/b/PROJECT.appspot.com/o/PATH?alt=media&token=TOKEN
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathStart = decodedUrl.indexOf('/o/') + 3;
    const pathEnd = decodedUrl.indexOf('?');
    const storagePath = decodedUrl.substring(pathStart, pathEnd);

    // Delete from storage
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Failed to delete image:', error);
    // Don't throw error - image might already be deleted
  }
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
