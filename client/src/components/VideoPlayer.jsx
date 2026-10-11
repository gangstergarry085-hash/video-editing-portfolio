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
      <div className="relative w-full h-full group">
        <iframe
          src={videoMeta.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={`w-full h-full border-0 ${className}`}
        />
        {videoMeta.type === 'googledrive' && (
          <a
            href={`https://drive.google.com/file/d/${videoMeta.fileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-black text-white hover:text-accent border border-white/20 text-[10px] font-mono tracking-wider shadow-xl transition-all duration-200 backdrop-blur-md active:scale-95"
            title="Open clean Fullscreen"
          >
            <span>FULLSCREEN HD</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
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
