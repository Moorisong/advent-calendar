import { readLocal, readSession, writeLocal } from './storage.js';

export function languageForLocale(locale) {
  const primary = typeof locale === 'string'
    ? locale.trim().split(/[-_]/, 1)[0].toLowerCase()
    : '';
  return primary === 'ko' ? 'ko' : 'en';
}

export function initialLanguage() {
  const saved = readLocal('lang');
  if (saved === 'ko' || saved === 'en') return saved;

  // Preserve language choices made before persistent preferences were introduced.
  const previous = readSession('lang');
  if (previous === 'ko' || previous === 'en') {
    writeLocal('lang', previous);
    return previous;
  }

  const browser = globalThis.navigator;
  return languageForLocale(browser?.languages?.[0] || browser?.language);
}
