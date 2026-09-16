import { useState, useEffect } from 'react';
import { beforeAfterAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineUpload,
  HiOutlineX, HiOutlineColorSwatch,
} from 'react-icons/hi';

export default function BeforeAfterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = { title: '', description: '', rawMediaUrl: '', finalMediaUrl: '', thumbnailUrl: '', published: false };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const { data } = await beforeAfterAPI.adminList();
      setItems(data);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  }

  function startEdit(item) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      rawMediaUrl: item.raw_media_url || '',
      finalMediaUrl: item.final_media_url || '',
      thumbnailUrl: item.thumbnail_url || '',
      published: item.published || false,
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
        toast.success('Updated');
      } else {
        await beforeAfterAPI.create(form);
        toast.success('Created');
      }
      setShowForm(false);
      await loadItems();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await beforeAfterAPI.delete(id);
      setDeleteConfirm(null);
      await loadItems();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  }

  async function handleTogglePublish(id) {
    try {
      await beforeAfterAPI.togglePublish(id);
      await loadItems();
    } catch { toast.error('Failed'); }
  }

  async function handleFileUpload(field, file) {
    setUploading((prev) => ({ ...prev, [field]: 0 }));
    try {
      const { data } = await mediaAPI.upload(file, (p) => setUploading((prev) => ({ ...prev, [field]: p })));
      setForm((prev) => ({ ...prev, [field]: data.url }));
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading((prev) => { const n = { ...prev }; delete n[field]; return n; }); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Before / After</h1>
          <p className="text-text-muted text-sm mt-1">{items.length} entr{items.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={startCreate} className="admin-btn-primary"><HiOutlinePlus className="w-4 h-4" /> New Entry</button>
      </div>

      {items.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineColorSwatch className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO COMPARISONS YET.</p>
          <p className="text-text-muted text-sm mt-2">Show the world the difference you make.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="admin-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                <span className={item.published ? 'text-xs text-success' : 'text-xs text-warning'}>{item.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleTogglePublish(item.id)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted" title={item.published ? 'Unpublish' : 'Publish'}>{item.published ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}</button>
                <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm(item.id)} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-card max-w-lg w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{editingItem ? 'Edit Entry' : 'New Entry'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="admin-label">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="admin-input resize-y" /></div>
              {['rawMediaUrl', 'finalMediaUrl', 'thumbnailUrl'].map((field) => (
                <div key={field}>
                  <label className="admin-label">{field === 'rawMediaUrl' ? 'Raw Media' : field === 'finalMediaUrl' ? 'Final Media' : 'Thumbnail'}</label>
                  {form[field] ? (
                    <div className="flex items-center gap-2 admin-card p-2"><span className="text-xs text-text-muted truncate flex-1">{form[field]}</span><button type="button" onClick={() => setForm({ ...form, [field]: '' })} className="p-1 hover:bg-surface-hover rounded"><HiOutlineX className="w-3 h-3" /></button></div>
                  ) : uploading[field] !== undefined ? (
                    <div className="admin-card p-3"><div className="w-full bg-surface rounded-full h-1.5"><div className="bg-accent h-1.5 rounded-full" style={{ width: `${uploading[field]}%` }} /></div></div>
                  ) : (
                    <label className="admin-card p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-accent/30"><HiOutlineUpload className="w-6 h-6 text-text-muted" /><span className="text-xs text-text-muted">Upload file</span><input type="file" className="hidden" onChange={(e) => e.target.files[0] && handleFileUpload(field, e.target.files[0])} /></label>
                  )}
                </div>
              ))}
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-text-secondary">Published</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="admin-btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Entry?</h3>
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
