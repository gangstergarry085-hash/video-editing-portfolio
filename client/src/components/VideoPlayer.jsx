import { useState, useMemo } from 'react';

/**
 * Universal Video Player Component
 * Automatically detects and handles YouTube, Vimeo, and direct video files (.mp4, .webm, .mov, /uploads/...)
 */
export default function VideoPlayer({
  url,
  poster,
  title = 'Video player',
  className = 'w-full h-full object-cover',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}) {
  const [hasError, setHasError] = useState(false);

  const videoMeta = useMemo(() => {
    if (!url || typeof url !== 'string') return null;

    const trimmed = url.trim();

    // YouTube regex matching standard, short, embed, and shorts URLs
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&playsinline=1${autoPlay ? '&autoplay=1' : ''}${muted ? '&mute=1' : ''}${loop ? `&loop=1&playlist=${ytMatch[1]}` : ''}`,
      };
    }

    // Vimeo regex matching video IDs
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&title=0&byline=0&portrait=0${autoPlay ? '&autoplay=1' : ''}${muted ? '&muted=1' : ''}${loop ? '&loop=1' : ''}`,
      };
    }

    // Direct video stream / file URL
    return {
      type: 'direct',
      src: trimmed,
    };
  }, [url, autoPlay, muted, loop]);

  if (!url || !videoMeta || hasError) {
    if (poster) {
      return (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          className={className}
        />
      );
    }
    return null;
  }

  if (videoMeta.type === 'youtube' || videoMeta.type === 'vimeo') {
    return (
      <iframe
        src={videoMeta.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`w-full h-full border-0 ${className}`}
      />
    );
  }

  return (
    <video
      src={videoMeta.src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
