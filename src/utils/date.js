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

export function getSeasonYear(today = todayInKorea()) {
  const year = Number(today.slice(0, 4));
  return Math.max(APP.year, Number(today.slice(5, 7)) >= 11 ? year : year - 1);
}

export function calendarDate(month, day, year = APP.year) {
  return [String(year), String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

export function validCalendarDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  const matches = calendarDate(month, day, year) === date && year >= APP.year;
  const november = month === APP.firstMonth && day >= APP.firstDay && day <= 30;
  const december = month === APP.lastMonth && day >= 1 && day <= APP.lastDay;
  return matches && (november || december);
}

export function canReadDate(date, today = todayInKorea()) {
  return validCalendarDate(date) && date <= today;
}

export function canWriteDate(today = todayInKorea()) {
  const year = Number(today.slice(0, 4));
  return year >= APP.year && today >= `${year}-11-01` && today <= `${year}-12-25`;
}

export function canLeaveGiftOnDate(date, today = todayInKorea()) {
  return canWriteDate(today) && validCalendarDate(date)
    && date >= today && date.slice(0, 4) === today.slice(0, 4);
}

export function isSeasonEnded(today = todayInKorea()) {
  return !canWriteDate(today);
}

export function getInitialMonth(today = todayInKorea()) {
  const year = getSeasonYear(today);
  return today >= `${year}-12-01` ? APP.lastMonth : APP.firstMonth;
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
    return Array.from({ length: 30 }, (_, index) => APP.firstDay + index);
  }
  if (month === APP.lastMonth) {
    return Array.from({ length: APP.lastDay }, (_, index) => index + 1);
  }
  return [];
}
