import { APP } from '../config/constants.js';

import { requireDatabase } from './client.js';

const SELECT_COLUMNS = 'id,slug,nickname,owner_id';

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

function generateSlug() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, APP.calendarSlugLength);
}

export async function createCalendar(nickname, ownerId) {
  const name = String(nickname).trim();
  if (!name || Array.from(name).length > APP.maximumNicknameLength) {
    throw new Error('INVALID_NICKNAME');
  }
  const client = requireDatabase();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateSlug();
    const { data, error } = await client
      .from('calendars')
      .insert({ slug, nickname: name, owner_id: ownerId })
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
