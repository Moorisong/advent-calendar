import { APP, CHOCOLATES, SCREEN } from '../config/constants.js';
import { logout, signIn } from '../data/auth.js';
import { canWriteDate } from '../utils/date.js';
import { writeLocal } from '../utils/storage.js';

import { changeSelectedChocolate, shareCalendar, submitCalendar, submitMessage } from './actions.js';
import { clearIntent, takeIntent } from './intent.js';
import { navigate, openDrawer } from './navigation.js';
import { render, toast } from './render.js';
import { state, switchLanguage, translate } from './state.js';

async function handleProvider(provider) {
  if (state.signingIn) {
    return;
  }
  state.signingIn = true;
  state.loginError = '';
  render();
  try {
    await signIn(provider);
  } catch (error) {
    console.error('OAuth sign-in failed:', error);
    state.loginError = translate(
      '로그인을 시작할 수 없어요. 연결 설정을 확인해 줘.',
      'Could not start sign-in. Please check the connection.',
    );
  } finally {
    state.signingIn = false;
    render();
  }
}

async function handleAction(action) {
  const slug = state.calendar?.slug ?? state.route.slug;
  const navigations = {
    landing: { page: SCREEN.landing },
    create: { page: SCREEN.create },
    visitor: { page: SCREEN.visitor, slug },
    owner: { page: SCREEN.owner, slug },
    'tutorial-close': { page: SCREEN.visitor, slug },
  };
  if (Object.hasOwn(navigations, action)) {
    if (state.route.page === SCREEN.tutorial && slug) {
      writeLocal(`tutorial:${slug}`, 'seen');
    }
    await navigate(navigations[action]);
    return;
  }
  if (action === 'lang') {
    switchLanguage();
    render();
    return;
  }
  if (action === 'logout') {
    try {
      await logout();
      clearIntent();
      state.user = null;
      state.lastSent = null;
      await navigate({ page: SCREEN.landing });
    } catch (error) {
      console.error('Sign out failed:', error);
      toast(translate('로그아웃에 실패했어요.', 'Could not sign out.'));
    }
    return;
  }
  if (action === 'leave-login') {
    const intent = takeIntent();
    if (intent?.slug) {
      await navigate({ page: SCREEN.visitor, slug: intent.slug }, { replace: true });
    } else {
      clearIntent();
      await navigate({ page: SCREEN.landing }, { replace: true });
    }
    return;
  }
  if (['share', 'copy'].includes(action)) {
    await shareCalendar(action);
    return;
  }
  if (action === 'prev' || action === 'next') {
    const delta = action === 'next' ? 1 : -1;
    state.readIndex = (state.readIndex + delta + state.notes.length) % state.notes.length;
    render();
    return;
  }
  if (action === 'send' || action === 'submit-create') {
    // The enclosing form handles validation and submission.
    return;
  }
}

async function handleClick(event) {
  const button = event.target.closest('button');
  if (!button || button.disabled) {
    return;
  }
  if (button.dataset.oauth) {
    await handleProvider(button.dataset.oauth);
    return;
  }
  if (button.dataset.month !== undefined) {
    state.month = Number(button.dataset.month);
    render();
    return;
  }
  if (button.dataset.choco !== undefined) {
    const index = Number(button.dataset.choco);
    if (Number.isInteger(index) && index >= 0 && index < CHOCOLATES.length) {
      changeSelectedChocolate(index);
    }
    return;
  }
  if (button.dataset.day !== undefined) {
    const day = Number(button.dataset.day);
    const role = button.dataset.role;
    if (role === 'ended' || (role === 'visitor' && !canWriteDate(state.today))) {
      toast(translate('지금은 초콜릿을 남길 수 없어요.', 'Chocolate deliveries are closed right now.'));
      return;
    }
    await openDrawer(day, role);
    return;
  }
  if (button.dataset.action) {
    await handleAction(button.dataset.action);
  }
}

function handleInput(event) {
  if (event.target.name === 'message') {
    state.message = event.target.value.slice(0, APP.maximumMessageLength);
    const counter = document.getElementById('count');
    if (counter) {
      counter.textContent = String(state.message.length);
    }
  }
  if (event.target.name === 'nickname') {
    state.nicknameDraft = event.target.value;
  }
}

async function handleSubmit(event) {
  const form = event.target;
  if (!form.matches('[data-create],[data-write]')) {
    return;
  }
  event.preventDefault();
  if (form.matches('[data-create]')) {
    await submitCalendar(form);
  } else {
    await submitMessage(form);
  }
}

export function attachEvents() {
  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);
  document.addEventListener('submit', handleSubmit);
}
