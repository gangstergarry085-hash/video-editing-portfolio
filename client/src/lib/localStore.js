// Standalone Browser Storage & Mock Database for GitHub Pages
// Ensures the entire Admin CMS and public site work 100% offline or on static hosting

const STORAGE_KEYS = {
  AUTH: 'dev_cms_auth',
  PASSWORD: 'dev_cms_password',
  PROJECTS: 'dev_cms_projects',
  BEFORE_AFTER: 'dev_cms_before_after',
  SHOWREELS: 'dev_cms_showreels',
  SERVICES: 'dev_cms_services',
  ABOUT: 'dev_cms_about',
  SETTINGS: 'dev_cms_settings',
  MEDIA: 'dev_cms_media',
  API_URL: 'dev_cms_custom_api_url',
};

const DEFAULT_ADMIN = {
  email: 'admin@devanand.com',
  name: 'Dev Anand',
  role: 'admin',
};

const DEFAULT_PASSWORD = 'garry@2004';

const INITIAL_PROJECTS = [
  {
    id: 'p-1',
    slug: 'star-excellent-academy',
    title: 'Star Excellent Academy Commercial',
    category: 'Client Work',
    client_name: 'Star Excellent Academy',
    client_description: 'Premier educational academy seeking high-converting promotional content.',
    dev_role: 'Lead Video Editor & Motion Graphics Designer',
    short_description: 'High-impact commercial featuring rhythmic pacing, kinetic typography, dynamic speed ramping, and pristine color grading.',
    description: 'Promotional video project for Star Excellent Academy. Handled end-to-end video editing and motion graphics for the academy\'s promotional content across digital channels.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    tools: ['DaVinci Resolve', 'After Effects', 'Premiere Pro', 'Photoshop'],
    services_provided: ['Commercial Editing', 'Motion Graphics', 'Color Grading', 'Sound Design'],
    project_year: 2024,
    project_type: 'Commercial',
    featured: true,
    published: true,
    display_order: 0,
    created_at: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'p-2',
    slug: 'pulse-fitness-app-reel',
    title: 'Pulse Fitness Kinetic Promo',
    category: 'Motion Graphics',
    client_name: 'Pulse Technologies',
    client_description: 'Next-generation fitness app combining biometric tracking with workout coaching.',
    dev_role: 'Motion Designer & Sound Editor',
    short_description: 'High-energy 9:16 vertical motion design reel with custom 3D phone tracking and sound sync.',
    description: 'Produced a viral social campaign showcasing UI screen replacements, beat-synced beat drops, and kinetic type animations tailored for TikTok and Instagram Reels.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-man-working-out-with-dumbbells-43284-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    tools: ['After Effects', 'DaVinci Resolve', 'Audition'],
    services_provided: ['Short-Form Vertical', 'Motion Graphics', 'Sound Design'],
    project_year: 2024,
    project_type: 'Social Ad',
    featured: true,
    published: true,
    display_order: 1,
    created_at: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'p-3',
    slug: 'nordic-echoes-documentary',
    title: 'Nordic Echoes — Mini Documentary',
    category: 'Cinematic',
    client_name: 'Fjord Narrative Films',
    client_description: 'Independent documentary studio exploring remote Arctic landscapes.',
    dev_role: 'Offline & Online Editor, Colorist',
    short_description: 'Atmospheric pacing with rich ambient soundscapes and cinematic film emulation.',
    description: 'Paced over 40 hours of drone and cinema camera footage down to an emotionally gripping 12-minute documentary cut. Graded in DaVinci Resolve using custom Kodak 2383 LUT curves.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-pine-forest-41566-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    tools: ['DaVinci Resolve', 'Premiere Pro'],
    services_provided: ['Cinematic Editing', 'Color Grading', 'Sound Design'],
    project_year: 2023,
    project_type: 'Documentary',
    featured: true,
    published: true,
    display_order: 2,
    created_at: new Date('2023-11-20').toISOString(),
  }
];

const INITIAL_SERVICES = [
  { id: 's-1', name: 'Short-form Content', description: 'Reels, TikToks, and Shorts engineered for high viewer retention, pacing, and viral engagement.', display_order: 0, published: true },
  { id: 's-2', name: 'YouTube Editing', description: 'Comprehensive YouTube video editing — hook pacing, storytelling cuts, kinetic graphics, and thumb-stopping visual cues.', display_order: 1, published: true },
  { id: 's-3', name: 'Motion Graphics', description: 'Custom animated titles, kinetic typography, lower thirds, 3D logo resolves, and visual effects.', display_order: 2, published: true },
  { id: 's-4', name: 'Cinematic Editing', description: 'Film-grade narrative rhythm, pacing, and dramatic tension tailored for commercials and short films.', display_order: 3, published: true },
  { id: 's-5', name: 'Brand & Commercial Videos', description: 'High-production promotional campaigns for brands, digital agencies, and product launches.', display_order: 4, published: true },
  { id: 's-6', name: 'Color Grading', description: 'Color correction, film print emulation, color harmony, and custom mood grading in DaVinci Resolve.', display_order: 5, published: true },
  { id: 's-7', name: 'Sound Design & Mixing', description: 'Multi-layer foley, riser/whoosh impacts, music timing, and broadcast-ready audio mastering.', display_order: 6, published: true },
];

const INITIAL_SHOWREEL = {
  id: 'sr-1',
  title: 'Official Showreel 2024-2025',
  description: 'A rapid montage of selected commercial, narrative, motion graphics, and color grading projects.',
  video_url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
  thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=85',
  aspect_ratio: '16:9',
  is_active: true,
  display_order: 0,
};

const INITIAL_BEFORE_AFTER = [
  {
    id: 'ba-1',
    title: 'Golden Hour Cinematic Grade',
    description: 'Transforming flat Log sensor footage into a rich, contrasty golden-hour look.',
    before_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60&sat=-80',
    after_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90',
    before_label: 'Flat Log',
    after_label: 'Rec.709 Color Grade',
    published: true,
    display_order: 0,
  }
];

const INITIAL_ABOUT = {
  name: 'Dev Anand',
  role: 'Video Editor & Motion Graphics Designer',
  bio: "I'm Dev Anand — a video editor and motion graphics designer with a passion for cinematic storytelling. I believe every frame should earn its place in the timeline. From raw footage to polished final cuts, I bring stories to life through precise editing, dynamic motion graphics, and thoughtful sound design.",
  experience: '~1 Year',
  location: 'India',
  availability_status: 'Available for Projects',
  social_links: [
    { platform: 'YouTube', url: 'https://youtube.com' },
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'LinkedIn', url: 'https://linkedin.com' },
  ],
  tools: [
    { name: 'DaVinci Resolve', category: 'Editing' },
    { name: 'After Effects', category: 'Motion Graphics' },
    { name: 'Premiere Pro', category: 'Editing' },
    { name: 'Photoshop', category: 'Design' },
  ],
};

const INITIAL_SETTINGS = {
  site_title: 'Dev Anand — Video Editor',
  hero_heading: 'DEV ANAND',
  hero_subheading: 'VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER',
  hero_statement: 'YOU WATCH. / I EDIT.',
  availability_status: 'Available for Projects',
  accent_color: '#E50914',
  email: 'contact@devanand.com',
  meta_title: 'Dev Anand — Video Editor & Motion Designer',
  meta_description: 'Portfolio of Dev Anand — Video Editor, Motion Graphics Designer, and Visual Storyteller.',
  footer_text: '© Dev Anand. All rights reserved.',
  process_steps: [
    { step: 1, title: 'Briefing', description: 'Understanding your vision, target audience, and project goals.' },
    { step: 2, title: 'Raw Review', description: 'Reviewing all footage, selecting the best takes, and organizing assets.' },
    { step: 3, title: 'Assembly Cut', description: 'Building the initial structure — story arc, pacing, and flow.' },
    { step: 4, title: 'Fine Cut', description: 'Refining transitions, timing, and adding motion graphics.' },
    { step: 5, title: 'Color & Sound', description: 'Color grading, sound design, music sync, and audio mixing.' },
    { step: 6, title: 'Final Delivery', description: 'Export in all required formats, revisions, and handoff.' },
  ],
};

const INITIAL_MEDIA = [
  {
    id: 'm-1',
    filename: 'showreel-poster.jpg',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    type: 'image/jpeg',
    size: 245000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    filename: 'academy-commercial.jpg',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    type: 'image/jpeg',
    size: 312000,
    created_at: new Date().toISOString(),
  }
];

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[LocalStore] Could not persist key ${key}:`, err);
  }
}

// ── Standalone Local Store API ────────────────────────────
export const localStore = {
  isStandalone() {
    return true;
  },

  // ── Auth ──────────────────────────────
  login(email, password) {
    const savedPassword = getStored(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
    const normalizedEmail = (email || '').trim().toLowerCase();
    
    // Check credentials (or accept default admin)
    if (
      (normalizedEmail === DEFAULT_ADMIN.email || normalizedEmail === 'admin@example.com' || normalizedEmail === 'dev@devanand.com') &&
      password === savedPassword
    ) {
      const user = { ...DEFAULT_ADMIN, email: normalizedEmail };
      setStored(STORAGE_KEYS.AUTH, user);
      return Promise.resolve({ data: { user, message: 'Logged in successfully (Standalone Mode)' } });
    }
    
    return Promise.reject({
      response: { data: { error: 'Invalid credentials. Default password is ' + DEFAULT_PASSWORD } },
    });
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    return Promise.resolve({ data: { message: 'Logged out' } });
  },

  me() {
    const user = getStored(STORAGE_KEYS.AUTH, null);
    if (user) {
      return Promise.resolve({ data: { user } });
    }
    return Promise.reject({ response: { status: 401, data: { error: 'Unauthorized' } } });
  },

  changePassword(currentPassword, newPassword) {
    const savedPassword = getStored(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
    if (currentPassword !== savedPassword) {
      return Promise.reject({ response: { data: { error: 'Current password incorrect' } } });
    }
    if (!newPassword || newPassword.length < 6) {
      return Promise.reject({ response: { data: { error: 'New password must be at least 6 characters' } } });
    }
    setStored(STORAGE_KEYS.PASSWORD, newPassword);
    return Promise.resolve({ data: { message: 'Password updated successfully' } });
  },

  // ── Projects ──────────────────────────
  getProjects(params = {}) {
    let items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    if (params.category && params.category !== 'All') {
      items = items.filter(p => p.category === params.category);
    }
    if (params.published) {
      items = items.filter(p => p.published);
    }
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: { projects: items } });
  },

  getProjectBySlug(slug) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = items.find(p => p.slug === slug);
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    return Promise.resolve({ data: { project: item } });
  },

  getProjectById(id) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = items.find(p => p.id === id);
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    return Promise.resolve({ data: { project: item } });
  },

  createProject(data) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const newProject = {
      ...data,
      id: 'p-' + Date.now(),
      slug: data.slug || (data.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      display_order: items.length,
      created_at: new Date().toISOString(),
    };
    items.push(newProject);
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { project: newProject } });
  },

  updateProject(id, data) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const index = items.findIndex(p => p.id === id);
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { project: items[index] } });
  },

  deleteProject(id) {
    let items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    items = items.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { message: 'Project deleted' } });
  },

  togglePublishProject(id) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = items.find(p => p.id === id);
    if (item) item.published = !item.published;
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { project: item } });
  },

  toggleFeatureProject(id) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = items.find(p => p.id === id);
    if (item) item.featured = !item.featured;
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { project: item } });
  },

  reorderProjects(reorderedItems) {
    let items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const orderMap = new Map(reorderedItems.map(item => [item.id, item.display_order]));
    items.forEach(p => {
      if (orderMap.has(p.id)) p.display_order = orderMap.get(p.id);
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { message: 'Projects reordered' } });
  },

  duplicateProject(id) {
    const items = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = items.find(p => p.id === id);
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    const copy = {
      ...item,
      id: 'p-' + Date.now(),
      title: `${item.title} (Copy)`,
      slug: `${item.slug}-copy-${Date.now().toString().slice(-4)}`,
      published: false,
      display_order: items.length,
      created_at: new Date().toISOString(),
    };
    items.push(copy);
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { project: copy } });
  },

  // ── Showreel ──────────────────────────
  getActiveShowreel() {
    const items = getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    const active = items.find(s => s.is_active) || items[0] || INITIAL_SHOWREEL;
    return Promise.resolve({ data: { showreel: active } });
  },

  getShowreels() {
    const items = getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    return Promise.resolve({ data: { showreels: items } });
  },

  createShowreel(data) {
    const items = getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    const newSr = {
      ...data,
      id: 'sr-' + Date.now(),
      is_active: !!data.is_active,
      created_at: new Date().toISOString(),
    };
    if (newSr.is_active) {
      items.forEach(s => s.is_active = false);
    }
    items.push(newSr);
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { showreel: newSr } });
  },

  updateShowreel(id, data) {
    const items = getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    const index = items.findIndex(s => s.id === id);
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Showreel not found' } } });
    if (data.is_active) {
      items.forEach(s => s.is_active = false);
    }
    items[index] = { ...items[index], ...data };
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { showreel: items[index] } });
  },

  deleteShowreel(id) {
    let items = getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    items = items.filter(s => s.id !== id);
    if (items.length > 0 && !items.some(s => s.is_active)) {
      items[0].is_active = true;
    }
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { message: 'Showreel deleted' } });
  },

  // ── Before / After ────────────────────
  getBeforeAfter() {
    const items = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: { items } });
  },

  createBeforeAfter(data) {
    const items = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const newItem = {
      ...data,
      id: 'ba-' + Date.now(),
      display_order: items.length,
      published: data.published ?? true,
    };
    items.push(newItem);
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { item: newItem } });
  },

  updateBeforeAfter(id, data) {
    const items = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const index = items.findIndex(b => b.id === id);
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Item not found' } } });
    items[index] = { ...items[index], ...data };
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { item: items[index] } });
  },

  deleteBeforeAfter(id) {
    let items = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    items = items.filter(b => b.id !== id);
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { message: 'Item deleted' } });
  },

  reorderBeforeAfter(reorderedItems) {
    let items = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const orderMap = new Map(reorderedItems.map(item => [item.id, item.display_order]));
    items.forEach(b => {
      if (orderMap.has(b.id)) b.display_order = orderMap.get(b.id);
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { message: 'Reordered' } });
  },

  // ── Services ──────────────────────────
  getServices() {
    const items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: { services: items } });
  },

  createService(data) {
    const items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const newItem = {
      ...data,
      id: 's-' + Date.now(),
      display_order: items.length,
      published: data.published ?? true,
    };
    items.push(newItem);
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { service: newItem } });
  },

  updateService(id, data) {
    const items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const index = items.findIndex(s => s.id === id);
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Service not found' } } });
    items[index] = { ...items[index], ...data };
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { service: items[index] } });
  },

  deleteService(id) {
    let items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    items = items.filter(s => s.id !== id);
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { message: 'Service deleted' } });
  },

  reorderServices(reorderedItems) {
    let items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const orderMap = new Map(reorderedItems.map(item => [item.id, item.display_order]));
    items.forEach(s => {
      if (orderMap.has(s.id)) s.display_order = orderMap.get(s.id);
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { message: 'Reordered' } });
  },

  // ── About ─────────────────────────────
  getAbout() {
    const about = getStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    return Promise.resolve({ data: { about } });
  },

  updateAbout(data) {
    const current = getStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    const updated = { ...current, ...data };
    setStored(STORAGE_KEYS.ABOUT, updated);
    return Promise.resolve({ data: { about: updated } });
  },

  // ── Settings ──────────────────────────
  getSettings() {
    const settings = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    return Promise.resolve({ data: { settings } });
  },

  updateSettings(data) {
    const current = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...data };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return Promise.resolve({ data: { settings: updated } });
  },

  // ── Media Library ─────────────────────
  getMedia() {
    const media = getStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    return Promise.resolve({ data: { media } });
  },

  uploadMedia(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const media = getStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
        const newMedia = {
          id: 'm-' + Date.now(),
          filename: file.name,
          url: e.target.result,
          type: file.type,
          size: file.size,
          created_at: new Date().toISOString(),
        };
        media.unshift(newMedia);
        setStored(STORAGE_KEYS.MEDIA, media);
        resolve({ data: { media: newMedia } });
      };
      reader.readAsDataURL(file);
    });
  },

  deleteMedia(id) {
    let media = getStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    media = media.filter(m => m.id !== id);
    setStored(STORAGE_KEYS.MEDIA, media);
    return Promise.resolve({ data: { message: 'Media removed' } });
  },

  // ── Import / Export Utilities ─────────
  exportDatabaseJSON() {
    return JSON.stringify({
      projects: getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
      services: getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
      showreels: getStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]),
      beforeAfter: getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER),
      about: getStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT),
      settings: getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
      media: getStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importDatabaseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.projects) setStored(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.services) setStored(STORAGE_KEYS.SERVICES, data.services);
      if (data.showreels) setStored(STORAGE_KEYS.SHOWREELS, data.showreels);
      if (data.beforeAfter) setStored(STORAGE_KEYS.BEFORE_AFTER, data.beforeAfter);
      if (data.about) setStored(STORAGE_KEYS.ABOUT, data.about);
      if (data.settings) setStored(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.media) setStored(STORAGE_KEYS.MEDIA, data.media);
      return true;
    } catch {
      return false;
    }
  },

  resetToSeed() {
    setStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    setStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    setStored(STORAGE_KEYS.SHOWREELS, [INITIAL_SHOWREEL]);
    setStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    setStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    setStored(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
  }
};
