import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineFilm,
  HiOutlinePencil,
} from 'react-icons/hi';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        projectsAPI.adminStats(),
        projectsAPI.adminList({ sort: 'newest' }),
      ]);
      setStats(statsRes.data);
      const rawProjects = projectsRes?.data;
      const projectsList = Array.isArray(rawProjects) ? rawProjects : (rawProjects?.projects || []);
      setRecentProjects(projectsList.slice(0, 5));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats?.total ?? 0, color: 'text-text-primary' },
    { label: 'Published', value: stats?.published ?? 0, color: 'text-success' },
    { label: 'Drafts', value: stats?.draft ?? 0, color: 'text-warning' },
    { label: 'Featured', value: stats?.featured ?? 0, color: 'text-info' },
    { label: 'Client Projects', value: stats?.client_projects ?? 0, color: 'text-accent' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Welcome back, Dev.</p>
        </div>
        <Link to="/admin/projects/new" className="admin-btn-primary">
          <HiOutlinePlus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="admin-card text-center">
            <p className={`text-3xl font-display font-bold ${card.color}`}>
              {card.value}
            </p>
            <p className="text-text-muted text-xs mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Projects</h2>
          <Link
            to="/admin/projects"
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            View All →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="admin-card text-center py-12">
            <HiOutlineFilm className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">THE TIMELINE IS EMPTY.</p>
            <p className="text-text-muted text-sm mt-1">Create your first project to get started.</p>
            <Link to="/admin/projects/new" className="admin-btn-primary mt-4 inline-flex">
              <HiOutlinePlus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        ) : (
          <div className="admin-card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3 hidden md:table-cell">Status</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-border/50 last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-surface"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center">
                            <HiOutlineFilm className="w-5 h-5 text-text-muted" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">{project.title}</p>
                          <p className="text-xs text-text-muted">
                            {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-xs text-text-secondary">{project.category}</span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={project.published ? 'badge-published' : 'badge-draft'}>
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                      {project.featured && (
                        <span className="badge-featured ml-2">Featured</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="inline-flex p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
