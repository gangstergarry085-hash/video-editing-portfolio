import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineSearch,
  HiOutlinePencil, HiOutlineTrash, HiOutlineEye,
  HiOutlineEyeOff, HiOutlineStar, HiOutlineFilm,
  HiOutlineDocumentDuplicate, HiOutlineChevronUp, HiOutlineChevronDown,
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

  async function handleMove(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setProjects(updated);
    try {
      const items = updated.map((p, idx) => ({ id: p.id, displayOrder: idx }));
      await projectsAPI.reorder(items);
      toast.success('Project order updated');
    } catch {
      toast.error('Failed to save order');
      await loadProjects();
    }
  }

  function clearFilters() {
    setSearch('');
    setCategory('All');
    setStatus('all');
    setSort('order');
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Projects & Showcase</h1>
          <p className="text-text-muted text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} on your timeline</p>
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
          className="admin-input w-auto min-w-[160px] cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-input w-auto min-w-[130px] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="admin-input w-auto min-w-[140px] cursor-pointer"
        >
          <option value="order">Custom Order</option>
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
          <p className="text-text-muted text-sm mt-2">No projects match your current filters.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={clearFilters} className="admin-btn-secondary">
              Clear Filters
            </button>
            <Link to="/admin/projects/new" className="admin-btn-primary">
              <HiOutlinePlus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="admin-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors"
            >
              {/* Order Controls (shown when in Custom Order mode) */}
              {sort === 'order' && (
                <div className="flex sm:flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <HiOutlineChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === projects.length - 1}
                    className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <HiOutlineChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail */}
              {project.thumbnail_url ? (
                <img
                  src={project.thumbnail_url}
                  alt=""
                  className="w-20 h-14 rounded-lg object-cover bg-surface shrink-0 border border-border"
                />
              ) : (
                <div className="w-20 h-14 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border">
                  <HiOutlineFilm className="w-6 h-6 text-text-muted" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-text-primary truncate">
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span className="badge-featured text-[10px] py-0.5">Featured</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="text-text-secondary font-medium">{project.category}</span>
                  <span>·</span>
                  <span className={project.published ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                  <span>·</span>
                  <span>{project.project_year || new Date(project.created_at).getFullYear()}</span>
                  {project.client_name && (
                    <>
                      <span>·</span>
                      <span className="text-accent">{project.client_name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(project.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title={project.published ? 'Unpublish' : 'Publish'}
                >
                  {project.published ? (
                    <HiOutlineEyeOff className="w-4 h-4 text-success" />
                  ) : (
                    <HiOutlineEye className="w-4 h-4 text-warning" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFeature(project.id)}
                  className={`p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer ${
                    project.featured ? 'text-info' : 'text-text-muted hover:text-text-primary'
                  }`}
                  title={project.featured ? 'Remove from Featured' : 'Mark as Featured'}
                >
                  <HiOutlineStar className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(project.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Duplicate project"
                >
                  <HiOutlineDocumentDuplicate className="w-4 h-4" />
                </button>
                <Link
                  to={`/admin/projects/${project.id}/edit`}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Edit details"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(project.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
                  title="Delete project"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Project?</h3>
            <p className="text-text-secondary text-sm mb-6">
              This action cannot be undone. The project and its metadata will be permanently removed.
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
