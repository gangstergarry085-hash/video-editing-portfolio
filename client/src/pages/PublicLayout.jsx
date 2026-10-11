import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { aboutAPI, settingsAPI } from '../lib/api';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PublicLayout() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('dev_portfolio_settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [about, setAbout] = useState(() => {
    try {
      const cached = localStorage.getItem('dev_portfolio_about');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const glowRef = useRef(null);

  useEffect(() => {
    Promise.allSettled([settingsAPI.get(), aboutAPI.get()]).then(([sRes, aRes]) => {
      if (sRes.status === 'fulfilled' && sRes.value.data) {
        try {
          localStorage.setItem('dev_portfolio_settings', JSON.stringify(sRes.value.data));
        } catch {}
        setSettings(sRes.value.data);
      }
      if (aRes.status === 'fulfilled' && aRes.value.data) {
        try {
          localStorage.setItem('dev_portfolio_about', JSON.stringify(aRes.value.data));
        } catch {}
        setAbout(aRes.value.data);
      }
    });
  }, []);

  useEffect(() => {
    const glowEl = glowRef.current;
    if (!glowEl) return;

    let rafId;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let isVisible = false;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        glowEl.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      glowEl.style.opacity = '0';
    };

    const updateGlow = () => {
      // Smooth lerp following cursor without triggering any React component re-renders
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      glowEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(updateGlow);
    };

    rafId = requestAnimationFrame(updateGlow);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface relative selection:bg-accent selection:text-surface">
      {/* Subtle cursor ambient glow (pure GPU transform, 0 React re-renders) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-30 w-80 h-80 rounded-full hidden lg:block opacity-0 transition-opacity duration-300 will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.07) 0%, transparent 70%)',
        }}
      />

      <Navigation settings={settings} />
      <main className="relative z-10">
        <Outlet context={{ settings, about }} />
      </main>
      <Footer settings={settings} about={about} />
    </div>
  );
}
