import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineUpload, HiOutlineX,
  HiOutlineFilm,
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
    <div>
      <label className="admin-label">{label}</label>
      {value ? (
        <div className="relative admin-card p-3">
          <div className="flex items-center gap-3">
            {type === 'image' ? (
              <img src={value} alt="" className="w-16 h-12 rounded object-cover" />
            ) : (
              <div className="w-16 h-12 rounded bg-surface flex items-center justify-center">
                <HiOutlineFilm className="w-6 h-6 text-text-muted" />
              </div>
            )}
            <p className="text-xs text-text-muted truncate flex-1">{value}</p>
            <button
              type="button"
              onClick={() => onChange(field, '')}
              className="p-1 rounded hover:bg-surface-hover text-text-muted cursor-pointer"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isUploading ? (
        <div className="admin-card p-4">
          <div className="w-full bg-surface rounded-full h-2 mb-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-center">{uploadPercent}% uploading...</p>
        </div>
      ) : (
        <label className="admin-card p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent/30 transition-colors">
          <HiOutlineUpload className="w-8 h-8 text-text-muted" />
          <span className="text-sm text-text-secondary">Click to upload or drag & drop</span>
          <span className="text-xs text-text-muted">{accept}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(field, e.target.files[0])}
          />
        </label>
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
        tools: project.tools || [],
        clientName: project.client_name || '',
        clientDescription: project.client_description || '',
        devRole: project.dev_role || '',
        servicesProvided: project.services_provided || [],
        projectYear: project.project_year || new Date().getFullYear(),
        projectType: project.project_type || '',
        featured: project.featured || false,
        published: project.published || false,
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
      toast.success('File uploaded');
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
      toast.error('Title is required');
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
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/projects')}
          className="p-2 rounded-lg hover:bg-surface-hover text-text-muted transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {isEdit ? 'Update project details' : 'Add a new project to your portfolio'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Project title"
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Category *</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="admin-input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="admin-label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Full project description..."
            rows={4}
            className="admin-input resize-y"
          />
        </div>

        <div>
          <label className="admin-label">Short Description</label>
          <input
            type="text"
            value={form.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            placeholder="One-line summary"
            maxLength={500}
            className="admin-input"
          />
        </div>

        {/* Media uploads */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Media</h3>
          <MediaField
            label="Video"
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
            label="Thumbnail"
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
            label="Mobile Video (9:16)"
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

        {/* Project details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Project Year</label>
            <input
              type="number"
              value={form.projectYear}
              onChange={(e) => handleChange('projectYear', parseInt(e.target.value) || '')}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Project Type</label>
            <input
              type="text"
              value={form.projectType}
              onChange={(e) => handleChange('projectType', e.target.value)}
              placeholder="e.g. Promotional Video"
              className="admin-input"
            />
          </div>
        </div>

        {/* Tools */}
        <div>
          <label className="admin-label">Tools</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
              placeholder="Add a tool (press Enter)"
              className="admin-input flex-1"
            />
            <button onClick={addTool} className="admin-btn-secondary">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tools.map((tool) => (
              <span key={tool} className="badge bg-surface-hover text-text-secondary flex items-center gap-1">
                {tool}
                <button onClick={() => removeTool(tool)} className="hover:text-danger">
                  <HiOutlineX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Client Work fields */}
        {form.category === 'Client Work' && (
          <div className="space-y-4 p-4 rounded-xl border border-border bg-surface-elevated/50">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Client Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Client Name</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="Client name"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Your Role</label>
                <input
                  type="text"
                  value={form.devRole}
                  onChange={(e) => handleChange('devRole', e.target.value)}
                  placeholder="e.g. Video Editor"
                  className="admin-input"
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Client Description</label>
              <textarea
                value={form.clientDescription}
                onChange={(e) => handleChange('clientDescription', e.target.value)}
                placeholder="About the client..."
                rows={2}
                className="admin-input resize-y"
              />
            </div>
            <div>
              <label className="admin-label">Services Provided</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  placeholder="Add a service (press Enter)"
                  className="admin-input flex-1"
                />
                <button onClick={addService} className="admin-btn-secondary">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.servicesProvided.map((svc) => (
                  <span key={svc} className="badge bg-surface-hover text-text-secondary flex items-center gap-1">
                    {svc}
                    <button onClick={() => removeService(svc)} className="hover:text-danger">
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text-secondary">Featured project</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="admin-btn-secondary flex-1"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="admin-btn-primary flex-1"
          >
            {saving ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
