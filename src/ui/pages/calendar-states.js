import { btn } from '../chrome.js';
import { APP } from '../../config/constants.js';
import { escapeHtml } from '../../utils/format.js';
import { timeZoneLabel } from '../../utils/timezones.js';
import { renderCalendar } from '../calendar.js';
import { icon } from '../sprites.js';

export function renderVisitor(state) {
  return renderCalendar(state, 'visitor');
}

export function renderOwner(state) {
  return renderCalendar(state, 'owner');
}

export function renderEnded(state) {
  return renderCalendar(state, 'visitor', true);
}

export function renderLocked(state) {
  const { t, month, day } = state;
  return [
    renderCalendar(state, 'owner'),
    '<div class="shade"><div class="bubble"><div class="largeicon">',
    icon(3),
    `</div><h3>${t('아직 열 수 없는 서랍이야!', 'Not time to open this drawer yet!')}</h3>`,
    `<p>${month}${t('월 ', ' / ')}${day}${t('일에 다시 만나.', ' · Come back on this date.')}`,
    `<br>${escapeHtml(timeZoneLabel(state.calendar?.timezone ?? APP.timeZone, state.lang))}</p>`,
    btn(t('기다릴게!', 'I’ll be back!'), 'owner'),
    '</div></div>',
  ].join('');
}

export function renderTutorial(state) {
  const { t } = state;
  return [
    renderCalendar(state),
    '<div class="shade"><div class="bubble"><div class="spot">',
    '<button class="drawer" data-action="tutorial-close" aria-label="Close tutorial">12</button>',
    `</div><h3>${t('날짜를 콕, 마음을 쏙!', 'Pick a day. Tuck in some love.')}</h3>`,
    `<p>${t('날짜를 눌러 초콜릿을 남겨줘!', 'Tap a date to leave a chocolate.')}`,
    `<br>${t('오늘도, 미래의 날짜도 괜찮아.', 'Today or a future day — it’s up to you.')}</p>`,
    btn(t('알겠어!', 'Got it!'), 'visitor'),
    '</div></div>',
  ].join('');
}
