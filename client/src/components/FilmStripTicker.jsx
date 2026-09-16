import { useRef, useEffect } from 'react';

const TICKER_ITEMS = [
  { text: 'DAVINCI RESOLVE STUDIO', badge: 'COLOR' },
  { text: 'AFTER EFFECTS', badge: 'VFX / MOTION' },
  { text: 'PREMIERE PRO', badge: 'EDIT' },
  { text: '4K PRORES & DCI 24FPS', badge: 'FORMAT' },
  { text: 'SOUND DESIGN & AUDIO FOLEY', badge: 'FAIRLIGHT' },
  { text: 'S-LOG3 & ARRI LOG-C CONVERSIONS', badge: 'COLOR SCIENCE' },
  { text: 'DYNAMIC KEYFRAME ANIMATION', badge: 'MOTION' },
  { text: 'CINEMATIC STORYTELLING', badge: 'NARRATIVE' },
];

export default function FilmStripTicker() {
  const trackRef = useRef(null);
  const singleSetRef = useRef(null);
  const posRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let running = true;
    const speed = 40; // Pixels per second - cinematic steady glide

    const loop = (time) => {
      if (!running) return;

      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (singleSetRef.current && trackRef.current) {
        const setWidth = singleSetRef.current.offsetWidth || 1800;
        posRef.current -= speed * Math.min(dt, 0.1); // Cap dt to avoid large leaps after tab switch

        if (posRef.current <= -setWidth) {
          posRef.current += setWidth;
        }

        trackRef.current.style.transform = `translate3d(${posRef.current.toFixed(2)}px, 0, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const renderItemSet = (isReference = false, keyPrefix = 'set') => (
    <div
      ref={isReference ? singleSetRef : undefined}
      className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 select-none"
    >
      {TICKER_ITEMS.map((item, idx) => (
        <div
          key={`${keyPrefix}-${idx}`}
          className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-text-secondary hover:text-text-primary transition-colors cursor-default"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <span className="font-semibold">{item.text}</span>
          <span className="text-[10px] px-2 py-0.5 rounded glass border border-border text-accent/90 shrink-0">
            {item.badge}
          </span>
          <span className="text-text-muted/40 font-mono shrink-0">//</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative w-full py-4 bg-surface-elevated/50 border-y border-border/70 overflow-hidden select-none backdrop-blur-md">
      {/* 35mm Film Sprockets - Top (spans up to 4K displays seamlessly) */}
      <div className="flex items-center overflow-hidden opacity-30 pointer-events-none mb-2 w-full">
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={`sprocket-top-${i}`}
              className="w-3 h-1.5 rounded-[2px] bg-text-muted/70 shrink-0 mx-1.5"
            />
          ))}
        </div>
      </div>

      {/* Marquee Content - Driven by 60/120fps hardware-accelerated rAF translate3d loop */}
      <div className="overflow-hidden w-full">
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {renderItemSet(true, 'primary')}
          {renderItemSet(false, 'secondary')}
          {renderItemSet(false, 'tertiary')}
          {renderItemSet(false, 'quaternary')}
        </div>
      </div>

      {/* 35mm Film Sprockets - Bottom */}
      <div className="flex items-center overflow-hidden opacity-30 pointer-events-none mt-2 w-full">
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={`sprocket-bottom-${i}`}
              className="w-3 h-1.5 rounded-[2px] bg-text-muted/70 shrink-0 mx-1.5"
            />
          ))}
        </div>
      </div>

      {/* Cinematic Gradient Edge Fades */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10" />
    </div>
  );
}
