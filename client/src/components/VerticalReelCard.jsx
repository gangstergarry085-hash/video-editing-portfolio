import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiArrowsPointingOut,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import { resolveMediaUrl } from '../lib/api';

/**
 * Mobile-first Vertical (9:16) Video Player Card
 * Engineered for instant poster paint, zero-lag inline playback, and tactile audio controls.
 */
export default function VerticalReelCard({ project }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  const videoSrc = project.mobile_video_url || project.video_url;
  const posterSrc = project.thumbnail_url
    ? resolveMediaUrl(project.thumbnail_url, 'image')
    : null;

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current) {
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Reset playback if card leaves viewport (optional optimization)
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-surface-card border border-border/80 hover:border-accent/50 transition-all duration-300 shadow-xl hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
    >
      {/* ── 9:16 Vertical Video Frame ──────────────────── */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-surface-elevated select-none">
        {/* Instant Poster Thumbnail (always ready, zero paint lag) */}
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={project.title}
            loading="eager"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-700 filter brightness-95 group-hover:brightness-100 ${
              isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100 group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-surface via-surface-card to-black p-6 text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-accent mb-2 animate-ping" />
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
              9:16 VERTICAL REEL
            </span>
            <span className="text-sm font-display font-bold text-text-primary mt-1">
              {project.title}
            </span>
          </div>
        )}

        {/* Zero-Lag HTML5 Video Element (mounted when played or preloaded) */}
        {isPlaying && videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            autoPlay
            preload="auto"
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        )}

        {/* Ambient Film Letterbox Gradient (hidden when playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/40 pointer-events-none z-15" />
        )}

        {/* Category & Format Pill Badges - Top (hidden when playing so video is 100% visible) */}
        {!isPlaying && (
          <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-1.5 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold glass border border-white/20 text-white shadow-lg">
              {project.category}
            </span>
            {project.project_type && (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-black/70 border border-white/10 text-accent font-bold">
                {project.project_type}
              </span>
            )}
          </div>
        )}

        {/* Interactive Center Play / Pause Button Overlay */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-25 flex items-center justify-center cursor-pointer transition-opacity"
        >
          {!isPlaying ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-accent/95 hover:bg-accent text-surface flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.55)] transition-all group-hover:scale-105"
            >
              <HiPlay className="w-7 h-7 ml-1 text-surface" />
            </motion.div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <HiPause className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Playback Progress Scrubber (visible when playing) */}
        {isPlaying && (
          <div className="absolute bottom-12 left-3 right-3 z-30 pointer-events-none">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-accent transition-all duration-150 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom Micro-HUD Controls (Audio Mute, Timecode, Fullscreen) */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-2">
            {isPlaying && (
              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black hover:border-accent text-white transition-all cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Audio"
              >
                {isMuted ? (
                  <HiSpeakerXMark className="w-4 h-4 text-red-400" />
                ) : (
                  <HiSpeakerWave className="w-4 h-4 text-accent" />
                )}
              </button>
            )}

            {isPlaying && duration > 0 && (
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white/80 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black hover:border-accent text-white transition-all cursor-pointer"
                title="Fullscreen"
                aria-label="Fullscreen"
              >
                <HiArrowsPointingOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Metadata & Case Info ────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-surface-card">
        <div>
          {/* Client Tag */}
          {project.client_name && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                {project.client_name}
              </span>
            </div>
          )}

          {/* Reel Title */}
          <h3 className="text-lg font-display font-bold text-text-primary group-hover:text-accent transition-colors tracking-tight leading-snug">
            {project.title}
          </h3>

          {/* Description */}
          {project.short_description && (
            <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed font-sans">
              {project.short_description}
            </p>
          )}
        </div>

        {/* Tools and Action Row */}
        <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between gap-2">
          {/* Tool Tags */}
          <div className="flex flex-wrap gap-1">
            {(project.tools || []).slice(0, 2).map((tool) => (
              <span
                key={tool}
                className="text-[9px] font-mono text-text-secondary bg-surface-elevated px-2 py-0.5 rounded border border-border/50"
              >
                {tool}
              </span>
            ))}
          </div>

          {/* Link to Project Detail / Timeline */}
          {project.slug ? (
            <Link
              to={`/project/${project.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-accent hover:text-accent-hover transition-colors group/link cursor-pointer shrink-0"
            >
              <span>CASE STORY</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer shrink-0"
            >
              <span>WATCH REEL</span>
              <HiPlay className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
