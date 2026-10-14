/**
 * Curated Video Showcase Data
 * Showcases multiple high-impact video editing styles across 3 dedicated categories:
 * 1. "Client & Case Stories" (Includes Star Excellent Academy education success reel)
 * 2. "High-Retention Reels" (Talking-head, creator, and short-form cuts)
 * 3. "Commercial & Promos" (Brand teasers, products, and color grade breakdowns)
 */

export const SHOWCASE_CATEGORIES = [
  'Client & Case Stories',
  'High-Retention Reels',
  'Commercial & Promos',
];

export const FALLBACK_SHOWCASE_PROJECTS = [
  // ── Tab 1: Client & Case Stories ──────────────────────
  {
    id: 'case-edu-01',
    title: 'Star Excellent Academy — Success Story',
    slug: 'star-excellent-academy',
    category: 'Client & Case Stories',
    project_type: 'Cinematic Education Reel',
    client_name: 'Star Excellent Academy',
    client_description: 'Premier educational academy providing competitive exam mentoring and leadership development.',
    dev_role: 'Lead Video Editor, Colorist & Motion Designer',
    short_description: 'Cinematic education success story and enrollment promo engineered with dynamic retention pacing, kinetic typography, student transformation testimonials, and DaVinci Resolve color grading.',
    description: 'High-impact promotional success story crafted for Star Excellent Academy. The client needed to translate student academic achievements and alumni acceptance stories into an emotionally gripping 9:16 vertical reel for Instagram campaigns and admissions outreach. Handled end-to-end editorial: cutting 3 hours of interview and campus footage into a disciplined 60-second retention narrative, leveling student dialogue with Fairlight voice isolation, synchronizing ambient campus foley, and applying a warm, filmic Rec.709 color grade.',
    thumbnail_url: '/posters/star-excellent-academy.jpg',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'Fairlight Audio', 'Fusion', 'Kinetic Typography'],
    services_provided: ['Story Assembly', 'Dialogue Restoration', 'Color Grading', 'Motion Graphics'],
    project_year: 2024,
    featured: true,
    published: true,
  },
  {
    id: 'case-athlete-02',
    title: 'Apex Athlete — Transformation Story',
    slug: 'apex-athlete-transformation',
    category: 'Client & Case Stories',
    project_type: 'Athlete Documentary Reel',
    client_name: 'Apex Performance Brand',
    client_description: 'High-performance athletic training center and athletic brand.',
    dev_role: 'Editor & Sound Designer',
    short_description: 'High-energy transformation documentary cut with frame-accurate sound foley, heartbeat risers, and aggressive bass drops synced to athlete lifts.',
    description: 'A punchy, gritty athlete case story focusing on recovery and athletic discipline. Edited with speed ramps synced to breathing audio, multi-track iron bar foley, and high-contrast Kodak 500T color science in DaVinci Resolve Studio.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'Fairlight Foley', 'Rec.709 CST'],
    services_provided: ['Dynamic Pacing', 'Sound Foley', 'Color Grading'],
    project_year: 2024,
    featured: true,
    published: true,
  },
  {
    id: 'case-saas-03',
    title: 'Founders Blueprint — SaaS Client Journey',
    slug: 'founders-blueprint-saas',
    category: 'Client & Case Stories',
    project_type: 'Client Testimonial Cut',
    client_name: 'Founders Blueprint',
    client_description: 'Venture accelerator documenting founder breakthroughs and product traction.',
    dev_role: 'Lead Editor & Sound Master',
    short_description: 'Turning 45 minutes of founder interview takes into a punchy 60-second high-retention reel with graphic lower thirds and voice isolation.',
    description: 'Corporate client case study turning founder dialogue into an engaging social story. Applied Fairlight dialogue restoration to eliminate room echo and engineered kinetic screen recording overlays.',
    thumbnail_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'After Effects', 'Fairlight EQ'],
    services_provided: ['Editorial Cutting', 'Voice Isolation', 'Motion Graphics'],
    project_year: 2024,
    featured: false,
    published: true,
  },

  // ── Tab 2: High-Retention Reels ───────────────────────
  {
    id: 'reel-hook-01',
    title: 'Fintech Masterclass — Viral Hook Cut',
    slug: 'fintech-viral-hook',
    category: 'High-Retention Reels',
    project_type: 'Talking-Head Retention Reel',
    client_name: 'Creator Capital',
    client_description: 'Financial creator media company with 500k+ subscribers.',
    dev_role: 'Retention Editor & Motion Specialist',
    short_description: 'Talking-head financial breakdown edited for >85% audience retention with visual pattern interrupts every 2.4s, kinetic punch-ins, and bespoke sound cues.',
    description: 'Designed specifically to dominate Instagram Reels & YouTube Shorts algorithmic metrics. Features sub-frame cuts, dynamic framing punch-ins on punchlines, animated emojis, sound-effect pop-ins, and Fairlight dialogue leveling.',
    thumbnail_url: '/posters/high-retention-reel.jpg',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'Motion Typography', 'Fairlight Voice Isolation'],
    services_provided: ['Retention Pacing', 'Animated Captions', 'Sound Design'],
    project_year: 2024,
    featured: true,
    published: true,
  },
  {
    id: 'reel-creator-02',
    title: 'The Creative Mindset — High-Velocity Cut',
    slug: 'creative-mindset-reel',
    category: 'High-Retention Reels',
    project_type: 'Creator Short-Form Cut',
    client_name: 'Modern Creative Agency',
    client_description: 'Creative studio producing daily viral video insights.',
    dev_role: 'Short-Form Video Editor',
    short_description: 'High-velocity creator cut with motion tracking, custom sound design foley, and micro-zooms that lock viewer attention from first frame to loop.',
    description: 'Paced to keep modern audiences mesmerized from start to finish. Utilizes smooth bezier curve transitions, paper-texture overlays, custom pop-in graphics, and studio voice presence boosting in DaVinci Fairlight.',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'After Effects', 'Sound Foley'],
    services_provided: ['Short-form Editorial', 'Motion Graphics', 'Sound Sync'],
    project_year: 2024,
    featured: false,
    published: true,
  },
  {
    id: 'reel-ai-03',
    title: 'AI Workflow Revolution — Explainer Short',
    slug: 'ai-workflow-explainer',
    category: 'High-Retention Reels',
    project_type: 'Educational Short-Form',
    client_name: 'Synthetix Media',
    client_description: 'Technology agency demystifying machine intelligence.',
    dev_role: 'Video Editor & Graphic Animator',
    short_description: 'Educational tech short featuring seamless multi-track b-roll cutaways, animated screen recordings, and crisp vocal leveling with Fairlight Voice Isolation.',
    description: 'Technical explainer made dynamic for mobile feeds. Features 3D UI callouts, smooth camera tracking zooms, kinetic text cues, and broadcast audio mastering.',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'Fairlight Voice Isolation', 'Fusion'],
    services_provided: ['B-Roll Pacing', 'Animated Graphics', 'Audio Mastering'],
    project_year: 2024,
    featured: false,
    published: true,
  },

  // ── Tab 3: Commercial & Promos ────────────────────────
  {
    id: 'promo-chronos-01',
    title: 'Chronos Timepiece — Commercial Promo',
    slug: 'chronos-luxury-timepiece',
    category: 'Commercial & Promos',
    project_type: 'Luxury Commercial Promo',
    client_name: 'Chronos Genève',
    client_description: 'Swiss horology manufacturer crafting mechanical luxury chronographs.',
    dev_role: 'Commercial Editor & Colorist',
    short_description: 'Commercial product teaser showcasing high-frequency speed ramps, macro color grading with Rec.709 film emulation, and metallic sound foley.',
    description: 'Commercial promo showcasing precision horology craftsmanship. Grade built in DaVinci Resolve Studio using a custom CST node tree, Kodak 2383 film print emulation, highlight halation, and metallic gear foley layered in Fairlight.',
    thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Colorist', 'CST Node Tree', 'Dehancer 35mm'],
    services_provided: ['Commercial Editing', 'Node-Based Color Grade', 'Macro Sound Foley'],
    project_year: 2024,
    featured: true,
    published: true,
  },
  {
    id: 'promo-lumina-02',
    title: 'Lumina Studio — Color Grade Breakdown',
    slug: 'lumina-color-grade-breakdown',
    category: 'Commercial & Promos',
    project_type: 'Commercial Grade Breakdown',
    client_name: 'Lumina Brand Lab',
    client_description: 'Beauty and skincare studio producing high-definition brand commercials.',
    dev_role: 'Colorist & Finishing Artist',
    short_description: 'Visual brand promo featuring side-by-side node grading layers, Rec.709 color balance transforms, and skin-tone vector isolation.',
    description: 'Demonstrating how flat camera raw sensor log is molded into glowing, filmic commercial skin tones. Features node-by-node breakdown wipes, false-color exposure checks, and saturation curve tuning.',
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve Studio', 'Rec.709 CST', 'Fairlight Mastering'],
    services_provided: ['Color Space Transform', 'Skin-Tone Isolation', 'Final Finishing'],
    project_year: 2024,
    featured: false,
    published: true,
  },
  {
    id: 'promo-urban-03',
    title: 'Urban Pulse — Streetwear Capsule Promo',
    slug: 'urban-pulse-capsule-promo',
    category: 'Commercial & Promos',
    project_type: 'Product Teaser & Motion Reel',
    client_name: 'Urban Pulse Fashion',
    client_description: 'High-end streetwear label dropping seasonal capsule collections.',
    dev_role: 'Motion Editor & Sound Designer',
    short_description: 'High-octane commercial fashion promo driven by syncopated beat cuts, VHS/halide film grain textures, and kinetic typography.',
    description: 'An aggressive, style-forward product launch promo. Synchronized heavy 808 sub-bass with jump cuts, digital glitch transitions, and anamorphic lens flares to build irresistible hype.',
    thumbnail_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    mobile_video_url: 'https://res.cloudinary.com/demo/video/upload/elephants.mp4',
    tools: ['DaVinci Resolve', 'Motion Graphics', 'Film Emulation'],
    services_provided: ['Beat-Synced Editorial', 'Kinetic Text', 'Sound Design'],
    project_year: 2024,
    featured: false,
    published: true,
  },
];

/**
 * Normalizes any project category into one of the 3 primary showcase categories.
 */
export function normalizeCategory(category) {
  if (!category) return 'Client & Case Stories';
  const c = category.toLowerCase().trim();
  if (c.includes('client') || c.includes('case') || c.includes('story') || c.includes('education')) {
    return 'Client & Case Stories';
  }
  if (c.includes('retention') || c.includes('reel') || c.includes('social') || c.includes('youtube') || c.includes('talking')) {
    return 'High-Retention Reels';
  }
  if (c.includes('commercial') || c.includes('promo') || c.includes('ad') || c.includes('brand') || c.includes('product') || c.includes('cinematic')) {
    return 'Commercial & Promos';
  }
  return 'Client & Case Stories';
}
