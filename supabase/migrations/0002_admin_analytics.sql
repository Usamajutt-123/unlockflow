-- ============================================================
-- UNLOCKFLOW — Database Migration (Admin + Analytics)
-- Run AFTER 0001_init.sql. Adds:
--   - views & clicks tracking on links
--   - admins table (who can access /admin)
--   - RPC functions for safe counters
--   - task placement support (reordering handled by position)
-- ============================================================

-- 1) Analytics counters on links
alter table public.links
  add column if not exists views integer not null default 0;

alter table public.links
  add column if not exists clicks integer not null default 0;

-- 2) Admins table — emails allowed to access the /admin dashboard
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- 3) RPC: increment views for a link slug (safe, avoids client races)
create or replace function public.increment_views(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.links
  set views = views + 1
  where slug = p_slug;
end;
$$;

-- 4) RPC: increment clicks for a link slug
create or replace function public.increment_clicks(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.links
  set clicks = clicks + 1
  where slug = p_slug;
end;
$$;

-- 5) RPC: get aggregated analytics (top links by views/clicks)
create or replace function public.get_analytics()
returns table (
  slug text,
  title text,
  destination_url text,
  views bigint,
  clicks bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select l.slug, l.title, l.destination_url, l.views, l.clicks, l.created_at
  from public.links l
  order by l.views desc;
$$;

-- 6) RPC: count total completions per link
create or replace function public.get_completions()
returns table (
  link_id uuid,
  completions bigint
)
language sql
security definer
set search_path = public
as $$
  select tc.link_id, count(*) as completions
  from public.task_completions tc
  group by tc.link_id;
$$;

-- 7) RLS: allow service role (server-side admin) full access — service role bypasses RLS by default.
-- Public (anon) should NOT read admins.
alter table public.admins enable row level security;
create policy "admins_read_own" on public.admins
  for select using (auth.uid() is not null);
create policy "admins_insert" on public.admins
  for insert with check (auth.uid() is not null);
