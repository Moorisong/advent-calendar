import { APP, SCREEN } from '../config/constants.js';
import { head } from '../ui/chrome.js';
import { renderAuthLoading, renderError, renderLogin } from '../ui/pages/auth.js';
import { renderEnded, renderLocked, renderOwner, renderTutorial, renderVisitor } from '../ui/pages/calendar-states.js';
import { renderCreate, renderCreated, renderLanding } from '../ui/pages/intro.js';
import { renderEmpty, renderRead, renderSent, renderWrite } from '../ui/pages/messages.js';
import { isSeasonEnded } from '../utils/date.js';

import { getViewState, state } from './state.js';

const PAGES = Object.freeze({
  [SCREEN.callback]: renderAuthLoading,
  [SCREEN.loading]: renderAuthLoading,
  [SCREEN.landing]: renderLanding,
  [SCREEN.login]: renderLogin,
  [SCREEN.create]: renderCreate,
  [SCREEN.created]: renderCreated,
  [SCREEN.visitor]: renderVisitor,
  [SCREEN.owner]: renderOwner,
  [SCREEN.write]: renderWrite,
  [SCREEN.sent]: renderSent,
  [SCREEN.read]: renderRead,
  [SCREEN.locked]: renderLocked,
  [SCREEN.empty]: renderEmpty,
  [SCREEN.tutorial]: renderTutorial,
  [SCREEN.ended]: renderEnded,
  [SCREEN.error]: renderError,
});

export function render() {
  const root = document.getElementById('root');
  if (!root) {
    return;
  }
  const current = getViewState();
  document.documentElement.lang = current.lang;
  document.title = 'Dear Choco — A Sweet Little Christmas';
  const frame = window.matchMedia('(max-width:650px)').matches ? 'mobile' : 'desktop';
  const page = current.page === SCREEN.visitor && isSeasonEnded(current.today) ? SCREEN.ended : current.page;
  const selected = PAGES[page] ?? renderError;
  const contents = selected(current);
  root.innerHTML = [
    `<main class="solo ${frame}">`,
    `<section class="screen" data-screen="${page}">`,
    head(current),
    contents,
    '</section></main>',
  ].join('');
  if (current.page === SCREEN.write) {
    const textarea = document.getElementById('message');
    if (textarea) {
      textarea.value = state.message;
    }
  }
  if (current.page === SCREEN.create) {
    const input = document.querySelector('[name=nickname]');
    if (input) {
      input.value = state.nicknameDraft;
    }
  }
}

export function toast(message) {
  const area = document.getElementById('toast');
  if (!area) {
    return;
  }
  area.textContent = message;
  area.classList.remove('hidden');
  window.setTimeout(() => {
    if (area.textContent === message) {
      area.classList.add('hidden');
    }
  }, APP.toastMilliseconds);
}
