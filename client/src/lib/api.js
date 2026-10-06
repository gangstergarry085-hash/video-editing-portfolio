import axios from 'axios';
import { localStore } from './localStore';

const customApiUrl = typeof window !== 'undefined' ? localStorage.getItem('dev_cms_custom_api_url') : null;

const api = axios.create({
  baseURL: customApiUrl || (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api')),
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to seamlessly fall back to client localStore if the backend is absent (e.g. on static GitHub Pages)
async function tryWithFallback(networkFn, fallbackFn) {
  try {
    return await networkFn();
  } catch (err) {
    const isOfflineOrStatic =
      !err.response ||
      err.response.status === 404 ||
      err.response.status === 502 ||
      err.response.status === 503 ||
      err.code === 'ERR_NETWORK' ||
      err.message?.includes('Network Error');

    if (isOfflineOrStatic && fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    tryWithFallback(
      () => api.post('/auth/login', { email, password }),
      () => localStore.login(email, password)
    ),
  logout: () =>
    tryWithFallback(
      () => api.post('/auth/logout'),
      () => localStore.logout()
    ),
  me: () =>
    tryWithFallback(
      () => api.get('/auth/me'),
      () => localStore.me()
    ),
  changePassword: (currentPassword, newPassword) =>
    tryWithFallback(
      () => api.put('/auth/password', { currentPassword, newPassword }),
      () => localStore.changePassword(currentPassword, newPassword)
    ),
};

// ── Projects ──────────────────────────────────────────────
export const projectsAPI = {
  // Public
  list: (params) =>
    tryWithFallback(
      () => api.get('/projects', { params }),
      () => localStore.getProjects(params)
    ),
  getBySlug: (slug) =>
    tryWithFallback(
      () => api.get(`/projects/${slug}`),
      () => localStore.getProjectBySlug(slug)
    ),

  // Admin
  adminList: (params) =>
    tryWithFallback(
      () => api.get('/projects/admin/all', { params }),
      () => localStore.getProjects(params)
    ),
  adminStats: () =>
    tryWithFallback(
      () => api.get('/projects/admin/stats'),
      async () => {
        const { data } = await localStore.getProjects();
        const projects = data.projects || [];
        return {
          data: {
            total: projects.length,
            published: projects.filter((p) => p.published).length,
            featured: projects.filter((p) => p.featured).length,
          },
        };
      }
    ),
  getById: (id) =>
    tryWithFallback(
      () => api.get(`/projects/admin/${id}`),
      () => localStore.getProjectById(id)
    ),
  create: (data) =>
    tryWithFallback(
      () => api.post('/projects', data),
      () => localStore.createProject(data)
    ),
  update: (id, data) =>
    tryWithFallback(
      () => api.put(`/projects/${id}`, data),
      () => localStore.updateProject(id, data)
    ),
  delete: (id) =>
    tryWithFallback(
      () => api.delete(`/projects/${id}`),
      () => localStore.deleteProject(id)
    ),
  togglePublish: (id) =>
    tryWithFallback(
      () => api.patch(`/projects/${id}/publish`),
      () => localStore.togglePublishProject(id)
    ),
  toggleFeature: (id) =>
    tryWithFallback(
      () => api.patch(`/projects/${id}/feature`),
      () => localStore.toggleFeatureProject(id)
    ),
  reorder: (items) =>
    tryWithFallback(
      () => api.put('/projects/admin/reorder', { items }),
      () => localStore.reorderProjects(items)
    ),
  duplicate: (id) =>
    tryWithFallback(
      () => api.post(`/projects/${id}/duplicate`),
      () => localStore.duplicateProject(id)
    ),
};

// ── Before/After ──────────────────────────────────────────
export const beforeAfterAPI = {
  list: () =>
    tryWithFallback(
      () => api.get('/before-after'),
      () => localStore.getBeforeAfter()
    ),
  adminList: () =>
    tryWithFallback(
      () => api.get('/before-after/admin/all'),
      () => localStore.getBeforeAfter()
    ),
  create: (data) =>
    tryWithFallback(
      () => api.post('/before-after', data),
      () => localStore.createBeforeAfter(data)
    ),
  update: (id, data) =>
    tryWithFallback(
      () => api.put(`/before-after/${id}`, data),
      () => localStore.updateBeforeAfter(id, data)
    ),
  delete: (id) =>
    tryWithFallback(
      () => api.delete(`/before-after/${id}`),
      () => localStore.deleteBeforeAfter(id)
    ),
  togglePublish: (id) =>
    tryWithFallback(
      () => api.patch(`/before-after/${id}/publish`),
      async () => {
        const { data } = await localStore.getBeforeAfter();
        const item = (data.items || []).find((b) => b.id === id);
        if (item) {
          return localStore.updateBeforeAfter(id, { published: !item.published });
        }
      }
    ),
  reorder: (items) =>
    tryWithFallback(
      () => api.put('/before-after/admin/reorder', { items }),
      () => localStore.reorderBeforeAfter(items)
    ),
};

// ── Showreel ──────────────────────────────────────────────
export const showreelAPI = {
  getActive: () =>
    tryWithFallback(
      () => api.get('/showreel'),
      () => localStore.getActiveShowreel()
    ),
  adminList: () =>
    tryWithFallback(
      () => api.get('/showreel/admin/all'),
      () => localStore.getShowreels()
    ),
  create: (data) =>
    tryWithFallback(
      () => api.post('/showreel', data),
      () => localStore.createShowreel(data)
    ),
  update: (id, data) =>
    tryWithFallback(
      () => api.put(`/showreel/${id}`, data),
      () => localStore.updateShowreel(id, data)
    ),
  delete: (id) =>
    tryWithFallback(
      () => api.delete(`/showreel/${id}`),
      () => localStore.deleteShowreel(id)
    ),
};

// ── Services ──────────────────────────────────────────────
export const servicesAPI = {
  list: () =>
    tryWithFallback(
      () => api.get('/services'),
      () => localStore.getServices()
    ),
  adminList: () =>
    tryWithFallback(
      () => api.get('/services/admin/all'),
      () => localStore.getServices()
    ),
  create: (data) =>
    tryWithFallback(
      () => api.post('/services', data),
      () => localStore.createService(data)
    ),
  update: (id, data) =>
    tryWithFallback(
      () => api.put(`/services/${id}`, data),
      () => localStore.updateService(id, data)
    ),
  delete: (id) =>
    tryWithFallback(
      () => api.delete(`/services/${id}`),
      () => localStore.deleteService(id)
    ),
  togglePublish: (id) =>
    tryWithFallback(
      () => api.patch(`/services/${id}/publish`),
      async () => {
        const { data } = await localStore.getServices();
        const item = (data.services || []).find((s) => s.id === id);
        if (item) {
          return localStore.updateService(id, { published: !item.published });
        }
      }
    ),
  reorder: (items) =>
    tryWithFallback(
      () => api.put('/services/admin/reorder', { items }),
      () => localStore.reorderServices(items)
    ),
};

// ── About ─────────────────────────────────────────────────
export const aboutAPI = {
  get: () =>
    tryWithFallback(
      () => api.get('/about'),
      () => localStore.getAbout()
    ),
  update: (data) =>
    tryWithFallback(
      () => api.put('/about', data),
      () => localStore.updateAbout(data)
    ),
};

// ── Settings ──────────────────────────────────────────────
export const settingsAPI = {
  get: () =>
    tryWithFallback(
      () => api.get('/settings'),
      () => localStore.getSettings()
    ),
  update: (data) =>
    tryWithFallback(
      () => api.put('/settings', data),
      () => localStore.updateSettings(data)
    ),
};

// ── Media ─────────────────────────────────────────────────
export const mediaAPI = {
  list: (params) =>
    tryWithFallback(
      () => api.get('/media', { params }),
      () => localStore.getMedia()
    ),
  upload: (file, onProgress) =>
    tryWithFallback(
      () => {
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
      () => localStore.uploadMedia(file)
    ),
  delete: (id, force = false) =>
    tryWithFallback(
      () => api.delete(`/media/${id}${force ? '?force=true' : ''}`),
      () => localStore.deleteMedia(id)
    ),
};

export default api;
