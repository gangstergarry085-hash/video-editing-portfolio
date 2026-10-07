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

const INITIAL_PROJECTS = [];

const INITIAL_SERVICES = [
  { id: 's-1', name: 'Short-form Content', description: 'Reels, TikToks, and Shorts engineered for high viewer retention, pacing, and viral engagement.', display_order: 0, published: true },
  { id: 's-2', name: 'YouTube Editing', description: 'Comprehensive YouTube video editing — hook pacing, storytelling cuts, kinetic graphics, and thumb-stopping visual cues.', display_order: 1, published: true },
  { id: 's-3', name: 'Motion Graphics', description: 'Custom animated titles, kinetic typography, lower thirds, 3D logo resolves, and visual effects.', display_order: 2, published: true },
  { id: 's-4', name: 'Cinematic Editing', description: 'Film-grade narrative rhythm, pacing, and dramatic tension tailored for commercials and short films.', display_order: 3, published: true },
  { id: 's-5', name: 'Brand & Commercial Videos', description: 'High-production promotional campaigns for brands, digital agencies, and product launches.', display_order: 4, published: true },
  { id: 's-6', name: 'Color Grading', description: 'Color correction, film print emulation, color harmony, and custom mood grading in DaVinci Resolve.', display_order: 5, published: true },
  { id: 's-7', name: 'Sound Design & Mixing', description: 'Multi-layer foley, riser/whoosh impacts, music timing, and broadcast-ready audio mastering.', display_order: 6, published: true },
];

const INITIAL_SHOWREEL = null;

const INITIAL_BEFORE_AFTER = [];
const INITIAL_MEDIA = [];

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
    const items = getStored(STORAGE_KEYS.SHOWREELS, []);
    const active = items.find(s => s.is_active) || items[0] || null;
    return Promise.resolve({ data: { showreel: active } });
  },

  getShowreels() {
    const items = getStored(STORAGE_KEYS.SHOWREELS, []);
    return Promise.resolve({ data: { showreels: items } });
  },

  createShowreel(data) {
    const items = getStored(STORAGE_KEYS.SHOWREELS, []);
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
    const items = getStored(STORAGE_KEYS.SHOWREELS, []);
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
    let items = getStored(STORAGE_KEYS.SHOWREELS, []);
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
    setStored(STORAGE_KEYS.SHOWREELS, []);
    setStored(STORAGE_KEYS.BEFORE_AFTER, INITIAL_BEFORE_AFTER);
    setStored(STORAGE_KEYS.ABOUT, INITIAL_ABOUT);
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setStored(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    setStored(STORAGE_KEYS.PASSWORD, DEFAULT_PASSWORD);
  }
};
