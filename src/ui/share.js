import { escapeHtml } from '../utils/format.js';

export function renderShareActions(state) {
  const { t } = state;
  const kakao = [
    '<button class="kakao-share" data-action="kakao-share">',
    t('카카오톡으로 공유', 'Share via KakaoTalk'),
    '</button>',
  ].join('');
  const native = `<button class="share-utility" data-action="share">`
    + `${t('다른 앱으로 공유', 'Other apps')}</button>`;
  return [
    '<div class="share-actions">',
    kakao,
    native,
    '</div>',
  ].join('');
}

export function renderPublicLink(url) {
  return `<div class="share-link url" title="${escapeHtml(url)}">`
    + `<span class="share-link-url">${escapeHtml(url)}</span>`
    + '<button class="share-copy-icon" type="button" data-action="copy"'
    + ' aria-label="링크 복사 / Copy link" title="링크 복사 / Copy link">'
    + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"'
    + ' stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">'
    + '<rect x="8" y="8" width="12" height="12" rx="1"/>'
    + '<path d="M16 8V4H4v12h4"/>'
    + '</svg></button></div>';
}
