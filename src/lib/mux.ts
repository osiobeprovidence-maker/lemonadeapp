/**
 * Mux Video Integration
 * Handles video uploads and playback through Mux's infrastructure
 */

export interface MuxUploadConfig {
  tokenId: string;
}

export interface MuxPlaybackConfig {
  playbackId: string;
  startTime?: number;
}

export const getMuxConfig = (): MuxUploadConfig => {
  const tokenId = import.meta.env.VITE_MUX_TOKEN_ID;

  if (!tokenId) {
    throw new Error('Mux public token ID is missing. Please set VITE_MUX_TOKEN_ID');
  }

  return { tokenId };
};

/**
 * Get Mux Stream URL for video playback
 */
export const getMuxStreamUrl = (playbackId: string): string => {
  return `https://stream.mux.com/${playbackId}.m3u8`;
};

/**
 * Create a Mux Direct Upload URL
 */
export const createMuxDirectUploadUrl = async (filename: string): Promise<string> => {
  getMuxConfig();
  
  try {
    const response = await fetch('/api/mux-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Mux upload: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error creating Mux upload URL:', error);
    throw error;
  }
};

export default {
  getMuxConfig,
  getMuxStreamUrl,
  createMuxDirectUploadUrl,
};
