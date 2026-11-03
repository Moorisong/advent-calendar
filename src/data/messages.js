import { APP, CHOCOLATES } from '../config/constants.js';
import { validCalendarDate } from '../utils/date.js';

import { requireDatabase } from './client.js';

export async function writeMessage(calendarId, date, type, body) {
  const message = String(body).trim();
  const validType = Number.isInteger(type) && type >= 0 && type < CHOCOLATES.length;
  if (!validCalendarDate(date) || !validType || !message || message.length > APP.maximumMessageLength) {
    throw new Error('INVALID_MESSAGE');
  }
  const { error } = await requireDatabase().from('messages').insert({
    calendar_id: calendarId,
    gift_date: date,
    chocolate_type: type,
    body: message,
  });
  if (error) {
    throw error;
  }
}

export async function getMessages(calendarId, date) {
  if (!validCalendarDate(date)) {
    throw new Error('INVALID_DATE');
  }
  const { data, error } = await requireDatabase()
    .from('messages')
    .select('id,chocolate_type,body,created_at')
    .eq('calendar_id', calendarId)
    .eq('gift_date', date)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return data ?? [];
}
