-- Dear Choco / 2026. Run once on a NEW, dedicated Supabase project.
-- Do not run this on Haroo or Dumpit. Never expose a service-role key to the browser.

create table if not exists public.calendars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  nickname text not null,
  timezone text not null default 'Asia/Seoul',
  created_at timestamptz not null default now(),
  constraint calendars_timezone_length check (length(timezone) between 1 and 80),
  constraint calendars_slug_format check (slug ~ '^[a-z0-9]{16}$'),
  constraint calendars_nickname_length check (
    char_length(btrim(nickname)) between 1 and 12
  )
);

-- Reject unknown IANA time zones even if clients bypass front-end checks.
create or replace function public.validate_calendar_timezone()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid calendar timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_calendar_timezone_on_insert on public.calendars;
create trigger validate_calendar_timezone_on_insert
before insert or update of timezone on public.calendars
for each row execute function public.validate_calendar_timezone();

-- Preserve historical calendars and messages; reject only new duplicate ownership.
create or replace function public.enforce_one_calendar_per_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $
begin
  -- Serialize inserts by owner so concurrent requests cannot bypass the check.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.owner_id::text, 0)
  );
  if exists (
    select 1 from public.calendars where owner_id = new.owner_id
  ) then
    raise exception 'Only one calendar is allowed per account'
      using errcode = '23505', constraint = 'calendars_one_per_owner';
  end if;
  return new;
end;
$;

drop trigger if exists enforce_one_calendar_per_owner_on_insert on public.calendars;
create trigger enforce_one_calendar_per_owner_on_insert
before insert on public.calendars
for each row execute function public.enforce_one_calendar_per_owner();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars (id) on delete cascade,
  gift_date date not null,
  chocolate_type smallint not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_gift_date_range check (
    gift_date >= date '2026-11-01'
    and (
      extract(month from gift_date) = 11
      or (extract(month from gift_date) = 12 and extract(day from gift_date) <= 25)
    )
  ),
  constraint messages_chocolate_type_range check (
    chocolate_type between 0 and 5
  ),
  constraint messages_body_length check (
    char_length(btrim(body)) between 1 and 200
  )
);

create index if not exists calendars_owner_index
  on public.calendars (owner_id, created_at desc);

create index if not exists messages_date_index
  on public.messages (calendar_id, gift_date, created_at, id);

alter table public.calendars enable row level security;
alter table public.messages enable row level security;

-- Anonymous visitors can load the public calendar's nickname and ID.
-- User email and identity information are NEVER stored here.
revoke all on public.calendars from public, anon, authenticated;
grant select on public.calendars to anon, authenticated;
grant insert, delete on public.calendars to authenticated;

-- Messages intentionally have NO sender identifier column, despite sign-in
-- being mandatory for inserting them. Calendar owners cannot infer authors.
revoke all on public.messages from public, anon, authenticated;
grant select, insert on public.messages to authenticated;

create policy "Anyone may view calendar cover"
  on public.calendars for select
  to anon, authenticated
  using (true);

create policy "Signed-in users can create their own calendars"
  on public.calendars for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and (select auth.uid()) is not null
  );

-- A signed-in user may leave multiple messages per date, including past dates.
-- The database (not only UI) closes submissions after December 25 in the owner's time zone.
create policy "Signed-in users can leave chocolates in season"
  on public.messages for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.calendars as calendar
      where calendar.id = messages.calendar_id
        and (now() at time zone calendar.timezone)::date
          between make_date(extract(year from now() at time zone calendar.timezone)::int, 11, 1)
              and make_date(extract(year from now() at time zone calendar.timezone)::int, 12, 25)
        and extract(year from messages.gift_date)
            = extract(year from now() at time zone calendar.timezone)
    )
  );

-- Crucially, future-dated message rows are excluded even from direct API
-- SELECT, COUNT and requests made outside the official UI.
create policy "Only owners can open arrived messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.calendars as calendar
      where calendar.id = messages.calendar_id
        and calendar.owner_id = (select auth.uid())
        and gift_date <= (now() at time zone calendar.timezone)::date
    )
  );

create policy "Owners may permanently delete their calendars"
  on public.calendars for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- Message deletion cascades from calendars. Direct message DELETE remains denied.

-- Clean up old season messages every 15 minutes, in each calendar's own time zone.
-- Calendars, accounts, and share links are deliberately never removed by this job.
create extension if not exists pg_cron with schema pg_catalog;

create schema if not exists private;

create or replace function private.purge_expired_chocolates()
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  removed bigint;
begin
  delete from public.messages as message
  using public.calendars as calendar
  where message.calendar_id = calendar.id
    and message.gift_date < pg_catalog.make_date(
      extract(year from (pg_catalog.now() at time zone calendar.timezone))::integer
        - case
          when extract(month from (pg_catalog.now() at time zone calendar.timezone)) >= 10
            then 0
          else 1
        end,
      1, 1
    );
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function private.purge_expired_chocolates() from public, anon, authenticated;

-- Runs independently of the home server. Safe to rerun; only expired messages match.
select cron.schedule(
  'dearchoco-expire-previous-season',
  '*/15 * * * *',
  'select private.purge_expired_chocolates();'
);
