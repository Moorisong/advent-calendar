import { APP, CHOCOLATES } from '../../config/constants.js';
import { messageHtml, escapeHtml } from '../../utils/format.js';
import { adjacentReadableDate } from '../../utils/date.js';

import { btn } from '../chrome.js';
import { icon } from '../sprites.js';
import { renderPublicLink, renderShareActions } from '../share.js';

function renderBackHeading(t, heading, action) {
  const backLabel = t('캘린더로 돌아가기', 'Back to calendar');
  return [
    '<div class="write-title-row">',
    `<button type="button" class="write-back" data-action="${action}" aria-label="${backLabel}" title="${backLabel}">`,
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    '</button>',
    `<h2>${heading}</h2>`,
    '</div>',
  ].join('');
}

function renderDateHeading(state, heading) {
  const { t, route, today } = state;
  const previous = adjacentReadableDate(route.date, -1, today);
  const next = adjacentReadableDate(route.date, 1, today);
  const arrow = (direction, target, label) => [
    `<button type="button" class="write-back drawer-date-arrow" data-action="drawer-${direction}"`,
    ` aria-label="${label}" title="${label}"${target ? '' : ' disabled'}>`,
    direction === 'prev'
      ? '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
      : '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    '</button>',
  ].join('');
  return [
    '<div class="write-title-row owner-date-title">',
    arrow('prev', previous, t('이전 날짜', 'Previous date')),
    `<h2>${heading}</h2>`,
    arrow('next', next, t('다음 날짜', 'Next date')),
    '</div>',
  ].join('');
}

export function renderWrite(state) {
  const { t, lang, month, day, selected, nickname, myMessage } = state;
  const options = CHOCOLATES.map((choice, index) => {
    const active = index === selected;
    return [
      `<button type="button" class="choice ${active ? 'selected' : ''}"`,
      ` aria-pressed="${active}" data-choco="${index}">`,
      icon(index),
      escapeHtml(choice[lang]),
      '</button>',
    ].join('');
  }).join('');
  return [
    '<div class="content">',
    `<div class="kicker">FOR ${escapeHtml(nickname.toUpperCase())}</div>`,
    renderBackHeading(t, `${month}${t('월 ', ' / ')}${day}${t('일의 작은 선물', ' · A little gift')}`, 'visitor'),
    `<p class="sub">${t('초콜릿 하나에 마음을 담아줘.', 'Pick a chocolate. Add a little heart.')}</p>`,
    '<form class="form" data-write>',
    `<label>${t('초콜릿 고르기', 'Choose a chocolate')}</label>`,
    `<div class="choices">${options}</div>`,
    `<label for="message">${t('익명 메시지', 'Anonymous note')}</label>`,
    `<textarea maxlength="${APP.maximumMessageLength}" required name="message" id="message"`,
    ` placeholder="${t('추운 날에 생각나는 따뜻한 말을 남겨줘.', 'A little note to warm a winter day.')}">`,
    escapeHtml(state.message),
    '</textarea>',
    `<div class="counter"><span id="count">${state.message.length}</span> / ${APP.maximumMessageLength}</div>`,

    '<p class="fine">',
    t('한 사람당 이 캘린더의 날짜별로 한 개만 남길 수 있어요.',
      'One note per person for each date on this calendar.'),
    '</p>',
    btn(myMessage ? t('메시지 수정하기', 'Update my note')
      : t('초콜릿 남기기', 'Leave a chocolate'), 'send'),
    myMessage
      ? `<button type="button" class="textbtn" data-action="delete-message">${t('내 메시지 삭제', 'Delete my note')}</button>`
      : '',
    `<button type="button" class="textbtn" data-action="visitor">${t('캘린더로 돌아가기', 'Back to calendar')}</button>`,
    '</form></div>',
  ].join('');
}

export function renderSent(state) {
  const { t, selected, month, day } = state;
  return [
    '<div class="content success"><div class="largeicon">',
    icon(selected),
    '</div><div class="kicker">SEALED WITH SWEETNESS</div>',
    `<h2>${t('마음을 넣어두었어요!', 'A little love, tucked away!')}</h2>`,
    `<p class="sub">${t(`${month}월 ${day}일에 친구가 확인할 수 있습니다.`, `Your friend can read it on ${month}/${day}.`)}</p>`,
    btn(t('나도 캘린더 만들기', 'Make my own calendar'), 'create'),
    btn(t('캘린더로 돌아가기', 'Back to calendar'), 'visitor', true),
    '</div>',
  ].join('');
}

export function renderRead(state) {
  const { t, notes, month, day } = state;
  if (!notes.length) return renderEmpty(state);
  const visible = Math.min(notes.length, state.visibleNoteCount || 10);
  const cards = notes.slice(0, visible).map((note, index) => {
    const type = Number(note.chocolate_type);
    const name = CHOCOLATES[type]?.[state.lang] ?? '';
    return [
      '<article class="drawer-note-card">',
      '<div class="drawer-note-top">',
      `<span class="drawer-note-chocolate">${icon(type)}<span>${escapeHtml(name)}</span></span>`,
      `<span class="drawer-note-number">${index + 1} / ${notes.length}</span>`,
      '</div>',
      `<div class="drawer-note-body">${messageHtml(note.body)}</div>`,
      `<div class="drawer-note-from">${t('익명의 친구가', 'From an anonymous friend')}</div>`,
      '</article>',
    ].join('');
  }).join('');
  return [
    `<div class="content drawer-message-list"><span class="stamp">${month} / ${day} · ${t('오늘의 서랍', 'TODAY’S DRAWER')}</span>`,
    renderDateHeading(state, t('너에게 도착한 마음', 'A little love for you')),
    `<p class="drawer-message-count">${t(`이 날짜에 도착한 선물 ${notes.length}개`, `${notes.length} gifts received on this date`)}</p>`,
    `<div class="drawer-note-list">${cards}</div>`,
    visible < notes.length
      ? `<button type="button" class="drawer-load-more" data-action="notes-more">${t('메시지 10개 더 보기', 'Show 10 more messages')} <span>${visible} / ${notes.length}</span></button>`
      : '',
    `<div class="drawer-close-spacing">${btn(t('서랍 닫기', 'Close drawer'), 'owner', true)}</div>`,
    '</div>',
  ].join('');
}

export function renderEmpty(state) {
  const { t } = state;
  return [
    '<div class="content empty"><div class="largeicon">',
    icon(3),
    '</div>',
    `<div class="empty-drawer-date">${state.lang === 'en' ? `${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][state.month - 1]} ${state.day}` : `${state.month}/${state.day}`}</div>`,
    renderDateHeading(state, t('아직 조용한 서랍이야', 'A quiet little drawer')),
    `<p class="sub">${t('친구들에게 캘린더를 살짝 알려줘볼까?', 'Let your friends know about your calendar.')}</p>`,
    '<div class="empty-share-panel">',
    `<h3 class="empty-share-heading">${t('친구에게 캘린더 보내기', 'Send your calendar to friends')}</h3>`,
    renderPublicLink(`${typeof window === 'undefined' ? '' : window.location.origin}/c/${state.slug}`),
    renderShareActions(state),
    '</div>',
    `<div class="drawer-close-spacing">${btn(t('서랍 닫기', 'Close drawer'), 'owner', true)}</div>`,
    '</div>',
  ].join('');
}
