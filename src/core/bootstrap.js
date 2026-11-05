import { PROTECTED_SCREENS, SCREEN } from '../config/constants.js';
import { finishSignIn, getUser, subscribeToAuth } from '../data/auth.js';
import { findMyCalendar } from '../data/calendars.js';
import { installPixelFont } from '../ui/pixel-font.js';
import { snow } from '../ui/sprites.js';
import { getInitialMonth, getSeasonYear, todayInZone } from '../utils/date.js';
import { deviceTimeZone } from '../utils/timezones.js';

import { attachEvents } from './events.js';
import { takeIntent } from './intent.js';
import { navigate } from './navigation.js';
import { render } from './render.js';
import { readRoute } from './routes.js';
import { state, translate } from './state.js';

function handleSessionChange(event, user) {
  if (event === 'SIGNED_OUT') {
    state.user = null;
    state.myCalendar = null;
    state.calendar = null;
    if (PROTECTED_SCREENS.has(state.route.page)) {
      void navigate(state.route, { replace: true });
    } else {
      render();
    }
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    const changed = state.user?.id !== user?.id;
    state.user = user;
    if (changed && state.route.page !== SCREEN.callback && state.route.page !== SCREEN.loading) {
      render();
    }
  }
}

async function resolveAccountRoute(route) {
  if (!state.user) {
    return route;
  }
  if (route.page !== SCREEN.landing) {
    return route;
  }
  state.myCalendar = await Promise.race([
    findMyCalendar(state.user.id),
    new Promise((_, reject) => setTimeout(() => reject(new Error('CALENDAR_LOOKUP_TIMEOUT')), 12000)),
  ]);
  if (state.myCalendar) {
    return { page: SCREEN.owner, slug: state.myCalendar.slug };
  }
  return route.page === SCREEN.landing ? { page: SCREEN.create } : route;
}

async function restoreSession(initialRoute) {
  try {
    if (initialRoute.page === SCREEN.callback) {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error_description') ?? url.searchParams.get('error');
      if (error) {
        throw new Error(error);
      }
      const code = url.searchParams.get('code');
      state.user = await finishSignIn(code);
      if (!state.user) {
        throw new Error('AUTHENTICATION_NOT_COMPLETED');
      }
      return await resolveAccountRoute(takeIntent() ?? { page: SCREEN.landing });
    }
    state.user = await getUser();
    if (initialRoute.page === SCREEN.login && state.user) {
      return await resolveAccountRoute(takeIntent() ?? { page: SCREEN.landing });
    }
    return await resolveAccountRoute(initialRoute);
  } catch (error) {
    console.error('Session initialization failed:', error);
    state.user = null;
    state.loginError = translate(
      '로그인을 완료하지 못했어요. 다시 시도해 줘.',
      'Sign-in could not finish. Please try again.',
    );
    return { page: SCREEN.login };
  }
}

export async function startApp() {
  installPixelFont();
  const ambiance = document.createElement('div');
  ambiance.className = 'ambient';
  ambiance.innerHTML = snow(28);
  document.body.prepend(ambiance);
  state.route = { page: SCREEN.loading };
  render();
  attachEvents();
  const initial = readRoute();
  const restored = await restoreSession(initial);
  subscribeToAuth(handleSessionChange);
  try {
    await navigate(restored, { replace: true, scroll: false });
  } catch (error) {
    console.error('Initial navigation failed:', error);
    state.route = { page: SCREEN.error, slug: null, date: null };
    state.error = translate('화면을 불러오지 못했어요. 새로고침해 주세요.', 'Could not load the page. Please refresh.');
    render();
  }
  window.addEventListener('popstate', () => {
    void navigate(readRoute(), { replace: true, scroll: false });
  });
  function checkOwnerDate() {
    const zone = state.calendar?.timezone ?? deviceTimeZone();
    const today = todayInZone(zone);
    if (state.today !== today) {
      const newYear = getSeasonYear(today);
      if (newYear !== getSeasonYear(state.today)) {
        state.year = newYear;
        state.month = getInitialMonth(today);
      }
      void navigate(state.route, { replace: true, scroll: false });
    }
  }
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkOwnerDate();
    }
  });
  window.addEventListener('focus', checkOwnerDate);
  window.setInterval(checkOwnerDate, 30_000);
  window.addEventListener('resize', () => {
    const frame = window.matchMedia('(max-width:650px)').matches ? 'mobile' : 'desktop';
    const screen = document.querySelector('.solo');
    if (screen && !screen.classList.contains(frame)) {
      render();
    }
  });
}
