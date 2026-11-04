import { escapeHtml } from '../utils/format.js';

import { btn } from './chrome.js';

export function renderShareActions(state) {
  const { t, lang } = state;
  const kakao = [
    '<button class="kakao-share" data-action="kakao-share">',
    t('카카오톡으로 공유', 'Share via KakaoTalk'),
    '</button>',
  ].join('');
  const native = btn(t('다른 앱으로 공유', 'Share to other apps'), 'share', true);
  const copy = btn(t('친구용 링크 복사', 'Copy friend link'), 'copy', true);
  const actions = lang === 'ko' ? [kakao, native, copy] : [native, kakao, copy];
  return `<div class="share-actions">${actions.join('')}</div>`;
}

export function renderPublicLink(url) {
  return `<div class="url">${escapeHtml(url)}</div>`;
}
