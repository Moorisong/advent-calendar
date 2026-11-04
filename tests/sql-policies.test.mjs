import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

test('캘린더와 메시지에 모두 RLS를 설정', () => {
  assert.match(schema, /alter table public\.calendars enable row level security;/);
  assert.match(schema, /alter table public\.messages enable row level security;/);
});

test('익명 작성자를 데이터베이스에 저장하지 않음', () => {
  const messages = schema.split('create table if not exists public.messages')[1].split(');')[0];
  assert.doesNotMatch(messages, /sender_id|author_id|writer_id/);
});

test('미래 날짜 정보는 SQL 정책으로 차단', () => {
  assert.match(schema, /gift_date <= \(now\(\) at time zone calendar\.timezone\)::date/);
  assert.match(schema, /calendar\.owner_id = \(select auth\.uid\(\)\)/);
  assert.match(schema, /timezone text not null default 'Asia\/Seoul'/);
});

test('시즌 밖의 메시지 쓰기는 정책에서 차단', () => {
  assert.match(schema, /between date '2026-11-05' and date '2026-12-25'/);
  assert.match(schema, /to authenticated\s+with check/);
  assert.match(schema, /at time zone calendar\.timezone/);
});
