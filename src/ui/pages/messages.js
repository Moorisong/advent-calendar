import { APP, CHOCOLATES } from '../../config/constants.js';
import { messageHtml, escapeHtml } from '../../utils/format.js';

import { btn } from '../chrome.js';
import { icon } from '../sprites.js';

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
    `<div class="content"><div class="kicker">FOR ${escapeHtml(nickname.toUpperCase())}</div>`,
    `<h2>${month}${t('월 ', ' / ')}${day}${t('일의 작은 선물', ' · A little gift')}</h2>`,
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
  const { t, selected } = state;
  return [
    '<div class="content success"><div class="largeicon">',
    icon(selected),
    '</div><div class="kicker">SEALED WITH SWEETNESS</div>',
    `<h2>${t('마음을 넣어두었어요!', 'A little love, tucked away!')}</h2>`,
    `<p class="sub">${t('선택한 날, 친구에게 달콤한 선물이 될 거예요.', 'A sweet surprise for your friend, on the day you picked.')}</p>`,
    btn(t('나도 캘린더 만들기', 'Make my own calendar'), 'create'),
    btn(t('캘린더로 돌아가기', 'Back to calendar'), 'visitor', true),
    '</div>',
  ].join('');
}

export function renderRead(state) {
  const { t, notes, readIndex, month, day } = state;
  const note = notes[readIndex];
  if (!note) {
    return renderEmpty(state);
  }
  const type = Number(note.chocolate_type);
  return [
    `<div class="content"><span class="stamp">${month} / ${day} · ${t('오늘의 서랍', 'TODAY’S DRAWER')}</span>`,
    `<h2>${t('너에게 도착한 마음', 'A little love for you')}</h2>`,
    `<div class="largeicon">${icon(type)}</div>`,
    `<div class="note">${messageHtml(note.body)}`,
    `<div class="from">${t('익명의 친구가', 'From an anonymous friend')}</div></div>`,
    '<div class="paging">',
    '<button data-action="prev" aria-label="Previous note">←</button>',
    `<span>${readIndex + 1} / ${notes.length}</span>`,
    '<button data-action="next" aria-label="Next note">→</button>',
    '</div>',
    btn(t('서랍 닫기', 'Close drawer'), 'owner', true),
    '</div>',
  ].join('');
}

export function renderEmpty(state) {
  const { t } = state;
  return [
    '<div class="content empty"><div class="largeicon">',
    icon(3),
    `</div><h2>${t('아직 조용한 서랍이야', 'A quiet little drawer')}</h2>`,
    `<p class="sub">${t('친구들에게 캘린더를 살짝 알려줘볼까?', 'Let your friends know about your calendar.')}</p>`,
    btn(t('친구에게 링크 공유', 'Share with friends'), 'share'),
    btn(t('서랍 닫기', 'Close drawer'), 'owner', true),
    '</div>',
  ].join('');
}
