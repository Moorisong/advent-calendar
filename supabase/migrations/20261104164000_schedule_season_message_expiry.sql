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
