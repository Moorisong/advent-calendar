import { removeLocal, writeLocal } from '../utils/storage.js';

export function draftKey(userId, calendarId, date) {
  return `message-draft:${userId}:${calendarId}:${date}`;
}

export function saveMessageDraft(state) {
  if (!state.user?.id || !state.calendar?.id || !state.route.date
    || state.route.page !== 'write') {
    return;
  }
  writeLocal(draftKey(state.user.id, state.calendar.id, state.route.date),
    JSON.stringify({ message: state.message, selected: state.selected }));
}

export function clearMessageDraft(state) {
  if (!state.user?.id || !state.calendar?.id || !state.route.date) {
    return;
  }
  removeLocal(draftKey(state.user.id, state.calendar.id, state.route.date));
}
