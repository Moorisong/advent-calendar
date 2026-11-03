import { SCREEN } from '../config/constants.js';
import { validCalendarDate } from '../utils/date.js';

const SLUG_PATTERN = '[a-z0-9]{16}';
const CALENDAR_PATTERN = new RegExp(`^/c/(${SLUG_PATTERN})(?:/([a-z-]+))?$`);
const ROUTE_TO_SCREEN = Object.freeze({
  '': SCREEN.visitor,
  created: SCREEN.created,
  write: SCREEN.write,
  sent: SCREEN.sent,
  owner: SCREEN.owner,
  read: SCREEN.read,
  empty: SCREEN.empty,
  locked: SCREEN.locked,
  tutorial: SCREEN.tutorial,
});
const SCREEN_TO_ROUTE = Object.freeze(Object.fromEntries(
  Object.entries(ROUTE_TO_SCREEN).map(([suffix, screen]) => [screen, suffix]),
));

export function readRoute(url = new URL(window.location.href)) {
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/') {
    return { page: SCREEN.landing, slug: null, date: null };
  }
  if (pathname === '/login') {
    return { page: SCREEN.login, slug: null, date: null };
  }
  if (pathname === '/auth/callback') {
    return { page: SCREEN.callback, slug: null, date: null };
  }
  if (pathname === '/create') {
    return { page: SCREEN.create, slug: null, date: null };
  }
  const match = pathname.match(CALENDAR_PATTERN);
  if (!match) {
    return { page: SCREEN.error, slug: null, date: null };
  }
  const suffix = match[2] ?? '';
  const page = ROUTE_TO_SCREEN[suffix] ?? SCREEN.error;
  const date = url.searchParams.get('date');
  return {
    page,
    slug: match[1],
    date: validCalendarDate(date) ? date : null,
  };
}

export function routeUrl(route) {
  if (route.page === SCREEN.landing) {
    return '/';
  }
  if (route.page === SCREEN.login) {
    return '/login';
  }
  if (route.page === SCREEN.callback) {
    return '/auth/callback';
  }
  if (route.page === SCREEN.create) {
    return '/create';
  }
  const suffix = SCREEN_TO_ROUTE[route.page];
  if (!route.slug || suffix === undefined || !new RegExp(`^${SLUG_PATTERN}$`).test(route.slug)) {
    return '/';
  }
  const clean = suffix ? `/${suffix}` : '';
  const date = validCalendarDate(route.date) ? `?date=${route.date}` : '';
  return `/c/${route.slug}${clean}${date}`;
}

export function isOwnerScreen(page) {
  return [SCREEN.owner, SCREEN.read, SCREEN.empty, SCREEN.locked].includes(page);
}
