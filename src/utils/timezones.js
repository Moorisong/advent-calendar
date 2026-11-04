import { APP } from '../config/constants.js';

export function validTimeZone(zone) {
  if (typeof zone !== 'string' || zone.length > 80) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function deviceTimeZone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return validTimeZone(detected) ? detected : APP.timeZone;
}

export function timeZoneOptions(selected = deviceTimeZone()) {
  const supported = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : [];
  return [...new Set([selected, APP.timeZone, 'UTC', ...supported])]
    .filter(validTimeZone)
    .sort((a, b) => a.localeCompare(b));
}
