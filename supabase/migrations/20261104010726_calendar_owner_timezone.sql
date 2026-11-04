-- Existing calendars keep their original Asia/Seoul behavior.
alter table public.calendars
  add column if not exists timezone text not null default 'Asia/Seoul';

alter table public.calendars
  drop constraint if exists calendars_timezone_length;
alter table public.calendars
  add constraint calendars_timezone_length check (length(timezone) between 1 and 80);

-- Validate timezone identifiers against PostgreSQL's IANA timezone database.
create or replace function public.validate_calendar_timezone()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from pg_catalog.pg_timezone_names where name = new.timezone
  ) then
    raise exception 'Invalid calendar timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_calendar_timezone_on_insert on public.calendars;
create trigger validate_calendar_timezone_on_insert
before insert or update of timezone on public.calendars
for each row execute function public.validate_calendar_timezone();

-- Recreate policies: DATE boundaries always use the recipient calendar's time zone.
drop policy if exists "Signed-in users can leave chocolates in season" on public.messages;
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
        between date '2026-11-05' and date '2026-12-25'
  )
);

drop policy if exists "Only owners can open arrived messages" on public.messages;
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
