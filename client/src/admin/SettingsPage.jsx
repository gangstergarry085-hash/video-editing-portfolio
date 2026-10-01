import { useState, useEffect } from 'react';
import { settingsAPI, authAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineLockClosed,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineUpload,
  HiOutlineLink,
} from 'react-icons/hi';

const KNOWN_SOCIALS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/username' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
];

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  // Social link custom input
  const [customSocialKey, setCustomSocialKey] = useState('');
  const [customSocialVal, setCustomSocialVal] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  async function loadSettings() {
    try {
      const { data } = await settingsAPI.get();
      setForm({
        siteTitle: data?.site_title || 'Dev Anand — Video Editor & Motion Designer',
        heroHeading: data?.hero_heading || 'Dev Anand',
        heroSubheading: data?.hero_subheading || 'Video Editor · Motion Graphics · Color Grading',
        heroStatement: data?.hero_statement || 'YOU SHOOT. / I CUT.',
        availabilityStatus: data?.availability_status || 'Available for Projects',
        accentColor: data?.accent_color || '#E5A93C',
        email: data?.email || 'admin@devanand.com',
        socialLinks: typeof data?.social_links === 'object' && data?.social_links !== null ? data.social_links : {},
        footerText: data?.footer_text || '© Dev Anand. All rights reserved.',
        metaTitle: data?.meta_title || 'Dev Anand — Video Editor & Motion Designer',
        metaDescription: data?.meta_description || 'High-impact video editing, rhythmic pacing, and cinematic color grading.',
        ogImageUrl: data?.og_image_url || '',
        contactHeading: data?.contact_heading || 'Ready to Cut Your Next Masterpiece?',
        contactSubheading: data?.contact_subheading || "Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let's collaborate.",
        processSteps: Array.isArray(data?.process_steps) ? data.process_steps : [],
      });
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
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

  function updateStep(idx, field, value) {
    const steps = [...form.processSteps];
    steps[idx] = { ...steps[idx], [field]: value };
    handleChange('processSteps', steps);
  }

  function addStep() {
    handleChange('processSteps', [
      ...form.processSteps,
      {
        step: form.processSteps.length + 1,
        title: '',
        description: '',
        track: 'V1',
        node: `0${form.processSteps.length + 1}`,
        label: 'PROCESS PHASE',
      },
    ]);
  }

  function removeStep(idx) {
    handleChange(
      'processSteps',
      form.processSteps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, step: i + 1, node: `0${i + 1}` }))
    );
  }

  async function handleOgUpload(file) {
    setUploadingOg(true);
    try {
      const { data } = await mediaAPI.upload(file);
      handleChange('ogImageUrl', data.url);
      toast.success('Social share image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingOg(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(form);
      toast.success('Settings saved successfully');
    } catch (err) {
      const msg = err.response?.data?.details?.[0] || err.response?.data?.error || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword) {
      return toast.error('Please enter your current password');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setChangingPass(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Admin password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setChangingPass(false);
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
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">System & Portfolio Settings</h1>
        <p className="text-text-muted text-sm mt-1">Configure global site settings, contact details, process pipeline, and admin security.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section Configuration */}
        <section className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Hero Section Content</h2>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Hero Main Heading</label>
              <input
                type="text"
                value={form.heroHeading}
                onChange={(e) => handleChange('heroHeading', e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Hero Subtitle</label>
              <input
                type="text"
                value={form.heroSubheading}
                onChange={(e) => handleChange('heroSubheading', e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Hero Tagline Statement</label>
              <input
                type="text"
                value={form.heroStatement}
                onChange={(e) => handleChange('heroStatement', e.target.value)}
                placeholder="YOU SHOOT. / I CUT."
                className="admin-input"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Availability Status</label>
                <input
                  type="text"
                  value={form.availabilityStatus}
                  onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Theme Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-10 h-10 rounded border border-border cursor-pointer bg-surface"
                  />
                  <input
                    type="text"
                    value={form.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="admin-input flex-1 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO & Meta */}
        <section className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Site SEO & Metadata</h2>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Site Title (Browser Tab)</label>
              <input
                type="text"
                value={form.siteTitle}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Meta Social Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                rows={2}
                className="admin-input resize-y"
              />
            </div>
            <div>
              <label className="admin-label">Social Share Image (OG Image)</label>
              <div className="space-y-2">
                <div className="relative">
                  <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={form.ogImageUrl}
                    onChange={(e) => handleChange('ogImageUrl', e.target.value)}
                    placeholder="https://... image URL for social previews"
                    className="admin-input pl-10"
                  />
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent/40 text-xs text-text-secondary cursor-pointer">
                  <HiOutlineUpload className="w-3.5 h-3.5 text-accent" />
                  <span>{uploadingOg ? 'Uploading...' : 'Or upload image from device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleOgUpload(e.target.files[0])}
                    disabled={uploadingOg}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Social Links */}
        <section className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Contact & Social Channels</h2>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Contact Headline</label>
              <input
                type="text"
                value={form.contactHeading}
                onChange={(e) => handleChange('contactHeading', e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Contact Subtitle</label>
              <textarea
                value={form.contactSubheading}
                onChange={(e) => handleChange('contactSubheading', e.target.value)}
                rows={2}
                className="admin-input resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Direct Contact Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={form.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            {/* Social channels inputs */}
            <div className="pt-2">
              <label className="admin-label text-xs font-semibold uppercase tracking-wider mb-2">Social Channels</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {KNOWN_SOCIALS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <span className="text-xs text-text-muted mb-1 block">{label}</span>
                    <input
                      type="url"
                      value={form.socialLinks[key] || ''}
                      onChange={(e) => handleSocialChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="admin-input text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Add custom social */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customSocialKey}
                  onChange={(e) => setCustomSocialKey(e.target.value)}
                  placeholder="Platform"
                  className="admin-input text-xs w-32"
                />
                <input
                  type="url"
                  value={customSocialVal}
                  onChange={(e) => setCustomSocialVal(e.target.value)}
                  placeholder="https://..."
                  className="admin-input text-xs flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSocial())}
                />
                <button
                  type="button"
                  onClick={addCustomSocial}
                  className="admin-btn-secondary text-xs"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Editing Process Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="admin-btn-secondary text-xs"
            >
              <HiOutlinePlus className="w-3.5 h-3.5" />
              Add Step
            </button>
          </div>

          <div className="space-y-3">
            {form.processSteps.map((step, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-accent font-semibold">
                    STEP {step.step || i + 1} // NODE {step.node || `0${i + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-1 hover:bg-danger/10 text-text-muted hover:text-danger rounded"
                    title="Remove step"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => updateStep(i, 'title', e.target.value)}
                    placeholder="Step Title (e.g. Ingestion & Proxies)"
                    className="admin-input text-xs"
                  />
                  <input
                    type="text"
                    value={step.track || ''}
                    onChange={(e) => updateStep(i, 'track', e.target.value)}
                    placeholder="Timeline Track (e.g. V1-V4 / A1-A6)"
                    className="admin-input text-xs"
                  />
                </div>
                <textarea
                  value={step.description || ''}
                  onChange={(e) => updateStep(i, 'description', e.target.value)}
                  rows={2}
                  placeholder="Detailed description of this production phase..."
                  className="admin-input text-xs resize-y"
                />
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="admin-btn-primary w-full py-3 text-base"
        >
          {saving ? 'Saving...' : 'Save Site Settings'}
        </button>
      </form>

      {/* Admin Security: Password Management */}
      <section className="admin-card border-danger/20 space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <HiOutlineLockClosed className="w-5 h-5 text-accent" />
          <h2 className="text-base font-display font-bold text-text-primary">Admin Security & Password</h2>
        </div>
        <p className="text-xs text-text-muted">
          Update the admin master password for your portfolio CMS. Passwords must be at least 8 characters.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-2">
          <div>
            <label className="admin-label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current CMS password"
                required
                className="admin-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showCurrentPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="admin-label">New Password (min 8 characters)</label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password"
                required
                minLength={8}
                className="admin-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showNewPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="admin-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              className="admin-input"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="admin-btn-secondary border-accent/40 text-accent hover:bg-accent/10"
          >
            {changingPass ? 'Updating...' : 'Update Admin Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
