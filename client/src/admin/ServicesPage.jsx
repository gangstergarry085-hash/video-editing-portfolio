import { useState, useEffect } from 'react';
import { servicesAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineCollection } from 'react-icons/hi';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', published: true });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try { const { data } = await servicesAPI.adminList(); setServices(data); }
    catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  }

  function startCreate() { setForm({ name: '', description: '', published: true }); setEditingItem(null); setShowForm(true); }
  function startEdit(item) { setForm({ name: item.name, description: item.description || '', published: item.published }); setEditingItem(item); setShowForm(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editingItem) { await servicesAPI.update(editingItem.id, form); toast.success('Updated'); }
      else { await servicesAPI.create(form); toast.success('Created'); }
      setShowForm(false); await loadServices();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await servicesAPI.delete(id); setDeleteConfirm(null); await loadServices(); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  }

  async function handleTogglePublish(id) {
    try { await servicesAPI.togglePublish(id); await loadServices(); }
    catch { toast.error('Failed'); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-text-primary">Services</h1><p className="text-text-muted text-sm mt-1">{services.length} service{services.length !== 1 ? 's' : ''}</p></div>
        <button onClick={startCreate} className="admin-btn-primary"><HiOutlinePlus className="w-4 h-4" /> New Service</button>
      </div>

      {services.length === 0 ? (
        <div className="admin-card text-center py-16"><HiOutlineCollection className="w-16 h-16 text-text-muted mx-auto mb-4" /><p className="text-lg text-text-secondary font-display font-semibold">NO SERVICES LISTED.</p></div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="admin-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{svc.name}</h3>
                {svc.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{svc.description}</p>}
              </div>
              <span className={svc.published ? 'text-xs text-success' : 'text-xs text-warning'}>{svc.published ? 'Published' : 'Draft'}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleTogglePublish(svc.id)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted">{svc.published ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}</button>
                <button onClick={() => startEdit(svc)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"><HiOutlinePencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm(svc.id)} className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{editingItem ? 'Edit Service' : 'New Service'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="admin-label">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" /></div>
              <div><label className="admin-label">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="admin-input resize-y" /></div>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="admin-card max-w-sm w-full p-6"><h3 className="text-lg font-semibold text-text-primary mb-2">Delete Service?</h3><p className="text-text-secondary text-sm mb-6">This cannot be undone.</p><div className="flex gap-3 justify-end"><button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="admin-btn-danger">Delete</button></div></div></div>
      )}
    </div>
  );
}
