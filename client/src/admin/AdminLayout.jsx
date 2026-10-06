import { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  HiOutlineViewGrid, HiOutlineFilm, HiOutlinePhotograph,
  HiOutlineCog, HiOutlineLogout, HiOutlineExternalLink,
  HiOutlineMenu, HiOutlineX, HiOutlineColorSwatch,
  HiOutlineUser, HiOutlineStar, HiOutlineCollection,
} from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: HiOutlineViewGrid, end: true },
  { type: 'divider', label: 'Content' },
  { label: 'Projects', to: '/admin/projects', icon: HiOutlineFilm },
  { label: 'Before/After', to: '/admin/before-after', icon: HiOutlineColorSwatch },
  { label: 'Showreel', to: '/admin/showreel', icon: HiOutlineStar },
  { label: 'Services', to: '/admin/services', icon: HiOutlineCollection },
  { label: 'About', to: '/admin/about', icon: HiOutlineUser },
  { label: 'Media Library', to: '/admin/media', icon: HiOutlinePhotograph },
  { type: 'divider', label: 'System' },
  { label: 'Settings', to: '/admin/settings', icon: HiOutlineCog },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          admin-sidebar fixed lg:static z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h1 className="text-lg font-display font-bold text-text-primary">Dev Anand</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-mono text-emerald-400">CMS ONLINE</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-hover text-text-muted"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={i} className="mt-5 mb-2 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 mb-0.5
                  ${isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
          <a
            href={import.meta.env.BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <HiOutlineExternalLink className="w-[18px] h-[18px]" />
            View Portfolio
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors w-full text-left"
          >
            <HiOutlineLogout className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"
          >
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-display font-bold text-text-primary">Dev Anand CMS</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
