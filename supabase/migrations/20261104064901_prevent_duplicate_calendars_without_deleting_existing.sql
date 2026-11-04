-- Preserve historical calendars and messages; reject only new duplicate ownership.
create or replace function public.enforce_one_calendar_per_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
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
$$;

drop trigger if exists enforce_one_calendar_per_owner_on_insert on public.calendars;
create trigger enforce_one_calendar_per_owner_on_insert
before insert on public.calendars
for each row execute function public.enforce_one_calendar_per_owner();
