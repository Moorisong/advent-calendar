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

// Keep the native device time zone as the default; group choices by country.
export function timeZoneOptions(selected = deviceTimeZone()) {
  const supported = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : [];
  return [...new Set([selected, APP.timeZone, 'UTC', ...supported])]
    .filter(validTimeZone);
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

const CITY_NAMES = {
  'America/New_York': ['뉴욕', 'New York'],
  'America/Chicago': ['시카고', 'Chicago'],
  'America/Denver': ['덴버', 'Denver'],
  'America/Los_Angeles': ['로스앤젤레스', 'Los Angeles'],
  'America/Phoenix': ['피닉스', 'Phoenix'],
  'America/Anchorage': ['앵커리지', 'Anchorage'],
  'Pacific/Honolulu': ['호놀룰루', 'Honolulu'],
  'America/Toronto': ['토론토', 'Toronto'],
  'America/Vancouver': ['밴쿠버', 'Vancouver'],
  'Australia/Sydney': ['시드니', 'Sydney'],
  'Australia/Melbourne': ['멜버른', 'Melbourne'],
  'Australia/Perth': ['퍼스', 'Perth'],
  'America/Sao_Paulo': ['상파울루', 'São Paulo'],
  'America/Mexico_City': ['멕시코시티', 'Mexico City'],
  'Asia/Jakarta': ['자카르타', 'Jakarta'],
};

export function timeZoneGroups(selected = deviceTimeZone(), lang = 'ko') {
  const locale = lang === 'en' ? 'en' : 'ko';
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const groups = new Map();
  for (const zone of timeZoneOptions(selected)) {
    const country = TIME_ZONE_COUNTRIES[zone] ?? (zone === 'UTC' ? 'UTC' : 'OTHER');
    if (!groups.has(country)) groups.set(country, []);
    groups.get(country).push(zone);
  }
  const title = (code) => code === 'UTC' ? 'UTC'
    : code === 'OTHER' ? (lang === 'en' ? 'Other regions' : '기타 지역')
      : names.of(code);
  const ordered = [...groups].sort(([a], [b]) => {
    if (a === 'UTC') return 1;
    if (b === 'UTC') return -1;
    if (a === 'OTHER') return 1;
    if (b === 'OTHER') return -1;
    if (a === 'KR') return -1;
    if (b === 'KR') return 1;
    return title(a).localeCompare(title(b), locale);
  });
  return ordered.map(([code, zones]) => ({
    label: title(code),
    options: zones.sort((a, b) => timeZoneLabel(a, lang).localeCompare(timeZoneLabel(b, lang), locale))
      .map((zone) => ({
        value: zone,
        label: code === 'UTC' ? 'UTC'
          : code === 'OTHER' ? zone.replaceAll('_', ' ')
            : MULTI_ZONE_COUNTRIES.has(code)
              ? (CITY_NAMES[zone]?.[lang === 'en' ? 1 : 0] ?? zone.split('/').at(-1).replaceAll('_', ' '))
              : title(code),
      })),
  }));
}

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
