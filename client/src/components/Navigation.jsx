import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Showreel', href: '#showreel' },
  { label: 'Work', href: '#work' },
  { label: 'Color Grade', href: '#before-after' },
  { label: 'Process', href: '#process' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

function TimecodeDisplay() {
  const timeRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 24;
      if (timeRef.current) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const f = String(frame).padStart(2, '0');
        timeRef.current.textContent = `${h}:${m}:${s}:${f}`;
      }
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border text-[11px] font-mono text-text-secondary">
      <span className="text-accent font-bold">REC</span>
      <span className="text-text-muted">●</span>
      <span ref={timeRef} className="text-text-primary tabular-nums tracking-wider">
        00:00:00:00
      </span>
    </div>
  );
}

export default function Navigation({ settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const getNavHref = (hash) => (isHome ? hash : `/${hash}`);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass py-3 border-b border-border/80 shadow-xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href={getNavHref('#hero')} className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-accent rec-dot" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-text-primary tracking-tight group-hover:text-accent transition-colors">
                {settings?.hero_heading || 'DEV ANAND'}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase">
                VIDEO EDITOR // 24FPS
              </span>
            </div>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={getNavHref(link.href)}
                className="text-xs font-mono tracking-wider uppercase text-text-secondary hover:text-text-primary transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Controls: 24FPS Timecode + Theme Switcher + Edit Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Zero-Lag 24 FPS Timecode */}
            <TimecodeDisplay />

            {/* Master Cinema Grade Indicator */}
            <div
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border/80 text-xs font-mono text-text-secondary select-none shadow-sm"
              title="Hollywood Master 35mm Color Grade // DCI-P3 Color Space"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-text-primary font-medium tracking-wide">DCI-P3</span>
              <span className="text-accent/80 font-bold text-[10px] tracking-wider">35mm</span>
            </div>


            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl glass border border-border text-text-primary hover:border-accent/40 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-full bg-current transform transition-transform duration-200 ${
                    mobileOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-current transition-opacity duration-200 ${
                    mobileOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-current transform transition-transform duration-200 ${
                    mobileOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface/98 backdrop-blur-md flex flex-col items-center justify-center gap-6 px-6 lg:hidden"
          >
            <div className="timecode text-xs text-accent mb-2">
              // TIMELINE NAVIGATION
            </div>
            {navLinks.map((link, idx) => (
              <motion.a
                key={link.href}
                href={getNavHref(link.href)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-display font-bold text-text-primary hover:text-accent transition-colors"
              >
                {link.label}
              </motion.a>
            ))}

            <div className="mt-8 flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>DEV ANAND // 4K TIMELINE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
