import { escapeHtml } from '../utils/format.js';

export function renderShareActions(state) {
  const { t, lang } = state;
  const kakao = [
    '<button class="kakao-share" data-action="kakao-share">',
    '<span aria-hidden="true">●</span> ',
    t('카카오톡으로 공유', 'Share via KakaoTalk'),
    '</button>',
  ].join('');
  const native = `<button class="share-utility" data-action="share">`
    + `<span aria-hidden="true">↗</span> ${t('다른 앱으로 공유', 'Other apps')}</button>`;
  const copy = `<button class="share-utility" data-action="copy">`
    + `<span aria-hidden="true">▣</span> ${t('링크 복사', 'Copy link')}</button>`;
  const main = lang === 'ko' ? kakao : native;
  const other = lang === 'ko' ? native : kakao;
  return [
    '<div class="share-actions">',
    main,
    '<div class="share-utilities">',
    other,
    copy,
    '</div></div>',
  ].join('');
}

export function renderPublicLink(url) {
  return `<div class="share-link url" title="${escapeHtml(url)}">`
    + `<span aria-hidden="true">🔗</span><span class="share-link-url">${escapeHtml(url)}</span></div>`;
}
