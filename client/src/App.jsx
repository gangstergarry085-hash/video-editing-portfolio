import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';

// Public core pages (eager loaded for instant first paint)
import PublicLayout from './pages/PublicLayout';
import HomePage from './pages/HomePage';

// Lazy-loaded routes for code splitting
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const LoginPage = lazy(() => import('./admin/LoginPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const ProjectsListPage = lazy(() => import('./admin/ProjectsListPage'));
const ProjectFormPage = lazy(() => import('./admin/ProjectFormPage'));
const BeforeAfterPage = lazy(() => import('./admin/BeforeAfterPage'));
const ShowreelPage = lazy(() => import('./admin/ShowreelPage'));
const ServicesPage = lazy(() => import('./admin/ServicesPage'));
const AboutPage = lazy(() => import('./admin/AboutPage'));
const SettingsPage = lazy(() => import('./admin/SettingsPage'));
const MediaLibraryPage = lazy(() => import('./admin/MediaLibraryPage'));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-text-muted text-xs font-mono tracking-wider">LOADING...</span>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Purge legacy multi-theme settings to enforce signature cinema master look
    try {
      localStorage.removeItem('dev_portfolio_theme');
      document.documentElement.removeAttribute('data-theme');

      // Purge any previously cached demo projects, before-after, and showreel from localStorage
      const purgeIfSample = (key, identifier) => {
        const val = localStorage.getItem(key);
        if (val && val.includes(identifier)) {
          localStorage.removeItem(key);
        }
      };
      purgeIfSample('dev_cms_projects', 'star-excellent-academy');
      purgeIfSample('dev_cms_before_after', 'ba-1');
      purgeIfSample('dev_cms_showreels', 'Official Showreel 2024-2025');
      purgeIfSample('dev_cms_media', 'showreel-poster.jpg');
    } catch {
      // ignore
    }
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:slug" element={<ProjectDetailPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsListPage />} />
              <Route path="projects/new" element={<ProjectFormPage />} />
              <Route path="projects/:id/edit" element={<ProjectFormPage />} />
              <Route path="before-after" element={<BeforeAfterPage />} />
              <Route path="showreel" element={<ShowreelPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="media" element={<MediaLibraryPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#F5F5F5',
              border: '1px solid #2A2A2A',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#1A1A1A' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1A1A1A' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
