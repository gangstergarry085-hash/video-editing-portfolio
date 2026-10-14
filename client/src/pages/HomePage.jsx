import { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  projectsAPI, showreelAPI, beforeAfterAPI,
  servicesAPI, aboutAPI, resolveMediaUrl,
} from '../lib/api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import TiltCard from '../components/TiltCard';
import AudioVisualizer from '../components/AudioVisualizer';
import FilmStripTicker from '../components/FilmStripTicker';
import VideoPlayer from '../components/VideoPlayer';
import { getSocialIcon, getSocialBrandColor } from '../components/SocialIcons';
import {
  HiPlay,
  HiOutlineArrowRight,
  HiSparkles,
  HiOutlineFilm,
  HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa6';

// ── Animation Variants ──────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

// ── Section Container ───────────────────────────────────
function Section({ id, children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`relative py-24 md:py-36 px-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto relative z-10">{children}</div>
    </motion.section>
  );
}

// ── Section Title ───────────────────────────────────────
function SectionTitle({ label, title, subtitle }) {
  return (
    <motion.div variants={fadeUp} className="mb-14 md:mb-18">
      <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full glass-light border border-border text-[11px] font-mono text-text-secondary mb-4 tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-text-primary font-medium">{label}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-text-primary tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-base md:text-lg mt-3.5 max-w-2xl leading-relaxed font-sans">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  const context = useOutletContext() || {};
  const settings = context.settings;
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('dev_portfolio_settings');
    } catch {
      return true;
    }
  });
  const [showreel, setShowreel] = useState(() => {
    try {
      const c = localStorage.getItem('dev_portfolio_showreel');
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });
  const [allProjects, setAllProjects] = useState(() => {
    try {
      const c = localStorage.getItem('dev_portfolio_projects');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [beforeAfter, setBeforeAfter] = useState(() => {
    try {
      const c = localStorage.getItem('dev_portfolio_before_after');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [services, setServices] = useState(() => {
    try {
      const c = localStorage.getItem('dev_portfolio_services');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [about, setAbout] = useState(() => {
    try {
      const c = localStorage.getItem('dev_portfolio_about');
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });
  const [activeCategory, setActiveCategory] = useState('All');

  const effectiveAbout = context.about || about;
  const combinedSocialLinks = {
    ...(effectiveAbout?.social_links || {}),
    ...(settings?.social_links || {}),
  };

  useEffect(() => {
    Promise.allSettled([
      showreelAPI.getActive(),
      projectsAPI.list(),
      beforeAfterAPI.list(),
      servicesAPI.list(),
      aboutAPI.get(),
    ]).then(([srRes, apRes, baRes, svRes, abRes]) => {
      if (srRes.status === 'fulfilled') {
        const sr = srRes.value.data?.showreel !== undefined
          ? srRes.value.data.showreel
          : srRes.value.data;
        setShowreel(sr || null);
        try {
          if (sr) localStorage.setItem('dev_portfolio_showreel', JSON.stringify(sr));
        } catch {}
      }
      if (apRes.status === 'fulfilled') {
        const list = Array.isArray(apRes.value.data)
          ? apRes.value.data
          : (apRes.value.data?.projects || []);
        setAllProjects(list);
        try {
          localStorage.setItem('dev_portfolio_projects', JSON.stringify(list));
        } catch {}
      }
      if (baRes.status === 'fulfilled') {
        const baList = Array.isArray(baRes.value.data)
          ? baRes.value.data
          : (baRes.value.data?.items || []);
        setBeforeAfter(baList);
        try {
          localStorage.setItem('dev_portfolio_before_after', JSON.stringify(baList));
        } catch {}
      }
      if (svRes.status === 'fulfilled') {
        const svList = Array.isArray(svRes.value.data)
          ? svRes.value.data
          : (svRes.value.data?.services || []);
        setServices(svList);
        try {
          localStorage.setItem('dev_portfolio_services', JSON.stringify(svList));
        } catch {}
      }
      if (abRes.status === 'fulfilled' && abRes.value.data) {
        const abData = abRes.value.data?.about || abRes.value.data;
        setAbout(abData);
        try {
          localStorage.setItem('dev_portfolio_about', JSON.stringify(abData));
        } catch {}
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Dynamic categories extracted from real projects in the database
  const categories = useMemo(() => {
    const set = new Set();
    allProjects.forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        const trimmed = p.category.trim();
        if (trimmed) set.add(trimmed);
      }
    });
    return ['All', ...Array.from(set)];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return allProjects;
    return allProjects.filter((p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase());
  }, [allProjects, activeCategory]);

  const rawWa = settings?.whatsapp_number || settings?.whatsappNumber || settings?.phone || '';
  const whatsappDigits = rawWa.replace(/\D/g, '');
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=Hi%20Dev,%20saw%20your%20portfolio`
    : 'https://wa.me/?text=Hi%20Dev,%20saw%20your%20portfolio';

  // Scroll parallax for Hero
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  if (loading && !settings && allProjects.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted text-xs font-mono tracking-wider">LOADING TIMELINE...</span>
        </div>
      </div>
    );
  }

  return (

    <>
      {/* ── HERO SECTION ──────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        {/* Ambient Film Light Leaks & Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[140px] flare-ambient" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-accent-secondary/15 rounded-full blur-[160px] flare-ambient" style={{ animationDelay: '-6s' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/40 to-surface" />
          {/* Subtle Grid Lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Timeline playhead lines decoration */}
        <div className="playhead-line left-[8%] hidden xl:block opacity-40" />
        <div className="playhead-line right-[8%] hidden xl:block opacity-40" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow / Director Moniker & Status */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-border text-xs font-mono text-text-secondary shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent rec-dot" />
              <span className="text-text-primary font-bold">DEV ANAND</span>
              <span className="text-text-muted">·</span>
              <span className="text-accent font-semibold tracking-wider">POST-PRODUCTION SPECIALIST</span>
              <span className="text-text-muted hidden sm:inline">·</span>
              <span className="hidden sm:inline">4K DCI // 24 FPS</span>
            </div>
            <AudioVisualizer bars={12} label="" className="hidden sm:inline-flex" />
          </motion.div>

          {/* Headline (Broad yet Professional) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-text-primary uppercase leading-[1.05] drop-shadow-2xl">
              High-Retention Video Editing &amp; <span className="text-gradient">Post-Production</span>
            </h1>
            <div className="absolute -inset-x-8 top-1/2 -translate-y-1/2 h-16 bg-accent/10 blur-3xl -z-10 pointer-events-none" />
          </motion.div>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-text-secondary max-w-3xl leading-relaxed font-sans font-normal"
          >
            Crafting cinematic client stories, engaging social reels, and commercial brand promos using DaVinci Resolve—complete with Fairlight audio cleanup and studio color grading.
          </motion.p>

          {/* CTA Group: Primary "Chat on WhatsApp" + Secondary Options */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Primary CTA: Chat on WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-sm bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#128C7E] text-white shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_45px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaWhatsapp className="w-4 h-4 text-white" />
              </div>
              <span className="tracking-wider uppercase">Chat on WhatsApp</span>
            </a>

            {/* Secondary CTA: Watch Showreel */}
            <a
              href="#showreel"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-display font-semibold text-sm glass text-text-primary hover:border-accent/40 hover:bg-surface-hover transition-all duration-300 group"
            >
              <HiPlay className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              <span>WATCH SHOWREEL</span>
            </a>

            {/* Tertiary CTA: Explore Work */}
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-display font-medium text-xs font-mono text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all group"
            >
              <span>EXPLORE WORK</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-accent" />
            </a>
          </motion.div>

          {/* Availability Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mt-10 flex items-center gap-2.5 px-4 py-2 rounded-full glass-light border border-border/80"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
              {settings?.availability_status || 'AVAILABLE FOR NEW PROJECTS'}
            </span>
          </motion.div>
        </motion.div>

        {/* Animated Scroll indicator */}
        <motion.a
          href="#showreel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors group cursor-pointer"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-60 group-hover:opacity-100">
            SCROLL DOWN
          </span>
          <div className="w-5 h-9 border-2 border-border group-hover:border-accent/50 rounded-full flex justify-center pt-1.5 transition-colors">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-accent"
            />
          </div>
        </motion.a>
      </section>

      {/* ── FILM STRIP MARQUEE TICKER ──────────────────── */}
      <FilmStripTicker />

      {/* ── SHOWREEL SECTION ──────────────────────────── */}
      <Section id="showreel" className="bg-surface-elevated/20">
        <SectionTitle
          label="TIMELINE SHOWCASE"
          title={showreel?.title || 'The 2024 Reel'}
          subtitle={
            showreel?.description ||
            'A 60-second compilation of high-impact commercial cuts, dynamic kinetic typography, and editorial color science.'
          }
        />

        <motion.div variants={fadeUp} className="relative">
          <TiltCard className={`rounded-3xl overflow-hidden glass-card p-3 shadow-2xl border border-border group ${showreel?.aspect_ratio === '9:16' ? 'max-w-md mx-auto' : ''}`}>
            <div className={`relative rounded-2xl overflow-hidden ${showreel?.aspect_ratio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'} bg-surface-card glow`}>
              {loading ? (
                <div className="w-full h-full bg-surface-card flex items-center justify-center animate-pulse">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                      INGESTING SHOWREEL...
                    </span>
                  </div>
                </div>
              ) : showreel?.video_url ? (
                <VideoPlayer
                  url={showreel.video_url}
                  poster={showreel.thumbnail_url}
                  title={showreel.title || 'Master Showreel'}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Clean Standby HUD Frame */
                <div className="relative w-full h-full bg-gradient-to-tr from-neutral-950 via-surface-card to-neutral-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/40" />

                  {/* Director's Viewfinder HUD Frame */}
                  <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent/60" />
                        <span className="tracking-widest font-bold text-white/80">STANDBY 4K DCI</span>
                      </div>
                      <span className="tracking-wider text-white/40">
                        ASPECT: {showreel?.aspect_ratio === '9:16' ? '9:16 VERTICAL' : '16:9 CINEMA'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                      <span className="tracking-wider">FPS: 24.000</span>
                      <span className="tracking-wider">AUDIO: 48kHz STEREO</span>
                    </div>
                  </div>

                  {/* Clean Standby Message */}
                  <div className="relative z-10 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-surface-elevated/80 border border-border flex items-center justify-center mx-auto text-text-muted mb-3 shadow-lg">
                      <HiPlay className="w-6 h-6 ml-0.5 text-accent/80" />
                    </div>
                    <p className="font-display font-bold text-lg sm:text-xl text-text-primary tracking-wide">
                      {showreel?.title || 'The 2024 Reel'}
                    </p>
                    <p className="text-xs font-mono text-text-muted mt-1.5 max-w-sm mx-auto">
                      {showreel?.description || 'The official master showreel is currently being assembled and will premiere here soon.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TiltCard>
        </motion.div>
      </Section>

      {/* ── SELECTED WORK / PORTFOLIO ─────────────────── */}
      <Section id="work" className="bg-surface-elevated/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionTitle
            label="SELECTED WORKS"
            title="Featured Cuts & Projects"
            subtitle="Curated collection of high-retention commercial cuts, client case stories, documentaries, and social reels."
          />

          {/* Dynamic Category Filter Pills */}
          {categories.length > 1 && (
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-accent text-surface font-bold shadow-lg shadow-accent/20'
                      : 'glass text-text-secondary hover:text-text-primary hover:border-accent/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl glass-card border border-border/70 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-4 text-text-muted">
              <HiOutlineFilm className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary tracking-tight">
              {allProjects.length === 0 ? 'PROJECTS IN POST-PRODUCTION' : 'NO PROJECTS FOUND'}
            </h3>
            <p className="text-text-muted text-sm mt-2 max-w-md">
              {allProjects.length === 0
                ? 'Recent cuts and client projects are currently in post-production. Selected works will premiere here soon.'
                : 'No projects match this category. Select another genre or view all works.'}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-medium tracking-wider border border-border hover:border-accent/50 text-text-secondary hover:text-text-primary transition-all glass hover:bg-surface-elevated cursor-pointer"
            >
              <span>INQUIRE FOR PRIVATE REELS</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 text-accent" />
            </a>
          </div>
        ) : (
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id || project.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <TiltCard className="group h-full">
                    <Link
                      to={`/project/${project.slug}`}
                      className="flex flex-col h-full bg-surface-card rounded-2xl overflow-hidden border border-border/80 hover:border-accent/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-accent/5 group"
                    >
                      {/* Thumbnail Viewport */}
                      <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                        {project.thumbnail_url ? (
                          <img
                            src={resolveMediaUrl(project.thumbnail_url, 'image')}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-surface via-surface-card to-surface-elevated">
                            <HiOutlineFilm className="w-12 h-12 text-text-muted/40" />
                          </div>
                        )}

                        {/* Hover Overlay with Play Icon */}
                        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-14 h-14 rounded-full bg-accent text-surface flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-accent/30">
                            <HiPlay className="w-6 h-6 ml-0.5" />
                          </div>
                        </div>

                        {/* Category Badge & Duration */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          {project.category && (
                            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider bg-surface/90 backdrop-blur-md text-text-primary px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                              {project.category}
                            </span>
                          )}
                          {project.featured && (
                            <span className="text-[10px] font-mono uppercase tracking-wider bg-accent text-surface font-bold px-2 py-0.5 rounded shadow-sm">
                              FEATURED
                            </span>
                          )}
                        </div>

                        {project.duration && (
                          <div className="absolute bottom-3 right-3 font-mono text-[11px] bg-neutral-950/85 backdrop-blur-md text-white/90 px-2 py-0.5 rounded border border-white/10">
                            {project.duration}
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {project.client_name && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
                                {project.client_name}
                              </span>
                            </div>
                          )}
                          <h3 className="text-xl font-display font-bold text-text-primary group-hover:text-accent transition-colors tracking-tight line-clamp-1">
                            {project.title}
                          </h3>
                          {(project.short_description || project.description) && (
                            <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed font-sans">
                              {project.short_description || project.description}
                            </p>
                          )}
                        </div>

                        {/* Tool Tags and View Action */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/60">
                          <div className="flex flex-wrap gap-1.5">
                            {(project.tools || []).slice(0, 3).map((tool) => (
                              <span
                                key={tool}
                                className="text-[10px] font-mono text-text-secondary bg-surface-elevated px-2 py-0.5 rounded border border-border/50"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-accent opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                            <span>VIEW CASE</span>
                            <HiOutlineArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Section>

      {/* ── BEFORE / AFTER INTERACTIVE SLIDER ─────────── */}
      <Section id="before-after" className="bg-surface/50">
        <SectionTitle
          label="COLOR FINISHING SUITE"
          title="Raw Log vs Final Grade"
          subtitle="Continuous comparison demonstrating how flat camera sensor profiles are sculpted with rich contrast, filmic saturation, and skin tone fidelity."
        />

        {loading ? (
          <div className="rounded-2xl bg-surface-card border border-border/60 p-8 flex items-center justify-center aspect-[21/9] animate-pulse">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              LOADING COLOR FINISHING SUITE...
            </span>
          </div>
        ) : beforeAfter.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl glass-card border border-border/70 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-3 text-text-muted">
              <HiOutlineAdjustmentsHorizontal className="w-6 h-6 text-accent/80" />
            </div>
            <h4 className="text-lg font-display font-bold text-text-primary">
              COLOR FINISHING SHOWCASE
            </h4>
            <p className="text-text-muted text-xs font-mono mt-1 max-w-md">
              Side-by-side camera log breakdowns and film emulation grades will be showcased here.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {beforeAfter.map((item) => (
              <motion.div key={item.id} variants={fadeUp}>
                <BeforeAfterSlider
                  title={item.title}
                  description={item.description}
                  rawMedia={item.raw_media_url}
                  finalMedia={item.final_media_url}
                />
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <Section id="services" className="bg-surface-elevated/20">
        <SectionTitle
          label="CAPABILITIES & SPECIALTIES"
          title="Services & Specialties"
          subtitle="Tailored post-production solutions for creative agencies, filmmakers, content creators, and innovative brands."
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface-card rounded-2xl p-6 border border-border/60 animate-pulse space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-elevated" />
                <div className="h-5 w-3/4 bg-surface-elevated rounded" />
                <div className="h-4 w-full bg-surface-elevated rounded" />
                <div className="h-4 w-2/3 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl glass-card border border-border/70 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-3 text-text-muted">
              <HiSparkles className="w-6 h-6 text-accent/80" />
            </div>
            <h4 className="text-lg font-display font-bold text-text-primary">
              POST-PRODUCTION SERVICES
            </h4>
            <p className="text-text-muted text-xs font-mono mt-1 max-w-md">
              High-end offline editorial, color grading, sound design, and motion graphics available upon request.
            </p>
          </div>
        ) : (
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const IconComponent = svc.icon || HiSparkles;
              return (
                <motion.div key={svc.id} variants={fadeUp}>
                  <TiltCard className="group h-full">
                    <div className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border/80 hover:border-accent/40 transition-all duration-300 h-full flex flex-col justify-between shadow-lg">
                      <div>
                        {/* Icon and Badge Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-surface transition-all duration-300">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          {svc.badge && (
                            <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted border border-border px-2 py-0.5 rounded-full">
                              {svc.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-display font-bold text-text-primary group-hover:text-accent transition-colors">
                          {svc.name}
                        </h3>
                        {svc.description && (
                          <p className="text-sm text-text-secondary mt-2.5 leading-relaxed font-sans">
                            {svc.description}
                          </p>
                        )}
                      </div>

                      {/* Deliverables Pills */}
                      {svc.deliverables && svc.deliverables.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-border/60">
                          <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">
                            DELIVERABLES
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {svc.deliverables.map((item) => (
                              <span
                                key={item}
                                className="text-[10px] font-mono text-text-secondary bg-surface-elevated px-2 py-0.5 rounded border border-border/40"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Section>

      {/* ── ABOUT & TOOLKIT ───────────────────────────── */}
      <Section id="about" className="bg-surface/50">
        <SectionTitle
          label="ABOUT THE EDITOR"
          title={effectiveAbout?.name || 'Dev Anand'}
          subtitle={effectiveAbout?.role || 'Video Editor & Motion Designer devoted to rhythm, pacing, and visual storytelling.'}
        />

        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Profile Photo / Visual Asset */}
          <div className="lg:col-span-1">
            <TiltCard maxTilt={6}>
              <div className="relative rounded-2xl overflow-hidden glass-card p-2 border border-border shadow-2xl group">
                <img
                  src={
                    resolveMediaUrl(effectiveAbout?.profile_image_url, 'image') ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={effectiveAbout?.name || 'Dev Anand'}
                  className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 filter contrast-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
              </div>
            </TiltCard>
          </div>

          {/* Bio & Details */}
          <div className="lg:col-span-2 space-y-8">
            <p className="text-text-secondary text-lg leading-relaxed font-sans">
              {effectiveAbout?.bio ||
                "I'm Dev Anand — a dedicated video editor and visual storyteller. I believe every frame should earn its place on the timeline. From high-energy short-form edits to cinematic commercial grades, I blend technical precision with emotional pacing to make stories impossible to look away from."}
            </p>

            {/* Metric / Stat highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="p-4 rounded-xl glass-light border border-border">
                <span className="timecode block text-[10px] mb-1">EXPERIENCE</span>
                <p className="text-text-primary font-display font-bold text-lg">
                  {effectiveAbout?.experience || '1+ Years'}
                </p>
              </div>
              <div className="p-4 rounded-xl glass-light border border-border">
                <span className="timecode block text-[10px] mb-1">LOCATION</span>
                <p className="text-text-primary font-display font-bold text-lg">
                  {effectiveAbout?.location || 'India / Remote'}
                </p>
              </div>
              <div className="p-4 rounded-xl glass-light border border-border">
                <span className="timecode block text-[10px] mb-1">PROJECT DELIVERIES</span>
                <p className="text-accent font-display font-bold text-lg">
                  {effectiveAbout?.deliveries_stat || '100% On-Time'}
                </p>
              </div>
              <div className="p-4 rounded-xl glass-light border border-border">
                <span className="timecode block text-[10px] mb-1">TIMELINE RESOLUTION</span>
                <p className="text-accent-secondary font-display font-bold text-lg">
                  {effectiveAbout?.resolution_stat || '4K / 60FPS HDR'}
                </p>
              </div>
            </div>

            {/* Toolkit Pills */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="timecode text-xs text-text-muted">// PRODUCTION SUITE</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(effectiveAbout?.tools && effectiveAbout.tools.length > 0
                  ? effectiveAbout.tools.map((t) => (typeof t === 'string' ? t : t.name))
                  : [
                      'DaVinci Resolve Studio',
                      'Adobe Premiere Pro',
                      'Adobe After Effects',
                      'Adobe Photoshop',
                      'Fairlight Audio',
                      'Apple ProRes 422',
                      'Dehancer Film Emulation',
                      'Mocha Pro Tracking',
                    ]
                ).map((tool) => (
                  <span
                    key={tool}
                    className="glass-light hover:border-accent/40 rounded-lg px-3.5 py-2 text-xs font-mono text-text-primary transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Channels / Connect */}
            {Object.entries(combinedSocialLinks).filter(([, url]) => Boolean(url)).length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="timecode text-xs text-text-muted">// CONNECT &amp; FOLLOW</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(combinedSocialLinks)
                    .filter(([, url]) => Boolean(url))
                    .map(([platform, url]) => {
                      const Icon = getSocialIcon(platform);
                      const brandColor = getSocialBrandColor(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-light border border-border text-text-secondary ${brandColor} transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-mono uppercase tracking-wider group`}
                          title={platform}
                        >
                          <Icon className="w-4 h-4 text-accent transition-transform group-hover:scale-110" />
                          <span className="font-medium">{platform}</span>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Section>

      {/* ── CONTACT CTA ───────────────────────────────── */}
      <Section id="contact" className="bg-surface-elevated/30">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-accent/30 text-xs font-mono text-accent mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span>LET'S BUILD SOMETHING CINEMATIC</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-text-primary tracking-tight leading-tight">
              {settings?.contact_heading || 'Ready to Cut Your Next Masterpiece?'}
            </h2>

            <p className="text-text-muted mt-6 text-lg max-w-xl mx-auto leading-relaxed">
              {settings?.contact_subheading ||
                "Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let's collaborate."}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-sm bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#128C7E] text-white shadow-[0_0_28px_rgba(37,211,102,0.4)] hover:shadow-[0_0_42px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaWhatsapp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="tracking-wider uppercase">Chat on WhatsApp</span>
              </a>

              <a
                href={settings?.email ? `mailto:${settings.email}` : 'mailto:hello@devanand.video'}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-sm glass text-text-primary hover:border-accent/50 hover:bg-surface-hover transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="tracking-wider uppercase">
                  {settings?.email || 'EMAIL BRIEF'}
                </span>
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-accent" />
              </a>
            </div>

            {/* Social Links & Channels */}
            {Object.entries(combinedSocialLinks).filter(([, url]) => Boolean(url)).length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3.5 mt-10">
                {Object.entries(combinedSocialLinks)
                  .filter(([, url]) => Boolean(url))
                  .map(([platform, url]) => {
                    const Icon = getSocialIcon(platform);
                    const brandColor = getSocialBrandColor(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full glass border border-border/80 text-text-secondary ${brandColor} transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-mono uppercase tracking-wider shadow-sm group`}
                        title={platform}
                      >
                        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>{platform}</span>
                      </a>
                    );
                  })}
              </div>
            )}
          </motion.div>
        </div>
      </Section>
    </>
  );
}
