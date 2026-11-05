import { APP } from '../../config/constants.js';
import { escapeHtml } from '../../utils/format.js';
import { searchTimeZoneGroups, timeZoneLabel } from '../../utils/timezones.js';

import { timeZoneNow, timeZoneOffset } from '../../utils/timezone-clock.js';
import { renderBox } from '../calendar.js';
import { btn, footer } from '../chrome.js';
import { icon } from '../sprites.js';
import { renderPublicLink, renderShareActions } from '../share.js';

export function renderLanding(state) {
  const { t } = state;
  return [
    '<div class="desktop-layout"><div class="content hero-copy">',
    '<div class="kicker">A SWEET LITTLE CHRISTMAS</div>',
    `<h2>${t('친구들이 남긴 초콜릿,<br>매일 하나씩 열어봐!',
      'A little chocolate.<br>A little love.<br>Open a new day.')}</h2>`,
    `<p class="sub">${t('나만의 달력을 만들고 친구들에게 공유해봐.',
      'Create your calendar. Let friends fill it with anonymous notes.')}</p>`,
    btn(t('시작하기', 'Get Started'), 'create'),
    `<p class="fine">${t('처음이신가요? 이미 캘린더가 있나요? 로그인하면 이어서 이용할 수 있어요.', 'New here or already have a calendar? Sign in to continue.')}</p>`,
    '</div><div class="content">',
    renderBox(state, 'visitor', true),
    `<div class="sprig"><i class="star"></i>${icon(0)}<i class="star"></i></div>`,
    footer(state),
    '</div></div>',
  ].join('');
}

export function renderTimezoneResults(timezoneDraft, lang, queryText) {
  const query = String(queryText || '').trim().toLowerCase();
  const resultLang = lang === 'en' || (query && /^[a-z]/i.test(query)) ? 'en' : 'ko';
  const zones = (searchTimeZoneGroups(timezoneDraft, resultLang, query)).flatMap(group =>
    group.options.map(option => ({
      value: option.value,
      label: option.label === group.label ? group.label : group.label + ' - ' + option.label,
      search: (group.label + ' ' + option.label + ' ' + option.value + ' ' + option.value.replaceAll('_', ' ')).toLowerCase(),
    }))
  );
  const results = zones
    .slice(0, 40).map(zone =>
      '<button type="button" class="timezone-result" data-zone="' + escapeHtml(zone.value) + '">' +
      escapeHtml(zone.label) + ' <small>' + escapeHtml(timeZoneOffset(zone.value)) + '</small></button>'
    ).join('');
  return results;
}

export function renderCreate(state) {
  const { t, timezoneDraft } = state;
  const results = state.timezoneSearchOpen ? renderTimezoneResults(timezoneDraft, state.lang, state.timezoneQuery) : '';
  return [
    '<div class="content"><div class="sprig">',
    icon(3),
    '</div><div class="kicker">MADE JUST FOR YOU</div>',
    `<h2>${t('누구의 캘린더를<br>만들까요?', 'Who is this<br>calendar for?')}</h2>`,
    `<p class="sub">${t('친구들이 알아볼 이름을 적어줘.', 'Pick a name your friends will recognize.')}</p>`,
    '<form class="form" data-create>',
    `<label>${t('닉네임', 'Nickname')}`,
    `<input name="nickname" maxlength="${APP.maximumNicknameLength}" required`,
    ` placeholder="${t('예: 수진', 'e.g. Sujin')}"`,
    ' autocomplete="off"></label>',
    `<p class="counter">${t('최대 12자', 'Up to 12 characters')}</p>`,
    '<div class="timezone-setting">',
    '<label>' + t('캘린더 시간 설정', 'Calendar time setting') + '</label>',
    '<div class="timezone-clock"><span>' + t('현재 시간', 'Current time') + '</span>',
    '<strong data-timezone-clock>' + escapeHtml(timeZoneNow(timezoneDraft, state.lang)) + '</strong>',
    '<span>' + escapeHtml(timeZoneLabel(timezoneDraft, state.lang)) + ' · ' + escapeHtml(timeZoneOffset(timezoneDraft)) + '</span></div>',
    '<p class="fine">' + t('이 시간이 맞다면 그대로 진행해 주세요. 서랍은 이 시간대의 자정에 열려요.', 'If this time is correct, continue. Drawers open at midnight in this zone.') + '</p>',
    '<button type="button" class="timezone-change" data-action="timezone-toggle">' + t('시간이 달라요 · 변경하기', 'Wrong time? Change') + '</button>',
    '<div class="timezone-search-panel"' + (state.timezoneSearchOpen ? '' : ' hidden') + '>',
    '<label for="timezone-search">' + t('국가 또는 도시 검색', 'Search country or city') + '</label>',
    '<input id="timezone-search" type="search" autocomplete="off" placeholder="' + t('예: 미국, 뉴욕, Tokyo', 'e.g. USA, New York, Tokyo') + '" value="' + escapeHtml(state.timezoneQuery || '') + '">',
    '<div class="timezone-results">' + (results || '<p class="fine">' + t('검색 결과가 없어요.', 'No results.') + '</p>') + '</div>',
    '</div>',
    '<input type="hidden" name="timezone" value="' + escapeHtml(timezoneDraft) + '">',
    '</div>',
    btn(t('캘린더 만들기', 'Create calendar'), 'submit-create'),
    '</form>',
    `<p class="fine">${t('로그인한 계정으로 내 캘린더를 관리할 수 있어요.',
      'Manage your calendar with your signed-in account.')}</p>`,
    '</div>',
  ].join('');
}

export function renderCreated(state) {
  const { t, slug } = state;
  const publicUrl = `${window.location.origin}/c/${slug}`;
  return [
    '<div class="content"><div class="sprig largeicon">',
    icon(3),
    `</div><h2>${t('작은 우체국, 준비 완료!', 'Your little post office is ready!')}</h2>`,
    `<p class="sub">${t('친구들에게 초콜릿을 부탁해봐.', 'Invite your friends to leave a little sweetness.')}</p>`,
    renderPublicLink(publicUrl),
    renderShareActions(state),
    `<button class="textbtn" data-action="owner">${t('내 캘린더로 가기', 'Go to my calendar')}</button>`,
    '</div>',
  ].join('');
}
