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

import bakedData from '../data/portfolioData.json';

const INITIAL_PROJECTS = Array.isArray(bakedData.projects) ? bakedData.projects : [];

const INITIAL_SERVICES = Array.isArray(bakedData.services) && bakedData.services.length > 0
  ? bakedData.services
  : [
      { id: 's-1', name: 'Short-form Content', description: 'Reels, TikToks, and Shorts engineered for high viewer retention, pacing, and viral engagement.', display_order: 0, published: true },
      { id: 's-2', name: 'YouTube Editing', description: 'Comprehensive YouTube video editing — hook pacing, storytelling cuts, kinetic graphics, and thumb-stopping visual cues.', display_order: 1, published: true },
      { id: 's-3', name: 'Motion Graphics', description: 'Custom animated titles, kinetic typography, lower thirds, 3D logo resolves, and visual effects.', display_order: 2, published: true },
      { id: 's-4', name: 'Cinematic Editing', description: 'Film-grade narrative rhythm, pacing, and dramatic tension tailored for commercials and short films.', display_order: 3, published: true },
      { id: 's-5', name: 'Brand & Commercial Videos', description: 'High-production promotional campaigns for brands, digital agencies, and product launches.', display_order: 4, published: true },
      { id: 's-6', name: 'Color Grading', description: 'Color correction, film print emulation, color harmony, and custom mood grading in DaVinci Resolve.', display_order: 5, published: true },
      { id: 's-7', name: 'Sound Design & Mixing', description: 'Multi-layer foley, riser/whoosh impacts, music timing, and broadcast-ready audio mastering.', display_order: 6, published: true },
    ];

const INITIAL_SHOWREEL_DEFAULT = {
  id: 'sr-1',
  title: 'The 2024 Reel',
  description: 'A 60-second compilation of high-impact commercial cuts, dynamic kinetic typography, and editorial color science.',
  video_url: '',
  videoUrl: '',
  thumbnail_url: '',
  thumbnailUrl: '',
  is_active: true,
  active: true,
  aspect_ratio: '16:9',
  aspectRatio: '16:9',
  created_at: new Date().toISOString(),
};

const INITIAL_SHOWREELS = Array.isArray(bakedData.showreels) && bakedData.showreels.length > 0
  ? bakedData.showreels
  : (bakedData.showreel ? [bakedData.showreel] : [INITIAL_SHOWREEL_DEFAULT]);

const INITIAL_SHOWREEL = INITIAL_SHOWREELS[0] || INITIAL_SHOWREEL_DEFAULT;

const INITIAL_BEFORE_AFTER = Array.isArray(bakedData.beforeAfter) ? bakedData.beforeAfter : [];
const INITIAL_MEDIA = Array.isArray(bakedData.media) ? bakedData.media : [];

// ── IndexedDB Engine for Large Media (Videos, Audio, High-Res Images) ──
const IDB_NAME = 'DevAnandPortfolioMediaDB';
const IDB_STORE = 'media_assets';

function openIDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGetMediaList() {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSaveMedia(item) {
  const db = await openIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbDeleteMedia(id) {
  const db = await openIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

const INITIAL_ABOUT = (bakedData.about && Object.keys(bakedData.about).length > 0)
  ? bakedData.about
  : {
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

const INITIAL_SETTINGS = (bakedData.settings && Object.keys(bakedData.settings).length > 0)
  ? bakedData.settings
  : {
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

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return parsed;
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

// ── Data Normalizers (Bridges camelCase forms with snake_case display models) ──
function normalizeProject(p) {
  if (!p || typeof p !== 'object') return p;
  const videoUrl = p.video_url || p.videoUrl || '';
  const thumbnailUrl = p.thumbnail_url || p.thumbnailUrl || '';
  const mobileVideoUrl = p.mobile_video_url || p.mobileVideoUrl || '';
  const shortDesc = p.short_description || p.shortDescription || '';
  const clientName = p.client_name || p.clientName || '';
  const clientDesc = p.client_description || p.clientDescription || '';
  const devRole = p.dev_role || p.devRole || '';
  const services = Array.isArray(p.services_provided) ? p.services_provided : (Array.isArray(p.servicesProvided) ? p.servicesProvided : []);
  const tools = Array.isArray(p.tools) ? p.tools : [];
  const projectYear = p.project_year || p.projectYear || new Date().getFullYear();
  const projectType = p.project_type || p.projectType || '';

  return {
    ...p,
    video_url: videoUrl,
    videoUrl: videoUrl,
    thumbnail_url: thumbnailUrl,
    thumbnailUrl: thumbnailUrl,
    mobile_video_url: mobileVideoUrl,
    mobileVideoUrl: mobileVideoUrl,
    short_description: shortDesc,
    shortDescription: shortDesc,
    client_name: clientName,
    clientName: clientName,
    client_description: clientDesc,
    clientDescription: clientDesc,
    dev_role: devRole,
    devRole: devRole,
    services_provided: services,
    servicesProvided: services,
    tools,
    project_year: projectYear,
    projectYear: projectYear,
    project_type: projectType,
    projectType: projectType,
  };
}

function normalizeSettings(s) {
  if (!s || typeof s !== 'object') return s;
  const siteTitle = s.site_title || s.siteTitle || 'Dev Anand — Video Editor & Motion Designer';
  const heroHeading = s.hero_heading || s.heroHeading || 'DEV ANAND';
  const heroSubheading = s.hero_subheading || s.heroSubheading || 'VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER';
  const heroStatement = s.hero_statement || s.heroStatement || 'YOU WATCH. / I EDIT.';
  const avail = s.availability_status || s.availabilityStatus || 'Available for Projects';
  const accent = s.accent_color || s.accentColor || '#E50914';
  const email = s.email || 'admin@devanand.com';
  const footer = s.footer_text || s.footerText || '© Dev Anand. All rights reserved.';
  const metaTitle = s.meta_title || s.metaTitle || 'Dev Anand — Video Editor & Motion Designer';
  const metaDesc = s.meta_description || s.metaDescription || '';
  const ogImg = s.og_image_url || s.ogImageUrl || '';
  const contactHead = s.contact_heading || s.contactHeading || 'Ready to Cut Your Next Masterpiece?';
  const contactSub = s.contact_subheading || s.contactSubheading || '';
  const socialLinks = typeof s.social_links === 'object' && s.social_links !== null ? s.social_links : (typeof s.socialLinks === 'object' && s.socialLinks !== null ? s.socialLinks : {});
  const processSteps = Array.isArray(s.process_steps) ? s.process_steps : (Array.isArray(s.processSteps) ? s.processSteps : []);

  return {
    ...s,
    site_title: siteTitle,
    siteTitle: siteTitle,
    hero_heading: heroHeading,
    heroHeading: heroHeading,
    hero_subheading: heroSubheading,
    heroSubheading: heroSubheading,
    hero_statement: heroStatement,
    heroStatement: heroStatement,
    availability_status: avail,
    availabilityStatus: avail,
    accent_color: accent,
    accentColor: accent,
    email,
    social_links: socialLinks,
    socialLinks,
    footer_text: footer,
    footerText: footer,
    meta_title: metaTitle,
    metaTitle: metaTitle,
    meta_description: metaDesc,
    metaDescription: metaDesc,
    og_image_url: ogImg,
    ogImageUrl: ogImg,
    contact_heading: contactHead,
    contactHeading: contactHead,
    contact_subheading: contactSub,
    contactSubheading: contactSub,
    process_steps: processSteps,
    processSteps,
  };
}

function normalizeAbout(a) {
  if (!a || typeof a !== 'object') return a;
  const name = a.name || 'Dev Anand';
  const role = a.role || 'Video Editor & Motion Graphics Designer';
  const bio = a.bio || '';
  const experience = a.experience || '~1 Year';
  const location = a.location || 'India';
  const avail = a.availability_status || a.availabilityStatus || 'Available for Projects';
  const profileImg = a.profile_image_url || a.profileImageUrl || a.avatar_url || a.avatarUrl || '';
  const deliveries = a.deliveries_stat || a.deliveriesStat || '';
  const resolution = a.resolution_stat || a.resolutionStat || '';
  const tools = Array.isArray(a.tools) ? a.tools : [];
  const social = Array.isArray(a.social_links) ? a.social_links : (Array.isArray(a.socialLinks) ? a.socialLinks : []);

  return {
    ...a,
    name,
    role,
    bio,
    experience,
    location,
    availability_status: avail,
    availabilityStatus: avail,
    profile_image_url: profileImg,
    profileImageUrl: profileImg,
    avatar_url: profileImg,
    avatarUrl: profileImg,
    deliveries_stat: deliveries,
    deliveriesStat: deliveries,
    resolution_stat: resolution,
    resolutionStat: resolution,
    tools,
    social_links: social,
    socialLinks: social,
  };
}

function normalizeShowreel(sr) {
  if (!sr || typeof sr !== 'object') return sr;
  const videoUrl = sr.video_url || sr.videoUrl || '';
  const thumbnailUrl = sr.thumbnail_url || sr.thumbnailUrl || '';
  const isActive = Boolean(sr.is_active ?? sr.active ?? true);
  const title = sr.title || 'The 2024 Reel';
  const desc = sr.description || 'A 60-second compilation of high-impact commercial cuts, dynamic kinetic typography, and editorial color science.';
  const aspect = sr.aspect_ratio || sr.aspectRatio || '16:9';
  return {
    ...sr,
    title,
    description: desc,
    video_url: videoUrl,
    videoUrl: videoUrl,
    thumbnail_url: thumbnailUrl,
    thumbnailUrl: thumbnailUrl,
    is_active: isActive,
    active: isActive,
    aspect_ratio: aspect,
    aspectRatio: aspect,
  };
}

function normalizeBeforeAfter(ba) {
  if (!ba || typeof ba !== 'object') return ba;
  const rawUrl = ba.raw_media_url || ba.rawMediaUrl || '';
  const finalUrl = ba.final_media_url || ba.finalMediaUrl || '';
  const thumbUrl = ba.thumbnail_url || ba.thumbnailUrl || '';
  const isPub = ba.published !== undefined ? Boolean(ba.published) : true;
  return {
    ...ba,
    raw_media_url: rawUrl,
    rawMediaUrl: rawUrl,
    final_media_url: finalUrl,
    finalMediaUrl: finalUrl,
    thumbnail_url: thumbUrl,
    thumbnailUrl: thumbUrl,
    published: isPub,
  };
}

function normalizeService(s) {
  if (!s || typeof s !== 'object') return s;
  return {
    ...s,
    name: s.name || '',
    description: s.description || '',
    published: s.published !== undefined ? Boolean(s.published) : true,
    display_order: s.display_order ?? s.displayOrder ?? 0,
    displayOrder: s.display_order ?? s.displayOrder ?? 0,
  };
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
    let raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    let items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    if (params.category && params.category !== 'All') {
      items = items.filter(p => p.category === params.category);
    }
    if (params.published) {
      items = items.filter(p => p.published);
    }
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: items, projects: items });
  },

  getProjectBySlug(slug) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const item = items.find(p => p.slug === slug);
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    return Promise.resolve({ data: { ...item, project: item } });
  },

  getProjectById(id) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const item = items.find(p => String(p.id) === String(id));
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    return Promise.resolve({ data: { ...item, project: item } });
  },

  createProject(data) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = Array.isArray(raw) ? raw : [];
    const normalized = normalizeProject({
      ...data,
      id: 'p-' + Date.now(),
      slug: data.slug || (data.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      display_order: items.length,
      created_at: new Date().toISOString(),
    });
    items.push(normalized);
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { ...normalized, project: normalized } });
  },

  updateProject(id, data) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = Array.isArray(raw) ? raw : [];
    const index = items.findIndex(p => String(p.id) === String(id));
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    const normalized = normalizeProject({
      ...items[index],
      ...data,
      updated_at: new Date().toISOString(),
    });
    items[index] = normalized;
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { ...normalized, project: normalized } });
  },

  deleteProject(id) {
    let raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    let items = (Array.isArray(raw) ? raw : []).filter(p => String(p.id) !== String(id));
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { message: 'Project deleted' } });
  },

  togglePublishProject(id) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const item = items.find(p => String(p.id) === String(id));
    if (item) {
      item.published = !item.published;
      setStored(STORAGE_KEYS.PROJECTS, items);
      return Promise.resolve({ data: { ...item, project: item } });
    }
    return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
  },

  toggleFeatureProject(id) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const item = items.find(p => String(p.id) === String(id));
    if (item) {
      item.featured = !item.featured;
      setStored(STORAGE_KEYS.PROJECTS, items);
      return Promise.resolve({ data: { ...item, project: item } });
    }
    return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
  },

  reorderProjects(reorderedItems) {
    let raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    let items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const orderMap = new Map(reorderedItems.map(item => [String(item.id), item.display_order]));
    items.forEach(p => {
      if (orderMap.has(String(p.id))) p.display_order = orderMap.get(String(p.id));
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { message: 'Projects reordered' } });
  },

  duplicateProject(id) {
    const raw = getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeProject);
    const item = items.find(p => String(p.id) === String(id));
    if (!item) return Promise.reject({ response: { status: 404, data: { error: 'Project not found' } } });
    const copy = normalizeProject({
      ...item,
      id: 'p-' + Date.now(),
      title: `${item.title} (Copy)`,
      slug: `${item.slug}-copy-${Date.now().toString().slice(-4)}`,
      published: false,
      display_order: items.length,
      created_at: new Date().toISOString(),
    });
    items.push(copy);
    setStored(STORAGE_KEYS.PROJECTS, items);
    return Promise.resolve({ data: { ...copy, project: copy } });
  },

  // ── Showreel ──────────────────────────
  getActiveShowreel() {
    const raw = getStored(STORAGE_KEYS.SHOWREELS, INITIAL_SHOWREELS);
    const items = (Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_SHOWREELS).map(normalizeShowreel);
    const active = items.find(s => s.is_active) || items[0] || INITIAL_SHOWREEL;
    return Promise.resolve({
      data: {
        ...(active || {}),
        showreel: active,
      },
    });
  },

  getShowreels() {
    const raw = getStored(STORAGE_KEYS.SHOWREELS, INITIAL_SHOWREELS);
    const items = (Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_SHOWREELS).map(normalizeShowreel);
    return Promise.resolve({ data: items, showreels: items });
  },

  createShowreel(data) {
    const raw = getStored(STORAGE_KEYS.SHOWREELS, []);
    const items = Array.isArray(raw) ? raw : [];
    const normalized = normalizeShowreel({
      ...data,
      id: 'sr-' + Date.now(),
      created_at: new Date().toISOString(),
    });
    if (normalized.is_active) {
      items.forEach(s => { s.is_active = false; s.active = false; });
    }
    items.push(normalized);
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { ...normalized, showreel: normalized } });
  },

  updateShowreel(id, data) {
    const raw = getStored(STORAGE_KEYS.SHOWREELS, []);
    const items = Array.isArray(raw) ? raw : [];
    const index = items.findIndex(s => String(s.id) === String(id));
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Showreel not found' } } });
    const normalized = normalizeShowreel({
      ...items[index],
      ...data,
    });
    if (normalized.is_active) {
      items.forEach(s => { s.is_active = false; s.active = false; });
    }
    items[index] = normalized;
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { ...normalized, showreel: normalized } });
  },

  deleteShowreel(id) {
    let raw = getStored(STORAGE_KEYS.SHOWREELS, []);
    let items = (Array.isArray(raw) ? raw : []).filter(s => String(s.id) !== String(id));
    if (items.length > 0 && !items.some(s => s.is_active)) {
      items[0].is_active = true;
      items[0].active = true;
    }
    setStored(STORAGE_KEYS.SHOWREELS, items);
    return Promise.resolve({ data: { message: 'Showreel deleted' } });
  },

  // ── Before / After ────────────────────
  getBeforeAfter() {
    const raw = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeBeforeAfter);
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: items, items });
  },

  createBeforeAfter(data) {
    const raw = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const items = Array.isArray(raw) ? raw : [];
    const newItem = normalizeBeforeAfter({
      ...data,
      id: 'ba-' + Date.now(),
      display_order: items.length,
      published: data.published ?? true,
    });
    items.push(newItem);
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { ...newItem, item: newItem } });
  },

  updateBeforeAfter(id, data) {
    const raw = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    const items = Array.isArray(raw) ? raw : [];
    const index = items.findIndex(b => String(b.id) === String(id));
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Item not found' } } });
    const normalized = normalizeBeforeAfter({ ...items[index], ...data });
    items[index] = normalized;
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { ...normalized, item: normalized } });
  },

  deleteBeforeAfter(id) {
    let raw = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    let items = (Array.isArray(raw) ? raw : []).filter(b => String(b.id) !== String(id));
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { message: 'Item deleted' } });
  },

  reorderBeforeAfter(reorderedItems) {
    let raw = getStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    let items = (Array.isArray(raw) ? raw : []).map(normalizeBeforeAfter);
    const orderMap = new Map(reorderedItems.map(item => [String(item.id), item.display_order]));
    items.forEach(b => {
      if (orderMap.has(String(b.id))) b.display_order = orderMap.get(String(b.id));
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.BEFORE_AFTER, items);
    return Promise.resolve({ data: { message: 'Reordered' } });
  },

  // ── Services ──────────────────────────
  getServices() {
    const raw = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeService);
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return Promise.resolve({ data: items, services: items });
  },

  createService(data) {
    const raw = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const items = Array.isArray(raw) ? raw : [];
    const newItem = normalizeService({
      ...data,
      id: 's-' + Date.now(),
      display_order: items.length,
      published: data.published ?? true,
    });
    items.push(newItem);
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { ...newItem, service: newItem } });
  },

  updateService(id, data) {
    const raw = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const items = Array.isArray(raw) ? raw : [];
    const index = items.findIndex(s => String(s.id) === String(id));
    if (index === -1) return Promise.reject({ response: { status: 404, data: { error: 'Service not found' } } });
    const normalized = normalizeService({ ...items[index], ...data });
    items[index] = normalized;
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { ...normalized, service: normalized } });
  },

  deleteService(id) {
    let items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    items = items.filter(s => String(s.id) !== String(id));
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { message: 'Service deleted' } });
  },

  reorderServices(reorderedItems) {
    let items = getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const orderMap = new Map(reorderedItems.map(item => [String(item.id), item.display_order]));
    items.forEach(s => {
      if (orderMap.has(String(s.id))) s.display_order = orderMap.get(String(s.id));
    });
    items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setStored(STORAGE_KEYS.SERVICES, items);
    return Promise.resolve({ data: { message: 'Reordered' } });
  },

  // ── About ─────────────────────────────
  getAbout() {
    const raw = getStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    const normalized = normalizeAbout(raw);
    return Promise.resolve({
      data: {
        ...normalized,
        about: normalized,
      },
    });
  },

  updateAbout(data) {
    const current = getStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    const normalized = normalizeAbout({ ...current, ...data });
    setStored(STORAGE_KEYS.ABOUT, normalized);
    return Promise.resolve({
      data: {
        ...normalized,
        about: normalized,
      },
    });
  },

  // ── Settings ──────────────────────────
  getSettings() {
    const raw = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const normalized = normalizeSettings(raw);
    return Promise.resolve({
      data: {
        ...normalized,
        settings: normalized,
      },
    });
  },

  updateSettings(data) {
    const current = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const normalized = normalizeSettings({ ...current, ...data });
    setStored(STORAGE_KEYS.SETTINGS, normalized);
    return Promise.resolve({
      data: {
        ...normalized,
        settings: normalized,
      },
    });
  },

  // ── Media Library ─────────────────────
  async getMedia(params = {}) {
    let list = [];
    const idbList = await idbGetMediaList();
    if (idbList && idbList.length > 0) {
      list = idbList.map((item) => {
        if (item.blob && (!item.url || item.url.startsWith('blob:'))) {
          try {
            item.url = URL.createObjectURL(item.blob);
          } catch {
            // keep existing url
          }
        }
        return item;
      });
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else {
      list = getStored(STORAGE_KEYS.MEDIA, []);
    }

    if (params?.type) {
      list = list.filter((m) => (m.mime_type || m.type || '').startsWith(params.type));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((m) =>
        (m.original_name || m.filename || '').toLowerCase().includes(q)
      );
    }

    return { data: list, media: list };
  },

  async uploadMedia(file) {
    const id = 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const objectUrl = URL.createObjectURL(file);
    const mimeType = file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream');

    const newMedia = {
      id,
      filename: file.name,
      original_name: file.name,
      mime_type: mimeType,
      type: mimeType,
      size: file.size,
      created_at: new Date().toISOString(),
      url: objectUrl,
      blob: file, // Natively stored in IndexedDB without 5MB quota restrictions
    };

    // Save to IndexedDB (supports videos of all sizes)
    await idbSaveMedia(newMedia);

    // Save lightweight metadata in localStorage (without large binary blob)
    try {
      const stored = getStored(STORAGE_KEYS.MEDIA, []);
      const metaOnly = { ...newMedia };
      delete metaOnly.blob;
      const updated = [metaOnly, ...stored.filter((x) => x.id !== id)].slice(0, 50);
      setStored(STORAGE_KEYS.MEDIA, updated);
    } catch {
      // ignore localStorage quota warnings
    }

    return {
      data: {
        ...newMedia,
        url: objectUrl,
        media: newMedia,
      },
    };
  },

  async addMediaUrl({ url, name, mimeType }) {
    const id = 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const trimmed = (url || '').trim();
    const isVideo = mimeType?.startsWith('video/') ||
      trimmed.includes('youtube') ||
      trimmed.includes('youtu.be') ||
      trimmed.includes('vimeo') ||
      trimmed.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i);

    const detectedMime = mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');

    const newMedia = {
      id,
      filename: name?.trim() || (isVideo ? 'External Video' : 'External Image'),
      original_name: name?.trim() || (isVideo ? 'External Video' : 'External Image'),
      mime_type: detectedMime,
      type: detectedMime,
      size: 0,
      created_at: new Date().toISOString(),
      url: trimmed,
    };

    await idbSaveMedia(newMedia);

    try {
      const stored = getStored(STORAGE_KEYS.MEDIA, []);
      const updated = [newMedia, ...stored.filter((x) => x.id !== id)].slice(0, 50);
      setStored(STORAGE_KEYS.MEDIA, updated);
    } catch {
      // ignore
    }

    return {
      data: {
        ...newMedia,
        url: trimmed,
        media: newMedia,
      },
    };
  },

  async deleteMedia(id) {
    await idbDeleteMedia(id);
    let media = getStored(STORAGE_KEYS.MEDIA, []);
    media = media.filter((m) => m.id !== id);
    setStored(STORAGE_KEYS.MEDIA, media);
    return { data: { message: 'Media removed' } };
  },

  // ── Import / Export Utilities ─────────
  exportDatabaseJSON() {
    return JSON.stringify({
      projects: getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
      services: getStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
      showreels: getStored(STORAGE_KEYS.SHOWREELS, INITIAL_SHOWREELS),
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
    setStored(STORAGE_KEYS.SHOWREELS, []);
    setStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    setStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    setStored(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
  }
};
