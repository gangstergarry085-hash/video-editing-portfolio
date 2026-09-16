import { useState, useEffect, useCallback } from 'react';
import { mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineTrash, HiOutlineSearch, HiOutlinePhotograph, HiOutlineFilm } from 'react-icons/hi';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);

  const loadMedia = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await mediaAPI.list(params);
      setMedia(data);
    } catch { toast.error('Failed to load media'); }
    finally { setLoading(false); }
  }, [search, typeFilter]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await mediaAPI.upload(file, setUploadProgress);
      toast.success('File uploaded');
      await loadMedia();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); setUploadProgress(0); e.target.value = ''; }
  }

  async function handleDelete(id, force = false) {
    try {
      await mediaAPI.delete(id, force);
      setDeleteConfirm(null);
      setDeleteWarning(null);
      await loadMedia();
      toast.success('Media deleted');
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteConfirm(null);
        setDeleteWarning({ id, usages: err.response.data.usages });
      } else {
        toast.error('Delete failed');
      }
    }
  }

  function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function isImage(mime) { return mime?.startsWith('image/'); }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold text-text-primary">Media Library</h1><p className="text-text-muted text-sm mt-1">{media.length} file{media.length !== 1 ? 's' : ''}</p></div>
        <label className="admin-btn-primary cursor-pointer">
          <HiOutlineUpload className="w-4 h-4" />
          {uploading ? `${uploadProgress}%` : 'Upload File'}
          <input type="file" className="hidden" accept="video/*,image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="w-full bg-surface-card rounded-full h-2"><div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-input w-auto">
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : media.length === 0 ? (
        <div className="admin-card text-center py-16"><HiOutlinePhotograph className="w-16 h-16 text-text-muted mx-auto mb-4" /><p className="text-lg text-text-secondary font-display font-semibold">NO MEDIA UPLOADED.</p><p className="text-text-muted text-sm mt-2">Upload your first file to get started.</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((file) => (
            <div key={file.id} className="admin-card p-0 overflow-hidden group">
              <div className="aspect-video bg-surface flex items-center justify-center relative">
                {isImage(file.mime_type) ? (
                  <img src={file.url} alt={file.original_name} className="w-full h-full object-cover" />
                ) : (
                  <HiOutlineFilm className="w-10 h-10 text-text-muted" />
                )}
                <button
                  onClick={() => setDeleteConfirm(file.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/80"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-xs text-text-primary truncate">{file.original_name || file.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-text-muted">{formatSize(file.size)}</span>
                  <span className="text-[10px] text-text-muted">{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="admin-card max-w-sm w-full p-6"><h3 className="text-lg font-semibold text-text-primary mb-2">Delete File?</h3><p className="text-text-secondary text-sm mb-6">This cannot be undone.</p><div className="flex gap-3 justify-end"><button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="admin-btn-danger">Delete</button></div></div></div>
      )}

      {/* In-use warning */}
      {deleteWarning && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-warning mb-2">⚠ Media In Use</h3>
            <p className="text-text-secondary text-sm mb-3">This file is referenced by:</p>
            <ul className="text-sm text-text-muted mb-6 space-y-1">
              {deleteWarning.usages.map((u, i) => (
                <li key={i}>• {u.type}: {u.items.map((it) => it.title || `ID ${it.id}`).join(', ')}</li>
              ))}
            </ul>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteWarning(null)} className="admin-btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteWarning.id, true)} className="admin-btn-danger">Delete Anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
