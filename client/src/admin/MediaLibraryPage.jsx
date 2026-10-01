import { useState, useEffect, useCallback } from 'react';
import { mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import {
  HiOutlineUpload, HiOutlineTrash, HiOutlineSearch,
  HiOutlinePhotograph, HiOutlineFilm, HiOutlineClipboardCopy,
  HiOutlineExternalLink, HiOutlineX,
} from 'react-icons/hi';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const loadMedia = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const { data } = await mediaAPI.list(params);
      setMedia(data);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await mediaAPI.upload(file, setUploadProgress);
      toast.success('File uploaded successfully');
      await loadMedia();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
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

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  }

  function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function isImage(mime) {
    return mime?.startsWith('image/');
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Media Library</h1>
          <p className="text-text-muted text-sm mt-1">{media.length} asset{media.length !== 1 ? 's' : ''} stored</p>
        </div>
        <label className="admin-btn-primary cursor-pointer">
          <HiOutlineUpload className="w-4 h-4" />
          {uploading ? `Uploading ${uploadProgress}%` : 'Upload New File'}
          <input
            type="file"
            className="hidden"
            accept="video/*,image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="w-full bg-surface-card rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="admin-input w-auto cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlinePhotograph className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO MEDIA ASSETS FOUND.</p>
          <p className="text-text-muted text-sm mt-2">Upload images and videos to reference them across your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((file) => (
            <div key={file.id} className="admin-card p-0 overflow-hidden group flex flex-col justify-between">
              <div
                className="aspect-video bg-surface flex items-center justify-center relative cursor-pointer overflow-hidden"
                onClick={() => setPreviewMedia(file)}
              >
                {isImage(file.mime_type) ? (
                  <img
                    src={file.url}
                    alt={file.original_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-text-muted group-hover:text-accent transition-colors">
                    <HiOutlineFilm className="w-10 h-10" />
                    <span className="text-[9px] font-mono uppercase">Preview Video</span>
                  </div>
                )}

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(file.url);
                    }}
                    className="p-2 rounded-lg bg-surface-card text-text-primary hover:text-accent hover:border-accent border border-border shadow-lg"
                    title="Copy URL"
                  >
                    <HiOutlineClipboardCopy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(file.id);
                    }}
                    className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger hover:text-white border border-danger/30 shadow-lg"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-surface-card">
                <p className="text-xs font-medium text-text-primary truncate" title={file.original_name || file.filename}>
                  {file.original_name || file.filename}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted font-mono">
                  <span>{formatSize(file.size)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-3xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="truncate max-w-md">
                <h3 className="text-sm font-semibold text-text-primary truncate">{previewMedia.original_name}</h3>
                <p className="text-[11px] font-mono text-text-muted mt-0.5 truncate">{previewMedia.url}</p>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border">
              {isImage(previewMedia.mime_type) ? (
                <img src={previewMedia.url} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <VideoPlayer url={previewMedia.url} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-text-muted">
                {previewMedia.mime_type} · {formatSize(previewMedia.size)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyUrl(previewMedia.url)}
                  className="admin-btn-secondary text-xs"
                >
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                  Copy Asset URL
                </button>
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn-secondary text-xs"
                >
                  <HiOutlineExternalLink className="w-3.5 h-3.5" />
                  Open in Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete File?</h3>
            <p className="text-text-secondary text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="admin-btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* In-use warning */}
      {deleteWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-warning mb-2">⚠ Media Currently In Use</h3>
            <p className="text-text-secondary text-sm mb-3">This file is referenced by active content:</p>
            <ul className="text-sm text-text-muted mb-6 space-y-1 font-mono text-xs">
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
