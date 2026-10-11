import { useState, useMemo } from 'react';

/**
 * Universal Video Player Component
 * Automatically detects and handles YouTube, Vimeo, Google Drive, and direct video files (.mp4, .webm, .mov)
 * Google Drive videos stream cleanly via native HTML5 video with full mobile/vertical support
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
  const [useIframeFallback, setUseIframeFallback] = useState(false);

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

    // Google Drive regex matching /file/d/{id}, /open?id={id}, /uc?id={id}
    const gDriveMatch = trimmed.match(
      /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i
    );
    if (gDriveMatch && gDriveMatch[1]) {
      const fileId = gDriveMatch[1];
      return {
        type: 'googledrive',
        fileId,
        // Stream directly using Google Drive's content CDN for clean native HTML5 video
        src: `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      };
    }

    // Direct video stream / file URL
    return {
      type: 'direct',
      src: trimmed,
    };
  }, [url, autoPlay, muted, loop]);

  const resolvedPoster = useMemo(() => {
    if (poster && typeof poster === 'string') {
      const match = poster.trim().match(
        /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i
      );
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
      return poster;
    }
    // Auto-generate clean high-res poster from Google Drive video if no poster set
    if (videoMeta?.type === 'googledrive' && videoMeta?.fileId) {
      return `https://lh3.googleusercontent.com/d/${videoMeta.fileId}`;
    }
    return null;
  }, [poster, videoMeta]);

  if (!url || !videoMeta || hasError) {
    if (resolvedPoster) {
      return (
        <img
          src={resolvedPoster}
          alt={title}
          loading="lazy"
          className={className}
        />
      );
    }
    return null;
  }

  // Only YouTube, Vimeo, or fallback Google Drive render an iframe
  if (videoMeta.type === 'youtube' || videoMeta.type === 'vimeo' || (videoMeta.type === 'googledrive' && useIframeFallback)) {
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

  // Google Drive & direct files play via native HTML5 video (clean mobile controls, zero clutter)
  return (
    <video
      src={videoMeta.src}
      poster={resolvedPoster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
      onError={() => {
        // If direct stream fails (e.g. >100MB file limit), gracefully fall back to preview iframe
        if (videoMeta.type === 'googledrive' && !useIframeFallback) {
          setUseIframeFallback(true);
        } else {
          setHasError(true);
        }
      }}
      className={className}
    />
  );
}
