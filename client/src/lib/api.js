import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// ── Projects ──────────────────────────────────────────────
export const projectsAPI = {
  // Public
  list: (params) => api.get('/projects', { params }),
  getBySlug: (slug) => api.get(`/projects/${slug}`),

  // Admin
  adminList: (params) => api.get('/projects/admin/all', { params }),
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
  list: () => api.get('/before-after'),
  adminList: () => api.get('/before-after/admin/all'),
  create: (data) => api.post('/before-after', data),
  update: (id, data) => api.put(`/before-after/${id}`, data),
  delete: (id) => api.delete(`/before-after/${id}`),
  togglePublish: (id) => api.patch(`/before-after/${id}/publish`),
  reorder: (items) => api.put('/before-after/admin/reorder', { items }),
};

// ── Showreel ──────────────────────────────────────────────
export const showreelAPI = {
  getActive: () => api.get('/showreel'),
  adminList: () => api.get('/showreel/admin/all'),
  create: (data) => api.post('/showreel', data),
  update: (id, data) => api.put(`/showreel/${id}`, data),
  delete: (id) => api.delete(`/showreel/${id}`),
};

// ── Services ──────────────────────────────────────────────
export const servicesAPI = {
  list: () => api.get('/services'),
  adminList: () => api.get('/services/admin/all'),
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
  list: (params) => api.get('/media', { params }),
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
  delete: (id, force = false) =>
    api.delete(`/media/${id}${force ? '?force=true' : ''}`),
};

export default api;
