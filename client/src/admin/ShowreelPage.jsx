import { useState, useEffect } from 'react';
import { showreelAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import {
  HiOutlineUpload, HiOutlineX, HiOutlineFilm,
  HiOutlinePlus, HiOutlineTrash, HiOutlineCheckCircle,
  HiOutlineLink,
} from 'react-icons/hi';

export default function ShowreelPage() {
  const [showreels, setShowreels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newReel, setNewReel] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    active: false,
  });

  useEffect(() => {
    loadShowreels();
  }, []);

  async function loadShowreels() {
    try {
      const { data } = await showreelAPI.adminList();
      const list = Array.isArray(data) ? data : (data?.showreels || []);
      setShowreels(list);
    } catch {
      toast.error('Failed to load showreels');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(id, field, value) {
    setShowreels((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  async function handleFileUpload(id, field, file) {
    const key = `${id}-${field}`;
    setUploading((prev) => ({ ...prev, [key]: 0 }));
    try {
      const { data } = await mediaAPI.upload(file, (p) =>
        setUploading((prev) => ({ ...prev, [key]: p }))
      );
      if (id === 'new') {
        setNewReel((prev) => ({ ...prev, [field]: data.url }));
      } else {
        handleChange(id, field === 'videoUrl' ? 'video_url' : 'thumbnail_url', data.url);
      }
      if (data?.url?.startsWith('blob:')) {
        toast('Local preview loaded. For public visitors to watch online, paste a YouTube, Vimeo, or CDN link.', {
          icon: 'ℹ️',
          duration: 6000,
        });
      } else {
        toast.success('Uploaded successfully');
      }
    } catch {
      toast.error('Upload failed. Paste a YouTube or Vimeo link directly.');
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSave(showreel) {
    setSaving(true);
    try {
      await showreelAPI.update(showreel.id, {
        ...showreel,
        videoUrl: showreel.video_url || showreel.videoUrl || '',
        video_url: showreel.video_url || showreel.videoUrl || '',
        thumbnailUrl: showreel.thumbnail_url || showreel.thumbnailUrl || '',
        thumbnail_url: showreel.thumbnail_url || showreel.thumbnailUrl || '',
        title: showreel.title || 'The 2024 Reel',
        description: showreel.description || '',
        aspect_ratio: showreel.aspect_ratio || showreel.aspectRatio || '16:9',
        aspectRatio: showreel.aspect_ratio || showreel.aspectRatio || '16:9',
        active: Boolean(showreel.active ?? showreel.is_active),
        is_active: Boolean(showreel.active ?? showreel.is_active),
      });
      toast.success('Showreel saved');
      await loadShowreels();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newReel.title.trim()) {
      return toast.error('Title is required');
    }
    setSaving(true);
    try {
      await showreelAPI.create({
        ...newReel,
        video_url: newReel.videoUrl,
        videoUrl: newReel.videoUrl,
        thumbnail_url: newReel.thumbnailUrl,
        thumbnailUrl: newReel.thumbnailUrl,
        aspect_ratio: newReel.aspect_ratio || '16:9',
        aspectRatio: newReel.aspect_ratio || '16:9',
        is_active: Boolean(newReel.active),
        active: Boolean(newReel.active),
      });
      toast.success('Showreel created');
      setShowNewModal(false);
      setNewReel({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        aspect_ratio: '16:9',
        active: showreels.length === 0,
      });
      await loadShowreels();
    } catch {
      toast.error('Failed to create showreel');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await showreelAPI.delete(id);
      setDeleteConfirm(null);
      toast.success('Showreel deleted');
      await loadShowreels();
    } catch {
      toast.error('Delete failed');
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
          <h1 className="text-2xl font-display font-bold text-text-primary">Showreels</h1>
          <p className="text-text-muted text-sm mt-1">Manage your showreel video editions showcased on the homepage.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="admin-btn-primary"
        >
          <HiOutlinePlus className="w-4 h-4" />
          New Showreel
        </button>
      </div>

      {showreels.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineFilm className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO SHOWREELS FOUND.</p>
          <p className="text-text-muted text-sm mt-2">Add your first showreel compilation to display on your portfolio.</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="admin-btn-primary mt-6 inline-flex"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add First Showreel
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {showreels.map((showreel) => (
            <div key={showreel.id} className="admin-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                    showreel.active
                      ? 'bg-success/15 border-success/30 text-success font-semibold flex items-center gap-1.5'
                      : 'bg-surface border-border text-text-muted'
                  }`}>
                    {showreel.active && <HiOutlineCheckCircle className="w-3.5 h-3.5" />}
                    {showreel.active ? 'ACTIVE MASTER REEL' : 'STANDBY'}
                  </span>
                  <span className="text-xs text-text-muted font-mono">ID #{showreel.id}</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                    <input
                      type="checkbox"
                      checked={Boolean(showreel.active)}
                      onChange={(e) => handleChange(showreel.id, 'active', e.target.checked)}
                      className="w-4 h-4 rounded text-accent focus:ring-accent"
                    />
                    <span>Make Active</span>
                  </label>
                  <button
                    onClick={() => setDeleteConfirm(showreel.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                    title="Delete Showreel"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="admin-label">Title</label>
                  <input
                    type="text"
                    value={showreel.title || ''}
                    onChange={(e) => handleChange(showreel.id, 'title', e.target.value)}
                    placeholder="e.g. Master Showreel 2024"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Description</label>
                  <textarea
                    value={showreel.description || ''}
                    onChange={(e) => handleChange(showreel.id, 'description', e.target.value)}
                    rows={2}
                    placeholder="Brief description of footage included..."
                    className="admin-input resize-y"
                  />
                </div>
                <div>
                  <label className="admin-label">Aspect Ratio / Layout Format</label>
                  <select
                    value={showreel.aspect_ratio || showreel.aspectRatio || '16:9'}
                    onChange={(e) => {
                      handleChange(showreel.id, 'aspect_ratio', e.target.value);
                      handleChange(showreel.id, 'aspectRatio', e.target.value);
                    }}
                    className="admin-input cursor-pointer"
                  >
                    <option value="16:9">16:9 Cinema Landscape (Standard)</option>
                    <option value="9:16">9:16 Vertical Reel (Mobile Cut / Shorts / Reels)</option>
                  </select>
                </div>
              </div>

              {/* Video URL & File Upload */}
              <div>
                <label className="admin-label">Video Source (URL or File Upload)</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={showreel.video_url || ''}
                        onChange={(e) => handleChange(showreel.id, 'video_url', e.target.value)}
                        placeholder="Paste Google Drive, YouTube, Vimeo, or direct MP4 URL"
                        className="admin-input pl-10"
                      />
                    </div>
                    {showreel.video_url && (
                      <button
                        type="button"
                        onClick={() => handleChange(showreel.id, 'video_url', '')}
                        className="admin-btn-secondary px-3"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {uploading[`${showreel.id}-videoUrl`] !== undefined ? (
                    <div className="admin-card p-3">
                      <div className="w-full bg-surface rounded-full h-2 mb-1.5">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploading[`${showreel.id}-videoUrl`]}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted text-center">Uploading video {uploading[`${showreel.id}-videoUrl`]}%...</p>
                    </div>
                  ) : (
                    <label className="admin-card p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                      <HiOutlineUpload className="w-5 h-5 text-accent" />
                      <span className="text-xs text-text-secondary">Or click here to upload video file (.mp4, .webm, .mov)</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(showreel.id, 'videoUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Thumbnail URL & File Upload */}
              <div>
                <label className="admin-label">Poster / Thumbnail</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={showreel.thumbnail_url || ''}
                        onChange={(e) => handleChange(showreel.id, 'thumbnail_url', e.target.value)}
                        placeholder="Paste image poster URL or upload below"
                        className="admin-input pl-10"
                      />
                    </div>
                    {showreel.thumbnail_url && (
                      <button
                        type="button"
                        onClick={() => handleChange(showreel.id, 'thumbnail_url', '')}
                        className="admin-btn-secondary px-3"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <label className="admin-card p-3 flex items-center justify-center gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                    <HiOutlineUpload className="w-4 h-4 text-accent" />
                    <span className="text-xs text-text-secondary">Upload thumbnail image (jpg, png, webp)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(showreel.id, 'thumbnailUrl', e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              {showreel.video_url && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="admin-label text-xs text-text-muted mb-0">Live Player Preview</label>
                    <span className="text-[10px] font-mono text-accent uppercase font-bold">
                      {showreel.aspect_ratio === '9:16' ? '9:16 VERTICAL FORMAT' : '16:9 CINEMA FORMAT'}
                    </span>
                  </div>
                  <div className={`rounded-xl overflow-hidden bg-surface border border-border shadow-lg ${
                    showreel.aspect_ratio === '9:16'
                      ? 'w-48 sm:w-56 aspect-[9/16] mx-auto border-accent/40 ring-4 ring-black/30'
                      : 'aspect-video max-w-lg'
                  }`}>
                    <VideoPlayer
                      url={showreel.video_url}
                      poster={showreel.thumbnail_url}
                      title={showreel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => handleSave(showreel)}
                disabled={saving}
                className="admin-btn-primary w-full py-3"
              >
                {saving ? 'Saving...' : 'Save Showreel Details'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Showreel Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-card max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-bold text-text-primary">Create New Showreel</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="admin-label">Title *</label>
                <input
                  type="text"
                  value={newReel.title}
                  onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                  placeholder="e.g. Master Reel 2024"
                  required
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Description</label>
                <textarea
                  value={newReel.description}
                  onChange={(e) => setNewReel({ ...newReel, description: e.target.value })}
                  rows={2}
                  placeholder="60-second compilation of cinematic commercial cuts..."
                  className="admin-input resize-y"
                />
              </div>

              <div>
                <label className="admin-label">Video URL (YouTube, Vimeo, MP4)</label>
                <input
                  type="text"
                  value={newReel.videoUrl}
                  onChange={(e) => setNewReel({ ...newReel, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or direct MP4"
                  className="admin-input mb-2"
                />
                <label className="admin-card p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-accent/40">
                  <HiOutlineUpload className="w-4 h-4 text-accent" />
                  <span className="text-xs text-text-secondary">Or Upload Video File</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('new', 'videoUrl', e.target.files[0])}
                  />
                </label>
              </div>

              <div>
                <label className="admin-label">Thumbnail URL</label>
                <input
                  type="text"
                  value={newReel.thumbnailUrl}
                  onChange={(e) => setNewReel({ ...newReel, thumbnailUrl: e.target.value })}
                  placeholder="https://... image poster URL"
                  className="admin-input mb-2"
                />
                <label className="admin-card p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-accent/40">
                  <HiOutlineUpload className="w-4 h-4 text-accent" />
                  <span className="text-xs text-text-secondary">Or Upload Thumbnail Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('new', 'thumbnailUrl', e.target.files[0])}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newReel.active}
                  onChange={(e) => setNewReel({ ...newReel, active: e.target.checked })}
                  className="w-4 h-4 rounded text-accent focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">Set as active reel immediately</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="admin-btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary flex-1"
                >
                  {saving ? 'Creating...' : 'Create Showreel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Showreel?</h3>
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
