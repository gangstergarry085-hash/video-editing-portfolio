import { useState, useEffect } from 'react';
import { settingsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    try {
      const { data } = await settingsAPI.get();
      setForm({
        siteTitle: data?.site_title || '',
        heroHeading: data?.hero_heading || '',
        heroSubheading: data?.hero_subheading || '',
        heroStatement: data?.hero_statement || '',
        availabilityStatus: data?.availability_status || '',
        accentColor: data?.accent_color || '#E50914',
        email: data?.email || '',
        socialLinks: data?.social_links || {},
        footerText: data?.footer_text || '',
        metaTitle: data?.meta_title || '',
        metaDescription: data?.meta_description || '',
        ogImageUrl: data?.og_image_url || '',
        contactHeading: data?.contact_heading || '',
        contactSubheading: data?.contact_subheading || '',
        processSteps: data?.process_steps || [],
      });
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadSettings(); }, []);

  function handleChange(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function updateStep(idx, field, value) {
    const steps = [...form.processSteps];
    steps[idx] = { ...steps[idx], [field]: value };
    handleChange('processSteps', steps);
  }

  function addStep() {
    handleChange('processSteps', [
      ...form.processSteps,
      { step: form.processSteps.length + 1, title: '', description: '' },
    ]);
  }

  function removeStep(idx) {
    handleChange('processSteps', form.processSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(form);
      toast.success('Settings saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  if (loading || !form) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8"><h1 className="text-2xl font-display font-bold text-text-primary">Settings</h1><p className="text-text-muted text-sm mt-1">Site configuration, SEO, and hero content.</p></div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div><label className="admin-label">Heading</label><input type="text" value={form.heroHeading} onChange={(e) => handleChange('heroHeading', e.target.value)} className="admin-input" /></div>
            <div><label className="admin-label">Subheading</label><input type="text" value={form.heroSubheading} onChange={(e) => handleChange('heroSubheading', e.target.value)} className="admin-input" /></div>
            <div><label className="admin-label">Statement</label><input type="text" value={form.heroStatement} onChange={(e) => handleChange('heroStatement', e.target.value)} className="admin-input" placeholder="YOU WATCH. / I EDIT." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="admin-label">Availability Status</label><input type="text" value={form.availabilityStatus} onChange={(e) => handleChange('availabilityStatus', e.target.value)} className="admin-input" /></div>
              <div><label className="admin-label">Accent Color</label><div className="flex gap-2"><input type="color" value={form.accentColor} onChange={(e) => handleChange('accentColor', e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" /><input type="text" value={form.accentColor} onChange={(e) => handleChange('accentColor', e.target.value)} className="admin-input flex-1" /></div></div>
            </div>
          </div>
        </section>

        {/* Site / SEO */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Site & SEO</h2>
          <div className="space-y-4">
            <div><label className="admin-label">Site Title</label><input type="text" value={form.siteTitle} onChange={(e) => handleChange('siteTitle', e.target.value)} className="admin-input" /></div>
            <div><label className="admin-label">Meta Title</label><input type="text" value={form.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} className="admin-input" /></div>
            <div><label className="admin-label">Meta Description</label><textarea value={form.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} rows={2} className="admin-input resize-y" /></div>
            <div><label className="admin-label">OG Image URL</label><input type="text" value={form.ogImageUrl} onChange={(e) => handleChange('ogImageUrl', e.target.value)} className="admin-input" /></div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Contact & Social</h2>
          <div className="space-y-4">
            <div><label className="admin-label">Contact Section Headline</label><input type="text" value={form.contactHeading} onChange={(e) => handleChange('contactHeading', e.target.value)} className="admin-input" placeholder="Ready to Cut Your Next Masterpiece?" /></div>
            <div><label className="admin-label">Contact Section Subtitle</label><textarea value={form.contactSubheading} onChange={(e) => handleChange('contactSubheading', e.target.value)} rows={2} className="admin-input resize-y" placeholder="Whether you need a dynamic commercial campaign..." /></div>
            <div><label className="admin-label">Email</label><input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="admin-input" /></div>
            <div><label className="admin-label">Footer Text</label><input type="text" value={form.footerText} onChange={(e) => handleChange('footerText', e.target.value)} className="admin-input" /></div>
            <div>
              <label className="admin-label">Social Links (JSON)</label>
              <textarea value={JSON.stringify(form.socialLinks, null, 2)} onChange={(e) => { try { handleChange('socialLinks', JSON.parse(e.target.value)); } catch {} }} rows={4} className="admin-input font-mono text-xs resize-y" />
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Editing Process Steps</h2>
            <button type="button" onClick={addStep} className="admin-btn-secondary text-xs"><HiOutlinePlus className="w-3 h-3" /> Add Step</button>
          </div>
          <div className="space-y-3">
            {form.processSteps.map((step, i) => (
              <div key={i} className="admin-card p-4 flex gap-4 items-start">
                <span className="text-2xl font-display font-bold text-accent/30 mt-1">{step.step}</span>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={step.track || `TRACK V${i + 1}`} onChange={(e) => updateStep(i, 'track', e.target.value)} placeholder="TRACK V1" className="admin-input text-xs font-mono text-accent" />
                    <input type="text" value={step.label || `NODE 0${i + 1}`} onChange={(e) => updateStep(i, 'label', e.target.value)} placeholder="INGEST" className="admin-input text-xs font-mono uppercase text-text-muted" />
                  </div>
                  <input type="text" value={step.title} onChange={(e) => updateStep(i, 'title', e.target.value)} placeholder="Step title" className="admin-input" />
                  <input type="text" value={step.description} onChange={(e) => updateStep(i, 'description', e.target.value)} placeholder="Description" className="admin-input" />
                </div>
                <button type="button" onClick={() => removeStep(i)} className="p-2 hover:bg-danger/10 rounded text-text-muted hover:text-danger"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <button type="submit" disabled={saving} className="admin-btn-primary w-full py-3">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
