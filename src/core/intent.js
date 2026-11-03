import { PROTECTED_SCREENS } from '../config/constants.js';
import { clearSession, readSession, writeSession } from '../utils/storage.js';

import { readRoute, routeUrl } from './routes.js';

const INTENT_STORAGE_KEY = 'return';

export function saveIntent(route) {
  if (PROTECTED_SCREENS.has(route.page)) {
    writeSession(INTENT_STORAGE_KEY, routeUrl(route));
  }
}

export function takeIntent() {
  const value = readSession(INTENT_STORAGE_KEY);
  clearSession(INTENT_STORAGE_KEY);
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }
    const route = readRoute(url);
    return PROTECTED_SCREENS.has(route.page) ? route : null;
  } catch {
    return null;
  }
}

export function clearIntent() {
  clearSession(INTENT_STORAGE_KEY);
}
