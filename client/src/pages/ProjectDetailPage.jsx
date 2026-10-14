import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsAPI } from '../lib/api';
import { FALLBACK_SHOWCASE_PROJECTS } from '../lib/showcaseData';
import VideoPlayer from '../components/VideoPlayer';
import {
  HiOutlineArrowLeft,
  HiPlay,
  HiOutlineArrowRight,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa6';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const context = useOutletContext() || {};
  const settings = context.settings;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCut, setActiveCut] = useState('landscape'); // 'landscape' or 'vertical'

  useEffect(() => {
    setLoading(true);
    projectsAPI
      .getBySlug(slug)
      .then(({ data }) => {
        const item = data?.project || data;
        const matched = item || FALLBACK_SHOWCASE_PROJECTS.find((p) => p.slug === slug);
        setProject(matched || null);
        if (matched?.mobile_video_url && !matched?.video_url) {
          setActiveCut('vertical');
        } else {
          setActiveCut('landscape');
        }
      })
      .catch(() => {
        const fallback = FALLBACK_SHOWCASE_PROJECTS.find((p) => p.slug === slug);
        setProject(fallback || null);
        if (fallback?.mobile_video_url && !fallback?.video_url) {
          setActiveCut('vertical');
        } else {
          setActiveCut('landscape');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          RESOLVING TIMELINE CLIP...
        </span>
      </div>
    );
  }

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

  const hasLandscape = Boolean(project.video_url);
  const hasVertical = Boolean(project.mobile_video_url);
  const hasBoth = hasLandscape && hasVertical;
  const isVerticalActive = activeCut === 'vertical' || (!hasLandscape && hasVertical);
  const currentVideoUrl = isVerticalActive ? project.mobile_video_url : project.video_url;
  const isGoogleDrive = Boolean(currentVideoUrl && currentVideoUrl.includes('drive.google.com'));
  const gDriveViewUrl = isGoogleDrive
    ? (() => {
        const match = currentVideoUrl.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i);
        return match ? `https://drive.google.com/file/d/${match[1]}/view` : currentVideoUrl;
      })()
    : null;
  const whatsappNumber = (settings?.phone || '919876543210').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Dev, I saw your "${project.title}" project on your portfolio and I'd like to discuss a video editing project with you.`
  )}`;

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

        {/* Aspect Ratio / Format Switcher if both cuts exist */}
        {hasBoth && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-xs font-mono text-text-muted">FORMAT CUT:</span>
            <button
              type="button"
              onClick={() => setActiveCut('landscape')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                !isVerticalActive
                  ? 'bg-accent text-surface font-bold shadow-lg shadow-accent/25'
                  : 'glass text-text-secondary hover:text-text-primary hover:border-accent/40'
              }`}
            >
              16:9 CINEMA MASTER
            </button>
            <button
              type="button"
              onClick={() => setActiveCut('vertical')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                isVerticalActive
                  ? 'bg-accent text-surface font-bold shadow-lg shadow-accent/25'
                  : 'glass text-text-secondary hover:text-text-primary hover:border-accent/40'
              }`}
            >
              9:16 VERTICAL REEL
            </button>
          </div>
        )}

        {/* Media / Video Showcase Frame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mt-8 ${isVerticalActive ? 'flex flex-col items-center' : ''}`}
        >
          {isVerticalActive ? (
            /* 9:16 Smartphone Showcase Frame */
            <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center">
              <div className="w-full aspect-[9/16] rounded-3xl overflow-hidden bg-black border-2 border-border/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative group ring-4 ring-black/40">
                <VideoPlayer
                  url={currentVideoUrl}
                  poster={project.thumbnail_url}
                  title={`${project.title} (Vertical Reel)`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Prominent Clean Fullscreen Action for Mobile */}
              {isGoogleDrive && (
                <div className="mt-4 flex flex-col items-center gap-2 text-center w-full">
                  <a
                    href={gDriveViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-accent via-accent-hover to-accent text-surface font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(var(--accent-rgb),0.35)] hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.55)] transition-all duration-300 hover:scale-105 active:scale-95 group w-full max-w-xs"
                  >
                    <HiPlay className="w-4 h-4 ml-0.5" />
                    <span>Watch in Clean Fullscreen</span>
                    <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <span className="text-[11px] font-mono text-text-muted">
                    Tap to play without overlapping buttons
                  </span>
                </div>
              )}
            </div>
          ) : currentVideoUrl ? (
            /* 16:9 Landscape Cinema Frame */
            <div className="w-full flex flex-col items-center">
              <div className="w-full rounded-2xl overflow-hidden aspect-video bg-surface-card border border-border/80 shadow-2xl relative group">
                <VideoPlayer
                  url={currentVideoUrl}
                  poster={project.thumbnail_url}
                  title={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {isGoogleDrive && (
                <div className="mt-4 flex items-center justify-center">
                  <a
                    href={gDriveViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-accent/40 text-accent hover:bg-accent hover:text-surface transition-all text-xs font-mono tracking-wider uppercase group"
                  >
                    <HiPlay className="w-3.5 h-3.5" />
                    <span>Open in Clean Fullscreen Player</span>
                    <HiOutlineArrowTopRightOnSquare className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden aspect-video bg-surface-card border border-border/80 shadow-2xl relative group">
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
            </div>
          )}
        </motion.div>

        {/* Narrative & Case Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-light border border-border text-[10px] font-mono text-accent mb-3 uppercase tracking-wider">
                EDITORIAL OVERVIEW
              </div>
              <p className="text-text-secondary leading-relaxed text-base sm:text-lg font-sans">
                {project.description}
              </p>
            </div>

            {project.client_description && (
              <div className="p-5 rounded-2xl bg-surface-card border border-border/70">
                <span className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">
                  CLIENT &amp; CREATIVE GOAL
                </span>
                <p className="text-text-secondary text-sm font-sans leading-relaxed">
                  {project.client_description}
                </p>
              </div>
            )}

            {/* Direct Client Action CTA */}
            <div className="p-6 rounded-2xl glass-card border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-base text-text-primary">
                  Interested in a video or reel like this?
                </h4>
                <p className="text-text-muted text-xs font-sans mt-0.5">
                  Let's discuss creative ideas, turnaround times, and pricing.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#128C7E] text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <FaWhatsapp className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </a>
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
