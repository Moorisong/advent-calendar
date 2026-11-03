import { PROTECTED_SCREENS, SCREEN } from '../config/constants.js';
import { finishSignIn, getUser, subscribeToAuth } from '../data/auth.js';
import { todayInKorea } from '../utils/date.js';

import { attachEvents } from './events.js';
import { takeIntent } from './intent.js';
import { navigate } from './navigation.js';
import { render } from './render.js';
import { readRoute } from './routes.js';
import { state, translate } from './state.js';
import { installPixelFont } from '../ui/pixel-font.js';
import { snow } from '../ui/sprites.js';

function handleSessionChange(event, user) {
  if (event === 'SIGNED_OUT') {
    state.user = null;
    if (PROTECTED_SCREENS.has(state.route.page)) {
      void navigate(state.route, { replace: true });
    } else {
      render();
    }
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    state.user = user;
    if (state.route.page !== SCREEN.callback) {
      render();
    }
  }
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
      return takeIntent() ?? { page: SCREEN.landing };
    }
    state.user = await getUser();
    if (initialRoute.page === SCREEN.login && state.user) {
      return takeIntent() ?? { page: SCREEN.landing };
    }
    return initialRoute;
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
  await navigate(restored, { replace: true, scroll: false });
  window.addEventListener('popstate', () => {
    void navigate(readRoute(), { replace: true, scroll: false });
  });
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      return;
    }
    const today = todayInKorea();
    if (state.today !== today) {
      state.today = today;
      void navigate(state.route, { replace: true, scroll: false });
    }
  });
  window.addEventListener('resize', () => {
    const frame = window.matchMedia('(max-width:650px)').matches ? 'mobile' : 'desktop';
    const screen = document.querySelector('.solo');
    if (screen && !screen.classList.contains(frame)) {
      render();
    }
  });
}
