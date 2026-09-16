import { HiOutlineArrowUp } from 'react-icons/hi2';

export default function Footer({ settings }) {
  const socialLinks = settings?.social_links || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-border bg-surface-elevated/20 py-16 px-6 overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left — timecode & reel motif */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="timecode text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent/80" />
              <span>TC 23:59:59:24 // END OF TIMELINE</span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-mono">
              MASTER OUTPUT · 4K DCI · 24.000 FPS · STEREO
            </p>
          </div>

          {/* Center — copyright */}
          <div className="text-center">
            <p className="text-text-secondary text-sm">
              {settings?.footer_text || '© Dev Anand. All rights reserved.'}
            </p>
            <p className="text-text-muted text-xs mt-1">
              Crafted for high-impact visual storytelling &amp; motion.
            </p>
          </div>

          {/* Right — social links & back to top */}
          <div className="flex items-center gap-5">
            {Object.entries(socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors text-xs font-mono tracking-wider uppercase"
              >
                {platform}
              </a>
            ))}

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full glass border border-border hover:border-accent/40 text-text-secondary hover:text-accent transition-all duration-300 group"
              title="Return to Head of Reel"
              aria-label="Back to top"
            >
              <HiOutlineArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
