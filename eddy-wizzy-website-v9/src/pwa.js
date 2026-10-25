import { useSyncExternalStore } from 'react';

// Install support. Browsers that allow it (Chrome, Edge, Samsung Internet on Android) fire
// "beforeinstallprompt"; we keep that event so the footer can offer an "Install app" button.
// iPhone Safari has no such event, so we show a short "Add to Home Screen" hint instead.
const listeners = new Set();
let deferred = null;
const isBrowser = typeof window !== 'undefined';
let installed = isBrowser && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
const isIos = isBrowser && /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const notify = () => listeners.forEach((listener) => listener());

if (isBrowser) {
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferred = event; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; installed = true; notify(); });
}

export function registerServiceWorker() {
  if (!isBrowser || !('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* the site works fine without it */ });
  });
}

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => (installed ? 'installed' : deferred ? 'prompt' : isIos ? 'ios' : 'none');

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribe, snapshot, () => 'none');
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* dismissed */ }
    deferred = null;
    notify();
  };
  return { state, install };
}
