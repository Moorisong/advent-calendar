import { APP } from '../config/constants.js';
import { calendarDate, calendarDays, drawerStatus } from '../utils/date.js';
import { escapeHtml } from '../utils/format.js';

import { btn, footer } from './chrome.js';
import { scene } from './sprites.js';

const PREVIEW_DAYS = Object.freeze(Array.from({ length: 15 }, (_, index) => index + 1));

export function renderBox(state, role = 'visitor', mini = false) {
  const days = mini ? PREVIEW_DAYS : calendarDays(state.month);
  const drawers = days.map((day) => {
    const date = calendarDate(state.month, day);
    const status = mini || role !== 'owner' ? '' : drawerStatus(date, state.today);
    const drawerClass = status === 'future' || status === 'invalid' ? '' : status;
    const todayLabel = status === 'today'
      ? `<small>${state.t('오늘', 'TODAY')}</small>`
      : '';
    const actionLabel = role === 'owner'
      ? state.t('서랍 열기', 'Open drawer')
      : state.t('초콜릿 남기기', 'Leave a chocolate');
    const ariaLabel = `${state.month}${state.t('월 ', ' / ')}${day}${state.t('일', '')} · ${actionLabel}`;
    return [
      `<button class="drawer ${drawerClass}" data-day="${day}" data-role="${role}"`,
      ` aria-label="${escapeHtml(ariaLabel)}"${mini ? ' tabindex="-1"' : ''}>`,
      String(day),
      todayLabel,
      '</button>',
    ].join('');
  }).join('');
  const baseLabel = mini
    ? 'WITH LOVE, FOR YOU'
    : state.month === APP.firstMonth ? 'NOVEMBER · 2026' : 'DECEMBER · 2026';
  return [
    `<div class="${mini ? 'mini' : ''}">`,
    scene(),
    '<div class="box"><div class="ribbon"><i class="star"></i>',
    ' MERRY CHRISTMAS <i class="star"></i></div>',
    `<div class="grid">${drawers}</div>`,
    `<div class="base">${baseLabel}</div></div></div>`,
  ].join('');
}

export function renderCalendar(state, role = 'visitor', ended = false) {
  const { t, month, lang, nickname } = state;
  const title = lang === 'ko'
    ? `${nickname}의 초콜릿 캘린더`
    : `${nickname}’s chocolate calendar`;
  const subtitle = ended
    ? t('올해의 초콜릿 배달이 끝났어요.', 'This year’s chocolate deliveries have ended.')
    : role === 'owner'
      ? t('오늘의 서랍을 열어볼까?', 'Shall we open today’s drawer?')
      : t('날짜를 골라 초콜릿과 메시지를 남겨줘!', 'Pick a date. Leave a chocolate and a note!');
  const stamp = role === 'owner'
    ? `<span class="stamp">${t('오늘', 'TODAY')} · ${state.today.slice(5)} · KST</span>`
    : '';
  const callToAction = role === 'owner'
    ? btn(t('친구에게 링크 공유', 'Share with friends'), 'share')
      + btn(t('새 캘린더 만들기', 'Create another calendar'), 'create', true)
    : btn(t('나도 캘린더 만들기', 'Make my own calendar'), 'create', true);
  return [
    '<div class="calendar-layout">',
    '<div class="content calendar-intro">',
    `<div class="kicker">${role === 'owner' ? 'YOUR CHOCOLATE POST OFFICE' : 'A LITTLE CHOCOLATE'}</div>`,
    `<h2>${escapeHtml(title)}</h2><p class="sub">${subtitle}</p>${stamp}</div>`,
    '<div class="content"><div class="tabs">',
    `<button data-month="11" class="${month === 11 ? 'on' : ''}" aria-pressed="${month === 11}">`,
    `${t('11월', 'November')}</button>`,
    `<button data-month="12" class="${month === 12 ? 'on' : ''}" aria-pressed="${month === 12}">`,
    `${t('12월', 'December')}</button></div>`,
    renderBox(state, ended ? 'ended' : role),
    callToAction,
    footer(state),
    `<div class="ad">${t('광고 영역', 'ADVERTISEMENT')}</div>`,
    '</div></div>',
  ].join('');
}
