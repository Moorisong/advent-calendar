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
  assert.match(schema, /make_date\(extract\(year from now\(\) at time zone calendar\.timezone\)/);
  assert.match(schema, /extract\(year from messages\.gift_date\)/);
  assert.match(schema, /to authenticated\s+with check/);
  assert.match(schema, /at time zone calendar\.timezone/);
});

test('기존 데이터 보존하면서 계정당 신규 캘린더 생성을 하나로 제한', () => {
  assert.match(schema, /create trigger enforce_one_calendar_per_owner_on_insert/);
  assert.match(schema, /pg_advisory_xact_lock/);
  assert.match(schema, /where owner_id = new\.owner_id/);
  assert.match(schema, /constraint = 'calendars_one_per_owner'/);
});

test('오너 삭제만 허용하고 초콜릿은 외래키로 연쇄 삭제', () => {
  assert.match(schema, /grant insert, delete on public\.calendars to authenticated/);
  assert.match(schema, /on public\.calendars for delete/);
  assert.match(schema, /using \(owner_id = \(select auth\.uid\(\)\)\)/);
  assert.match(schema, /calendar_id uuid not null references public\.calendars \(id\) on delete cascade/);
  assert.doesNotMatch(schema, /grant select, insert, delete on public\.messages/);
});

test('오너 메시지는 다음 해 10월에만 정리하고 캘린더는 유지', () => {
  assert.match(schema, /create or replace function private\.purge_expired_chocolates/);
  assert.match(schema, /delete from public\.messages as message/);
  assert.match(schema, /using public\.calendars as calendar/);
  assert.match(schema, /when pg_catalog\.extract\(month/);
  assert.match(schema, /then 0\s+else 1/);
  assert.match(schema, /'dearchoco-expire-previous-season'/);
  assert.match(schema, /'\*\/15 \* \* \* \*'/);
  assert.doesNotMatch(schema.split('create or replace function private.purge_expired_chocolates')[1],
    /delete from public\.calendars/);
});
