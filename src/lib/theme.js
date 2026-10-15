import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mraz-theme';
const listeners = new Set();

function getSnapshot() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * The site is a dark room by default; the header toggle switches to a light
 * room, remembered per browser (index.html applies it before first paint).
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'dark');

  const toggleTheme = useCallback((event) => {
    const apply = () => {
      const next = getSnapshot() === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.dataset.theme = 'light';
        try { localStorage.setItem(STORAGE_KEY, 'light'); } catch { /* ignore */ }
      } else {
        delete document.documentElement.dataset.theme;
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      }

      listeners.forEach((listener) => listener());
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      apply();
      return;
    }

    // Circular reveal growing out of the toggle (View Transitions API).
    const x = event?.clientX ?? window.innerWidth - 40;
    const y = event?.clientY ?? 30;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const root = document.documentElement;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${radius}px`);
    root.classList.add('theme-transition');
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => root.classList.remove('theme-transition'));
  }, []);

  return { theme, toggleTheme };
}
