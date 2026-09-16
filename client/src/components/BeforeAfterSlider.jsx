import { useRef, useEffect } from 'react';
import { HiArrowsRightLeft } from 'react-icons/hi2';

export default function BeforeAfterSlider({
  rawMedia,
  finalMedia,
  title = 'Color Grade Comparison',
  description = 'Continuous cinema wipe comparing raw camera flat log profile with final cinematic color grade.',
  rawLabel = 'RAW S-LOG3',
  finalLabel = 'GRADED REC.709',
}) {
  const containerRef = useRef(null);
  const percentRef = useRef(null);
  const rawVideoRef = useRef(null);
  const finalVideoRef = useRef(null);
  const rectRef = useRef(null);
  const isVisibleRef = useRef(false);

  const stateRef = useRef({
    isDragging: false,
    resumeTimer: null,
    currentPos: 50,
    animPhase: 0,
    isGliding: true,
  });

  const isVideoRaw = rawMedia && Boolean(rawMedia.match(/\.(mp4|webm|mov|ogg)/i));
  const isVideoFinal = finalMedia && Boolean(finalMedia.match(/\.(mp4|webm|mov|ogg)/i));

  // Synchronize raw & final videos if both are video
  const handleTimeUpdate = () => {
    if (isVideoRaw && isVideoFinal && rawVideoRef.current && finalVideoRef.current) {
      if (Math.abs(rawVideoRef.current.currentTime - finalVideoRef.current.currentTime) > 0.2) {
        finalVideoRef.current.currentTime = rawVideoRef.current.currentTime;
      }
    }
  };

  // Helper to set slider position synchronously across clip and divider with 0 layout reflows
  const setPosition = (pos) => {
    stateRef.current.currentPos = pos;
    const clamped = Math.max(1, Math.min(99, pos));
    if (containerRef.current) {
      containerRef.current.style.setProperty('--slider-pos', `${clamped.toFixed(2)}%`);
    }
    if (percentRef.current) {
      percentRef.current.textContent = `${Math.round(clamped)}%`;
    }
  };

  // Viewport-aware auto-glider animation loop (runs ONLY when on-screen and idle)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const cycleDuration = 7000; // 7s smooth sweep
    const state = stateRef.current;

    const animate = (now) => {
      const dt = now - lastTime;
      lastTime = now;

      if (isVisibleRef.current && state.isGliding && !state.isDragging) {
        state.animPhase += (dt / cycleDuration) * Math.PI * 2;
        const pos = 50 + 35 * Math.sin(state.animPhase);
        setPosition(pos);
      }

      animId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.1 }
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
  }, []);

  // Zero-reflow pointer update (uses cached bounding rect from pointerdown)
  const updatePosFromClientX = (clientX) => {
    const rect = rectRef.current;
    if (!rect || rect.width <= 0) return;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const rawPercent = (offsetX / rect.width) * 100;
    setPosition(rawPercent);

    // Keep glider phase in sync so it resumes without jumping
    const norm = Math.max(-1, Math.min(1, (rawPercent - 50) / 35));
    stateRef.current.animPhase = Math.asin(norm);
  };

  const handlePointerDown = (e) => {
    if (!containerRef.current) return;
    // Cache bounding rect ONCE at start of gesture to eliminate forced reflows during move
    rectRef.current = containerRef.current.getBoundingClientRect();
    stateRef.current.isDragging = true;
    stateRef.current.isGliding = false;

    if (stateRef.current.resumeTimer) {
      clearTimeout(stateRef.current.resumeTimer);
      stateRef.current.resumeTimer = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    updatePosFromClientX(clientX);
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isDragging) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    updatePosFromClientX(clientX);
  };

  const handlePointerUp = (e) => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.isDragging = false;
    rectRef.current = null;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    // Resume subtle glide after 3s of idle
    stateRef.current.resumeTimer = setTimeout(() => {
      stateRef.current.isGliding = true;
    }, 3000);
  };

  const handleMouseEnter = () => {
    stateRef.current.isGliding = false;
  };

  const handleMouseLeave = () => {
    if (!stateRef.current.isDragging) {
      stateRef.current.resumeTimer = setTimeout(() => {
        stateRef.current.isGliding = true;
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Title & Live Status Cue */}
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent/40 text-[11px] font-mono text-accent shrink-0 select-none">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>LIVE WIPE // DRAG OR GLIDE</span>
        </div>
      </div>

      {/* Main Visual Comparison Frame (Interactive Drag + Zero-Lag Synced Inset Clip) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          '--slider-pos': '50%',
          touchAction: 'none',
        }}
        className="relative w-full aspect-video rounded-2xl overflow-hidden select-none bg-surface-card border border-border shadow-2xl cursor-ew-resize group"
      >
        {/* Final / Graded Layer (Base Layer) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {finalMedia ? (
            isVideoFinal ? (
              <video
                ref={finalVideoRef}
                src={finalMedia}
                autoPlay
                muted
                loop
                playsInline
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={finalMedia}
                alt="Final graded cut"
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-950/40 via-cyan-950/30 to-surface-card flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-black text-accent text-xl">4K</span>
                </div>
                <p className="font-display font-bold text-lg text-text-primary">CINEMATIC REC.709 GRADE</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Hollywood 35mm Contrast Curve · Film Grain · Dynamic Range</p>
              </div>
            </div>
          )}

          {/* Graded Badge */}
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium glass-card border border-accent/40 text-accent shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {finalLabel}
            </span>
          </div>
        </div>

        {/* Raw Layer (Clipped overlay on the left, driven in lockstep via CSS variable) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none will-change-[clip-path]"
          style={{
            clipPath: 'inset(0 calc(100% - var(--slider-pos, 50%)) 0 0)',
            WebkitClipPath: 'inset(0 calc(100% - var(--slider-pos, 50%)) 0 0)',
          }}
        >
          {rawMedia ? (
            isVideoRaw ? (
              <video
                ref={rawVideoRef}
                src={rawMedia}
                autoPlay
                muted
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover filter contrast-75 brightness-110 saturate-50"
              />
            ) : (
              <img
                src={rawMedia}
                alt="Raw log footage"
                style={{ transform: 'translateZ(0)' }}
                className="w-full h-full object-cover filter contrast-75 brightness-110 saturate-50"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-950 flex items-center justify-center p-8">
              <div className="text-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-bold text-white text-xl">LOG</span>
                </div>
                <p className="font-display font-bold text-lg text-white">FLAT S-LOG3 SENSOR CAPTURE</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Uncompressed Sensor Profile · Flat Gamma · 10-Bit 4:2:2</p>
              </div>
            </div>
          )}

          {/* Raw Badge */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium glass-card border border-white/25 text-white shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              {rawLabel}
            </span>
          </div>
        </div>

        {/* Glider Divider Beam & Centered Pill (Always driven 100% in lockstep by --slider-pos) */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none will-change-[left]"
          style={{ left: 'var(--slider-pos, 50%)' }}
        >
          {/* Vertical beam line with cinema glow */}
          <div className="absolute top-0 bottom-0 -left-px w-0.5 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

          {/* Glider Status Pill */}
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
