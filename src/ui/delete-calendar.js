export function renderCalendarDeletion(state) {
  const { t } = state;
  const warning = t(
    '캘린더와 모든 연도의 초콜릿·메시지가 영구 삭제돼. 복구할 수 없어.',
    'The calendar and every year of chocolates and messages will be erased permanently.',
  );
  const linkWarning = t(
    '친구에게 공유한 링크도 더 이상 열리지 않아. 삭제 후 새 캘린더를 만들 수 있어.',
    'Your shared link will stop working. You can create a new calendar afterward.',
  );
  const modal = state.deleteOpen ? [
    '<div class="delete-overlay">',
    '<button type="button" class="delete-scrim" data-action="delete-close"',
    ' aria-label="Close dialog"></button>',
    '<section class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">',
    `<h3 id="delete-title">${t('캘린더를 영구 삭제할까?', 'Permanently delete your calendar?')}</h3>`,
    `<p>${warning}</p>`,
    `<p>${linkWarning}</p>`,
    '<div class="delete-actions">',
    `<button type="button" data-action="delete-close" ${state.deleting ? 'disabled' : ''}>`
      + `${t('취소', 'Cancel')}</button>`,
    `<button type="button" data-action="delete-confirm" ${state.deleting ? 'disabled' : ''}>`,
    t('영구 삭제', 'Delete permanently'),
    '</button>',
    '</div></section></div>',
  ].join('') : '';
  return [
    '<div class="calendar-danger">',
    `<button type="button" data-action="delete-open">${t('캘린더 삭제', 'Delete calendar')}</button>`,
    '</div>',
    modal,
  ].join('');
}
