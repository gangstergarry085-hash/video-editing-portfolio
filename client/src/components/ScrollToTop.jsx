import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that navigating between pages always starts at the top,
 * and navigating to an anchor hash (#section) scrolls smoothly.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow DOM to settle, then scroll to anchor
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    // Instantly reset scroll to top on page transitions
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}
