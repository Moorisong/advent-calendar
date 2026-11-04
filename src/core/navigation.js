import { PROTECTED_SCREENS, SCREEN } from '../config/constants.js';
import { findCalendar } from '../data/calendars.js';
import { getMessages } from '../data/messages.js';
import {
  calendarDate, canReadDate, getInitialMonth, isSeasonEnded, todayInZone, validCalendarDate,
} from '../utils/date.js';
import { readLocal, writeLocal } from '../utils/storage.js';

import { saveIntent } from './intent.js';
import { resolvePage } from './page-policy.js';
import { render } from './render.js';
import { isOwnerScreen, routeUrl } from './routes.js';
import { state, translate } from './state.js';

let navigationVersion = 0;

function updateHistory(route, replace) {
  const target = routeUrl(route);
  if (replace) {
    window.history.replaceState({ page: route.page }, '', target);
  } else if (window.location.pathname + window.location.search !== target) {
    window.history.pushState({ page: route.page }, '', target);
  }
}

function showError(message = translate('캘린더를 찾을 수 없어요.', 'Could not find this calendar.')) {
  state.route = { page: SCREEN.error, slug: null, date: null };
  state.error = message;
  render();
}

async function hydrateCalendar(route, version) {
  const matching = state.calendar?.slug === route.slug;
  if (!matching) {
    state.calendar = null;
    const loaded = await findCalendar(route.slug);
    if (navigationVersion !== version) {
      return false;
    }
    if (!loaded) {
      showError();
      return false;
    }
    state.calendar = loaded;
    if (!route.date) {
      state.month = getInitialMonth(todayInZone(loaded.timezone));
    }
  }
  return true;
}

export async function navigate(requested, { replace = false, scroll = true } = {}) {
  const version = ++navigationVersion;
  const initial = { page: requested.page, slug: requested.slug ?? null, date: requested.date ?? null };
  let route = initial;
  // Nonexistent send confirmations and invalid write dates are public visitor routes,
  // not login prompts; this check does not depend on the calendar's time zone.
  if (route.page === SCREEN.sent
    && (state.lastSent?.slug !== route.slug || state.lastSent?.date !== route.date)) {
    route = { ...route, page: SCREEN.visitor, date: null };
  }
  if (route.page === SCREEN.write && !validCalendarDate(route.date)) {
    route = { ...route, page: SCREEN.visitor, date: null };
  }
  if (PROTECTED_SCREENS.has(route.page) && !state.user) {
    saveIntent(route);
    route = { page: SCREEN.login, slug: null, date: null };
  }
  if (route.page === SCREEN.login && state.user) {
    route = { page: SCREEN.landing, slug: null, date: null };
  }
  state.route = route;
  state.loginError = route.page === SCREEN.login ? state.loginError : '';
  state.error = '';
  state.notes = [];
  state.readIndex = 0;
  if (route.date) {
    state.month = Number(route.date.slice(5, 7));
    state.day = Number(route.date.slice(8, 10));
  }
  if (route.slug) {
    state.loading = true;
    state.route = { ...route, page: SCREEN.loading };
    render();
    try {
      const found = await hydrateCalendar(route, version);
      if (!found || navigationVersion !== version) {
        return;
      }
    } catch (error) {
      if (navigationVersion !== version) {
        return;
      }
      console.error('Calendar fetch failed:', error);
      showError(translate('캘린더를 불러오지 못했어요.', 'Unable to load the calendar.'));
      return;
    } finally {
      if (navigationVersion === version) {
        state.loading = false;
      }
    }
  } else {
    state.calendar = null;
  }
  if (navigationVersion !== version) {
    return;
  }
  const zone = state.calendar?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  state.today = todayInZone(zone);
  route = resolvePage(route, state.today, state.lastSent);
  if (route.slug && isOwnerScreen(route.page) && state.calendar?.owner_id !== state.user?.id) {
    showError(translate('내 캘린더가 아니에요.', 'You cannot open this owner calendar.'));
    return;
  }
  if (route.page === SCREEN.created && state.calendar?.owner_id !== state.user?.id) {
    showError();
    return;
  }
  if (route.page === SCREEN.read) {
    try {
      state.notes = await getMessages(state.calendar.id, route.date);
      if (navigationVersion !== version) {
        return;
      }
      route = { ...route, page: state.notes.length ? SCREEN.read : SCREEN.empty };
    } catch (error) {
      if (navigationVersion !== version) {
        return;
      }
      console.error('Message read failed:', error);
      showError(translate('메시지를 불러오지 못했어요.', 'Could not read messages.'));
      return;
    }
  }
  if (navigationVersion !== version) {
    return;
  }
  state.route = route;
  updateHistory(route, replace);
  if (route.slug && route.page === SCREEN.visitor && !isSeasonEnded(state.today)) {
    const tutorialKey = `tutorial:${route.slug}`;
    const visited = readLocal(tutorialKey) === 'seen';
    if (!visited) {
      writeLocal(tutorialKey, 'seen');
      state.route = { ...route, page: SCREEN.tutorial };
    }
  }
  render();
  if (scroll) {
    window.scrollTo(0, 0);
  }
}

export function returnToCalendar() {
  const { slug } = state.route;
  return navigate({ page: SCREEN.visitor, slug });
}

export function ownerCalendar() {
  const { slug } = state.route;
  return navigate({ page: SCREEN.owner, slug });
}

export function openDrawer(day, role) {
  if (!Number.isInteger(day)) {
    return;
  }
  const date = calendarDate(state.month, day);
  if (!validCalendarDate(date)) {
    return;
  }
  const slug = state.calendar?.slug;
  if (!slug) {
    return;
  }
  if (role === 'ended') {
    return;
  }
  const page = role === 'owner'
    ? canReadDate(date, state.today) ? SCREEN.read : SCREEN.locked
    : SCREEN.write;
  return navigate({ page, slug, date });
}
