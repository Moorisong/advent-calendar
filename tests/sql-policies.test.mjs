import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

test('캘린더와 메시지에 모두 RLS를 설정', () => {
  assert.match(schema, /alter table public\.calendars enable row level security;/);
  assert.match(schema, /alter table public\.messages enable row level security;/);
});

test('날짜별 작성자 중복은 DB에서 막고, 작성자 ID는 읽을 수 없음', () => {
  assert.match(schema, /sender_id uuid not null default auth.uid\(\)/);
  assert.match(schema, /messages_one_sender_per_day/);
  assert.match(schema, /\(calendar_id, gift_date, sender_id\)/);
  assert.match(schema, /grant select \(id, calendar_id, gift_date, chocolate_type, body, created_at\)/);
  assert.match(schema, /grant insert \(calendar_id, gift_date, chocolate_type, body\)/);
  assert.doesNotMatch(schema, /grant select, insert on public.messages to authenticated/);
  assert.match(schema, /m.sender_id = \(select auth.uid\(\)\)/);
  assert.match(schema, /grant execute on function public.get_my_message/);
  assert.match(schema, /revoke all on function public.get_my_message/);
});

test('메시지 수정과 삭제는 작성자만 가능', () => {
  assert.match(schema, /create policy "Senders can edit their notes"/);
  assert.match(schema, /create policy "Senders can delete their notes"/);
  assert.match(schema, /grant update \(chocolate_type, body\)/);
  assert.match(schema, /using \(sender_id = \(select auth.uid\(\)\)/);
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
  assert.match(schema, /when extract\(month/);
  assert.match(schema, /then 0\s+else 1/);
  assert.match(schema, /'dearchoco-expire-previous-season'/);
  assert.match(schema, /'\*\/15 \* \* \* \*'/);
  assert.doesNotMatch(schema.split('create or replace function private.purge_expired_chocolates')[1],
    /delete from public\.calendars/);
});
