import { useRef, useEffect, useCallback, useMemo } from 'react';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { resolveMediaUrl } from '../lib/api';

export default function BeforeAfterSlider({
  rawMedia,
  finalMedia,
  title = 'Color Grade Comparison',
  description = 'Continuous cinema wipe comparing raw camera flat log profile with final cinematic color grade.',
  rawLabel = 'RAW S-LOG3',
  finalLabel = 'GRADED REC.709',
}) {
  const containerRef = useRef(null);
  const clipLayerRef = useRef(null);
  const dividerRef = useRef(null);
  const percentRef = useRef(null);
  const rawVideoRef = useRef(null);
  const finalVideoRef = useRef(null);

  const stateRef = useRef({
    isDragging: false,
    resumeTimer: null,
    currentPos: 50,
    animPhase: 0,
    isVisible: true,
  });

  const isVideoRaw = rawMedia && Boolean(rawMedia.match(/\.(mp4|webm|mov|ogg)/i));
  const isVideoFinal = finalMedia && Boolean(finalMedia.match(/\.(mp4|webm|mov|ogg)/i));

  const resolvedRaw = useMemo(() => resolveMediaUrl(rawMedia, isVideoRaw ? 'video' : 'image'), [rawMedia, isVideoRaw]);
  const resolvedFinal = useMemo(() => resolveMediaUrl(finalMedia, isVideoFinal ? 'video' : 'image'), [finalMedia, isVideoFinal]);

  // Direct 0ms hardware update without CSS variable inheritance overhead
  const applyPosition = useCallback((pos) => {
    const clamped = Math.max(1, Math.min(99, pos));
    stateRef.current.currentPos = clamped;

    if (clipLayerRef.current) {
      const insetVal = `inset(0 ${(100 - clamped).toFixed(2)}% 0 0)`;
      clipLayerRef.current.style.clipPath = insetVal;
      clipLayerRef.current.style.webkitClipPath = insetVal;
    }
    if (dividerRef.current) {
      dividerRef.current.style.left = `${clamped.toFixed(2)}%`;
    }
    if (percentRef.current) {
      percentRef.current.textContent = `${Math.round(clamped)}%`;
    }
  }, []);

  // Synchronize video playback if both are video
  const handleTimeUpdate = () => {
    if (isVideoRaw && isVideoFinal && rawVideoRef.current && finalVideoRef.current) {
      if (Math.abs(rawVideoRef.current.currentTime - finalVideoRef.current.currentTime) > 0.25) {
        finalVideoRef.current.currentTime = rawVideoRef.current.currentTime;
      }
    }
  };

  // Viewport observer & continuous auto-glider
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const cycleDuration = 6500; // 6.5s smooth cinematic sweep
    const state = stateRef.current;

    const animate = (now) => {
      const dt = now - lastTime;
      lastTime = now;

      if (state.isVisible && !state.isDragging) {
        state.animPhase += (dt / cycleDuration) * Math.PI * 2;
        const pos = 50 + 35 * Math.sin(state.animPhase);
        applyPosition(pos);
      }

      animId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        state.isVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      if (state.resumeTimer) {
        clearTimeout(state.resumeTimer);
      }
    };
  }, [applyPosition]);

  // Pointer tracking attached to window to guarantee zero lost clicks/moves
  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;

    stateRef.current.isDragging = true;
    if (stateRef.current.resumeTimer) {
      clearTimeout(stateRef.current.resumeTimer);
      stateRef.current.resumeTimer = null;
    }

    const updateFromClientX = (clientX) => {
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (offsetX / rect.width) * 100;
      applyPosition(percent);

      // Keep auto-glider phase in lockstep with user's position
      const norm = Math.max(-1, Math.min(1, (percent - 50) / 35));
      stateRef.current.animPhase = Math.asin(norm);
    };

    updateFromClientX(e.clientX);

    const onPointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      updateFromClientX(moveEvent.clientX);
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      // Resume auto-glide after 2.5s of inactivity
      stateRef.current.resumeTimer = setTimeout(() => {
        stateRef.current.isDragging = false;
      }, 2500);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  return (
    <div className="w-full select-none">
      {/* Title & Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-text-primary tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-secondary mt-1 max-w-2xl font-sans leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent/40 text-[11px] font-mono text-accent shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>DRAG OR AUTOPLAY</span>
        </div>
      </div>

      {/* Main Interactive Comparison Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-card border border-border shadow-2xl cursor-ew-resize group"
      >
        {/* Base Layer: Final Graded Cut */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {resolvedFinal ? (
            isVideoFinal ? (
              <video
                ref={finalVideoRef}
                src={resolvedFinal}
                autoPlay
                muted
                loop
                playsInline
                draggable={false}
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={resolvedFinal}
                alt="Final graded cut"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  transform: 'translateZ(0)',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                }}
                className="w-full h-full object-cover pointer-events-none"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-cyan-950/30 to-surface-card flex items-center justify-center p-8 pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-black text-accent text-xl">4K</span>
                </div>
                <p className="font-display font-bold text-lg text-text-primary">CINEMATIC REC.709 GRADE</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Hollywood 35mm Contrast Curve · Film Grain · Dynamic Range</p>
              </div>
            </div>
          )}

          {/* Graded Label Badge */}
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium glass-card border border-accent/40 text-accent shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {finalLabel}
            </span>
          </div>
        </div>

        {/* Top Clipped Layer: Raw Log Footage */}
        <div
          ref={clipLayerRef}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none will-change-[clip-path]"
          style={{
            clipPath: 'inset(0 50% 0 0)',
            WebkitClipPath: 'inset(0 50% 0 0)',
          }}
        >
          {resolvedRaw ? (
            isVideoRaw ? (
              <video
                ref={rawVideoRef}
                src={resolvedRaw}
                autoPlay
                muted
                loop
                playsInline
                draggable={false}
                onTimeUpdate={handleTimeUpdate}
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover filter contrast-75 brightness-110 saturate-50"
              />
            ) : (
              <img
                src={resolvedRaw}
                alt="Raw log footage"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  transform: 'translateZ(0)',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                }}
                className="w-full h-full object-cover filter contrast-75 brightness-110 saturate-50 pointer-events-none"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-950 flex items-center justify-center p-8 pointer-events-none">
              <div className="text-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-bold text-white text-xl">LOG</span>
                </div>
                <p className="font-display font-bold text-lg text-white">FLAT S-LOG3 SENSOR CAPTURE</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Uncompressed Sensor Profile · Flat Gamma · 10-Bit 4:2:2</p>
              </div>
            </div>
          )}

          {/* Raw Label Badge */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium glass-card border border-white/25 text-white shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              {rawLabel}
            </span>
          </div>
        </div>

        {/* Vertical Wipe Divider Line & Handle */}
        <div
          ref={dividerRef}
          className="absolute top-0 bottom-0 z-20 pointer-events-none will-change-[left]"
          style={{ left: '50%' }}
        >
          {/* Cinema Glow Wipe Beam */}
          <div className="absolute top-0 bottom-0 -left-px w-0.5 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

          {/* Center Pill / Percentage Readout */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full glass border border-accent/60 flex items-center gap-1.5 shadow-2xl bg-surface/90 text-text-primary backdrop-blur-md group-hover:scale-105 transition-transform">
            <HiArrowsRightLeft className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span
              ref={percentRef}
              className="text-[10px] font-mono font-bold tracking-wider select-none text-text-primary"
            >
              50%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
