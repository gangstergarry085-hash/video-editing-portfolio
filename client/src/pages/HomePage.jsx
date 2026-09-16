import { useState, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  projectsAPI, showreelAPI, beforeAfterAPI,
  servicesAPI, aboutAPI,
} from '../lib/api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import TiltCard from '../components/TiltCard';
import AudioVisualizer from '../components/AudioVisualizer';
import FilmStripTicker from '../components/FilmStripTicker';
import {
  HiPlay,
  HiOutlineArrowRight,
  HiSparkles,
  HiOutlineFilm,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineBolt,
  HiOutlineMusicalNote,
  HiOutlineVideoCamera,
} from 'react-icons/hi2';

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

// ── Fallback Sample Data (ensures rich display if DB is cold) ──
const FALLBACK_PROJECTS = [
  {
    id: 'p-1',
    slug: 'star-excellent-academy',
    title: 'Star Excellent Academy Commercial',
    category: 'Client Work',
    client_name: 'Star Excellent Academy',
    short_description:
      'High-impact promotional commercial featuring rhythmic pacing, kinetic typography, dynamic speed ramping, and pristine color grading.',
    tools: ['DaVinci Resolve', 'After Effects', 'Premiere Pro'],
    services_provided: ['Commercial Editing', 'Motion Graphics', 'Color Grading'],
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'p-2',
    slug: 'neon-horizon-narrative',
    title: 'Neon Horizon — Sci-Fi Narrative',
    category: 'Client Work',
    client_name: 'Aetheria Films',
    short_description:
      'Atmospheric neo-noir short film edit with multi-layer sound design, custom LUT color grading, and anamorphic lens distortion passes.',
    tools: ['DaVinci Resolve Studio', 'Fairlight Audio', 'Fusion VFX'],
    services_provided: ['Narrative Editing', 'Color Grading', 'Sound Design'],
    thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'p-3',
    slug: 'hyper-velocity-fashion',
    title: 'Hyper Velocity — Fashion Campaign',
    category: 'Client Work',
    client_name: 'Vogue Lab Tokyo',
    short_description:
      'Fast-paced editorial fashion reel synced to experimental audio beats, featuring glitch transitions and film halation emulation.',
    tools: ['Premiere Pro', 'After Effects', 'Photoshop'],
    services_provided: ['Short-Form Cut', 'VFX Transitions', 'Audio Sync'],
    thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'p-4',
    slug: 'echoes-of-iceland-doc',
    title: 'Echoes of the North — Documentary',
    category: 'Personal Experiment',
    client_name: 'Independent',
    short_description:
      'Contemplative travel documentary exploring volcanic landscapes with slow-burn pacing and rich cinematic tonal gradation.',
    tools: ['DaVinci Resolve', 'Dehancer Pro'],
    services_provided: ['Documentary Cut', 'Film Emulation'],
    thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
];

const FALLBACK_BEFORE_AFTER = [
  {
    id: 'ba-1',
    title: 'Anamorphic Cinema Grade — S-Log3 to Rec.709 Film',
    description: 'Transforming flat, low-contrast sensor capture into rich cinematic imagery with warm skin tones and deep atmospheric shadows.',
    raw_media_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=70',
    final_media_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=95',
  },
  {
    id: 'ba-2',
    title: 'Commercial Product Grade — High Dynamic Range Pop',
    description: 'Balancing exposure highlights, enhancing saturated product hues, and crafting a crisp, commercial finish.',
    raw_media_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=70',
    final_media_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=95',
  },
];

const FALLBACK_SERVICES = [
  {
    id: 's-1',
    name: 'Short-Form & Social Reels',
    description: 'Thumb-stopping, retention-optimized short-form edits for Instagram, YouTube Shorts, and TikTok with razor-sharp pacing and dynamic kinetic subtitles.',
    icon: HiOutlineBolt,
    badge: 'VIRAL RETENTION',
    deliverables: ['9:16 Vertical Export', 'Attention Hook Framing', 'Kinetic Captions', 'Sound Design Accents'],
  },
  {
    id: 's-2',
    name: 'YouTube & Long-Form Narrative',
    description: 'Strategic pacing, compelling storytelling arcs, multi-cam assembly, custom B-roll cut-ins, and audience retention engineering for creators.',
    icon: HiOutlineFilm,
    badge: 'STORY ARC',
    deliverables: ['16:9 4K DCI Cut', 'Multi-Cam Synchronization', 'Custom Lower Thirds', 'High CTR Thumbnail Stills'],
  },
  {
    id: 's-3',
    name: 'Motion Graphics & Titles',
    description: 'Custom animated title sequences, 3D lower thirds, kinetic typography, callout graphics, screen replacements, and branded logo stings.',
    icon: HiSparkles,
    badge: 'AFTER EFFECTS VFX',
    deliverables: ['Keyframe Animations', 'Kinetic Typography', 'Logo Ident Animation', 'Motion Graphic Callouts'],
  },
  {
    id: 's-4',
    name: 'Cinematic Color Grading',
    description: 'Professional color balancing, skin tone isolation, contrast curve sculpting, film halation, and bespoke Hollywood LUT emulation in DaVinci Resolve Studio.',
    icon: HiOutlineAdjustmentsHorizontal,
    badge: 'DAVINCI RESOLVE',
    deliverables: ['Log-to-Rec.709 CST', 'Skin Tone Vectorscope Isolation', 'Film Halation & Grain Emulation', 'Custom Cinema LUT Exports'],
  },
  {
    id: 's-5',
    name: 'Sound Design & Spatial Foley',
    description: 'Multi-track audio soundscapes, visceral impacts, cinematic whooshes, ambient room tone balancing, dialogue de-noise, and broadcast loudness mastering.',
    icon: HiOutlineMusicalNote,
    badge: 'FAIRLIGHT AUDIO',
    deliverables: ['Multi-Track Foley Layering', 'Dialogue Denoise & EQ', 'Sub-Bass Drops & Risers', '-14 LUFS Streaming Normalization'],
  },
  {
    id: 's-6',
    name: 'Brand & Commercial Ads',
    description: 'Polished promotional videos for agencies, founders, and lifestyle brands engineered to convert audiences and elevate brand prestige.',
    icon: HiOutlineVideoCamera,
    badge: 'COMMERCIAL FINISH',
    deliverables: ['Multi-Aspect Master Deliverables', 'Product Feature Highlights', 'Commercial Color Science', 'Broadcast & Social Cutdowns'],
  },
];

const FALLBACK_PROCESS = [
  { step: 1, track: 'V1', node: 'NODE 01', label: 'INGEST', title: 'Vision & Creative Brief', description: 'Aligning on project tone, visual references, target runtime, pacing blueprint, and distribution platform specifications.' },
  { step: 2, track: 'V2', node: 'NODE 02', label: 'ASSEMBLY', title: 'Selects & Timeline Assembly', description: 'Cataloging selects, synchronizing multi-camera audio tracks, eliminating dead air, and locking the structural story narrative.' },
  { step: 3, track: 'V3', node: 'NODE 03', label: 'PACING', title: 'Rhythm & Dynamic Motion Cut', description: 'Fine-tuning cut points to the frame, crafting dynamic speed ramps, seamless match cuts, and kinetic motion graphics.' },
  { step: 4, track: 'V4', node: 'NODE 04', label: 'COLOR', title: 'DaVinci Colorist Grade', description: 'Color balancing, node-tree grading, camera CST transforms, skin tone isolation, and 35mm film stock emulation.' },
  { step: 5, track: 'A1', node: 'NODE 05', label: 'FAIRLIGHT', title: 'Audio Foley & Soundscape', description: 'Multi-track foley layering, spatial audio placement, dialogue leveling, noise reduction, and musical beat synchronization.' },
  { step: 6, track: 'MASTER', node: 'NODE 06', label: 'DELIVERY', title: 'Master 4K DCI Delivery', description: 'High-bitrate Apple ProRes 422 HQ and web-optimized H.264 exports formatted for client distribution channels.' },
];

export default function HomePage() {
  const context = useOutletContext() || {};
  const settings = context.settings;
  const [showreel, setShowreel] = useState(null);
  const [allProjects, setAllProjects] = useState(FALLBACK_PROJECTS);
  const [beforeAfter, setBeforeAfter] = useState(FALLBACK_BEFORE_AFTER);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [about, setAbout] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const effectiveAbout = context.about || about;

  useEffect(() => {
    Promise.allSettled([
      showreelAPI.getActive(),
      projectsAPI.list(),
      beforeAfterAPI.list(),
      servicesAPI.list(),
      aboutAPI.get(),
    ]).then(([srRes, apRes, baRes, svRes, abRes]) => {
      if (srRes.status === 'fulfilled' && srRes.value.data) {
        setShowreel(srRes.value.data);
      }
      if (apRes.status === 'fulfilled' && apRes.value.data?.length > 0) {
        setAllProjects(apRes.value.data);
      }
      if (baRes.status === 'fulfilled' && baRes.value.data?.length > 0) {
        setBeforeAfter(baRes.value.data);
      }
      if (svRes.status === 'fulfilled' && svRes.value.data?.length > 0) {
        setServices(svRes.value.data);
      }
      if (abRes.status === 'fulfilled' && abRes.value.data) {
        setAbout(abRes.value.data);
      }
    });
  }, []);

  const projectsToDisplay = allProjects.length > 0 ? allProjects : FALLBACK_PROJECTS;
  const filteredProjects =
    activeCategory === 'All'
      ? projectsToDisplay
      : projectsToDisplay.filter((p) => p.category === activeCategory);

  const categories = ['All', 'Client Work', 'Personal Experiment'];

  // Scroll parallax for Hero
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

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
          {/* Audio Visualizer & REC Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border text-xs font-mono text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent rec-dot" />
              <span className="text-text-primary font-bold">24.000 FPS</span>
              <span className="text-text-muted">·</span>
              <span>4K DCI TIMELINE</span>
            </div>
            <AudioVisualizer bars={12} label="" className="hidden sm:inline-flex" />
          </motion.div>

          {/* Hero Name with kinetic stagger */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter text-text-primary uppercase leading-none drop-shadow-2xl">
              {settings?.hero_heading || 'DEV ANAND'}
            </h1>
            <div className="absolute -inset-x-6 top-1/2 -translate-y-1/2 h-10 bg-accent/10 blur-2xl -z-10 pointer-events-none" />
          </motion.div>

          {/* Role Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 flex items-center justify-center flex-wrap gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-text-muted"
          >
            {(settings?.hero_subheading
              ? settings.hero_subheading.split(/[·•/,]/).map((s) => s.trim()).filter(Boolean)
              : ['VIDEO EDITOR', 'COLORIST', 'MOTION DESIGNER']
            ).map((role, idx, arr) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span>{role}</span>
                {idx < arr.length - 1 && <span className="text-accent">•</span>}
              </span>
            ))}
          </motion.div>

          {/* Bold Statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-gradient mt-8 tracking-tight"
          >
            {(settings?.hero_statement || 'YOU WATCH. / I EDIT.').split('/').map((part, i) => (
              <span key={i}>
                {part.trim()}
                {i === 0 && <br />}
              </span>
            ))}
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <a
              href="#showreel"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-bold text-sm bg-gradient-to-r from-accent via-accent-hover to-accent text-surface shadow-[0_0_25px_rgba(var(--accent-rgb),0.35)] hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.6)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden border-beam"
            >
              <div className="w-6 h-6 rounded-full bg-surface/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiPlay className="w-3.5 h-3.5 text-surface ml-0.5" />
              </div>
              <span className="tracking-wider uppercase">WATCH SHOWREEL</span>
            </a>

            <a
              href="#work"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-display font-semibold text-sm glass text-text-primary hover:border-accent/40 hover:bg-surface-hover transition-all duration-300 group"
            >
              <span>EXPLORE WORK</span>
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-accent" />
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
          title="The 2024 Reel"
          subtitle="A 60-second compilation of high-impact commercial cuts, dynamic kinetic typography, and editorial color science."
        />

        <motion.div variants={fadeUp} className="relative">
          <TiltCard className="rounded-3xl overflow-hidden glass-card p-3 shadow-2xl border border-border group">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-card glow">
              {showreel?.video_url ? (
                <video
                  src={showreel.video_url}
                  poster={showreel.thumbnail_url}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Fallback Showreel Interactive Player Simulation */
                <div className="relative w-full h-full bg-gradient-to-tr from-neutral-950 via-surface-card to-neutral-900 flex items-center justify-center group/video overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80"
                    alt="Dev Anand Showreel"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover/video:scale-105 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/40" />

                  {/* Director's Viewfinder HUD Frame */}
                  <div className="absolute inset-4 border border-white/15 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="tracking-widest font-bold text-white">REC 4K DCI</span>
                      </div>
                      <span className="tracking-wider text-white/50">ASPECT: 2.39:1 CINEMASCOPE</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
                      <span className="tracking-wider">FPS: 24.000</span>
                      <span className="tracking-wider">AUDIO: 48kHz STEREO</span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-accent text-surface flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(var(--accent-rgb),0.8)] group-hover/video:scale-110 transition-all duration-300">
                      <HiPlay className="w-8 h-8 ml-1" />
                    </div>
                    <p className="mt-4 font-display font-black text-xl text-text-primary tracking-wide">
                      PLAY MASTER REEL
                    </p>
                    <p className="text-xs font-mono text-text-muted mt-1">
                      PRORES 422 HQ · 01:15 MASTER CUT
                    </p>
                  </div>

                  {/* Corner Timecode Badge */}
                  <div className="absolute top-6 left-6 z-10 hidden sm:block">
                    <span className="timecode bg-black/70 px-3 py-1.5 rounded-md border border-white/10 text-xs font-mono text-text-primary">
                      TC 01:00:00:00 // REEL_v04.mov
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TiltCard>
        </motion.div>
      </Section>

      {/* ── BEFORE / AFTER INTERACTIVE SLIDER ─────────── */}
      <Section id="before-after" className="bg-surface/50">
        <SectionTitle
          label="COLOR FINISHING SUITE"
          title="Raw Log vs Final Grade"
          subtitle="Continuous comparison demonstrating how flat camera sensor profiles are sculpted with rich contrast, filmic saturation, and skin tone fidelity."
        />

        <div className="space-y-16">
          {(beforeAfter.length > 0 ? beforeAfter : FALLBACK_BEFORE_AFTER).map((item) => (
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
      </Section>

      {/* ── SELECTED WORK / PORTFOLIO ─────────────────── */}
      <Section id="work" className="bg-surface-elevated/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionTitle
            label="SELECTED WORKS"
            title="Featured Cuts"
            subtitle="Curated collection of commercials, brand videos, narrative pieces, and motion graphics."
          />

          {/* Category Filter Pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
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
        </div>

        {/* Projects Grid */}
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <TiltCard className="group h-full">
                  <Link
                    to={`/project/${project.slug}`}
                    className="block h-full rounded-2xl overflow-hidden bg-surface-card border border-border/80 hover:border-accent/50 transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col"
                  >
                    {/* Media Thumbnail with Viewfinder HUD */}
                    <div className="relative aspect-video overflow-hidden bg-surface-elevated">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-95 group-hover:brightness-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="timecode">NO THUMBNAIL</span>
                        </div>
                      )}

                      {/* Cinematic Letterbox Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

                      {/* Corner Viewfinder Crosshairs */}
                      <div className="absolute inset-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <span className="text-[9px] font-mono text-white/50 tracking-tighter">[ ⤡ ]</span>
                          <span className="text-[9px] font-mono text-white/50 tracking-tighter">[ ⤢ ]</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[9px] font-mono text-white/50 tracking-tighter">[ ⤢ ]</span>
                          <span className="text-[9px] font-mono text-white/50 tracking-tighter">[ ⤡ ]</span>
                        </div>
                      </div>

                      {/* Category Badge - Top Left */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase glass-card border border-white/15 text-white font-medium shadow">
                          {project.category}
                        </span>
                      </div>

                      {/* Format Badge - Top Right */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase bg-black/60 border border-white/10 text-text-secondary">
                          4K DCI · 24P
                        </span>
                      </div>

                      {/* Centered Hover Play / Expand Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-12 h-12 rounded-full bg-accent/90 text-surface flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl shadow-accent/40">
                          <HiPlay className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Project Metadata */}
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
                        {project.short_description && (
                          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed font-sans">
                            {project.short_description}
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
                          <span>TIMELINE</span>
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
      </Section>

      {/* ── EDITING WORKFLOW PROCESS ───────────────────── */}
      <Section id="process" className="bg-surface/60">
        <SectionTitle
          label="POST-PRODUCTION PIPELINE"
          title="The Workflow"
          subtitle="From raw ingest to master release — a disciplined six-stage pipeline engineered for clarity and cinematic speed."
        />

        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(settings?.process_steps?.length > 0 ? settings.process_steps : FALLBACK_PROCESS).map((step) => (
            <motion.div key={step.step} variants={fadeUp}>
              <TiltCard className="group h-full">
                <div className="bg-surface-card rounded-2xl p-6 sm:p-7 border border-border/80 hover:border-accent/40 transition-all duration-300 h-full flex flex-col justify-between shadow-lg">
                  <div>
                    {/* Track Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span className="font-mono text-xs font-bold text-accent">
                          {step.track || `TRACK V${step.step}`}
                        </span>
                        <span className="text-text-muted/50 font-mono text-xs">|</span>
                        <span className="font-mono text-[10px] text-text-muted uppercase">
                          {step.label || `NODE 0${step.step}`}
                        </span>
                      </div>
                      <span className="text-2xl font-display font-black text-text-muted/30 group-hover:text-accent transition-colors">
                        0{step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-text-primary group-hover:text-accent transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-2.5 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>

                  {/* Playhead Progress Track Indicator */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-500 rounded-full"
                        style={{ width: `${(step.step / 6) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {Math.round((step.step / 6) * 100)}%
                    </span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <Section id="services" className="bg-surface-elevated/20">
        <SectionTitle
          label="CAPABILITIES & SPECIALTIES"
          title="Services & Specialties"
          subtitle="Tailored post-production solutions for creative agencies, filmmakers, content creators, and innovative brands."
        />

        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(services.length > 0 ? services : FALLBACK_SERVICES).map((svc) => {
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
                    effectiveAbout?.profile_image_url ||
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
                href={settings?.email ? `mailto:${settings.email}` : 'mailto:hello@devanand.video'}
                className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-display font-bold text-sm bg-gradient-to-r from-accent via-accent-hover to-accent text-surface shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)] hover:shadow-[0_0_50px_rgba(var(--accent-rgb),0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border-beam"
              >
                <span className="tracking-wider uppercase">
                  {settings?.email || 'START A PROJECT'}
                </span>
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Social Links */}
            {settings?.social_links && Object.keys(settings.social_links).length > 0 && (
              <div className="flex items-center justify-center gap-6 mt-10">
                {Object.entries(settings.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent transition-colors text-xs font-mono uppercase tracking-wider"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Section>
    </>
  );
}
