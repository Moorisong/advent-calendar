import { APP } from '../config/constants.js';
import { calendarDate, calendarDays, canWriteDate, drawerStatus } from '../utils/date.js';
import { escapeHtml } from '../utils/format.js';

import { btn, footer } from './chrome.js';
import { scene } from './sprites.js';
import { renderPublicLink, renderShareActions } from './share.js';
import { renderCalendarDeletion } from './delete-calendar.js';
import { renderRetentionBanner } from './retention-banner.js';

const PREVIEW_DAYS = Object.freeze(Array.from({ length: 15 }, (_, index) => index + 1));

export function renderBox(state, role = 'visitor', mini = false) {
  const days = mini ? PREVIEW_DAYS : calendarDays(state.month);
  const drawers = days.map((day) => {
    const date = calendarDate(state.month, day, state.year ?? APP.year);
    const status = mini ? '' : drawerStatus(date, state.today);
    const drawerClass = status === 'future' || status === 'invalid' ? '' : status;
    const todayLabel = status === 'today'
      ? `<small>${state.t('오늘', 'TODAY')}</small>`
      : '';
    const actionLabel = role === 'owner'
      ? state.t('서랍 열기', 'Open drawer')
      : state.t('초콜릿 남기기', 'Leave a chocolate');
    const ariaLabel = `${state.month}${state.t('월 ', ' / ')}${day}${state.t('일', '')} · ${actionLabel}`;
    if (mini) {
      return `<span class="drawer" aria-hidden="true">${day}</span>`;
    }
    return [
      `<button class="drawer ${drawerClass}" data-day="${day}" data-role="${role}"`,
      ` aria-label="${escapeHtml(ariaLabel)}">`,
      String(day),
      todayLabel,
      '</button>',
    ].join('');
  }).join('');
  const baseLabel = mini
    ? 'WITH LOVE, FOR YOU'
    : `${state.month === APP.firstMonth ? 'NOVEMBER' : 'DECEMBER'} · ${state.year ?? APP.year}`;
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
    ? `<span class="calendar-title-line">${escapeHtml(nickname)}의</span>`
      + '<span class="calendar-title-line">초콜릿 캘린더</span>'
    : `${escapeHtml(nickname)}’s chocolate calendar`;
  const seasonOpen = canWriteDate(state.today);
  const viewingArchive = (state.year ?? APP.year) !== Number(state.today.slice(0, 4));
  const subtitle = ended || (role === 'owner' && (!seasonOpen || viewingArchive))
    ? t('초콜릿 배달은 쉬고 있어. 받은 마음은 언제든 다시 열어봐.',
      'Deliveries are closed. Your sweet notes are here to revisit.')
    : role === 'owner'
      ? t('오늘의 서랍을 열어볼까?', 'Shall we open today’s drawer?')
      : t('달력에서 날짜를 고르고 초콜릿을 선택해 메시지를 남겨줘. 그날이 되면 친구가 열어볼 수 있어!',
        'Pick a date, choose a chocolate, and leave a note. Your friend can open it on that day!');
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const publicUrl = `${origin}/c/${state.slug}`;
  const shareTools = role === 'owner'
    ? [
      '<div class="share-backdrop" data-action="close-share" aria-hidden="true"></div>',
      '<section class="owner-share" id="owner-share" aria-label="Share calendar">',
      '<button class="share-close" type="button" data-action="close-share"',
      ` aria-label="${t('닫기', 'Close')}">×</button>`,
      `<h3 class="share-heading">${t('친구들에게 초콜릿 부탁하기', 'Invite your friends')}</h3>`,
      `<p class="share-description">${t('링크를 보내고 달콤한 메시지를 받아봐.',
        'Share your link to collect sweet messages.')}</p>`,
      renderPublicLink(publicUrl),
      renderShareActions(state),
      '</section>',
    ].join('')
    : '';
  const callToAction = btn(t('나도 캘린더 만들기', 'Make my own calendar'), 'create', true);
  const yearLabel = role === 'owner'
    ? `<div class="calendar-year-picker"><span>${t('캘린더 연도', 'Calendar year')}</span>`
      + `<span class="calendar-year-value">${state.year ?? APP.year}</span></div>`
    : '';
  const deletion = role === 'owner' ? renderCalendarDeletion(state) : '';
  const shareTrigger = role === 'owner'
    ? `<button class="mobile-share-trigger" type="button" data-action="open-share"`
      + ` aria-controls="owner-share" aria-expanded="false">`
      + `${t('친구에게 공유하기', 'Share with friends')}</button>`
    : '';
  return [
    `<div class="calendar-layout ${role === 'owner' ? 'owner-layout' : 'visitor-layout'}">`,
    '<div class="content calendar-intro">',
    `<div class="kicker">${role === 'owner' ? 'YOUR CHOCOLATE POST OFFICE' : 'A LITTLE CHOCOLATE'}</div>`,
    '<h2 class="calendar-heading">',
    `<span class="calendar-heading-text">${title}</span>`,
    '<span class="calendar-heading-gift" aria-hidden="true"></span></h2>',
    `<p class="sub">${role === 'visitor' && !ended ? subtitle.replace('. ', '.<br>') : subtitle}</p>`,
    role === 'owner' ? renderRetentionBanner(state) : '',
    '</div>',
    '<div class="content calendar-main">',
    yearLabel,
    '<div class="tabs">',
    `<button data-month="11" class="${month === 11 ? 'on' : ''}" aria-pressed="${month === 11}">`,
    `${t('11월', 'November')}</button>`,
    `<button data-month="12" class="${month === 12 ? 'on' : ''}" aria-pressed="${month === 12}">`,
    `${t('12월', 'December')}</button></div>`,
    renderBox(state, ended ? 'ended' : role),
    role === 'visitor' ? `<div class="visitor-create-action">${callToAction}</div>` : '',
    footer(state),
    `<div class="ad">${t('광고 영역', 'ADVERTISEMENT')}</div>`,
    deletion,
    '</div>',
    role === 'owner' ? `<aside class="owner-sidebar">${shareTools}</aside>` : '',
    shareTrigger,
    '</div>',
  ].join('');
}
