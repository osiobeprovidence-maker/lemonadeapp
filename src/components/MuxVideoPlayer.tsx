import React from 'react';

/**
 * Mux Video Player Component
 * Displays video playback using Mux's stream
 */

export interface MuxVideoPlayerProps {
  playbackId: string;
  title?: string;
  poster?: string;
}

export const MuxVideoPlayer: React.FC<MuxVideoPlayerProps> = ({
  playbackId,
  title = 'Video',
  poster,
}) => {
  const getMuxStreamUrl = (id: string): string => {
    return `https://stream.mux.com/${id}.m3u8`;
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        controls
        poster={poster}
        className="w-full h-full"
        title={title}
      >
        <source src={getMuxStreamUrl(playbackId)} type="application/x-mpegURL" />
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};

export default MuxVideoPlayer;
