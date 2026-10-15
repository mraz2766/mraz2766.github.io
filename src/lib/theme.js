import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mraz-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set();

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getSnapshot() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function subscribe(callback) {
  listeners.add(callback);
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', callback);
  return () => {
    listeners.delete(callback);
    query.removeEventListener('change', callback);
  };
}

/**
 * Light / dark theme. Follows the system until the visitor picks one; the
 * choice is remembered per browser (index.html applies it before paint).
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light');

  const toggleTheme = useCallback((event) => {
    const apply = () => {
      const next = getSnapshot() === 'dark' ? 'light' : 'dark';
      const systemTheme = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

      // Choosing the system's own theme clears the override, so the site keeps
      // following the OS afterwards.
      if (next === systemTheme && readStored() !== null) {
        delete document.documentElement.dataset.theme;
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      } else {
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
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
