import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineSearch,
  HiOutlinePencil, HiOutlineTrash, HiOutlineEye,
  HiOutlineEyeOff, HiOutlineStar, HiOutlineFilm,
  HiOutlineDocumentDuplicate,
} from 'react-icons/hi';

const CATEGORIES = [
  'All', 'Cinematic', 'Motion Graphics', 'Social Media',
  'YouTube', 'Advertisement', 'Client Work', 'Personal Experiment',
];

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('order');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (status !== 'all') params.status = status;
      if (sort === 'newest') params.sort = 'newest';

      const { data } = await projectsAPI.adminList(params);
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sort]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleTogglePublish(id) {
    try {
      await projectsAPI.togglePublish(id);
      await loadProjects();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleToggleFeature(id) {
    try {
      await projectsAPI.toggleFeature(id);
      await loadProjects();
      toast.success('Feature status updated');
    } catch {
      toast.error('Failed to update feature status');
    }
  }

  async function handleDelete(id) {
    try {
      await projectsAPI.delete(id);
      setDeleteConfirm(null);
      await loadProjects();
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  }

  async function handleDuplicate(id) {
    try {
      await projectsAPI.duplicate(id);
      await loadProjects();
      toast.success('Project duplicated');
    } catch {
      toast.error('Failed to duplicate project');
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Projects</h1>
          <p className="text-text-muted text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/projects/new" className="admin-btn-primary">
          <HiOutlinePlus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="admin-input w-auto min-w-[160px]"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-input w-auto min-w-[130px]"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="admin-input w-auto min-w-[130px]"
        >
          <option value="order">Display Order</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Project list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineFilm className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">THE TIMELINE IS EMPTY.</p>
          <p className="text-text-muted text-sm mt-2">No projects match your filters, or you haven't created any yet.</p>
          <Link to="/admin/projects/new" className="admin-btn-primary mt-5 inline-flex">
            <HiOutlinePlus className="w-4 h-4" />
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="admin-card p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt=""
                  className="w-16 h-12 rounded-lg object-cover bg-surface shrink-0"
                />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                  <HiOutlineFilm className="w-6 h-6 text-text-muted" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <HiOutlineStar className="w-4 h-4 text-info shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{project.category}</span>
                  <span>·</span>
                  <span className={project.published ? 'text-success' : 'text-warning'}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleTogglePublish(project.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title={project.published ? 'Unpublish' : 'Publish'}
                >
                  {project.published ? (
                    <HiOutlineEyeOff className="w-4 h-4" />
                  ) : (
                    <HiOutlineEye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleToggleFeature(project.id)}
                  className={`p-2 rounded-lg hover:bg-surface-hover transition-colors ${
                    project.featured ? 'text-info' : 'text-text-muted hover:text-text-primary'
                  }`}
                  title={project.featured ? 'Unfeature' : 'Feature'}
                >
                  <HiOutlineStar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(project.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Duplicate"
                >
                  <HiOutlineDocumentDuplicate className="w-4 h-4" />
                </button>
                <Link
                  to={`/admin/projects/${project.id}/edit`}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(project.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Project?</h3>
            <p className="text-text-secondary text-sm mb-6">
              This action cannot be undone. The project will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="admin-btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
