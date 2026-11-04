import { getSeasonYear } from '../utils/date.js';

export function renderRetentionBanner(state) {
  const today = state.today;
  const month = Number(today.slice(5, 7));
  // During October, the previous season's messages have already expired.
  if (month === 10) {
    return '';
  }
  const seasonYear = getSeasonYear(today);
  const deletionYear = seasonYear + 1;
  const { t } = state;
  return [
    '<aside class="retention-banner" aria-label="Message retention notice">',
    '<span class="retention-banner-icon" aria-hidden="true">✉</span>',
    '<div class="retention-banner-copy">',
    `<strong>${t('지난 초콜릿은 다음 가을까지 보관해!', 'Your chocolates are kept until next autumn!')}</strong>`,
    `<p>${t(
      `${seasonYear}년에 받은 초콜릿과 메시지는 ${deletionYear}년 10월 1일에 영구 삭제돼. `
        + '삭제된 메시지는 복구할 수 없으니 소중한 마음을 미리 보관해 줘.',
      `Chocolates and notes from ${seasonYear} will be permanently deleted on October 1, ${deletionYear}. `
        + 'They cannot be restored, so keep any memories you want to save.',
    )}</p>`,
    '</div>',
    '</aside>',
  ].join('');
}
