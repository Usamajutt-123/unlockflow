-- ============================================================
-- UNLOCKFLOW — Migration 0007: Ads on the unlock page
-- Adds a global `ads` table so admins can manage advertisements
-- shown on unlock pages from the Admin dashboard.
--
-- Slots:
--   banner  -> image banner shown below the unlock-page hero
--   task    -> compact inline ad rendered inside the task list
--   bottom  -> fixed bottom "social bar" ad
-- ============================================================

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  slot text not null default 'banner'
    check (slot in ('banner', 'task', 'bottom')),
  title text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Unlock pages read active ads with the anon key.
alter table public.ads enable row level security;
create policy "public_read_ads" on public.ads
  for select using (true);

-- Admin CRUD is done server-side with the service role (bypasses RLS).
