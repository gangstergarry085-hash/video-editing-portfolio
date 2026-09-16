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
  const renderTrack = (keyPrefix) => (
    <div className="film-ticker-track flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
      {TICKER_ITEMS.map((item, idx) => (
        <div
          key={`${keyPrefix}-${idx}`}
          className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-text-secondary hover:text-text-primary transition-colors cursor-default"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-semibold">{item.text}</span>
          <span className="text-[10px] px-2 py-0.5 rounded glass border border-border text-accent/90">
            {item.badge}
          </span>
          <span className="text-text-muted/40 font-mono">//</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="film-ticker-container relative w-full py-5 bg-surface-elevated/40 border-y border-border/70 overflow-hidden select-none backdrop-blur-md">
      <style>{`
        @keyframes film-ticker-slide {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .film-ticker-track {
          display: flex;
          flex-shrink: 0;
          animation: film-ticker-slide 28s linear infinite;
          will-change: transform;
        }
        .film-ticker-container:hover .film-ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* 35mm Film Sprockets - Top */}
      <div className="flex justify-between items-center px-2 py-1 overflow-hidden opacity-30 pointer-events-none mb-2">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-1.5 rounded-[2px] bg-text-muted/60 flex-shrink-0 mx-1"
          />
        ))}
      </div>

      {/* Marquee Content - Dual Track Infinite Loop */}
      <div className="flex overflow-hidden w-full">
        {renderTrack('track-a')}
        {renderTrack('track-b')}
      </div>

      {/* 35mm Film Sprockets - Bottom */}
      <div className="flex justify-between items-center px-2 py-1 overflow-hidden opacity-30 pointer-events-none mt-2">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-1.5 rounded-[2px] bg-text-muted/60 flex-shrink-0 mx-1"
          />
        ))}
      </div>

      {/* Gradient edge fades */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10" />
    </div>
  );
}
