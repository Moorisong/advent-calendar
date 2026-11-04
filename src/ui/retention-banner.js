export function renderRetentionBanner(state) {
  const today = state.today;
  const month = Number(today.slice(5, 7));
  if (month !== 9) {
    return '';
  }
  // In September the messages from last year's season expire next month.
  const seasonYear = Number(today.slice(0, 4)) - 1;
  const deletionYear = seasonYear + 1;
  const { t } = state;
  return [
    '<aside class="retention-banner" aria-label="Message retention notice">',
    '<span class="retention-banner-icon" aria-hidden="true">✉</span>',
    '<div class="retention-banner-copy">',
    `<strong>${t('지난 초콜릿이 곧 정리돼!', 'Your saved chocolates will soon expire!')}</strong>`,
    `<p>${t(
      `${seasonYear}년에 받은 초콜릿과 메시지는 ${deletionYear}년 10월 1일에 영구 삭제돼. `
        + '삭제 후에는 복구할 수 없으니 9월 30일까지 소중한 메시지를 따로 저장해 줘.',
      `Chocolates and messages from ${seasonYear} will be permanently deleted on October 1, ${deletionYear}. `
        + 'They cannot be recovered, so save any messages you want to keep by September 30.',
    )}</p>`,
    '</div>',
    '</aside>',
  ].join('');
}
