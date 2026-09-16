import { useState, useEffect } from 'react';
import { aboutAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineX, HiOutlinePlus } from 'react-icons/hi';

export default function AboutPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toolInput, setToolInput] = useState('');
  const [toolCatInput, setToolCatInput] = useState('');
  const [uploading, setUploading] = useState(false);

  async function loadAbout() {
    try {
      const { data } = await aboutAPI.get();
      setForm({
        name: data?.name || '',
        role: data?.role || '',
        bio: data?.bio || '',
        experience: data?.experience || '',
        location: data?.location || '',
        availabilityStatus: data?.availability_status || '',
        profileImageUrl: data?.profile_image_url || '',
        socialLinks: data?.social_links || {},
        deliveriesStat: data?.deliveries_stat || '',
        resolutionStat: data?.resolution_stat || '',
        tools: data?.tools || [],
      });
    } catch { toast.error('Failed to load about data'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAbout(); }, []);

  function handleChange(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function addTool() {
    if (toolInput.trim()) {
      handleChange('tools', [...form.tools, { name: toolInput.trim(), category: toolCatInput.trim() || 'General' }]);
      setToolInput(''); setToolCatInput('');
    }
  }

  function removeTool(idx) { handleChange('tools', form.tools.filter((_, i) => i !== idx)); }

  async function handleImageUpload(file) {
    setUploading(true);
    try {
      const { data } = await mediaAPI.upload(file);
      handleChange('profileImageUrl', data.url);
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await aboutAPI.update(form);
      toast.success('About saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  if (loading || !form) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8"><h1 className="text-2xl font-display font-bold text-text-primary">About</h1><p className="text-text-muted text-sm mt-1">Manage your bio, tools, and personal info.</p></div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile image */}
        <div>
          <label className="admin-label">Profile Image</label>
          {form.profileImageUrl ? (
            <div className="flex items-center gap-4">
              <img src={form.profileImageUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
              <button type="button" onClick={() => handleChange('profileImageUrl', '')} className="admin-btn-secondary text-xs"><HiOutlineX className="w-3 h-3" /> Remove</button>
            </div>
          ) : (
            <label className="admin-card p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent/30 w-fit">
              <HiOutlineUpload className="w-8 h-8 text-text-muted" />
              <span className="text-sm text-text-secondary">{uploading ? 'Uploading...' : 'Upload photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="admin-label">Name</label><input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Role</label><input type="text" value={form.role} onChange={(e) => handleChange('role', e.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Experience</label><input type="text" value={form.experience} onChange={(e) => handleChange('experience', e.target.value)} placeholder="e.g. ~1 Year" className="admin-input" /></div>
          <div><label className="admin-label">Location</label><input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Availability</label><input type="text" value={form.availabilityStatus} onChange={(e) => handleChange('availabilityStatus', e.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Project Deliveries Stat</label><input type="text" value={form.deliveriesStat} onChange={(e) => handleChange('deliveriesStat', e.target.value)} placeholder="e.g. 100% On-Time" className="admin-input font-bold text-accent" /></div>
          <div><label className="admin-label">Timeline Resolution Stat</label><input type="text" value={form.resolutionStat} onChange={(e) => handleChange('resolutionStat', e.target.value)} placeholder="e.g. 4K / 60FPS HDR" className="admin-input font-bold text-accent-secondary" /></div>
        </div>

        <div><label className="admin-label">Bio</label><textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={5} className="admin-input resize-y" /></div>

        {/* Tools */}
        <div>
          <label className="admin-label">Tools / Software</label>
          <div className="flex gap-2 mb-3">
            <input type="text" value={toolInput} onChange={(e) => setToolInput(e.target.value)} placeholder="Tool name" className="admin-input flex-1" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())} />
            <input type="text" value={toolCatInput} onChange={(e) => setToolCatInput(e.target.value)} placeholder="Category" className="admin-input w-32" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())} />
            <button type="button" onClick={addTool} className="admin-btn-secondary"><HiOutlinePlus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tools.map((tool, i) => (
              <span key={i} className="badge bg-surface-hover text-text-secondary flex items-center gap-1">
                {tool.name} <span className="text-text-muted">({tool.category})</span>
                <button type="button" onClick={() => removeTool(i)} className="hover:text-danger ml-1"><HiOutlineX className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div>
          <label className="admin-label">Social Links (JSON)</label>
          <textarea
            value={JSON.stringify(form.socialLinks, null, 2)}
            onChange={(e) => { try { handleChange('socialLinks', JSON.parse(e.target.value)); } catch {} }}
            rows={4}
            className="admin-input font-mono text-xs resize-y"
            placeholder='{ "instagram": "...", "youtube": "..." }'
          />
        </div>

        <button type="submit" disabled={saving} className="admin-btn-primary w-full py-3">{saving ? 'Saving...' : 'Save About'}</button>
      </form>
    </div>
  );
}
