import axios from 'axios';

const TOKEN_KEY = 'dev_cms_token';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-clear token on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// ── Token helpers ─────────────────────────────────────────
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => {
    clearToken();
    return api.post('/auth/logout');
  },
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// ── Projects ──────────────────────────────────────────────
export const projectsAPI = {
  // Public
  list: async (params) => {
    const res = await api.get('/projects', { params });
    const list = Array.isArray(res.data) ? res.data : (res.data?.projects || []);
    return { ...res, data: list };
  },
  getBySlug: (slug) => api.get(`/projects/${slug}`),

  // Admin
  adminList: async (params) => {
    const res = await api.get('/projects/admin/all', { params });
    const list = Array.isArray(res.data) ? res.data : (res.data?.projects || []);
    return { ...res, data: list };
  },
  adminStats: () => api.get('/projects/admin/stats'),
  getById: (id) => api.get(`/projects/admin/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  togglePublish: (id) => api.patch(`/projects/${id}/publish`),
  toggleFeature: (id) => api.patch(`/projects/${id}/feature`),
  reorder: (items) => api.put('/projects/admin/reorder', { items }),
  duplicate: (id) => api.post(`/projects/${id}/duplicate`),
};

// ── Before/After ──────────────────────────────────────────
export const beforeAfterAPI = {
  list: async () => {
    const res = await api.get('/before-after');
    const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    return { ...res, data: list };
  },
  adminList: async () => {
    const res = await api.get('/before-after/admin/all');
    const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    return { ...res, data: list };
  },
  create: (data) => api.post('/before-after', data),
  update: (id, data) => api.put(`/before-after/${id}`, data),
  delete: (id) => api.delete(`/before-after/${id}`),
  togglePublish: (id) => api.patch(`/before-after/${id}/publish`),
  reorder: (items) => api.put('/before-after/admin/reorder', { items }),
};

// ── Showreel ──────────────────────────────────────────────
export const showreelAPI = {
  getActive: () => api.get('/showreel'),
  adminList: async () => {
    const res = await api.get('/showreel/admin/all');
    const list = Array.isArray(res.data) ? res.data : (res.data?.showreels || []);
    return { ...res, data: list };
  },
  create: (data) => api.post('/showreel', data),
  update: (id, data) => api.put(`/showreel/${id}`, data),
  delete: (id) => api.delete(`/showreel/${id}`),
};

// ── Services ──────────────────────────────────────────────
export const servicesAPI = {
  list: async () => {
    const res = await api.get('/services');
    const list = Array.isArray(res.data) ? res.data : (res.data?.services || []);
    return { ...res, data: list };
  },
  adminList: async () => {
    const res = await api.get('/services/admin/all');
    const list = Array.isArray(res.data) ? res.data : (res.data?.services || []);
    return { ...res, data: list };
  },
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  togglePublish: (id) => api.patch(`/services/${id}/publish`),
  reorder: (items) => api.put('/services/admin/reorder', { items }),
};

// ── About ─────────────────────────────────────────────────
export const aboutAPI = {
  get: () => api.get('/about'),
  update: (data) => api.put('/about', data),
};

// ── Settings ──────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// ── Media ─────────────────────────────────────────────────
export const mediaAPI = {
  list: async (params) => {
    const res = await api.get('/media', { params });
    const list = Array.isArray(res.data) ? res.data : (res.data?.media || []);
    return { ...res, data: list };
  },
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    });
  },
  addUrl: (data) => api.post('/media/url', data),
  delete: (id, force = false) =>
    api.delete(`/media/${id}${force ? '?force=true' : ''}`),
};

export function resolveMediaUrl(url, type = 'image') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // 1. Convert GitHub repo URLs (blob or raw) to fast jsDelivr CDN
  // e.g. https://github.com/user/repo/blob/main/media/thumb.jpg -> https://cdn.jsdelivr.net/gh/user/repo@main/media/thumb.jpg
  const ghBlobMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/i
  );
  if (ghBlobMatch) {
    const [, owner, repo, branch, path] = ghBlobMatch;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
  }

  // 2. Convert raw.githubusercontent.com URLs to jsDelivr CDN
  // e.g. https://raw.githubusercontent.com/user/repo/main/media/thumb.jpg -> https://cdn.jsdelivr.net/gh/user/repo@main/media/thumb.jpg
  const ghRawMatch = trimmed.match(
    /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i
  );
  if (ghRawMatch) {
    const [, owner, repo, branch, path] = ghRawMatch;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
  }

  // 3. Convert Google Drive URLs
  const gDriveMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i
  );
  if (gDriveMatch && gDriveMatch[1]) {
    return type === 'image'
      ? `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`
      : `https://drive.google.com/file/d/${gDriveMatch[1]}/preview`;
  }

  return trimmed;
}

export default api;
