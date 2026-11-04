import { APP } from '../config/constants.js';
import { validTimeZone } from '../utils/timezones.js';

import { requireDatabase } from './client.js';

const SELECT_COLUMNS = 'id,slug,nickname,owner_id,timezone';

export async function findCalendar(slug) {
  const { data, error } = await requireDatabase()
    .from('calendars')
    .select(SELECT_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function findMyCalendar(ownerId) {
  if (!ownerId) {
    return null;
  }
  const { data, error } = await requireDatabase()
    .from('calendars')
    .select(SELECT_COLUMNS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

function generateSlug() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, APP.calendarSlugLength);
}

export async function createCalendar(nickname, ownerId, timezone = APP.timeZone) {
  const name = String(nickname).trim();
  if (!name || Array.from(name).length > APP.maximumNicknameLength) {
    throw new Error('INVALID_NICKNAME');
  }
  if (!validTimeZone(timezone)) {
    throw new Error('INVALID_TIMEZONE');
  }
  const client = requireDatabase();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateSlug();
    const { data, error } = await client
      .from('calendars')
      .insert({ slug, nickname: name, owner_id: ownerId, timezone })
      .select(SELECT_COLUMNS)
      .single();
    if (!error && data) {
      return data;
    }
    if (error?.code !== '23505') {
      throw error ?? new Error('CALENDAR_CREATE_FAILED');
    }
  }
  throw new Error('SLUG_COLLISION');
}
