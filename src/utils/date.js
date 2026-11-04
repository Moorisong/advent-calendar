import { APP } from '../config/constants.js';

export function todayInZone(timeZone = APP.timeZone, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayInKorea(date = new Date()) {
  return todayInZone(APP.timeZone, date);
}

export function calendarDate(month, day) {
  return [String(APP.year), String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

export function validCalendarDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  const matches = calendarDate(month, day) === date && year === APP.year;
  const november = month === APP.firstMonth && day >= APP.firstDay && day <= 30;
  const december = month === APP.lastMonth && day >= 1 && day <= APP.lastDay;
  return matches && (november || december);
}

export function canReadDate(date, today = todayInKorea()) {
  return validCalendarDate(date) && date <= today;
}

export function canWriteDate(today = todayInKorea()) {
  return today >= APP.startDate && today <= APP.endDate;
}

export function isSeasonEnded(today = todayInKorea()) {
  return today > APP.endDate;
}

export function getInitialMonth(today = todayInKorea()) {
  return today.startsWith(`${APP.year}-${APP.lastMonth}`) ? APP.lastMonth : APP.firstMonth;
}

export function drawerStatus(date, today = todayInKorea()) {
  if (!validCalendarDate(date)) {
    return 'invalid';
  }
  if (date > today) {
    return 'future';
  }
  if (date === today) {
    return 'today';
  }
  return 'past';
}

export function calendarDays(month) {
  if (month === APP.firstMonth) {
    return Array.from({ length: 26 }, (_, index) => APP.firstDay + index);
  }
  if (month === APP.lastMonth) {
    return Array.from({ length: APP.lastDay }, (_, index) => index + 1);
  }
  return [];
}
