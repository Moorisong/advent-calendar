export const timeZoneNow = (zone, lang = 'ko') => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ko-KR', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(new Date());
export const timeZoneOffset = (zone) => new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName').value.replace('GMT', 'UTC');
