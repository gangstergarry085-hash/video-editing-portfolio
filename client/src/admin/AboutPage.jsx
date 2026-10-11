import { useState, useEffect } from 'react';
import { aboutAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUpload, HiOutlineX, HiOutlinePlus,
  HiOutlineLink, HiOutlinePhotograph,
} from 'react-icons/hi';

const KNOWN_SOCIALS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/username' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
];

export default function AboutPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toolInput, setToolInput] = useState('');
  const [toolCatInput, setToolCatInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [customSocialKey, setCustomSocialKey] = useState('');
  const [customSocialVal, setCustomSocialVal] = useState('');

  async function loadAbout() {
    try {
      const { data } = await aboutAPI.get();
      const raw = data?.about || data;
      setForm({
        name: raw?.name || '',
        role: raw?.role || '',
        bio: raw?.bio || '',
        experience: raw?.experience || '',
        location: raw?.location || '',
        availabilityStatus: raw?.availability_status || raw?.availabilityStatus || '',
        profileImageUrl: raw?.profile_image_url || raw?.profileImageUrl || raw?.avatar_url || '',
        socialLinks: typeof raw?.social_links === 'object' && raw?.social_links !== null ? raw.social_links : (typeof raw?.socialLinks === 'object' && raw?.socialLinks !== null ? raw.socialLinks : {}),
        deliveriesStat: raw?.deliveries_stat || raw?.deliveriesStat || '100% On-Time',
        resolutionStat: raw?.resolution_stat || raw?.resolutionStat || '4K / 60FPS HDR',
        tools: Array.isArray(raw?.tools) ? raw.tools : [],
      });
    } catch {
      toast.error('Failed to load about data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAbout();
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSocialChange(key, value) {
    setForm((prev) => {
      const updated = { ...prev.socialLinks };
      if (!value.trim()) {
        delete updated[key];
      } else {
        updated[key] = value.trim();
      }
      return { ...prev, socialLinks: updated };
    });
  }

  function addCustomSocial() {
    if (customSocialKey.trim() && customSocialVal.trim()) {
      handleSocialChange(customSocialKey.trim().toLowerCase(), customSocialVal.trim());
      setCustomSocialKey('');
      setCustomSocialVal('');
    }
  }

  function addTool() {
    if (toolInput.trim()) {
      handleChange('tools', [
        ...form.tools,
        { name: toolInput.trim(), category: toolCatInput.trim() || 'General' },
      ]);
      setToolInput('');
      setToolCatInput('');
    }
  }

  function removeTool(idx) {
    handleChange('tools', form.tools.filter((_, i) => i !== idx));
  }

  async function handleImageUpload(file) {
    setUploading(true);
    try {
      const { data } = await mediaAPI.upload(file);
      handleChange('profileImageUrl', data.url);
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        availability_status: form.availabilityStatus,
        availabilityStatus: form.availabilityStatus,
        profile_image_url: form.profileImageUrl,
        profileImageUrl: form.profileImageUrl,
        avatar_url: form.profileImageUrl,
        social_links: form.socialLinks,
        socialLinks: form.socialLinks,
        deliveries_stat: form.deliveriesStat,
        deliveriesStat: form.deliveriesStat,
        resolution_stat: form.resolutionStat,
        resolutionStat: form.resolutionStat,
      };
      await aboutAPI.update(payload);
      toast.success('About details saved successfully');
    } catch (err) {
      const msg = err.response?.data?.details?.[0] || err.response?.data?.error || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">About & Profile</h1>
        <p className="text-text-muted text-sm mt-1">Manage your biographical information, gear, badges, and social channels.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="admin-card space-y-4">
          <label className="admin-label">Profile Photo</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {form.profileImageUrl ? (
              <div className="relative group shrink-0">
                <img
                  src={form.profileImageUrl}
                  alt={form.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => handleChange('profileImageUrl', '')}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-danger text-white hover:bg-danger/80 shadow"
                  title="Remove image"
                >
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted shrink-0">
                <HiOutlinePhotograph className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 w-full space-y-2">
              <div className="relative">
                <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={form.profileImageUrl}
                  onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="admin-input pl-10"
                />
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-accent/40 text-xs font-medium text-text-secondary cursor-pointer transition-colors">
                <HiOutlineUpload className="w-4 h-4 text-accent" />
                <span>{uploading ? 'Uploading image...' : 'Or choose image file from device'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Identity & Basic Info */}
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Identity Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Dev Anand"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Professional Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Video Editor & Motion Graphics Designer"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Years of Experience</label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="e.g. 3+ Years"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Location / Base</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. New Delhi, India"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Availability Status</label>
              <input
                type="text"
                value={form.availabilityStatus}
                onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                placeholder="e.g. Available for Projects"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">On-Time Deliveries Stat</label>
              <input
                type="text"
                value={form.deliveriesStat}
                onChange={(e) => handleChange('deliveriesStat', e.target.value)}
                placeholder="100% On-Time"
                className="admin-input text-accent font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label">Timeline Resolution Stat</label>
              <input
                type="text"
                value={form.resolutionStat}
                onChange={(e) => handleChange('resolutionStat', e.target.value)}
                placeholder="4K / 60FPS HDR"
                className="admin-input text-accent-secondary font-bold"
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Biography</label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={5}
              placeholder="Tell your story, editing philosophy, and creative background..."
              className="admin-input resize-y"
            />
          </div>
        </div>

        {/* Tools & Software */}
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Tools & Software Stack</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              placeholder="Software (e.g. DaVinci Resolve)"
              className="admin-input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
            />
            <input
              type="text"
              value={toolCatInput}
              onChange={(e) => setToolCatInput(e.target.value)}
              placeholder="Category (e.g. Color Grading)"
              className="admin-input w-40"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
            />
            <button
              type="button"
              onClick={addTool}
              className="admin-btn-secondary"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {form.tools.map((tool, i) => (
              <span
                key={i}
                className="badge bg-surface-hover border border-border text-text-secondary flex items-center gap-1.5 py-1 px-3"
              >
                <span className="text-text-primary font-medium">{tool.name}</span>
                {tool.category && <span className="text-text-muted text-[10px]">({tool.category})</span>}
                <button
                  type="button"
                  onClick={() => removeTool(i)}
                  className="hover:text-danger ml-1 p-0.5 rounded cursor-pointer"
                  title="Remove tool"
                >
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Social Channels */}
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Social Channels & Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {KNOWN_SOCIALS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="admin-label">{label}</label>
                <input
                  type="url"
                  value={form.socialLinks[key] || ''}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="admin-input"
                />
              </div>
            ))}
          </div>

          {/* Custom social link adder */}
          <div className="pt-3 border-t border-border/60">
            <label className="admin-label text-xs">Add Other Platform</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSocialKey}
                onChange={(e) => setCustomSocialKey(e.target.value)}
                placeholder="Platform name (e.g. Behance)"
                className="admin-input w-36"
              />
              <input
                type="url"
                value={customSocialVal}
                onChange={(e) => setCustomSocialVal(e.target.value)}
                placeholder="https://..."
                className="admin-input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSocial())}
              />
              <button
                type="button"
                onClick={addCustomSocial}
                className="admin-btn-secondary"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="admin-btn-primary w-full py-3"
        >
          {saving ? 'Saving...' : 'Save All About Settings'}
        </button>
      </form>
    </div>
  );
}
