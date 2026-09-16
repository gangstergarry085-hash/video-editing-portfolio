import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsAPI } from '../lib/api';
import {
  HiOutlineArrowLeft,
  HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';

const FALLBACK_PROJECTS = [
  {
    id: 'p-1',
    slug: 'star-excellent-academy',
    title: 'Star Excellent Academy Commercial',
    category: 'Client Work',
    client_name: 'Star Excellent Academy',
    description:
      'Star Excellent Academy commissioned a high-energy, contemporary commercial designed for multi-platform distribution across Instagram, YouTube, and digital outdoor displays. The edit required intense rhythmic pacing, audio beat-syncing, custom color grading to evoke an inspiring academic environment, and animated graphic callouts highlighting course offerings.',
    short_description: 'High-impact promotional commercial featuring rhythmic pacing, kinetic typography, dynamic speed ramping, and pristine color grading.',
    tools: ['DaVinci Resolve', 'After Effects', 'Premiere Pro', 'Fairlight Audio'],
    services_provided: ['Commercial Editing', 'Motion Graphics', 'Color Grading', 'Sound Design'],
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80',
    video_url: '',
    project_year: 2024,
    project_type: 'Commercial Ad',
    dev_role: 'Lead Video Editor & Colorist',
    client_description: 'Premier regional educational academy specializing in student transformation.',
  },
  {
    id: 'p-2',
    slug: 'neon-horizon-narrative',
    title: 'Neon Horizon — Sci-Fi Narrative',
    category: 'Client Work',
    client_name: 'Aetheria Films',
    description:
      'A moody, futuristic narrative short set in a rain-drenched cyberpunk metropolis. Handled full timeline assembly, scene pacing, atmospheric sound design with Foley, and heavy colorist work matching neon highlights with deep cinematic blacks.',
    short_description: 'Atmospheric neo-noir short film edit with multi-layer sound design and custom LUT color grading.',
    tools: ['DaVinci Resolve Studio', 'Fairlight Audio', 'Fusion VFX'],
    services_provided: ['Narrative Editing', 'Color Grading', 'Sound Design'],
    thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    video_url: '',
    project_year: 2024,
    project_type: 'Short Film',
    dev_role: 'Editor & Sound Designer',
    client_description: 'Independent film studio producing elevated genre shorts.',
  },
  {
    id: 'p-3',
    slug: 'hyper-velocity-fashion',
    title: 'Hyper Velocity — Fashion Campaign',
    category: 'Client Work',
    client_name: 'Vogue Lab Tokyo',
    description:
      'Fast-paced editorial fashion campaign featuring dynamic kinetic cuts, custom split screens, 35mm film halation emulation, and aggressive electronic soundtrack sync.',
    short_description: 'Fast-paced editorial fashion reel synced to experimental audio beats.',
    tools: ['Premiere Pro', 'After Effects', 'Photoshop'],
    services_provided: ['Short-Form Cut', 'VFX Transitions', 'Audio Sync'],
    thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80',
    video_url: '',
    project_year: 2024,
    project_type: 'Fashion Editorial',
    dev_role: 'Editor & Motion Designer',
    client_description: 'High-fashion creative agency creating vanguard digital looks.',
  },
  {
    id: 'p-4',
    slug: 'echoes-of-iceland-doc',
    title: 'Echoes of the North — Documentary',
    category: 'Personal Experiment',
    client_name: 'Independent',
    description:
      'Meditative travel documentary capturing remote volcanic landscapes. Focused on slow-burn editing rhythm, subtle ambient audio, and film stock emulation with authentic grain structure.',
    short_description: 'Contemplative travel documentary exploring volcanic landscapes with slow-burn pacing.',
    tools: ['DaVinci Resolve', 'Dehancer Pro'],
    services_provided: ['Documentary Cut', 'Film Emulation'],
    thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    video_url: '',
    project_year: 2024,
    project_type: 'Documentary',
    dev_role: 'Director & Editor',
    client_description: 'Personal creative exploration.',
  },
];

const COLORIST_NODES = [
  { node: '01', name: 'Input CST', desc: 'Camera Sensor Log to DaVinci Wide Gamut Intermediate' },
  { node: '02', name: 'Exposure & Balance', desc: 'Photometric exposure offset & neutral grey balance' },
  { node: '03', name: 'Contrast Curve', desc: 'S-curve roll-off preserving highlight details' },
  { node: '04', name: 'Skin Tone Qualifier', desc: 'Vectorscope isolation along skin tone indicator line' },
  { node: '05', name: 'Look Development', desc: 'Hollywood 35mm print stock emulation & split toning' },
  { node: '06', name: 'Output Transform', desc: 'Rec.709 Gamma 2.4 delivery master conversion' },
];

export default function ProjectDetailPage() {
  const { slug } = useParams();
  // Instant 0ms initialization using fallback
  const [project, setProject] = useState(() => {
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) || null;
  });

  useEffect(() => {
    projectsAPI
      .getBySlug(slug)
      .then(({ data }) => {
        if (data) setProject(data);
      })
      .catch(() => {
        // Fallback is already actively rendered
      });
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-border text-xs font-mono text-text-muted mb-4 uppercase">
          TIMELINE 404
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-text-primary mb-4">
          CLIP NOT FOUND.
        </h1>
        <p className="text-text-secondary mb-8 max-w-md font-sans leading-relaxed">
          This sequence doesn't exist on the timeline or has been archived.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-surface font-display font-bold text-sm hover:bg-accent-hover transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" /> Return to Head of Reel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all duration-300 text-xs font-mono uppercase tracking-wider group"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-accent" />
            <span>BACK TO PORTFOLIO</span>
          </Link>
        </motion.div>

        {/* Header Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="border-b border-border/80 pb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
              {project.category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-text-primary tracking-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-5 text-xs font-mono text-text-secondary">
            {project.project_year && (
              <span className="px-3 py-1 rounded-md bg-surface-card border border-border">
                YEAR: {project.project_year}
              </span>
            )}
            {project.project_type && (
              <span className="px-3 py-1 rounded-md bg-surface-card border border-border">
                FORMAT: {project.project_type}
              </span>
            )}
            {project.client_name && (
              <span className="px-3 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent font-semibold">
                CLIENT: {project.client_name}
              </span>
            )}
          </div>
        </motion.div>

        {/* Media / Video Showcase Frame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 rounded-2xl overflow-hidden aspect-video bg-surface-card border border-border/80 shadow-2xl relative group"
        >
          {project.video_url ? (
            <video
              src={project.video_url}
              poster={project.thumbnail_url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={project.thumbnail_url}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30 flex items-end justify-between p-6">
                <div className="glass px-3.5 py-1.5 rounded-lg text-xs font-mono text-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>MASTER PREVIEW · 4K DCI</span>
                </div>
                <span className="text-[10px] font-mono text-white/60 bg-black/50 px-2.5 py-1 rounded border border-white/10">
                  24.000 FPS · PRORES 422 HQ
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Technical Specs Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-card border border-border/70">
            <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
              TIMELINE RESOLUTION
            </span>
            <span className="text-xs font-mono font-bold text-text-primary mt-1 block">
              4096 × 2160 DCI
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-card border border-border/70">
            <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
              COLOR PIPELINE
            </span>
            <span className="text-xs font-mono font-bold text-accent mt-1 block">
              DaVinci YRGB Managed
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-card border border-border/70">
            <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
              ASPECT RATIO
            </span>
            <span className="text-xs font-mono font-bold text-text-primary mt-1 block">
              16:9 / 2.39:1 Cinema
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-card border border-border/70">
            <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider">
              AUDIO MASTER
            </span>
            <span className="text-xs font-mono font-bold text-text-primary mt-1 block">
              48kHz 24-Bit Stereo
            </span>
          </div>
        </div>

        {/* Narrative & Specifications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-light border border-border text-[10px] font-mono text-accent mb-3 uppercase tracking-wider">
                EDITORIAL OVERVIEW
              </div>
              <p className="text-text-secondary leading-relaxed text-lg font-sans">
                {project.description}
              </p>
            </div>

            {/* DaVinci Colorist Node Breakdown */}
            <div className="pt-6 border-t border-border/70">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-primary">
                    DaVinci Resolve Color Grade Node-Tree
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-text-muted">6-NODE PIPELINE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLORIST_NODES.map((node) => (
                  <div
                    key={node.node}
                    className="p-3 rounded-xl bg-surface-card border border-border/60 hover:border-accent/40 transition-colors flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded bg-accent/10 border border-accent/30 text-accent font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {node.node}
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-text-primary font-display">
                        {node.name}
                      </span>
                      <span className="block text-[11px] text-text-secondary font-sans mt-0.5 leading-snug">
                        {node.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Software Pipeline */}
            {project.tools?.length > 0 && (
              <div className="bg-surface-card p-5 rounded-2xl border border-border/80 shadow-lg">
                <h3 className="text-xs font-mono font-bold text-text-primary mb-3 uppercase tracking-wider">
                  SOFTWARE PIPELINE
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="bg-surface-elevated rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary border border-border/60"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Role & Deliverables */}
            {project.dev_role && (
              <div className="bg-surface-card p-5 rounded-2xl border border-border/80 shadow-lg">
                <h3 className="text-xs font-mono font-bold text-text-primary mb-2 uppercase tracking-wider">
                  ROLE & RESPONSIBILITY
                </h3>
                <p className="text-text-secondary text-sm font-medium">{project.dev_role}</p>
              </div>
            )}

            {project.services_provided?.length > 0 && (
              <div className="bg-surface-card p-5 rounded-2xl border border-border/80 shadow-lg">
                <h3 className="text-xs font-mono font-bold text-text-primary mb-3 uppercase tracking-wider">
                  DELIVERABLES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.services_provided.map((svc) => (
                    <span
                      key={svc}
                      className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
