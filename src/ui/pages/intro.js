import { APP } from '../../config/constants.js';
import { escapeHtml } from '../../utils/format.js';

import { renderBox } from '../calendar.js';
import { btn, footer } from '../chrome.js';
import { icon } from '../sprites.js';

export function renderLanding(state) {
  const { t } = state;
  return [
    '<div class="desktop-layout"><div class="content hero-copy">',
    '<div class="kicker">A SWEET LITTLE CHRISTMAS</div>',
    `<h2>${t('친구들이 남긴 초콜릿,<br>매일 하나씩 열어봐!',
      'A little chocolate.<br>A little love.<br>Open a new day.')}</h2>`,
    `<p class="sub">${t('나만의 달력을 만들고 친구들에게 공유해봐.',
      'Create your calendar. Let friends fill it with anonymous notes.')}</p>`,
    btn(t('내 캘린더 만들기', 'Create my calendar'), 'create'),
    `<p class="fine">${t('카카오 또는 구글 로그인으로 시작해요.', 'Get started with Kakao or Google.')}</p>`,
    '</div><div class="content">',
    renderBox(state, 'visitor', true),
    `<div class="sprig"><i class="star"></i>${icon(0)}<i class="star"></i></div>`,
    footer(state),
    '</div></div>',
  ].join('');
}

export function renderCreate(state) {
  const { t } = state;
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
    `<div class="url">${escapeHtml(publicUrl)}</div>`,
    btn(t('친구용 링크 복사', 'Copy friend link'), 'copy'),
    btn(t('친구에게 공유', 'Share with friends'), 'share', true),
    '<div class="private">',
    `<h3>${t('나만의 관리 링크', 'Your private owner link')}</h3>`,
    `<p>${t('주인 화면으로 가는 바로가기예요.<br>로그인한 계정에서만 확인할 수 있어요.',
      'A shortcut to your owner calendar.<br>Only your signed-in account can access it.')}</p>`,
    btn(t('관리 링크 저장', 'Save owner link'), 'private', true),
    '</div>',
    `<button class="textbtn" data-action="owner">${t('내 캘린더로 가기', 'Go to my calendar')}</button>`,
    '</div>',
  ].join('');
}
