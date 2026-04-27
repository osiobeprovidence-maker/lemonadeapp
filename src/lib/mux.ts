/**
 * Mux Video Integration
 * Handles video uploads and playback through Mux's infrastructure
 */

export interface MuxUploadConfig {
  tokenId: string;
  tokenSecret: string;
}

export interface MuxPlaybackConfig {
  playbackId: string;
  startTime?: number;
}

export const getMuxConfig = (): MuxUploadConfig => {
  const tokenId = import.meta.env.VITE_MUX_TOKEN_ID;
  const tokenSecret = import.meta.env.VITE_MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    throw new Error('Mux configuration is missing. Please set VITE_MUX_TOKEN_ID and VITE_MUX_TOKEN_SECRET');
  }

  return { tokenId, tokenSecret };
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
  const config = getMuxConfig();
  
  try {
    const response = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.tokenId}:${config.tokenSecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cors_origin: window.location.origin,
        new_asset_settings: {
          playback_policy: ['public'],
        },
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
