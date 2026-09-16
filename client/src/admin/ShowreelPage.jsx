import { useState, useEffect } from 'react';
import { showreelAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineX, HiOutlineFilm } from 'react-icons/hi';

export default function ShowreelPage() {
  const [showreels, setShowreels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => { loadShowreels(); }, []);

  async function loadShowreels() {
    try {
      const { data } = await showreelAPI.adminList();
      setShowreels(data);
    } catch { toast.error('Failed to load showreels'); }
    finally { setLoading(false); }
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
      handleChange(id, field, data.url);
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading((prev) => { const n = { ...prev }; delete n[key]; return n; }); }
  }

  async function handleSave(showreel) {
    setSaving(true);
    try {
      await showreelAPI.update(showreel.id, {
        videoUrl: showreel.video_url || '',
        thumbnailUrl: showreel.thumbnail_url || '',
        title: showreel.title || '',
        description: showreel.description || '',
        active: showreel.active || false,
      });
      toast.success('Showreel saved');
      await loadShowreels();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Showreel</h1>
        <p className="text-text-muted text-sm mt-1">Manage your showreel — the hero video of your portfolio.</p>
      </div>

      {showreels.length === 0 ? (
        <div className="admin-card text-center py-16">
          <HiOutlineFilm className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary font-display font-semibold">NO SHOWREEL YET.</p>
        </div>
      ) : (
        showreels.map((showreel) => (
          <div key={showreel.id} className="admin-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                {showreel.active ? '● Active Showreel' : 'Inactive'}
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showreel.active}
                  onChange={(e) => handleChange(showreel.id, 'active', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-text-secondary">Active</span>
              </label>
            </div>

            <div>
              <label className="admin-label">Title</label>
              <input
                type="text"
                value={showreel.title || ''}
                onChange={(e) => handleChange(showreel.id, 'title', e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea
                value={showreel.description || ''}
                onChange={(e) => handleChange(showreel.id, 'description', e.target.value)}
                rows={2}
                className="admin-input resize-y"
              />
            </div>

            {/* Video upload */}
            <div>
              <label className="admin-label">Video</label>
              {showreel.video_url ? (
                <div className="flex items-center gap-2 admin-card p-3">
                  <HiOutlineFilm className="w-5 h-5 text-text-muted shrink-0" />
                  <span className="text-xs text-text-muted truncate flex-1">{showreel.video_url}</span>
                  <button onClick={() => handleChange(showreel.id, 'video_url', '')} className="p-1 hover:bg-surface-hover rounded"><HiOutlineX className="w-4 h-4" /></button>
                </div>
              ) : uploading[`${showreel.id}-video_url`] !== undefined ? (
                <div className="admin-card p-3"><div className="w-full bg-surface rounded-full h-1.5"><div className="bg-accent h-1.5 rounded-full" style={{ width: `${uploading[`${showreel.id}-video_url`]}%` }} /></div></div>
              ) : (
                <label className="admin-card p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent/30">
                  <HiOutlineUpload className="w-8 h-8 text-text-muted" /><span className="text-sm text-text-secondary">Upload showreel video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && handleFileUpload(showreel.id, 'video_url', e.target.files[0])} />
                </label>
              )}
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="admin-label">Thumbnail</label>
              {showreel.thumbnail_url ? (
                <div className="flex items-center gap-2 admin-card p-3">
                  <img src={showreel.thumbnail_url} alt="" className="w-12 h-8 rounded object-cover" />
                  <span className="text-xs text-text-muted truncate flex-1">{showreel.thumbnail_url}</span>
                  <button onClick={() => handleChange(showreel.id, 'thumbnail_url', '')} className="p-1 hover:bg-surface-hover rounded"><HiOutlineX className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="admin-card p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-accent/30">
                  <HiOutlineUpload className="w-6 h-6 text-text-muted" /><span className="text-xs text-text-muted">Upload thumbnail</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleFileUpload(showreel.id, 'thumbnail_url', e.target.files[0])} />
                </label>
              )}
            </div>

            <button onClick={() => handleSave(showreel)} disabled={saving} className="admin-btn-primary w-full">
              {saving ? 'Saving...' : 'Save Showreel'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
