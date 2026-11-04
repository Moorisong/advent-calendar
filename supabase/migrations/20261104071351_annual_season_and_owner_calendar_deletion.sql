-- Repeat November 1 through December 25 in each owner's time zone, for every year.
alter table public.messages drop constraint if exists messages_gift_date_range;
alter table public.messages
  add constraint messages_gift_date_range check (
    gift_date >= date '2026-11-01'
    and (
      extract(month from gift_date) = 11
      or (extract(month from gift_date) = 12 and extract(day from gift_date) <= 25)
    )
  );

drop policy if exists "Signed-in users can leave chocolates in season" on public.messages;
create policy "Signed-in users can leave chocolates in season"
on public.messages for insert to authenticated
with check (
  (select auth.uid()) is not null
  and exists (
    select 1 from public.calendars as calendar
    where calendar.id = messages.calendar_id
      and (now() at time zone calendar.timezone)::date
        between make_date(extract(year from now() at time zone calendar.timezone)::int, 11, 1)
            and make_date(extract(year from now() at time zone calendar.timezone)::int, 12, 25)
      and extract(year from messages.gift_date)
          = extract(year from now() at time zone calendar.timezone)
  )
);

grant delete on public.calendars to authenticated;
drop policy if exists "Owners may permanently delete their calendars" on public.calendars;
create policy "Owners may permanently delete their calendars"
on public.calendars for delete to authenticated
using (owner_id = (select auth.uid()));
