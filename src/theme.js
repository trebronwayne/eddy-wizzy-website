import { useSyncExternalStore } from 'react';

// Theme model: visitors follow their device setting until they press the toggle.
// After that their choice is remembered. "Match system" clears the choice again.
const KEY = 'ew-theme';
const COLORS = { dark: '#14171a', light: '#e8ecf1' };
const listeners = new Set();
const query = () => window.matchMedia('(prefers-color-scheme: dark)');

function readStored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

let explicit = typeof window === 'undefined' ? null : readStored();

const systemTheme = () => (query().matches ? 'dark' : 'light');
const current = () => explicit ?? systemTheme();

function apply(animate) {
  const root = document.documentElement;
  const theme = current();
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 450);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', COLORS[theme]);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  const media = query();
  // Keep following the device while the visitor has not chosen a theme.
  const onSystemChange = () => {
    if (explicit === null) {
      apply(true);
      notify();
    }
  };
  media.addEventListener('change', onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', onSystemChange);
  };
}

export function setTheme(next) {
  explicit = next;
  try {
    if (next) localStorage.setItem(KEY, next);
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: the choice simply lasts for this visit */
  }
  apply(true);
  notify();
}

// The snapshot includes whether the visitor has chosen a theme, so the footer label updates too.
const snapshot = () => `${current()}:${explicit === null ? 'system' : 'chosen'}`;

export function useTheme() {
  const [theme, mode] = useSyncExternalStore(subscribe, snapshot, () => 'dark:system').split(':');
  return {
    theme,
    followsSystem: mode === 'system',
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    matchSystem: () => setTheme(null),
  };
}
