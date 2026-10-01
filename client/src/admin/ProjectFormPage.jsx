import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import {
  HiOutlineArrowLeft, HiOutlineUpload, HiOutlineX,
  HiOutlineLink,
} from 'react-icons/hi';

const CATEGORIES = [
  'Cinematic', 'Motion Graphics', 'Social Media',
  'YouTube', 'Advertisement', 'Client Work', 'Personal Experiment',
];

const emptyForm = {
  title: '',
  category: 'Cinematic',
  description: '',
  shortDescription: '',
  videoUrl: '',
  thumbnailUrl: '',
  mobileVideoUrl: '',
  tools: [],
  clientName: '',
  clientDescription: '',
  devRole: '',
  servicesProvided: [],
  projectYear: new Date().getFullYear(),
  projectType: '',
  featured: false,
  published: false,
};

function MediaField({ label, field, accept, type = 'video', value, isUploading, uploadPercent, onChange, onUpload }) {
  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>

      {/* Paste URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={type === 'video' ? 'Paste YouTube, Vimeo, or direct MP4 URL' : 'Paste image URL (https://...)'}
            className="admin-input pl-10 text-xs"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(field, '')}
            className="admin-btn-secondary px-3"
            title="Clear"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* File Upload Zone */}
      {isUploading ? (
        <div className="admin-card p-3">
          <div className="w-full bg-surface rounded-full h-2 mb-1.5">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-center">{uploadPercent}% uploading...</p>
        </div>
      ) : (
        <label className="admin-card p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-accent/40 transition-colors">
          <HiOutlineUpload className="w-4 h-4 text-accent" />
          <span className="text-xs text-text-secondary">Or choose {type === 'video' ? 'video file' : 'image'} to upload</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(field, e.target.files[0])}
          />
        </label>
      )}

      {/* Live Preview if value provided */}
      {value && (
        <div className="mt-2 rounded-xl overflow-hidden bg-surface border border-border max-w-sm">
          {type === 'image' ? (
            <img src={value} alt="" className="w-full h-32 object-cover" />
          ) : (
            <div className="aspect-video">
              <VideoPlayer url={value} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [toolInput, setToolInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  const loadProject = useCallback(async () => {
    try {
      let project = null;
      try {
        const { data } = await projectsAPI.getById(id);
        project = data;
      } catch {
        const { data: all } = await projectsAPI.adminList({});
        project = all.find((p) => p.id === parseInt(id));
      }

      if (!project) {
        toast.error('Project not found');
        navigate('/admin/projects');
        return;
      }

      setForm({
        title: project.title || '',
        category: project.category || 'Cinematic',
        description: project.description || '',
        shortDescription: project.short_description || '',
        videoUrl: project.video_url || '',
        thumbnailUrl: project.thumbnail_url || '',
        mobileVideoUrl: project.mobile_video_url || '',
        tools: Array.isArray(project.tools) ? project.tools : [],
        clientName: project.client_name || '',
        clientDescription: project.client_description || '',
        devRole: project.dev_role || '',
        servicesProvided: Array.isArray(project.services_provided) ? project.services_provided : [],
        projectYear: project.project_year || new Date().getFullYear(),
        projectType: project.project_type || '',
        featured: Boolean(project.featured),
        published: Boolean(project.published),
      });
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      loadProject();
    }
  }, [isEdit, loadProject]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTool() {
    if (toolInput.trim() && !form.tools.includes(toolInput.trim())) {
      handleChange('tools', [...form.tools, toolInput.trim()]);
      setToolInput('');
    }
  }

  function removeTool(tool) {
    handleChange('tools', form.tools.filter((t) => t !== tool));
  }

  function addService() {
    if (serviceInput.trim() && !form.servicesProvided.includes(serviceInput.trim())) {
      handleChange('servicesProvided', [...form.servicesProvided, serviceInput.trim()]);
      setServiceInput('');
    }
  }

  function removeService(svc) {
    handleChange('servicesProvided', form.servicesProvided.filter((s) => s !== svc));
  }

  async function handleFileUpload(field, file) {
    setUploading((prev) => ({ ...prev, [field]: 0 }));
    try {
      const { data } = await mediaAPI.upload(file, (progress) => {
        setUploading((prev) => ({ ...prev, [field]: progress }));
      });
      handleChange(field, data.url);
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(asPublished) {
    if (!form.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, published: asPublished };

      if (isEdit) {
        await projectsAPI.update(id, payload);
        toast.success('Project updated');
      } else {
        await projectsAPI.create(payload);
        toast.success('Project created');
      }

      navigate('/admin/projects');
    } catch (err) {
      const msg = err.response?.data?.details?.[0] || err.response?.data?.error || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/projects')}
          className="p-2 rounded-lg hover:bg-surface-hover text-text-muted transition-colors cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {isEdit ? 'Update project video, metadata, and tools' : 'Add a new project to your master portfolio'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title & Category */}
        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Star Excellent Academy Commercial"
                required
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="admin-input cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Short Tagline Description</label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              placeholder="High-energy commercial edit with kinetic typography and dynamic speed ramping."
              maxLength={500}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Full Narrative Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed breakdown of creative brief, editing techniques, pacing, and color science..."
              rows={4}
              className="admin-input resize-y"
            />
          </div>
        </div>

        {/* Media uploads & URLs */}
        <div className="admin-card space-y-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Video & Imagery Media</h3>

          <MediaField
            label="Main Project Video (16:9 Landscape)"
            field="videoUrl"
            accept="video/mp4,video/webm,video/quicktime"
            type="video"
            value={form.videoUrl}
            isUploading={uploading.videoUrl !== undefined}
            uploadPercent={uploading.videoUrl}
            onChange={handleChange}
            onUpload={handleFileUpload}
          />

          <MediaField
            label="Thumbnail / Poster Image"
            field="thumbnailUrl"
            accept="image/*"
            type="image"
            value={form.thumbnailUrl}
            isUploading={uploading.thumbnailUrl !== undefined}
            uploadPercent={uploading.thumbnailUrl}
            onChange={handleChange}
            onUpload={handleFileUpload}
          />

          <MediaField
            label="Vertical Reel / Mobile Cut (9:16 Portrait - Optional)"
            field="mobileVideoUrl"
            accept="video/mp4,video/webm"
            type="video"
            value={form.mobileVideoUrl}
            isUploading={uploading.mobileVideoUrl !== undefined}
            uploadPercent={uploading.mobileVideoUrl}
            onChange={handleChange}
            onUpload={handleFileUpload}
          />
        </div>

        {/* Technical specs & client details */}
        <div className="admin-card space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Production & Client Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Production Year</label>
              <input
                type="number"
                value={form.projectYear}
                onChange={(e) => handleChange('projectYear', parseInt(e.target.value) || '')}
                min={2000}
                max={2100}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Project Format / Type</label>
              <input
                type="text"
                value={form.projectType}
                onChange={(e) => handleChange('projectType', e.target.value)}
                placeholder="e.g. Commercial Ad, Music Video, Short Film"
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Client Name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="e.g. Star Excellent Academy"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Your Role on Timeline</label>
              <input
                type="text"
                value={form.devRole}
                onChange={(e) => handleChange('devRole', e.target.value)}
                placeholder="e.g. Lead Video Editor & Colorist"
                className="admin-input"
              />
            </div>
          </div>

          <div>
            <label className="admin-label">About the Client / Engagement</label>
            <textarea
              value={form.clientDescription}
              onChange={(e) => handleChange('clientDescription', e.target.value)}
              placeholder="Brief summary of client and creative objective..."
              rows={2}
              className="admin-input resize-y"
            />
          </div>
        </div>

        {/* Tools and Services */}
        <div className="admin-card space-y-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Software Stack & Services</h3>

          {/* Tools */}
          <div>
            <label className="admin-label">Software Tools Used</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                placeholder="Type tool name (e.g. DaVinci Resolve) and press Enter"
                className="admin-input flex-1"
              />
              <button type="button" onClick={addTool} className="admin-btn-secondary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {form.tools.map((tool) => (
                <span key={tool} className="badge bg-surface border border-border text-text-secondary flex items-center gap-1.5 py-1 px-3">
                  {tool}
                  <button type="button" onClick={() => removeTool(tool)} className="hover:text-danger cursor-pointer">
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Services Provided */}
          <div>
            <label className="admin-label">Services Provided</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                placeholder="Type service (e.g. Color Grading) and press Enter"
                className="admin-input flex-1"
              />
              <button type="button" onClick={addService} className="admin-btn-secondary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {form.servicesProvided.map((svc) => (
                <span key={svc} className="badge bg-surface border border-border text-text-secondary flex items-center gap-1.5 py-1 px-3">
                  {svc}
                  <button type="button" onClick={() => removeService(svc)} className="hover:text-danger cursor-pointer">
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="admin-card flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text-primary font-medium">Feature prominently on Homepage Hero</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="admin-btn-secondary flex-1 py-3 text-sm font-semibold"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="admin-btn-primary flex-1 py-3 text-sm font-semibold"
          >
            {saving ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish to Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
}
