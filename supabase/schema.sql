-- Dear Choco / 2026. Run once on a NEW, dedicated Supabase project.
-- Do not run this on Haroo or Dumpit. Never expose a service-role key to the browser.

create table if not exists public.calendars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  nickname text not null,
  created_at timestamptz not null default now(),
  constraint calendars_slug_format check (slug ~ '^[a-z0-9]{16}$'),
  constraint calendars_nickname_length check (
    char_length(btrim(nickname)) between 1 and 12
  )
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars (id) on delete cascade,
  gift_date date not null,
  chocolate_type smallint not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_gift_date_range check (
    gift_date between date '2026-11-05' and date '2026-12-25'
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
grant insert on public.calendars to authenticated;

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
-- The database (not only UI) closes submissions after December 25 KST.
create policy "Signed-in users can leave chocolates in season"
  on public.messages for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and (now() at time zone 'Asia/Seoul')::date
      between date '2026-11-05' and date '2026-12-25'
    and exists (
      select 1
      from public.calendars as calendar
      where calendar.id = messages.calendar_id
    )
  );

-- Crucially, future-dated message rows are excluded even from direct API
-- SELECT, COUNT and requests made outside the official UI.
create policy "Only owners can open arrived messages"
  on public.messages for select
  to authenticated
  using (
    gift_date <= (now() at time zone 'Asia/Seoul')::date
    and exists (
      select 1
      from public.calendars as calendar
      where calendar.id = messages.calendar_id
        and calendar.owner_id = (select auth.uid())
    )
  );

-- There are deliberately no UPDATE or DELETE privileges or policies.
-- This version of the product has no edit/delete UI.
