import { APP, CHOCOLATES } from '../config/constants.js';
import { validCalendarDate } from '../utils/date.js';

import { requireDatabase } from './client.js';

function validateMessage(date, type, body) {
  const message = String(body).replace(/\r\n?/g, '\n');
  const validType = Number.isInteger(type) && type >= 0 && type < CHOCOLATES.length;
  if (!validCalendarDate(date) || !validType || !message.trim() || message.length > APP.maximumMessageLength) {
    throw new Error('INVALID_MESSAGE');
  }
  return message;
}

export async function getMyMessage(calendarId, date) {
  if (!validCalendarDate(date)) {
    throw new Error('INVALID_DATE');
  }
  const { data, error } = await requireDatabase().rpc('get_my_message', {
    p_calendar_id: calendarId,
    p_gift_date: date,
  });
  if (error) {
    throw error;
  }
  return data?.[0] ?? null;
}

export async function writeMessage(calendarId, date, type, body) {
  const message = validateMessage(date, type, body);
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

export async function updateMessage(id, date, type, body) {
  const message = validateMessage(date, type, body);
  const { data, error } = await requireDatabase()
    .from('messages')
    .update({ chocolate_type: type, body: message })
    .eq('id', id)
    .select('id');
  if (error) {
    throw error;
  }
  if (data?.length !== 1) {
    throw new Error('MESSAGE_EDIT_NOT_ALLOWED');
  }
}

export async function deleteMessage(id) {
  const { data, error } = await requireDatabase()
    .from('messages')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) {
    throw error;
  }
  if (data?.length !== 1) {
    throw new Error('MESSAGE_DELETE_NOT_ALLOWED');
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
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) {
    throw error;
  }
  return data ?? [];
}
