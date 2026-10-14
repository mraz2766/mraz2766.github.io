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

  const toggleTheme = useCallback(() => {
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
  }, []);

  return { theme, toggleTheme };
}
