import { useState, useEffect } from 'react';
import { beforeAfterAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineUpload,
  HiOutlineX, HiOutlineColorSwatch, HiOutlineLink,
  HiOutlineChevronUp, HiOutlineChevronDown,
} from 'react-icons/hi';

export default function BeforeAfterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = {
    title: '',
    description: '',
    rawMediaUrl: '',
    finalMediaUrl: '',
    thumbnailUrl: '',
    published: false,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const { data } = await beforeAfterAPI.adminList();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setItems(list);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      rawMediaUrl: item.raw_media_url || '',
      finalMediaUrl: item.final_media_url || '',
      thumbnailUrl: item.thumbnail_url || '',
      published: Boolean(item.published),
    });
    setEditingItem(item);
    setShowForm(true);
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingItem(null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editingItem) {
        await beforeAfterAPI.update(editingItem.id, form);
        toast.success('Comparison updated');
      } else {
        await beforeAfterAPI.create(form);
        toast.success('Comparison created');
      }
      setShowForm(false);
      await loadItems();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await beforeAfterAPI.delete(id);
      setDeleteConfirm(null);
      await loadItems();
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  }

  async function handleTogglePublish(id) {
    try {
      await beforeAfterAPI.togglePublish(id);
      await loadItems();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleFileUpload(field, file) {
    setUploading((prev) => ({ ...prev, [field]: 0 }));
    try {
      const { data } = await mediaAPI.upload(file, (p) =>
        setUploading((prev) => ({ ...prev, [field]: p }))
      );
      setForm((prev) => ({ ...prev, [field]: data.url }));
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setItems(updated);
    try {
      const payload = updated.map((it, idx) => ({ id: it.id, displayOrder: idx }));
      await beforeAfterAPI.reorder(payload);
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save order');
      await loadItems();
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
          <h1 className="text-2xl font-display font-bold text-text-primary">Color Grading & Before / After</h1>
          <p className="text-text-muted text-sm mt-1">{items.length} color grading comparison{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={startCreate} className="admin-btn-primary">
          <HiOutlinePlus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {items.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineColorSwatch className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO COMPARISONS YET.</p>
          <p className="text-text-muted text-sm mt-2">Demonstrate your colorist expertise with Raw Log vs Finished Look comparisons.</p>
          <button onClick={startCreate} className="admin-btn-primary mt-5 inline-flex">
            <HiOutlinePlus className="w-4 h-4" />
            Add First Comparison
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="admin-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Order buttons */}
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
                  disabled={idx === items.length - 1}
                  className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <HiOutlineChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails preview */}
              <div className="flex items-center gap-1 shrink-0">
                {item.raw_media_url ? (
                  <img src={item.raw_media_url} alt="Raw" className="w-16 h-12 rounded object-cover border border-border" />
                ) : (
                  <div className="w-16 h-12 rounded bg-surface border border-border flex items-center justify-center text-[9px] font-mono text-text-muted">RAW</div>
                )}
                <span className="text-xs text-text-muted">→</span>
                {item.final_media_url ? (
                  <img src={item.final_media_url} alt="Final" className="w-16 h-12 rounded object-cover border border-border" />
                ) : (
                  <div className="w-16 h-12 rounded bg-surface border border-border flex items-center justify-center text-[9px] font-mono text-text-muted">FINAL</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{item.description}</p>
                )}
                <span className={item.published ? 'text-xs text-success font-semibold mt-1 inline-block' : 'text-xs text-warning font-semibold mt-1 inline-block'}>
                  {item.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleTogglePublish(item.id)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary"
                  title={item.published ? 'Unpublish' : 'Publish'}
                >
                  {item.published ? <HiOutlineEyeOff className="w-4 h-4 text-success" /> : <HiOutlineEye className="w-4 h-4 text-warning" />}
                </button>
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-card max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-text-primary">
                {editingItem ? 'Edit Comparison Entry' : 'New Comparison Entry'}
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
                <label className="admin-label">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Neo-Noir Cyberpunk Color Grading"
                  required
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Explain sensor profile used, color space transform, and aesthetic target..."
                  className="admin-input resize-y"
                />
              </div>

              {/* Raw Media */}
              <div>
                <label className="admin-label">Raw Media (Flat / S-Log / V-Log Image or Video)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={form.rawMediaUrl}
                        onChange={(e) => setForm({ ...form, rawMediaUrl: e.target.value })}
                        placeholder="Paste image or video URL (https://...)"
                        className="admin-input pl-10 text-xs"
                      />
                    </div>
                    {form.rawMediaUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, rawMediaUrl: '' })}
                        className="admin-btn-secondary px-3"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="admin-card p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-accent/40">
                    <HiOutlineUpload className="w-4 h-4 text-accent" />
                    <span className="text-xs text-text-secondary">
                      {uploading.rawMediaUrl !== undefined ? `Uploading ${uploading.rawMediaUrl}%...` : 'Or upload raw file'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('rawMediaUrl', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Final Media */}
              <div>
                <label className="admin-label">Final Graded Media (Finished Look)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={form.finalMediaUrl}
                        onChange={(e) => setForm({ ...form, finalMediaUrl: e.target.value })}
                        placeholder="Paste image or video URL (https://...)"
                        className="admin-input pl-10 text-xs"
                      />
                    </div>
                    {form.finalMediaUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, finalMediaUrl: '' })}
                        className="admin-btn-secondary px-3"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="admin-card p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-accent/40">
                    <HiOutlineUpload className="w-4 h-4 text-accent" />
                    <span className="text-xs text-text-secondary">
                      {uploading.finalMediaUrl !== undefined ? `Uploading ${uploading.finalMediaUrl}%...` : 'Or upload graded file'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('finalMediaUrl', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
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
                  {saving ? 'Saving...' : 'Save Comparison'}
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
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Comparison?</h3>
            <p className="text-text-secondary text-sm mb-6">This action cannot be undone.</p>
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
