import { useSyncExternalStore } from 'react';

// Mobile = viewport narrower than Tailwind's `md` breakpoint (768px).
const QUERY = '(max-width: 767px)';

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// Server snapshot — the app is a client-only SPA, so default to desktop.
const getServerSnapshot = () => false;

/**
 * Reactively reports whether the viewport is in the mobile range. Single source
 * of truth for JS-side responsive logic (CSS uses `md:` utilities directly).
 */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
