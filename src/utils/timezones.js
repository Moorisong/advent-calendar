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

const TIME_ZONE_COUNTRIES = {
  'Asia/Seoul': 'KR',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Manila': 'PH',
  'Asia/Jakarta': 'ID',
  'Asia/Kolkata': 'IN',
  'Asia/Dubai': 'AE',
  'Asia/Jerusalem': 'IL',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Zurich': 'CH',
  'Europe/Stockholm': 'SE',
  'Europe/Warsaw': 'PL',
  'Europe/Istanbul': 'TR',
  'Europe/Moscow': 'RU',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG',
};

const MULTI_ZONE_COUNTRIES = new Set(['US', 'CA', 'AU', 'RU', 'BR', 'MX', 'ID']);

export function timeZoneLabel(zone, lang = 'ko') {
  if (zone === 'UTC' || zone === 'Etc/UTC') {
    return 'UTC';
  }
  const locale = lang === 'en' ? 'en' : 'ko';
  const country = TIME_ZONE_COUNTRIES[zone];
  const city = zone.split('/').at(-1).replaceAll('_', ' ');
  if (!country) {
    return city;
  }
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(country);
  return MULTI_ZONE_COUNTRIES.has(country) ? `${countryName} · ${city}` : countryName;
}
