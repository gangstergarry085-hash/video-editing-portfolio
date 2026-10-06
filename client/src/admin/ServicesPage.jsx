import { useState, useEffect } from 'react';
import { servicesAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineCollection,
  HiOutlineX, HiOutlineChevronUp, HiOutlineChevronDown,
} from 'react-icons/hi';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', published: true });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const { data } = await servicesAPI.adminList();
      const list = Array.isArray(data) ? data : (data?.services || []);
      setServices(list);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setForm({ name: '', description: '', published: true });
    setEditingItem(null);
    setShowForm(true);
  }

  function startEdit(item) {
    setForm({
      name: item.name,
      description: item.description || '',
      published: Boolean(item.published),
    });
    setEditingItem(item);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editingItem) {
        await servicesAPI.update(editingItem.id, form);
        toast.success('Service updated');
      } else {
        await servicesAPI.create(form);
        toast.success('Service created');
      }
      setShowForm(false);
      await loadServices();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await servicesAPI.delete(id);
      setDeleteConfirm(null);
      await loadServices();
      toast.success('Service deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handleTogglePublish(id) {
    try {
      await servicesAPI.togglePublish(id);
      await loadServices();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const updated = [...services];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setServices(updated);
    try {
      const payload = updated.map((s, idx) => ({ id: s.id, displayOrder: idx }));
      await servicesAPI.reorder(payload);
      toast.success('Service order saved');
    } catch {
      toast.error('Failed to save order');
      await loadServices();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Services & Offerings</h1>
          <p className="text-text-muted text-sm mt-1">{services.length} creative service{services.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={startCreate} className="admin-btn-primary">
          <HiOutlinePlus className="w-4 h-4" />
          New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineCollection className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO SERVICES LISTED.</p>
          <p className="text-text-muted text-sm mt-2">Add your editing offerings such as Commercial Editing, Color Grading, or Motion Graphics.</p>
          <button onClick={startCreate} className="admin-btn-primary mt-5 inline-flex">
            <HiOutlinePlus className="w-4 h-4" />
            Add First Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc, idx) => (
            <div key={svc.id} className="admin-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Order Controls */}
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
                  disabled={idx === services.length - 1}
                  className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <HiOutlineChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary">{svc.name}</h3>
                {svc.description && (
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{svc.description}</p>
                )}
                <span className={svc.published ? 'text-xs text-success font-semibold mt-1 inline-block' : 'text-xs text-warning font-semibold mt-1 inline-block'}>
                  {svc.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleTogglePublish(svc.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary"
                  title={svc.published ? 'Unpublish' : 'Publish'}
                >
                  {svc.published ? <HiOutlineEyeOff className="w-4 h-4 text-success" /> : <HiOutlineEye className="w-4 h-4 text-warning" />}
                </button>
                <button
                  onClick={() => startEdit(svc)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(svc.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-text-primary">
                {editingItem ? 'Edit Service' : 'New Service'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Service Title *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cinematic Commercial Editing"
                  required
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Explain deliverables, workflow, turnarounds..."
                  className="admin-input resize-y"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 rounded text-accent focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">Published to portfolio</span>
              </label>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="admin-btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Service?</h3>
            <p className="text-text-secondary text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="admin-btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
