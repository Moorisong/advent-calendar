import { APP } from '../config/constants.js';

import { icon } from './sprites.js';

export function btn(label, action, secondary = false) {
  const variant = secondary ? 'secondary' : 'primary';
  return `<button class="${variant}" data-action="${action}">${label}</button>`;
}

export function head(state) {
  const logout = state.user
    ? `<button class="language" data-action="logout">${state.t('로그아웃', 'Sign out')}</button>`
    : '';
  return [
    '<header class="apphead">',
    `<div class="brand">${icon(3)} advent.exe</div>`,
    '<div class="head-actions">',
    logout,
    `<button class="language" data-action="lang" aria-label="Change language">`,
    `${state.lang === 'ko' ? 'EN' : '한국어'}</button>`,
    '</div></header>',
  ].join('');
}

export function footer(state) {
  const timezone = state.calendar?.timezone;
  const label = state.t('날짜는 캘린더 주인의 시간대 기준이에요.',
    'Dates follow the calendar owner’s time zone.');
  return [
    `<footer class="fine">${state.year ?? APP.year}. 11. 01 — 12. 25<br>`,
    label,
    timezone ? ` · ${timezone}` : '',
    '</footer>',
  ].join('');
}
